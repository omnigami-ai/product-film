# Product film: style

A 20–30 second launch film that sells one product in five acts, on the
product's real screens. It is a story, not a tour: one viewer with one goal,
the problem in their way, the product named as the answer, then three or four
captioned steps on the real product that reach the goal, the goal reached, and
an ask held to the last frame. Not a UI study: every action is a step toward
the goal, and its caption says so.

The grammar comes from a measured study of three 2026 launch films: Figma
Motion (the proof loop and the cursor), ElevenLabs' Reception (the turn
between two worlds), and @LexnLin's Tessel (the beat grid, the relay object,
colour as meaning). Take the grammar, never the content.

## Format

- 28 s by default (20–30), on a 120 BPM grid: a beat is 0.5 s, a bar 2 s.
  Acts start on bar lines; clicks and landings fall on beats.
- 60 fps, rendered with motion blur (`--blur 4`). Choreography is timed in
  steps of 1/12 s (`F` in the film): words land a step apart, a press lasts
  two steps.
- Three shapes, each laid out for its frame: 16:9 (1920 × 1080), 1:1
  (1440 × 1440), 9:16 (1080 × 1920).
- Captions, no voice-over. Every message reads with the sound off.

## The five acts

| Act | Share | Reference (28 s) | What it does |
|---|---|---|---|
| Hook | 15–18% | 0–4 s | The old way in huge type: the tool or method the product replaces, then what it costs the viewer. Lines land on beats; then every line is struck through, a line a step. Write only lines that belong to the old way, so crossing them all out reads as one decision. Never leave one standing among struck ones. |
| Turn | one cut | 4 s | One hard cut on the beat from the problem's world (paper) into the product's (ink). The turn answers the hook in the hook's own terms, the opposite of its problems in as few words ("Frustrating. Privacy-invasive." → "Simple. Private."; "$5,000. Three weeks." → "Or one line."), and the product's name or mark arrives within a beat. Never a line that answers something the hook didn't say, or a tagline that could still be the problem. |
| Promise | 12–15% | 4–8 s | The name and one line: what it does, for whom. The product is in view by 8 s at the latest. |
| Proof | 45–50% | 8–22 s | Three or four captioned steps toward the viewer's goal, on real screens. Each step breathes: a beat to read its caption, the move, the action, then a hold of at least a second on the result before the next caption. Never an action the instant the camera arrives. |
| Payoff | 10–12% | 22–25 s | The goal reached, readable at a glance: what the product made, the answer it gave, a before and after. |
| Ask | 10–12% | 25–28 s | The name, the address and the one action (sign up, install, open), held to the last frame. |

## The story of the proof

Steps, not features. From the site, find who the product is for and the one
job they come to it for: that is the viewer's goal. Choose three or four steps
on the real product that reach it, in order, each with a visible result. Write
each step's caption as what the viewer does or learns, in a few words: steps
for products you operate ("Add it. Pick a shape. Change a word."), questions
for products that answer them ("Which AI tools send you visitors?"), whose
answer lands next, in the accent, once the screen shows it. A step whose
result doesn't visibly answer its caption is cut or replaced.

The captions live beside the product, never on it: a column 34% of the width
in wide (the product to its right), a band across the top in square (24% of
the height) and tall (20%). The column takes the step's colour. Each step
lands a beat before its action and holds through the result: its number small
(mono, 2.4% of the short side, 60% white), its words large (6.6% of the short
side in wide, 5.6% otherwise, bold, white), a word at a time.

## The proof step

Four steps, 2–4.5 s each, one place in the product each. Each one:

1. Its caption lands first (the column on the promise's accent for the first
   step, the product's panel ink after), and the camera holds a beat so it reads.
2. The camera moves to the element in play, framed close enough to read (a
   page rect fitted to the view; tall frames a narrower part). Never zoom past
   the capture's scale × 1.15; past that, text softens.
3. The element floats alone on a dark field with a soft lift shadow (the row
   about to be clicked, the line that explains, the button about to be pressed),
   long enough to see before anything happens to it.
4. The big cursor arrives (fast first, landing soft) and acts on a beat: the
   app's own pressed state shows for a few frames.
5. The real response: a page the app opens arrives on a cut; a state that
   changes in place changes only in its own regions. The field falls away
   (0.3 s) with the click.
6. A hold of at least a second on the result, then the next caption. Moves
   between places glide (expo out: fast, then a long soft settle) or whip down
   a long page, landing soft.
7. Plays any moving result (a preview, a counter) in its real place.

When an action and its result live far apart on the page, split the screen:
the result close up beside (or, in tall, above) the control. The reference's
word edit does this. When a step builds on the last (a filter, a chosen
period), keep that context in view: in the shot, or in a split beside the new
result, so the caption's claim is on screen and not taken on trust.

## The cursor

A black arrow with a white outline and a soft shadow. 12% of the frame's
short side in close-ups, 9.5% in wider views. It tilts toward where it is
going (rest −8°, up to ±16°), shrinks to 0.84 while pressed (two steps), and
moves fast first with a soft landing. It stops just below and right of its
target, so the target stays visible.

## The camera

A page camera: the page point at the frame's centre and a scale, the scale
moving in log space. Moves: `cut` (a page the app opens), `glide` (expo out:
fast out of the blocks, a long soft settle, as every travel), `whip`
(back-loaded, landing soft, down a long page) and `drift` (a few percent over
seconds; the camera always breathes). Every framing is a page rect fitted to the
frame (`fitK`), so each shape gets its own; tall frames a narrower part of each
screen so the UI keeps its size. A state that changes in place changes only in
its own regions (`PATCH`), never as a whole-screen dissolve.

## Type

- The product's own font where licensed (the reference: Instrument Sans and
  JetBrains Mono, Lamplit's). Display weight 700, tracking −0.03 em (the name −0.04 em).
- Hook lines up to 15.5% of the short side, fitted to the width with margins
  (11.2% of the short side in wide, 8% otherwise).
- The turn and the payoff at 8–11%; the promise line at 4.4% (× 1.15 in tall),
  wrapped at 86% of the width.
- Words land a step apart, from 116% size and soft to set in 0.22 s. New
  words arrive in the accent and cool to their colour over 0.4 s.
- Never lay words over the product: the story's words are in the caption
  column or band.
- Floor: nothing meant to be read under 2.4% of the short side in the frame.

## Colour

Paper (the product's background, or `#f1f1ed`), ink (`#0b0b0b`) and one
accent: the product's brand colour. The accent means three things only:
just arrived, the problem (the strike-through), the action (the send button,
the mark). The proof fields alternate accent and ink; a flood of the accent
carries the cut into the first proof.

## The relay object

One shape crosses the seams. In the reference, Lamplit's flame grows at the
turn (it fades up as it grows: never a lone dot), opens into the command line
and rides its right end, becomes the mark beside the name, floods its amber into
the first proof, and returns in the ask, where the payoff's screens fold into it.
Use the product's mark.

## Rhythm and sound

- Typing: 12 letters a second in the product's own fields, 36 in the prompt.
- Music: the 120 BPM bed, with breaks (drums and bass out) for two or three
  beats before each result: the hook's last line, the click, the edit, the
  payoff.
- Effects from the kit (`scripts/sounds/kit.json`): `click` or `tap` on
  clicks, `tick` per typed letter, `swish` on pull-backs, `whoosh` on whips
  and floods (peaking at their fastest moment), `hit` on the turn and the
  payoff, `chime` on a success, `riser` into the ask, `pop` on arrivals.
- Mastered around −14 LUFS.

The score's sound is `music.style`: here `'synth'`, the default. For the user's product, pick by what it is: `'organic'` for plants, food and drink, and other natural or handmade things; `'synth'` (oscillators, the default) for software and tools; `'felt'` (a sparse felt piano over a sub bass and a light kit) for a quiet, minimal film. In a break (`music.breaks`) the drums, bass and lead stop and the chords play on; the film's name seeds the key (always major), the progressions and the patterns.

## Shapes

- Wide and square show the desktop page. Tall shows the phone layout of the
  same page (a plan with `"viewport": "mobile"`), never a desktop page shrunk.
- Phone layouts hide things: a filter folded into a "+1" badge, a chart with
  fewer axis labels. Whatever a step's answer depends on must be on screen in
  tall too. Expand it in the mobile plan (a `click` or `eval` step), capture
  a closer crop, or split the screen. Check every step's answer in the tall
  sheet, not only in wide.
- Text fits or wraps; the split screen is side by side in wide and square,
  stacked in tall; tiles of results reflow.

## Real screens only

Capture every state the film shows with `scripts/screens.mjs` (see
`reference/plans/`). Hide anything the film composites itself. Sample data
only, no customer data, no other company's brand. If the product's own UI
isn't reachable (behind a sign-in), ask for a demo account, a public demo or
the user's own screenshots. Never draw an imagined UI.

## Banned

- A UI study: interactions with no goal, no promise, no result, no ask.
- Features toured one after another; a step with no caption, or whose result
  doesn't answer its caption.
- A turn that doesn't name the product.
- Fades between scenes: use cuts on beats, floods, pull-backs and whips.
- Captions laid over real screens; tiny UI in a wide frame; a desktop page in
  a tall frame.
- Numbers or claims without a source in `STORY.md`.
- More than one accent; gradients or glows on UI.
- An ask that leaves before the end; an ending with only a logo.
