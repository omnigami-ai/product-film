# Lamplit: the story

34 s, 120 BPM (a bar is 2 s), five acts. Each proof step gets a beat to read its caption, a move, the action and a hold on the result; the words hold long enough to read, and after a page change or a long glide the screen holds before the click (re-timed 2026-10-22 from 28 s; style.md, "Pauses"). Lamplit is a fictional company made for omnigami's
examples (`cast/lamplit/`). Real screens: its working dashboard, captured by
`plans/lamplit.json` at 1440 × 900 and 3× (`assets/screens/`). One set of captures serves every
shape; each shape frames them for itself (tall frames a narrower part of each screen).

**The viewer:** a developer whose app does work out of sight (digests, image resizing, invoice
syncs). **Their goal:** background jobs they can trust and see. **The problem, in their words:**
cron on a box, retries by hand, pages at 3 a.m. **The answer:** one command, then every run in
the light. The proof is four steps on the real dashboard, each captioned, each answered on screen.

| Time | Act | Screen and state | Action → result | Words |
|---|---|---|---|---|
| 0–4 | Hook | ink | three lines slam in on beats 0, 2 and 4: the old way. Then all three are struck through in amber, a line a step (3.0) | "Cron on a box." "Retries by hand." "Pages at 3 a.m." |
| 4–7.1 | Turn | night | "Or one line." lands and reads for 1.25 s; the flame grows under it (5.0), opens into a command line and types it (5.6–6.4); the command holds, then is sent (7.0) | "Or one line." · "$ npx lamplit deploy" |
| 7.1–10 | Promise | night | the line closes into the flame, which takes its place beside the name; the promise reads (to 9.67); its light floods the frame amber | "lamplit" · "Every job, in the light." |
| 10–13.5 | Step 1 | Runs (`runs`, `runs-pressed-01`) | the timeline, then the failed run's row floats alone; click (12.5) → the run opens (`failed`) | "01 See every run." |
| 13.5–15.5 | Step 2 | Run #4,812 (`failed`) | whip down to the logs; the error line floats alone | "02 Find why it failed." |
| 15.5–20.5 | Step 3 | Run #4,812 → replay #4,813 (`replay-pressed-01`, `queued`, `running`, `succeeded`) | the glide to "Replay from write-ledger", which floats alone; click (17.25) → queued; then running (18.25) and succeeded (19.25) change only in their own regions | "03 Replay the step that failed." |
| 20.5–26 | Step 4 | Schedules (`schedules`, `sched-00` … `sched-20`) | the page and caption hold; the cursor rests on the field and clicks it (22.0); "every weekday at 9am" types in, a letter a step; the cron and next runs appear; the camera pulls back (to 24.85) and holds on them | "04 Schedule it in plain English." |
| 26–29 | Payoff | ink | three of the real screens side by side; the line lands a phrase a beat | "Every job. Every run. In the light." |
| 29–34 | Ask | ink | the screens fold into the flame; the name, the address, the line to type, the plan (in by 31.45), held to the end | "lamplit" · "lamplit.example" · "$ npm i lamplit" · "Free for 10k runs a month." |

## Claims

Every claim on screen, with its source (all in `cast/lamplit/brand.md`, the company's sheet).

| Claim | Source |
|---|---|
| One line deploys it (`npx lamplit deploy`) | brand.md, CLI: `npx lamplit dev`, `lamplit deploy` |
| Every run, its steps and logs are shown | brand.md and the dashboard: the runs timeline, the run page's steps and logs |
| A failed run replays from the step that failed | brand.md, v3.3 "Replay from any step"; run #4,812 → #4,813 in the sample account |
| Schedules in plain English | brand.md, v3.4: "every weekday at 9am" → `0 9 * * 1-5` |
| Free for 10k runs a month | brand.md, pricing: "Free for 10k runs a month" |
| `npm i lamplit` | brand.md, SDK: `import { job } from "lamplit"` (the npm name) |

## Sample data

The sample account `pebble-shop` (brand.md): Noor's project, "now" fixed at Wed 14 Oct 2026,
09:41. No real company, person or customer data anywhere.
