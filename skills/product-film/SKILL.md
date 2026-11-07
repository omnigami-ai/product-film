---
name: product-film
description: >-
  Launch video from your product's real screens: 34 seconds in five acts (problem, promise, the product at work,
  result, ask) with a big cursor, a moving camera, captions and sound, in wide, square and tall, with an optional
  narrated version. Use when the user
  asks for a launch video, product video, promo, demo video, teaser or motion graphics for their product, app or
  website.
---

# Product film

**If several skills could do this:** when the request doesn't name this skill and your agent also has other omnigami skills that make the same kind of thing (other launch films, shots, decks or mockups), list them by name and ask which one the user wants before you start. If it's named, or it's the only one installed, go ahead.

For Japanese, Korean or Chinese product pages, keep the copy in that language and set the film’s `lang` to the page’s `<html lang>`; bundled Noto faces and phrase breaks handle the text.

Make a launch film that sells one product: the problem in huge type, one
line of promise, four proof steps on the product's real screens, the result,
and an ask held to the last frame. Start from the finished film in `reference/`
(Lamplit, a fictional developer tool made for omnigami's examples; story in
`reference/STORY.md`). Its toolkit (type, cursor, page camera, colour fields,
caption column, drawing, music) stays; its words, screens and steps become the user's.

Read `style.md` before you build and `critique.md` before you judge.

## Start or resume

- Check Node 20+, ffmpeg and a local Chrome-family browser
  (`scripts/chrome.mjs` finds it; `CHROME_PATH` overrides). Explain anything
  missing.
- Use what the user gave: the product's URL, anything to show or avoid, the
  ask (sign up, install, a URL). Read the site before asking. Ask once for what
  the site can't answer. If the user wants no questions or an unattended run,
  decide from the site.
- If `product-film/` already exists with `film/STORY.md`, this is a revision:
  work on that film. For another film, use a new folder and reuse
  `PRODUCT.md`'s brand notes.

Set up a first film:

```bash
mkdir product-film && cd product-film
cp -R "$SKILL_DIR/reference" reference && cp -R "$SKILL_DIR/reference" film && cp -R "$SKILL_DIR/scripts" scripts && cp -R "$SKILL_DIR/music" music
rm -rf film/assets/screens film/assets/brand film/plans film/narration
npm init -y >/dev/null && npm i -D puppeteer-core
```

`SKILL_DIR` is this file's folder. `reference/` stays untouched, to compare
against.

## Learn the product, then write the story

1. `node scripts/capture.mjs <url> capture`: look at every screenshot and read
   `capture/brand.json`. Find what the product does, its own words, its brand
   colour and mark, the claims it makes and where each comes from, and where
   its real UI can be reached (the page itself, a live demo, a sandbox).
2. Write `film/STORY.md` in the shape of `reference/STORY.md`. It is one
   story, not a tour of features:
   - **the viewer and their goal:** who the product is for, and the one job
     they come to it for, in the site's own terms;
   - **the problem** in their way, which the site itself names (the hook):
     the old way and what it costs them, every line of which gets struck out;
   - **the turn:** the hook's answer in its own terms (the opposite of its
     problems, in as few words), with the product named within a beat;
   - **three or four steps** toward the goal on the real product, each with a
     caption (what the viewer does or learns, a few words), the real screen
     and the states to capture, the action, and the result on screen that
     answers the caption;
   - **the payoff:** the goal reached; **the ask:** the one action;
   - the times on the 120 BPM grid, and every claim with its source. Numbers
     come only from a source you cite.
   Read it back as a stranger would: if a step's result doesn't answer its
   caption, or a step doesn't move toward the goal, change it.
3. Show the user the story in a few lines (the five acts, the two actions)
   and ask for one review, unless they asked for an unattended run. Never take
   silence as approval.

## Capture the real screens

1. Write `film/plans/app.json` in the shape of `reference/plans/lamplit.json`
   (the format is at the top of `scripts/screens.mjs`):
   - every state the story shows, as `click`, `type`, `drag` (a held press,
     for the app's own pressed state) and `capture` steps;
   - each screen whole, at scale 3, so the camera can move in close;
   - a typed field as `type` with `around` its panel (one capture a letter);
   - `rects`: every element the camera, a colour field or the cursor uses, by name.
   One set of captures serves every shape: each shape frames them for itself.
   Dismiss cookie banners with a `click` step. Use `hide` for anything the
   film draws itself.
2. Run it:
   ```bash
   node scripts/screens.mjs film/plans/app.json film/assets/screens
   ```
3. Look at every capture. Fix the plan until each state is right. If the UI
   needs a sign-in, ask for a demo account or a public demo, or use the user's
   own screenshots. Never capture customer data, and never draw an imagined
   UI.

## Build the film

Edit `film/index.html`. Its sections are labelled KEEP, ADAPT and REPLACE.

- **ADAPT the words:** `DEFAULTS` and `FIELDS`, from `STORY.md`, including
  the step captions (`step1` … `step4`) and their times in `STEPS`.
- **ADAPT the colours:** the grounds (`INK`, `NIGHT`, `INK2`), the text and
  the one accent from the product (the reference is dark first; a light
  product takes its paper and ink). Put the product's mark in
  `film/assets/brand/mark.svg`; it grows under the turn, opens into the one
  line, and leads the lockups.
- **ADAPT the proof:** `P` (when each click and change happens), `screenAt`
  (which capture is on screen), the framings in `proofScene` (page rects the
  camera shows whole, with a narrower set for tall), `floats` (the element in
  play, alone on a dark field), `PATCH` (the only regions that change when a
  state advances in place: measure them by diffing the captures), `SETTLED`
  (when each step's result has settled on screen), and the cursor's
  `cursorSets`. A page the app opens arrives on a cut; a state that changes
  in place changes only inside `PATCH`.
- **Every click in sync with the cursor:** write each cursor set with
  `clickKeys` (its comment shows Lamplit's three that way). The cursor glides
  in, arrives and rests still on the target for 0.3–0.5 s, presses exactly
  when the app's own pressed state shows (the same `P` time drives both), holds
  still through the press, then leaves. A field is clicked the same way; the
  words start typing once the press is over, and the cursor steps aside and
  holds still while they type. Never key the cursor's arrival and its exit
  either side of the click: it would be gliding off the button as it presses.
  Delete `APPROVED_CURSOR` and Lamplit's own sets (its approved cut predates
  this rule). The film's checks fail any press where the cursor isn't resting
  on its target rect, or has moved in the 0.25 s before it.
- **ADAPT the payoff and the ask:** `TILES` (three of your real screens) and
  your name, address, line to type and tagline.
  Keep the act times on bar lines, and keep the cues in step with the acts.
- **KEEP** the toolkit, the camera, the fields, the drawing, and the 120 BPM
  grid, with room where the viewer needs it (style.md, "Pauses"): each step's
  caption reads before its first action; after each result settles, about a
  second to read it before the next camera or cursor move; after a page change
  or long glide, the screen holds before the click. Keep it lively: nothing in
  the proof sits dead for more than about 1.8 s. When your words are longer or
  shorter, move the holds (`TU`, `ST`, `P`), not the product's own working.
  When the steps need more room than 34 s gives, lengthen the film a bar
  (2 s) at a time, up to about 40 s: move `ST` and `DURATION` together, keep
  the acts' shares (style.md, "The five acts"), and update `STORY.md`'s times.
  The song fits itself to the new length (it lands on the last bar line at
  least 3.5 s before the end); with `--music`, stretch the last of
  `music.sections` to the new bar count.

Write `PRODUCT.md` at the project root: the URL, what the product does, the
brand colour and mark (with licences), the chosen words, the date.

## Review, render, deliver

1. Sheets and phone checks for every shape:
   ```bash
   node scripts/render.mjs film --all --times key --sheet
   node scripts/render.mjs film --all --phone
   ```
   Then 12-frame strips at every whip, pull-back and flood, in wide and in
   tall: `node scripts/render.mjs film --size 9:16 --strip <time>`.
2. Score with `critique.md` and fix the worst problems. Before shipping, get
   a fresh judgement. If your agent can start a sub-agent without this
   session's memory, give it `critique.md`, `STORY.md` and the images, nothing
   else, and fix what it finds. Otherwise reread `critique.md` and score from
   the images alone. Nothing ships below 8. After three rounds, report what
   remains.
3. Check repeatability and the film's own checks:
   `node scripts/render.mjs film --all --check`. They fail a press where the
   cursor isn't resting on its target, a field typing with the cursor moving, a
   result with under 0.9 s before the next move, a caption without time to read
   before its click, a dead hold over 1.8 s in the proof, and a length off the
   bar grid. Fix the timing, not the checks.
4. Render:
   ```bash
   node scripts/render.mjs film --all --video --blur 4 --audio music/song.mp3 --sound --poster <time>
   ```
   This writes `out/16x9.mp4`, `out/1x1.mp4` and `out/9x16.mp4`: 60 fps, with
   motion blur, the skill's song and effects, around −14 LUFS. It takes several minutes:
   run it in the foreground and wait for all three files before handing over.
   In an unattended run, a render left in the background can be cut off when
   the session ends. The song (`music/song.mp3`: nu-disco at 120 BPM) is fitted
   to each shape: it starts on a bar line and, near the end, lands one hit, where
   its drums stop and the rest closes and fades (from its stems in
   `music/song-stems/`). `--from <seconds>` starts at another of its distinct 8-bar sections (the song is about two minutes long).
   `--music` gives the synthesised score instead; the user's own song works with
   `--audio their.wav`.
5. Run `node scripts/preview.mjs film` and give its localhost address. It plays
   every shape and edits the words; saved edits need a new render to reach
   the MP4s.
6. Write `README.md` (the files, how to preview, how to change a word, how to
   render) and `out/CAPTION.md` (a post under 280 characters in the product's
   own words, with its URL). Hand over the MP4 links, the posters, the
   caption, a short check summary, and the one change that would most improve
   the film. Put the detailed scores in `out/REVIEW.md`.
7. If the user asked for a narrated version, make it now ("Narrated version",
   below) and hand it over beside the music-only films.

## Narrated version (optional)

A second cut of the same film with a voice reading short lines through the acts
over the song. The music-only films stay the main delivery; the narrated MP4s
reuse their picture exactly. Make it when the user asks for a voice-over,
narration or a spoken version. When you show the story for review, you may
offer it once in a line ("I can also make a narrated version: it needs a
Gemini or ElevenLabs API key, or your own recording of the lines"). Don't
make it unasked, and never in place of the music-only films.

**Voice, one of three:**

- **Google (the default):** Gemini 3.8 Flash TTS through the Gemini API, with
  the user's own key: make one at aistudio.google.com/apikey and
  `export GEMINI_API_KEY=…`. The voice is designed from a written description
  (omnigami's "Iris", or the user's own) and kept in the key's Google project;
  its ID is saved in `film/narration/voices.json`, so later films keep the
  voice. The default direction is warm and conversational, with connected
  phrases, downward sentence endings, no up-talk, and each sentence starting
  cleanly on its own first word. A film costs about eight requests (one for
  the voice, one a line), a few hundred characters: pennies. A key's tier sets a daily request limit
  (100 a day on Tier 1). The script waits out a per-minute limit and stops at
  the daily one with the takes so far saved; run it again after the reset.
  Never switch it to another model (a "lite" one) to get past a limit: its
  voice is thinner. Wait for the reset, or use ElevenLabs or the user's own
  recording, and say which in the handover.
- **ElevenLabs:** the user's own key, from their ElevenLabs settings, with
  text to speech, voices read and voices write allowed;
  `export ELEVENLABS_API_KEY=…`. The voice is omnigami's pick from the public
  voice library, "Lara", a studio-trained voice that sounds the same for
  every user; narrate.mjs adds her to their voice list the first time. A
  studio-trained (professional) voice is spoken on a model it was trained on
  (eleven_v4, or the next one their plan allows), never on eleven_v3, where
  it only approximates the voice and comes out thin; narrate.mjs reads this
  from ElevenLabs and picks the model. Don't change it. 24 kHz PCM. A film
  uses a few hundred credits. Using
  ElevenLabs audio commercially (a launch film is commercial) needs a paid
  plan; tell the user before they rely on a free account.
- **Their own voice, free:** one recording a line, named by the line's id, in
  `film/narration/recorded/` (`problem.wav`, `promise.wav`, …; any common
  audio format). A quiet room and a phone held close are enough. Each take is
  trimmed and levelled like the generated ones.

A stock voice (Google) or a library voice (ElevenLabs) is fine if the user
asks for one: give its id in the script's `voice`. To change the voice,
write a description in `voice` (who is speaking, their age, accent and
manner, "never an announcer").

**Write the script:** `film/narration/script.json`, in the shape of
`reference/narration/script.json` (its format is at the top of
`scripts/narrate.mjs`):

- one short line per act (the problem, the promise, each step, the result),
  written from `STORY.md` in the product's own words. Say what each moment
  does for the viewer, like the captions, but don't read the captions out;
- one sentence a line at most. A second sentence gets its own line, with its
  own `start` at the moment it describes and its own `window` from there to
  the act's end, never tacked onto the first. narrate.mjs refuses a line with
  two sentences;
- let the lines run into each other, not a list of statements. After the
  opening problem and promise, a sentence can carry across the steps: "Make
  the call, note the reason," / "and two of them get moving." / "So by
  Friday, your update's already started." / "Just give it a read, and share
  it." Give the lines of one sentence the same `"run": "a"` (the next one
  `"b"`): they are voiced as one take, so the voice carries on instead of
  closing each line. Closely connected sentences may share a run too. Keep
  the line's own punctuation: a comma for a continuing sentence, a full stop
  and a capital first word for a new sentence. Never
  join lines with "..." or "…": the voice trails off, pauses oddly, or carries
  the next line's first word onto the previous one. The script joins them
  with a space, estimates boundaries from word counts, and cuts at the nearest
  pause, never just the longest one. Check each cut: the next line must start
  with its own first word ("Just give", never "give" after an earlier "just"). Reject and
  redo a take with words across a cut or a pause inside a phrase. Start the
  first piece late enough that the gap to the next is about half a second;
- plain, concrete words for what happens on screen ("two of them get
  moving", "give it a read, and share it"). Keep tagline phrasing out of the
  proof steps, use no people's names from the sample data, and keep lines in
  the steps short (four to eight words where possible);
- each line's `window` is its act's times from `STORY.md`. Size the line to
  the act at about 2.5 words a second, so it ends well before the next act.
  Speech is never sped up: when a take is too long, cut words;
- no spoken ask. End on the result, optionally followed by a short benefit
  line across the end card, with a natural breath between them. The ask stays
  music and picture ("Try it" sounds insincere in every voice);
- the name said right: find how the company says it (its site, videos,
  docs) and ask the user if it's ambiguous. In an unattended run, take the
  plainest reading and say so in the handover. Add a `pronounce` entry: a
  `note` for Google, a `respell` for ElevenLabs;
- on ElevenLabs with a designed voice (eleven_v3), an audio tag such as
  `[warmly]` (in the line's `say`) softens a line that comes out harsh. Lara's
  model has no tags (narrate.mjs takes them out); `--redo` the line instead.

**Lamplit narrated example (34 seconds, wide):** the approved script in
`reference/narration/script.json` uses Lara (`vChnJZ1Cu89g2XXumPfT`) on
`eleven_v4`. The first two sentences share the `opening` run; the next three
share `proof`. Each run keeps the written full stops and space joins. The
result and tagline are separate takes. These are the exact lines and measured
placements of the approved take; adapt the words and windows to your product.

| Id | Run | Window (s) | Start (s) | Clip ends (s) | Exact line |
| --- | --- | --- | ---: | ---: | --- |
| problem | opening | 0–4 | 0.120 | 3.776 | A broken background job shouldn't turn into another sleepless night. |
| promise | opening | 4–10 | 4.120 | 7.998 | With Lamplit, one command gets your jobs running where you can see them. |
| follow | proof | 10–13.5 | 10.080 | 12.868 | Follow a job from its first step to its last. |
| replay | proof | 13.5–20.5 | 13.580 | 18.119 | See exactly where it failed and replay it from there without redoing the rest. |
| schedule | proof | 20.5–26 | 20.620 | 24.422 | Then tell it when to run in plain words and check the next dates. |
| result | separate | 26–29 | 26.100 | 27.804 | And you sleep through the night. |
| tagline | separate | 28.374–34 | 28.374 | 30.797 | Less guesswork, more confidence. |

The tagline's `endBy` is 32 s and the song's `land` is 34 s. The measured
breath between “night” and “Less” is **700 ms** (27.73–28.43 s): the guarded
audio clips have a 570 ms gap. The end card runs 29–34 s and holds 3.203 s
after the tagline's clip ends. Preserve that breath when placing cached takes;
a fresh TTS take can have different timing and must be checked again.

**Make it:**

```bash
node scripts/narrate.mjs film --plan                 # the words against each act's time
node scripts/narrate.mjs film --all                  # Google; or --provider elevenlabs | files
```

It makes a take a line, places each at its act's start (a long one starts
earlier in its act and ends 0.12 s before the next line, the last by the end
of its act; if the song lands earlier than that, set `land` to the time
render.mjs printed), dips the song 8 dB under the voice, masters to −14 LUFS and
writes `out/<shape>-narrated.mp4` with `-narrated.srt` (the lines, timed) and
`-narration.json` (the timing and loudness). Takes are saved in
`film/narration/takes/` and reused, so a re-render makes no requests and
sounds the same. When you change a line, only that line is made again.
`--redo step-2` makes a new take of one line (the old one is kept in
`superseded/`).

**Check:** the timing report shows every line inside its act (the script
won't mix one that overruns: shorten that line). Listen to every take, or
have the user listen if you can't: the name said right, no harsh or flat
line, nothing garbled. The report confirms the picture is identical to the
music-only MP4 and the loudness is −14 LUFS.

**No key and no recording:** deliver the music-only films as usual, and tell
the user that a narrated version needs only a Gemini or ElevenLabs key (or
their own recording of the lines in `script.json`), then the command above.

## Revisions

For a request like "hold the result longer" or "show the export instead",
edit the current story and film. Keep what was approved and the user's saved
words. Recapture only the states that changed, rerun the checks, render
again, and update `STORY.md` and `PRODUCT.md`.

## Hard rules

- Real screens only, captured; sample data only; only the user's brand.
- Every claim on screen has a source in `STORY.md`.
- Breathing room: every step's caption is read before anything moves, the
  element is seen before it is acted on, and every result reads for about a
  second before the next camera or cursor move. No dead hold over about 1.8 s.
  When the story doesn't fit, lengthen the film a bar at a time (up to about
  40 s) or drop a step; never compress the holds.
- The cursor is still on its target when it presses, in time with the app's
  own pressed state (`clickKeys`).
- `seek(t, values)` paints from its arguments only: no clocks, unseeded
  randomness, timers or network. CPU-backed canvases, reset every frame.
- Every file the film loads lives inside `film/`.

## Files

- `reference/`: Lamplit's launch film, `STORY.md`, the capture plan
  (`plans/lamplit.json`), its narration script (`narration/script.json`), the captured screens, the mark, and the fonts with
  their OFL licences (Instrument Sans, JetBrains Mono). Lamplit is a
  fictional company made for omnigami's examples.
- `style.md`: the grammar, with numbers. `critique.md`: the review.
- `music/`: the skill's song and its stems.
- `scripts/`: `screens.mjs` (real screens in states), `capture.mjs` (brand
  from a URL), `render.mjs` (stills, strips, checks, MP4s), `preview.mjs`,
  `music.mjs`, `song.mjs` (fits a supplied song), `sfx.mjs` with the sound kit, `narrate.mjs` (the narrated
  version), and `chrome.mjs`.

This skill is omnigami's (https://omnigami.ai), © 2026 Auberon LLC. Use what it makes for anything,
commercial work included, and change the skill for your own use; don't redistribute or
sell the skill. Full terms: https://github.com/omnigami-ai/skills/blob/main/LICENSE.md
