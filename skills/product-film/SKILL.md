---
name: product-film
description: Make a 34-second launch video for a product from its real screens, in five acts (the problem, the promise, four proof steps of the product in action, the result, the ask), with a big cursor, a moving camera, captions and sound, in square, wide and tall. Use when the user asks for a launch video, product video, promo, demo video, teaser or motion graphics for their product, app or website.
---

# Product film

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
rm -rf film/assets/screens film/assets/brand film/plans
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
  state advances in place: measure them by diffing the captures), and the
  cursor `sets`. A page the app opens arrives on a cut; a state that changes
  in place changes only inside `PATCH`.
- **ADAPT the payoff and the ask:** `TILES` (three of your real screens) and
  your name, address, line to type and tagline.
  Keep the act times on bar lines, and keep the cues in step with the acts.
- **KEEP** the toolkit, the camera, the fields, the drawing, and the 34 s on
  the 120 BPM grid (unless the user asks otherwise), with its pauses where the
  viewer needs them (style.md, "Pauses"): your words read before they leave,
  and after a page change or long glide the screen holds before the click.
  When your words are longer or shorter, move the holds (`TU`, `ST`, `P`), not
  the product's own working.

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
3. Check repeatability: `node scripts/render.mjs film --all --check`.
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

## Revisions

For a request like "hold the result longer" or "show the export instead",
edit the current story and film. Keep what was approved and the user's saved
words. Recapture only the states that changed, rerun the checks, render
again, and update `STORY.md` and `PRODUCT.md`.

## Hard rules

- Real screens only, captured; sample data only; only the user's brand.
- Every claim on screen has a source in `STORY.md`.
- Breathing room: every step's caption is read before anything moves, the
  element is seen before it is acted on, and every result holds at least a
  second. When the story doesn't fit, lengthen the film (up to 30 s) or drop
  a step; never compress the holds.
- `seek(t, values)` paints from its arguments only: no clocks, unseeded
  randomness, timers or network. CPU-backed canvases, reset every frame.
- Every file the film loads lives inside `film/`.

## Files

- `reference/`: Lamplit's launch film, `STORY.md`, the capture plan
  (`plans/lamplit.json`), the captured screens, the mark, and the fonts with
  their OFL licences (Instrument Sans, JetBrains Mono). Lamplit is a
  fictional company made for omnigami's examples.
- `style.md`: the grammar, with numbers. `critique.md`: the review.
- `music/`: the skill's song and its stems.
- `scripts/`: `screens.mjs` (real screens in states), `capture.mjs` (brand
  from a URL), `render.mjs` (stills, strips, checks, MP4s), `preview.mjs`,
  `music.mjs`, `song.mjs` (fits a supplied song), `sfx.mjs` with the sound kit, and `chrome.mjs`.

This skill is omnigami's (https://omnigami.ai), © 2026 Auberon LLC. Use what it makes for anything,
commercial work included, and change the skill for your own use; don't redistribute or
sell the skill. Full terms: https://github.com/omnigami-ai/skills/blob/main/LICENSE.md
