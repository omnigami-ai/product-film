# Product film · omnigami

A 34-second launch film of your real product, in every shape.

Give it your URL. It reads your site, writes one short story in your own words, captures your real screens, and shows your product doing its job, with a cursor and a camera that follows it. You get MP4s in wide, square and tall, and a film you can still edit. A narrated version is optional.

Watch it play live, and change its words, at [omnigami.ai/skills/product-film](https://omnigami.ai/skills/product-film).

## Install

In Claude Code:

```
/plugin marketplace add omnigami-ai/skills
/plugin install omnigami-product-film@omnigami
```

With the skills CLI, for Claude Code and other agents that read SKILL.md:

```bash
npx skills add omnigami-ai/product-film
```

Or copy `skills/product-film/` into your agent's skills folder (for Claude Code, `~/.claude/skills/product-film/`). Then ask:

```
Make a launch video for https://your-product.com
```

## What it runs

The skill works on your computer. It runs the Node scripts in `skills/product-film/scripts/`: they open your product's pages in a local headless browser to capture its real screens, then render the film with that browser and ffmpeg, writing MP4s and an editable HTML film to your project. It sends nothing to omnigami. Optional narration sends the script and voice settings to your chosen Google or ElevenLabs TTS service using your own key, or uses your own recordings locally.


## Narrated example

Lamplit's narrated example uses Lara on `eleven_v4`, with the opening and proof sentences voiced in connected runs, then “And you sleep through the night.” and “Less guesswork, more confidence.” separated by a measured 700 ms breath. The [narration section](skills/product-film/SKILL.md#narrated-version-optional) records every exact line, run and timing; [the reference script](skills/product-film/reference/narration/script.json) keeps the voice settings and placements. Google remains the default for your own film; this approved example selects ElevenLabs.


## You need

- Claude Code with Opus 5.5
- Node 20 or later
- ffmpeg
- Chrome, Chromium, Edge or Brave

Your Claude plan’s usage, plus optional TTS usage on your own Google or ElevenLabs account. Your own recording is free; commercial ElevenLabs audio needs a paid plan.

## Licence

Free to use. Use the films and anything else the skill makes for anything, commercial work included. Don't redistribute the skill. See [LICENSE.md](LICENSE.md). The bundled fonts keep their own licence (SIL Open Font License, beside them in `reference/assets/fonts/`).

## Credits

Its example shows Lamplit, a fictional company made for omnigami’s examples, with sample data.

omnigami is not affiliated with Anthropic. More skills at [omnigami.ai](https://omnigami.ai).
