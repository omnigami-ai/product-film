// A narrated version of a rendered film: a voice reads one short line per act over the film's own song,
// beside the music-only MP4. The picture is copied from that MP4 untouched, so narration never changes a frame.
//
//   node scripts/narrate.mjs <film-dir> [options]
//     --provider google|elevenlabs|files   who speaks (default: the script's "provider", else google)
//                            google: Gemini 3.8 Flash TTS through the Gemini API, key in GEMINI_API_KEY
//                            elevenlabs: at pcm_24000, key in ELEVENLABS_API_KEY; a professional (studio-trained) voice
//                            speaks on a model it was trained on (eleven_v4 first), never eleven_v3, which only
//                            approximates it and comes out thin; a designed voice speaks on eleven_v3
//                            files: your own recordings, <film-dir>/narration/recorded/<line id>.wav (or .m4a, .mp3)
//     --size 16:9 | --all    which MP4s in <out> to narrate (default 16:9); each <name>.mp4 → <name>-narrated.mp4
//     --script file.json     the narration script (default <film-dir>/narration/script.json)
//     --plan                 check the script only: words against each act's time, no requests, no mix
//     --takes                make (or reuse) the takes and report their fit; no mix (the MP4 isn't needed)
//     --redo id,id           a new take of these lines (the old one moves to superseded/): a harsh read, a misheard name
//     --out dir              (default <film-dir>/../out, where render.mjs writes)
//
// The script (narration/script.json):
//   { "lang": "en-US",
//     "voice": { "google": { "description": "…", "gender": "female" }, "elevenlabs": { "description": "…" } },
//         (a voice designed from a description; or { "id": "Kore" } / { "id": "<ElevenLabs voice id>" } for a stock
//          or library voice; leave "voice" out for omnigami's defaults, below)
//     "style": "natural, conversational",          (Google only: a short style note sent with every line)
//     "pronounce": [{ "word": "Lamplit", "note": "said \"lamp-lit\", two clear syllables", "respell": "Lamp-lit" }],
//         (Google gets the note with each line that has the word; ElevenLabs gets the respelling in place of the word)
//     "land": 30,      (optional: when the song lands, as render.mjs prints it; the last line ends 0.12 s before it)
//     "lines": [{ "id": "problem", "window": [0, 4], "start": 0.12, "text": "…",
//                 "say": { "elevenlabs": "[warmly] Find the cause." } }] }
//         window: the act's seconds; start: where the line is placed (default 0.12 s into its act); say: what is
//         sent instead of text, for every provider (a string) or per provider (ElevenLabs v3 takes audio tags; any
//         other model has them taken out, or it would read them aloud)
//     a run: lines that carry one sentence across the picture share "run": "a" ("Make the call, note the reason," /
//         "and two of them get moving."). They are voiced as one take, so the voice carries on instead of closing each
//         line, and cut at the take's pauses, one piece a line, each placed at its own start (the founder, 2026-11-06)
//
// Takes are saved in <film-dir>/narration/takes/<provider>-<voice>/ and reused while the line, voice and style are
// unchanged, so a re-render makes no requests and sounds the same; designed voices' IDs are kept in
// narration/voices.json. Keys come only from the environment and are never printed.
//
// The mix (picked by ear, 2026-11-06): each line at its start; one that would overrun starts earlier within its act
// and ends 0.12 s before the next line (the last by its act's end, and before the song's landing); speech is never
// sped up. The voice is set to −18 LUFS (measured as mono; it plays in both channels), the song and effects dip 8 dB
// under it (100 ms in, 400 ms out), and the whole is mastered to −14 LUFS with peaks under −1.5 dBTP.
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, rename, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const SR = 48000;
const GAP = 0.12, DUCK_DB = -8, ATTACK = 0.1, RELEASE = 0.4, VOICE_LUFS = -18, MASTER_LUFS = -14, CEILING_DBTP = -1.5;
const WORDS_PER_SECOND = 2.5;
const GEMINI_MODEL = 'gemini-3.8-flash-tts', GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/';
const ELEVEN_TTS_MODEL = 'eleven_v3', ELEVEN_DESIGN_MODEL = 'eleven_ttv_v3', ELEVEN_FORMAT = 'pcm_24000';
// A professional voice clone is trained per model; its best trained model, in this order (eleven_v4_hq when the plan
// allows it). On eleven_v3, where it isn't trained, Lara lost a third of her body (2026-11-06): never use v3 for one.
const ELEVEN_TRAINED_ORDER = ['eleven_v4_hq', 'eleven_v4', 'eleven_multilingual_v2', 'eleven_turbo_v2_5', 'eleven_flash_v2_5'];
// omnigami's picks (the founder, 2026-11-06): "Iris" on Google; on ElevenLabs "Lara", a studio-quality voice from
// the public library (the same voice for every buyer, unlike a voice designed from a description)
const DEFAULT_VOICES = {
  google: { name: 'iris', gender: 'female', description: 'A bright, crisp young woman in her late twenties with a neutral American accent; precise, upbeat and modern, like a product designer narrating her own launch film. Light, clear and natural.' },
  elevenlabs: { name: 'lara', id: 'vChnJZ1Cu89g2XXumPfT', owner: '655db62473dfb65f630c66cab2df71a87da6f912f5ac05ca869b852e1b7f9489' },
};
const DEFAULT_STYLE = 'natural, conversational';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : fallback; };
const flag = (name) => args.includes('--' + name);
if (!args[0] || args[0].startsWith('--')) { console.error('usage: node scripts/narrate.mjs <film-dir> [--provider google|elevenlabs|files] [--size 16:9 | --all] [--plan | --takes] [--redo id,id]'); process.exit(1); }
const dir = path.resolve(args[0]);
const outDir = path.resolve(opt('out', path.join(dir, '..', 'out')));
const scriptFile = path.resolve(opt('script', path.join(dir, 'narration', 'script.json')));
const narrDir = path.dirname(scriptFile);
const fail = (msg) => { console.error(msg); process.exit(1); };

if (!existsSync(scriptFile)) fail(`no narration script at ${scriptFile}: write one (see the top of this file)`);
const script = JSON.parse(await readFile(scriptFile, 'utf8'));
const lines = script.lines || [];
if (!lines.length) fail('the script has no lines');
for (const [i, l] of lines.entries()) {
  if (!l.id || !/^[a-z0-9-]+$/i.test(l.id)) fail(`line ${i + 1}: an id of letters, digits or hyphens is needed`);
  if (!Array.isArray(l.window) || l.window.length !== 2 || !(l.window[1] > l.window[0])) fail(`${l.id}: window must be [from, to] in seconds`);
  if (!l.text) fail(`${l.id}: no text`);
  if (i && l.window[0] < lines[i - 1].window[0]) fail(`${l.id}: lines must be in time order`);
}
// One sentence a line (the founder, 2026-11-06: a second sentence said straight after the first ran the two together):
// a second thing to say gets its own line, with its own start at the moment it describes.
const ABBR = /\b(?:a\.m|p\.m|e\.g|i\.e|etc|vs|approx|Mr|Mrs|Ms|Dr|St|No|Inc|Ltd|Co)\.$/i;
function sentences(s) {
  const clean = s.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim(), parts = [];
  let from = 0;
  for (const m of clean.matchAll(/[.!?…]+["'”’)\]]*\s+(?=["'“‘(\[]?[\p{Lu}\p{N}])|[。！？]+(?=\S)/gu)) {
    const end = m.index + m[0].trimEnd().length;
    if (ABBR.test(clean.slice(0, end))) continue;
    parts.push(clean.slice(from, end).trim()); from = m.index + m[0].length;
  }
  parts.push(clean.slice(from).trim());
  return parts.filter(Boolean);
}
const runOn = [];
for (const l of lines) {
  for (const s of [l.text, ...(typeof l.say === 'string' ? [l.say] : Object.values(l.say || {}))]) {
    const p = sentences(s);
    if (p.length < 2) continue;
    runOn.push(`${l.id} has ${p.length} sentences (${p.map((x) => `"${x}"`).join(' / ')}). One sentence a line: keep "${p[0]}" here and give ${p.length > 2 ? 'each of the others' : `"${p[1]}"`} its own line, starting at the moment it describes, e.g.\n  { "id": "${l.id}b", "window": [<when that happens>, ${l.window[1]}], "start": <when that happens>, "text": "${p[1]}" }`);
    break;
  }
}
if (runOn.length) fail(runOn.join('\n'));
// a run (one sentence carried across lines, voiced as one take): its lines are consecutive
const runSeen = new Set();
for (const [i, l] of lines.entries()) if (l.run) {
  if (runSeen.has(l.run) && lines[i - 1]?.run !== l.run) fail(`run "${l.run}": its lines must follow one another`);
  runSeen.add(l.run);
}
const startOf = (l) => l.start ?? +(l.window[0] + GAP).toFixed(3);
const provider = opt('provider', script.provider || 'google');
if (!['google', 'elevenlabs', 'files'].includes(provider)) fail(`unknown provider ${provider}: google, elevenlabs or files`);

// ---------------------------------------------------------------- the plan: words against time
const words = (s) => s.replace(/\[[^\]]*\]/g, ' ').split(/\s+/).filter(Boolean).length;
const roomOf = (i) => {
  const l = lines[i], next = lines[i + 1];
  return (next ? startOf(next) - GAP : l.window[1]) - l.window[0] - 0.02;
};
console.log(`narration: ${lines.length} lines, ${lines.reduce((n, l) => n + words(l.text), 0)} words, ${provider}`);
let tight = 0;
for (const [i, l] of lines.entries()) {
  const need = words(l.text) / WORDS_PER_SECOND, room = roomOf(i);
  // about 2.5 words a second is the guide; a brisk voice manages a little more, so only a clear excess is flagged
  if (need > room * 1.1) { tight++; console.log(`  ${l.id}: ${words(l.text)} words want about ${need.toFixed(1)} s; its act has ${room.toFixed(1)} s. Shorten it.`); }
}
if (flag('plan')) { console.log(tight ? `${tight} line(s) too long for their acts` : 'every line fits its act at a natural pace'); process.exit(tight ? 1 : 0); }

// ---------------------------------------------------------------- helpers
function run(cmd, argv, input) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
    const out = [], err = [];
    p.stdout.on('data', (d) => out.push(d)); p.stderr.on('data', (d) => err.push(d));
    p.on('error', reject);
    p.on('close', (code) => code ? reject(new Error(`${cmd} exited ${code}: ${Buffer.concat(err).toString().slice(-400)}`)) : resolve({ out: Buffer.concat(out), err: Buffer.concat(err).toString() }));
    if (input) p.stdin.end(input);
  });
}
async function decode(file, channels) { // Float32Array per channel, at 48 kHz
  const { out } = await run('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-vn', '-ar', String(SR), '-ac', String(channels), '-f', 'f32le', '-']);
  const x = new Float32Array(out.buffer, out.byteOffset, Math.floor(out.length / 4));
  if (channels === 1) return [Float32Array.from(x)];
  const n = x.length / channels, ch = Array.from({ length: channels }, () => new Float32Array(n));
  for (let i = 0; i < n; i++) for (let c = 0; c < channels; c++) ch[c][i] = x[i * channels + c];
  return ch;
}
function wavFloat(chs) { // 32-bit float WAV
  const n = chs[0].length, c = chs.length, b = Buffer.alloc(44 + n * c * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * c * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(3, 20); b.writeUInt16LE(c, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * c * 4, 28);
  b.writeUInt16LE(c * 4, 32); b.writeUInt16LE(32, 34); b.write('data', 36); b.writeUInt32LE(n * c * 4, 40);
  for (let i = 0; i < n; i++) for (let k = 0; k < c; k++) b.writeFloatLE(chs[k][i], 44 + (i * c + k) * 4);
  return b;
}
function wavPcm16(pcm, rate) { // raw mono s16le (ElevenLabs' pcm_24000) in a WAV header
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
async function loudnorm(file) { // the EBU R128 numbers ffmpeg's loudnorm measures (input_i, input_tp, …)
  const { err } = await run('ffmpeg', ['-hide_banner', '-nostdin', '-nostats', '-i', file, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  return JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1));
}
async function measure(file) { // integrated loudness and true peak, as a player would hear the file
  const { err } = await run('ffmpeg', ['-hide_banner', '-nostdin', '-nostats', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const s = err.slice(err.lastIndexOf('Summary'));
  return { lufs: Number(s.match(/I:\s+(-?[\d.]+) LUFS/)[1]), dbtp: Number(s.match(/Peak:\s+(-?[\d.inf]+) dBFS/)[1]) };
}
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
const secret = (name) => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
};

// ---------------------------------------------------------------- the voice
const voiceCfg = provider === 'files' ? { name: 'recorded' } : { ...(script.voice?.[provider] || DEFAULT_VOICES[provider]) };
if (provider !== 'files') {
  if (!voiceCfg.id && !voiceCfg.description) fail(`voice.${provider} needs a description (to design a voice) or an id (a stock or library voice)`);
  voiceCfg.name ??= voiceCfg.id ? String(voiceCfg.id) : 'custom-' + sha(voiceCfg.description);
}
const style = script.style || DEFAULT_STYLE;
const wordRe = (w, g) => new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u' + (g ? 'g' : ''));
const sayOf = (l) => {
  let s = typeof l.say === 'string' ? l.say : (l.say && l.say[provider]) || l.text;
  if (provider === 'elevenlabs') for (const p of script.pronounce || []) if (p.respell) s = s.replace(wordRe(p.word, true), p.respell);
  return s;
};
const styleOf = (l) => [style, ...(script.pronounce || []).filter((p) => p.note && wordRe(p.word).test(l.text)).map((p) => `${p.word} is ${p.note}`)].join('; ');

const requests = { voice: 0, lines: 0 };
const keyName = provider === 'google' ? (secret('GEMINI_API_KEY') ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY') : 'ELEVENLABS_API_KEY';
const KEY = provider === 'files' ? null : secret(keyName);

// Gemini: a per-minute limit waits and tries again; a per-day limit stops (the takes so far are kept)
async function gemini(pathname, body) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try { res = await fetch(GEMINI_API + pathname, { method: 'POST', headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(240e3) }); }
    catch (e) { if (attempt < 4) { console.log(`  Gemini didn't answer (${e.name}); trying again in ${15 * attempt} s`); await sleep(15 * attempt); continue; } throw e; }
    if (res.ok) return res.json();
    const text = await res.text();
    if (res.status === 429) {
      // e.g. "Rate limit exceeded for model gemini-3.8-flash-tts (limit: 100 requests per day on Tier 1). Please retry in
      // 10h34m45s …" (2026-11-06), or a QuotaFailure with a quotaId and a RetryInfo retryDelay
      const msg = (text.match(/"message":\s*"([^"]+)"/) || [])[1] || '';
      const quotas = [...new Set([...text.matchAll(/"quotaId":\s*"([^"]+)"/g)].map((m) => m[1]))];
      const wait = msg.match(/retry in ((?:\d+h)?(?:\d+m)?(?:\d+(?:\.\d+)?s)?)/i)?.[1] || '';
      if (quotas.some((q) => /PerDay/i.test(q)) || /per.?day|daily/i.test(msg || text)) fail(`Gemini's daily request limit for this key is used up${msg ? ` ("${msg.split('. ')[0]}")` : ''}; ${requests.voice + requests.lines} request(s) made this run. The takes made so far are saved: run the same command again ${wait ? `in ${wait}` : 'after it resets (midnight Pacific time)'}, or narrate with --provider elevenlabs or files.`);
      const hms = wait.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/);
      const delay = (hms && wait ? (+(hms[1] || 0)) * 3600 + (+(hms[2] || 0)) * 60 + (+(hms[3] || 0)) : Number((text.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/) || [])[1] || 60)) + 2;
      if (delay > 600) fail(`Gemini asks to wait ${wait || Math.round(delay) + ' s'} (${msg.split('. ')[0] || 'rate limit'}). The takes made so far are saved: run the same command again then, or narrate with --provider elevenlabs or files.`);
      if (attempt <= 6) { console.log(`  Gemini's per-minute limit: waiting ${Math.round(delay)} s`); await sleep(delay); continue; }
    }
    if ([500, 502, 503, 504].includes(res.status) && attempt < 5) { console.log(`  Gemini is busy (${res.status}); trying again in ${20 * attempt} s`); await sleep(20 * attempt); continue; }
    if (res.status === 400 && /API key not valid|API_KEY_INVALID/.test(text)) fail(`Gemini refused the key in ${keyName}: check it at aistudio.google.com/apikey`);
    if (res.status === 403) fail(`Gemini refused the request (403): the key's project may not have the Gemini API enabled. ${text.replace(/\s+/g, ' ').slice(0, 300)}`);
    fail(`Gemini ${pathname}: ${res.status} ${text.replace(/\s+/g, ' ').slice(0, 400)}`);
  }
}
// soft: a pattern; a refusal whose text matches it is returned as { error, text } instead of stopping the run
async function eleven(pathname, body, raw = false, { method = 'POST', soft = null } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try { res = await fetch('https://api.elevenlabs.io' + pathname, { method, headers: { 'xi-api-key': KEY, 'content-type': 'application/json' }, body: method === 'GET' ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(240e3) }); }
    catch (e) { if (attempt < 4) { console.log(`  ElevenLabs didn't answer (${e.name}); trying again in ${15 * attempt} s`); await sleep(15 * attempt); continue; } throw e; }
    if (res.ok) return raw ? Buffer.from(await res.arrayBuffer()) : res.json();
    const text = await res.text();
    if (soft && res.status < 500 && res.status !== 429 && soft.test(text)) return { error: res.status, text };
    if (res.status === 401) fail(`ElevenLabs refused the key in ELEVENLABS_API_KEY (401): ${/missing_permissions/.test(text) ? 'the key lacks a permission this needs (text to speech, voices read, voices write, voice generation)' : 'check it in your ElevenLabs settings'}.`);
    if (/quota_exceeded|insufficient/i.test(text)) fail('ElevenLabs: this plan has run out of credits for the month. The takes made so far are saved.');
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { console.log(`  ElevenLabs is busy (${res.status}); trying again in ${20 * attempt} s`); await sleep(20 * attempt); continue; }
    fail(`ElevenLabs ${pathname}: ${res.status} ${text.replace(/\s+/g, ' ').slice(0, 400)}`);
  }
}

const voicesFile = path.join(narrDir, 'voices.json');
async function voiceId() {
  if (voiceCfg.id) return voiceCfg.id;
  const voices = existsSync(voicesFile) ? JSON.parse(await readFile(voicesFile, 'utf8')) : {};
  const key = `${provider}:${voiceCfg.name}:${sha(voiceCfg.description)}`;
  if (voices[key]) return voices[key].id;
  console.log(`designing the voice "${voiceCfg.name}" from its description (${provider})`);
  let id;
  if (provider === 'google') {
    // Voice Design keeps the voice in the key's project (store: true); its ID is kept below and reused
    const r = await gemini('voices', { store: true, voice: { model: GEMINI_MODEL, type: 'prompted', display_name: `narration ${voiceCfg.name}`, gender: voiceCfg.gender || 'female', language_code: script.lang || 'en-US', prompted: { input: voiceCfg.description } } });
    id = r.id; requests.voice++;
  } else {
    // a preview needs 100–1000 characters of text: the script itself, or ElevenLabs' own when it's shorter
    const sample = lines.map((l) => l.text).join(' ').slice(0, 1000);
    const p = await eleven('/v1/text-to-voice/design', { voice_description: voiceCfg.description, model_id: ELEVEN_DESIGN_MODEL, ...(sample.length >= 100 ? { text: sample } : { auto_generate_text: true }) });
    requests.voice++;
    const v = await eleven('/v1/text-to-voice', { voice_name: `narration ${voiceCfg.name}`, voice_description: voiceCfg.description, generated_voice_id: p.previews[0].generated_voice_id });
    id = v.voice_id; requests.voice++;
  }
  if (!id) fail(`${provider} returned no voice id`);
  voices[key] = { id, name: voiceCfg.name, description: voiceCfg.description };
  await mkdir(narrDir, { recursive: true });
  await writeFile(voicesFile, JSON.stringify(voices, null, 2) + '\n');
  return id;
}

// ElevenLabs: the models this voice may speak on, best first. A designed voice speaks on eleven_v3 (it was designed
// there); a professional voice on the models it was trained on (ELEVEN_TRAINED_ORDER); voice.elevenlabs.model overrides.
// A library voice not yet in the account is added to it first (free). The answer is kept in narration/voices.json.
async function elevenModels() {
  if (voiceCfg.model) return [voiceCfg.model];
  if (!voiceCfg.id) return [ELEVEN_TTS_MODEL];
  const voices = existsSync(voicesFile) ? JSON.parse(await readFile(voicesFile, 'utf8')) : {};
  const key = `elevenlabs-models:${voiceCfg.id}`;
  if (voices[key]) return voices[key];
  if (!KEY) return null;
  let v = await eleven(`/v1/voices/${voiceCfg.id}`, null, false, { method: 'GET', soft: /not.?found|voice_not_found|does not exist|invalid/i });
  if (v.error && voiceCfg.owner) {
    console.log(`adding the library voice "${voiceCfg.name}" to this ElevenLabs account`);
    await eleven(`/v1/voices/add/${voiceCfg.owner}/${voiceCfg.id}`, { new_name: `narration ${voiceCfg.name}` });
    v = await eleven(`/v1/voices/${voiceCfg.id}`, null, false, { method: 'GET' });
  } else if (v.error) fail(`ElevenLabs has no voice ${voiceCfg.id} in this account (${v.error}): add it from the voice library first.`);
  let models = [ELEVEN_TTS_MODEL];
  if (v.category === 'professional') {
    const trained = Object.entries(v.fine_tuning?.state || {}).filter(([, st]) => st === 'fine_tuned').map(([m]) => m);
    models = ELEVEN_TRAINED_ORDER.filter((m) => trained.includes(m));
    if (!models.length) fail(`"${voiceCfg.name}" is a professional voice trained on none of ${ELEVEN_TRAINED_ORDER.join(', ')}; set voice.elevenlabs.model to one it was trained on (${trained.join(', ') || 'none listed'}).`);
    console.log(`"${voiceCfg.name}" is a professional voice: speaking on ${models[0]}, a model it was trained on`);
  }
  voices[key] = models;
  await mkdir(narrDir, { recursive: true });
  await writeFile(voicesFile, JSON.stringify(voices, null, 2) + '\n');
  return models;
}
async function keepModels(models) {
  const voices = existsSync(voicesFile) ? JSON.parse(await readFile(voicesFile, 'utf8')) : {};
  voices[`elevenlabs-models:${voiceCfg.id}`] = models;
  await writeFile(voicesFile, JSON.stringify(voices, null, 2) + '\n');
}
// audio tags ("[warmly]") are eleven_v3's; any other model would read them aloud
const sayFor = (l, model) => provider === 'elevenlabs' && model !== 'eleven_v3' ? sayOf(l).replace(/\[[^\]]*\]\s*/g, '').trim() : sayOf(l);

// ---------------------------------------------------------------- the takes
const redo = new Set((opt('redo', '') || '').split(',').filter(Boolean));
for (const r of redo) if (!lines.some((l) => l.id === r)) fail(`--redo: no line "${r}"`);
async function takes() {
  if (provider === 'files') {
    const rec = path.join(narrDir, 'recorded'), missing = [], files = {};
    for (const l of lines) {
      const f = ['.wav', '.m4a', '.mp3', '.aif', '.aiff', '.flac'].map((e) => path.join(rec, l.id + e)).find(existsSync);
      if (f) files[l.id] = f; else missing.push(l.id);
    }
    if (missing.length) fail(`no recording for ${missing.join(', ')}: put one take a line in ${rec}/<id>.wav (any format ffmpeg reads)`);
    return files;
  }
  const folder = path.join(narrDir, 'takes', `${provider}-${voiceCfg.name}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase());
  await mkdir(folder, { recursive: true });
  const files = {};
  let id = null;
  const models = provider === 'elevenlabs' ? await elevenModels() : null;
  // a take is one line, or a run: lines that carry one sentence across the picture ("run": "a" on each), voiced as
  // one take so the voice carries on through them, then cut at its pauses, one piece a line
  const units = [];
  for (const l of lines) { const u = units.at(-1); if (l.run && u && u[0].run === l.run) u.push(l); else units.push([l]); }
  const join = (ls, say) => ls.map((l, i) => i < ls.length - 1 ? say(l).replace(/[\s,;:—–-]+$/u, '') + '...' : say(l)).join(' ');
  for (const unit of units) {
    const first = unit[0], label = unit.length > 1 ? `${first.run} (${unit.map((l) => l.id).join(', ')})` : first.id;
    const spec = provider === 'google'
      ? { provider, model: GEMINI_MODEL, voice: voiceCfg.id || `${voiceCfg.name}:${sha(voiceCfg.description)}`, say: join(unit, sayOf), style: unit.map(styleOf).reduce((a, b) => b.length > a.length ? b : a) }
      : { provider, model: models?.[0] ?? ELEVEN_TTS_MODEL, format: ELEVEN_FORMAT, voice: voiceCfg.id || `${voiceCfg.name}:${sha(voiceCfg.description)}`, say: join(unit, (l) => sayFor(l, models?.[0] ?? ELEVEN_TTS_MODEL)) };
    const saved = [];
    for (const l of unit) {
      const wav = path.join(folder, `${l.id}.wav`), meta = path.join(folder, `${l.id}.json`);
      const was = existsSync(meta) ? JSON.parse(await readFile(meta, 'utf8')) : null;
      if (existsSync(wav) && was && JSON.stringify(was.spec) === JSON.stringify(spec) && !redo.has(l.id)) saved.push(wav);
    }
    if (saved.length === unit.length) { unit.forEach((l, i) => { files[l.id] = saved[i]; }); continue; }
    // a key is needed only for a take that isn't saved yet
    if (!KEY) fail(provider === 'google'
      ? 'No Gemini key: set GEMINI_API_KEY (make one at aistudio.google.com/apikey), or narrate with --provider elevenlabs or files.'
      : 'No ElevenLabs key: set ELEVENLABS_API_KEY (from your ElevenLabs settings, with text to speech and voice generation allowed), or narrate with --provider google or files.');
    id ??= await voiceId();
    let bytes;
    if (provider === 'google') {
      const r = await gemini('interactions', { model: GEMINI_MODEL, input: [{ type: 'user_input', content: [{ type: 'text', text: spec.say, annotations: [{ type: 'speech_metadata', style: spec.style }] }] }], response_format: { type: 'audio' }, generation_config: { speech_config: [{ voice: id }] } });
      const audio = (r.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || []).find((c) => c.type === 'audio');
      if (!audio) fail(`Gemini returned no audio for ${label}`);
      bytes = Buffer.from(audio.data, 'base64');
      if (bytes.subarray(0, 4).toString() !== 'RIFF') bytes = wavPcm16(bytes, 24000); // raw 24 kHz PCM, if it comes bare
    } else {
      for (;;) {
        const r = await eleven(`/v1/text-to-speech/${id}?output_format=${ELEVEN_FORMAT}`, { text: spec.say, model_id: spec.model }, true, { soft: /model_access_denied|unauthorized_to_access_model/ });
        if (!r.error) { bytes = wavPcm16(r, 24000); break; }
        // a trained model this plan can't use (eleven_v4_hq on Starter): the next trained one, never eleven_v3
        if (!models || models.length < 2) fail(`ElevenLabs: this plan can't use ${spec.model}, and "${voiceCfg.name}" has no other trained model to fall back on.`);
        console.log(`  ${spec.model} isn't open to this plan: using ${models[1]}`);
        models.shift(); await keepModels(models);
        spec.model = models[0]; spec.say = join(unit, (l) => sayFor(l, spec.model));
      }
    }
    requests.lines++;
    let pieces = [bytes];
    if (unit.length > 1) {
      const whole = path.join(folder, `${first.run}-run.wav`);
      await writeFile(whole, bytes);
      pieces = await splitRun(whole, unit.length, label, unit.map((l) => words(l.text)));
    }
    for (const [i, l] of unit.entries()) {
      const wav = path.join(folder, `${l.id}.wav`), meta = path.join(folder, `${l.id}.json`);
      if (existsSync(wav)) { // keep the take it replaces, once the new one is in hand
        const old = path.join(folder, 'superseded'); await mkdir(old, { recursive: true });
        let n = 1; while (existsSync(path.join(old, `${l.id}-${n}.wav`))) n++;
        await rename(wav, path.join(old, `${l.id}-${n}.wav`));
        if (existsSync(meta)) await rename(meta, path.join(old, `${l.id}-${n}.json`));
      }
      await writeFile(wav, pieces[i]);
      await writeFile(meta, JSON.stringify({ spec, text: l.text }, null, 2) + '\n');
      files[l.id] = wav;
    }
    console.log(`  take: ${label}`);
  }
  return files;
}

// a run's one take, cut into its lines at its longest pauses (one fewer than its lines), in time order
// shares: each line's word count, so each cut goes at the pause nearest where the words put it (the longest pause can
// fall inside a line: "Make the call, | note the reason," took one, 2026-11-07)
async function splitRun(file, n, label, shares) {
  const [a] = await decode(file, 1);
  const W = Math.round(0.01 * SR), frames = Math.floor(a.length / W), rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) { let e = 0; for (let i = f * W; i < (f + 1) * W; i++) e += a[i] * a[i]; rms[f] = Math.sqrt(e / W); }
  const peak = rms.reduce((m, v) => Math.max(m, v), 0), th = Math.min(10 ** (-40 / 20), peak * 10 ** (-30 / 20));
  let on0 = rms.findIndex((v) => v > th), on1 = frames - 1; while (on1 > 0 && rms[on1] <= th) on1--;
  const gaps = [];
  for (let f = on0, g = -1; f <= on1; f++) {
    if (rms[f] <= th) { if (g < 0) g = f; } else if (g >= 0) { if (f - g >= 10) gaps.push([g, f]); g = -1; }
  }
  if (gaps.length < n - 1) fail(`${label}: the take ran its lines together (${gaps.length} pause(s) for ${n} lines). Voice it again with --redo ${label.match(/\(([^,)]+)/)[1]}, or end each line but the last with a comma.`);
  const total = shares.reduce((a, b) => a + b, 0), cuts = [];
  let acc = 0, from0 = 0;
  for (let i = 0; i < n - 1; i++) {
    acc += shares[i];
    const want = on0 + (on1 - on0) * (acc / total);
    // the pause after the previous cut nearest the expected point, longer pauses winning a near tie
    const pick = gaps.filter((g) => g[0] > from0).map((g) => ({ g, cost: Math.abs((g[0] + g[1]) / 2 - want) / 100 - (g[1] - g[0]) / 100 * 0.5 }))
      .sort((x, y) => x.cost - y.cost)[0];
    if (!pick) fail(`${label}: no pause left for the cut after line ${i + 1}`);
    cuts.push(pick.g); from0 = pick.g[1];
  }
  const out = [];
  let from = 0;
  for (const [g0, g1] of cuts) { out.push(a.slice(from, Math.min(a.length, (g0 + 6) * W))); from = Math.max(0, (g1 - 5) * W); }
  out.push(a.slice(from));
  return out.map((x) => wavFloat([x]));
}

// a take without the silence (and faint noise) around its speech: from 50 ms before the first 10 ms above the
// threshold to 60 ms after the last, with 5 ms fades
function trim(a) {
  const W = Math.round(0.01 * SR), h = W >> 1, P = new Float64Array(a.length + 1), rms = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) P[i + 1] = P[i] + a[i] * a[i];
  for (let i = 0; i < a.length; i++) rms[i] = Math.sqrt(Math.max(0, P[Math.min(a.length, i + W - h)] - P[Math.max(0, i - h)]) / W);
  let peak = 0; for (const v of rms) peak = Math.max(peak, v);
  // −42 dBFS clears the faint noise a generated take opens on; a quiet recording gets 30 dB under its loudest
  const th = Math.min(10 ** (-42 / 20), peak * 10 ** (-30 / 20));
  let on0 = -1, on1 = -1;
  for (let i = 0; i < a.length; i++) if (rms[i] > th) { if (on0 < 0) on0 = i; on1 = i; }
  if (on0 < 0) return null;
  const lo = Math.max(0, on0 - Math.round(0.05 * SR)), hi = Math.min(a.length, on1 + Math.round(0.06 * SR));
  const seg = a.slice(lo, hi), e = Math.min(Math.round(0.005 * SR), seg.length >> 1);
  for (let i = 0; i < e; i++) { seg[i] *= i / (e - 1 || 1); seg[seg.length - 1 - i] *= i / (e - 1 || 1); }
  return seg;
}

// where each line goes: at its start, or earlier within its act when it would run into the next line
async function place(files, land) {
  const rows = [];
  for (const [i, l] of lines.entries()) {
    const [a] = await decode(files[l.id], 1);
    const seg = trim(a);
    if (!seg) fail(`${l.id}: the take is silent`);
    const len = seg.length / SR, next = lines[i + 1];
    const deadline = l.endBy ?? (next ? startOf(next) - GAP : Math.min(l.window[1] - 0.01, land !== undefined ? land - GAP : Infinity));
    const prevEnd = rows.length ? rows[rows.length - 1].end + GAP : 0;
    let start = startOf(l);
    if (start + len > deadline) start = Math.max(l.window[0] + 0.02, prevEnd, deadline - len);
    rows.push({ id: l.id, text: l.text, seg, seconds: +len.toFixed(2), start: +start.toFixed(3), end: +(start + len).toFixed(3), deadline: +deadline.toFixed(3), fits: start + len <= deadline + 1e-6 });
  }
  return rows;
}
function report(rows) {
  for (const r of rows) console.log(`  ${r.id.padEnd(10)} ${r.seconds.toFixed(2).padStart(5)} s  ${r.start.toFixed(2).padStart(6)} → ${r.end.toFixed(2).padStart(6)}  (by ${r.deadline.toFixed(2)})${r.fits ? '' : '  OVERRUNS'}`);
  const over = rows.filter((r) => !r.fits);
  for (const r of over) console.log(`${r.id} is ${r.seconds} s; it has ${(r.deadline - (lines.find((l) => l.id === r.id).window[0] + 0.02)).toFixed(2)} s. Shorten the line (about ${Math.ceil((r.end - r.deadline) * WORDS_PER_SECOND)} word(s) fewer), or give its act more time. Speech is never sped up.`);
  return !over.length;
}

// ---------------------------------------------------------------- the mix
const files = await takes();
const said = `${requests.voice + requests.lines} request(s) to ${provider === 'google' ? 'Gemini' : 'ElevenLabs'} (${requests.voice} for the voice, ${requests.lines} for lines)`;
if (provider !== 'files') console.log(said);
if (flag('takes')) {
  const ok = report(await place(files, script.land));
  process.exit(ok ? 0 : 1);
}

const names = flag('all')
  ? (await readdir(outDir)).filter((f) => /^\d+x\d+\.mp4$/.test(f)).map((f) => f.slice(0, -4))
  : [opt('size', '16:9').replace(':', 'x')];
if (!names.length) fail(`no rendered MP4s in ${outDir}: render the film first (render.mjs --all --video …)`);
let allOk = true;
for (const name of names) {
  const film = path.join(outDir, `${name}.mp4`);
  if (!existsSync(film)) fail(`no ${film}: render it first`);
  const land = script.land;
  const { out: probe } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', film]);
  const duration = Number(probe.toString().trim());
  console.log(`\n${name}: ${duration.toFixed(2)} s${land !== undefined ? `, the song lands at ${land} s` : ''}`);
  const rows = await place(files, land);
  if (!report(rows)) { allOk = false; console.log(`${name}: not mixed (a line overruns)`); continue; }

  const n = Math.round(duration * SR);
  const voice = new Float32Array(n), duck = new Float32Array(n);
  for (const r of rows) {
    const b = Math.round(r.start * SR), end = Math.min(n, b + r.seg.length);
    for (let i = b; i < end; i++) voice[i] += r.seg[i - b];
    // the dip: a raised cosine in over 100 ms before the line, held, out over 400 ms after it
    const at = Math.round(ATTACK * SR), rl = Math.round(RELEASE * SR), x = Math.max(0, b - at), z = Math.min(n, end + rl);
    for (let i = x; i < b; i++) duck[i] = Math.max(duck[i], (1 - Math.cos(Math.PI * (i - x) / Math.max(1, b - x - 1))) / 2);
    for (let i = b; i < end; i++) duck[i] = 1;
    for (let i = end; i < z; i++) duck[i] = Math.max(duck[i], (1 + Math.cos(Math.PI * (i - end) / Math.max(1, z - end - 1))) / 2);
  }
  const tmp = path.join(outDir, `.${name}-narration`);
  await mkdir(tmp, { recursive: true });
  const rawVoice = path.join(tmp, 'voice-raw.wav');
  await writeFile(rawVoice, wavFloat([voice]));
  const vl = Number((await loudnorm(rawVoice)).input_i);
  const vg = 10 ** ((VOICE_LUFS - vl) / 20);
  const bed = await decode(film, 2);
  const mix = [new Float32Array(n), new Float32Array(n)];
  for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) mix[c][i] = (i < bed[c].length ? bed[c][i] : 0) * 10 ** (DUCK_DB * duck[i] / 20) + voice[i] * vg;
  const pre = path.join(tmp, 'premaster.wav');
  await writeFile(pre, wavFloat(mix));
  const preL = await loudnorm(pre);

  // master: a gain to −14 LUFS, a limiter holding samples under −2 dBFS (room for the AAC encoder's overshoot, so
  // the file keeps under about −1.5 dBTP), then measured as encoded and the gain corrected if it missed by more than 0.1 LU
  const outFile = path.join(outDir, `${name}-narrated.mp4`);
  let gain = MASTER_LUFS - Number(preL.input_i), got;
  for (let pass = 1; pass <= 3; pass++) {
    await run('ffmpeg', ['-v', 'error', '-y', '-nostdin', '-i', film, '-i', pre, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
      '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.794:attack=1:release=60:level=false,aresample=${SR}`,
      '-c:a', 'aac', '-b:a', '256k', '-t', String(duration), '-movflags', '+faststart', outFile]);
    got = await measure(outFile);
    if (Math.abs(got.lufs - MASTER_LUFS) <= 0.1 || pass === 3) break;
    gain += MASTER_LUFS - got.lufs;
  }
  // the picture is the music-only film's, packet for packet
  const md5 = async (f) => (await run('ffmpeg', ['-v', 'error', '-nostdin', '-i', f, '-map', '0:v:0', '-c', 'copy', '-f', 'md5', '-'])).out.toString().trim();
  const samePicture = (await md5(film)) === (await md5(outFile));
  await rm(tmp, { recursive: true, force: true });

  const srt = rows.map((r, i) => { const t = (s) => { const ms = Math.round(s * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; }; return `${i + 1}\n${t(r.start)} --> ${t(r.end)}\n${r.text}\n`; }).join('\n');
  await writeFile(path.join(outDir, `${name}-narrated.srt`), srt);
  const summary = { film: `${name}.mp4`, narrated: `${name}-narrated.mp4`, provider, voice: voiceCfg.name || 'recorded', land: land ?? null,
    lines: rows.map(({ seg, ...r }) => r), voice_lufs_before: vl, voice_lufs: VOICE_LUFS, duck_db: DUCK_DB, premaster_lufs: Number(preL.input_i),
    master: { lufs: got.lufs, dbtp: got.dbtp, gain_db: +gain.toFixed(2) }, same_picture: samePicture };
  await writeFile(path.join(outDir, `${name}-narration.json`), JSON.stringify(summary, null, 2) + '\n');
  console.log(`wrote ${outFile}: ${got.lufs} LUFS, ${got.dbtp} dBTP; picture ${samePicture ? 'identical to' : 'DIFFERS FROM'} ${name}.mp4`);
  console.log(`speech ends at ${rows[rows.length - 1].end.toFixed(2)} s; transcript ${name}-narrated.srt`);
  if (!samePicture || got.dbtp > CEILING_DBTP + 0.5) allOk = false;
}
process.exitCode = allOk ? 0 : 1;
