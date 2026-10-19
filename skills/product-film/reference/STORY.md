# Lamplit: the story

28 s, 120 BPM (a bar is 2 s), five acts. Each proof step gets a beat to read its caption, a move, the action and a hold on the result. Lamplit is a fictional company made for omnigami's
examples (`cast/lamplit/`). Real screens: its working dashboard, captured by
`plans/lamplit.json` at 1440 × 900 and 3× (`assets/screens/`). One set of captures serves every
shape; each shape frames them for itself (tall frames a narrower part of each screen).

**The viewer:** a developer whose app does work out of sight (digests, image resizing, invoice
syncs). **Their goal:** background jobs they can trust and see. **The problem, in their words:**
cron on a box, retries by hand, pages at 3 a.m. **The answer:** one command, then every run in
the light. The proof is four steps on the real dashboard, each captioned, each answered on screen.

| Time | Act | Screen and state | Action → result | Words |
|---|---|---|---|---|
| 0–4 | Hook | ink | three lines slam in on beats 0, 2 and 4: the old way. Then all three are struck through in amber, a line a step | "Cron on a box." "Retries by hand." "Pages at 3 a.m." |
| 4–6.4 | Turn | night | "Or one line." lands; the flame grows under it, opens into a command line and types it | "Or one line." · "$ npx lamplit deploy" |
| 6.4–8 | Promise | night | the line closes into the flame, which takes its place beside the name; its light floods the frame amber | "lamplit" · "Every job, in the light." |
| 8–11.5 | Step 1 | Runs (`runs`, `runs-pressed-01`) | the timeline, then the failed run's row floats alone; click → the run opens (`failed`) | "01 See every run." |
| 11.5–13.5 | Step 2 | Run #4,812 (`failed`) | whip down to the logs; the error line floats alone | "02 Find why it failed." |
| 13.5–18 | Step 3 | Run #4,812 → replay #4,813 (`replay-pressed-01`, `queued`, `running`, `succeeded`) | "Replay from write-ledger" floats alone; click → queued; then running and succeeded change only in their own regions | "03 Replay the step that failed." |
| 18–22 | Step 4 | Schedules (`schedules`, `sched-00` … `sched-20`) | click the field; "every weekday at 9am" types in, a letter a step; the cron and next runs appear | "04 Schedule it in plain English." |
| 22–25 | Payoff | ink | three of the real screens side by side; the line lands a phrase a beat | "Every job. Every run. In the light." |
| 25–28 | Ask | ink | the screens fold into the flame; the name, the address, the line to type, the plan | "lamplit" · "lamplit.example" · "$ npm i lamplit" · "Free for 10k runs a month." |

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
