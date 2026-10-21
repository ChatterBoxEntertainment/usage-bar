# usage-bar

Context, cost and 5h/7d rate-limit usage at a glance in Claude Code.

## What it does

- **Claude Code mod** (`hooks/register.ts`): a live band above the prompt with 10-cell meters for context, the 5-hour and 7-day windows and spend. Meters turn amber at 70% and red at 90%. It also shows time until each window resets, session cost and approximate output tokens per second. It refreshes on usage changes and every 30 seconds, and keeps other mods' content in the band.
- **`usage-meter` skill** (`skills/usage-meter`): for chat, where live usage is not readable. Give it your numbers or a screenshot and it returns the same meters as text.

## Install

Claude Code CLI v2.1.287 or later is required for mods. Install from this repository's marketplace at user scope (all local projects):

```sh
claude plugin marketplace add ChatterBoxEntertainment/usage-bar
claude plugin install usage-bar@usage-bar --scope user
```

In an open Claude Code session, run `/reload-plugins`, then check `/plugin` for `usage-bar` under Installed. The chat skill appears as `/usage-bar:usage-meter`. To try a downloaded copy for one session, use `claude --plugin-dir PATH_TO_USAGE_BAR` instead of installing it.

For development, run these commands from the plugin root:

```sh
node --test tests/usage-bar.test.mjs
claude plugin validate .
claude plugin test
```

## Notes

The live bar needs an interactive Claude Code terminal or the local Code tab in Claude Desktop. Rate-limit meters appear only when Claude Code reports them. The speed figure is output tokens divided by time spent in model requests; it includes request latency and excludes tool runs between requests. Cost is Claude Code's session estimate. The skill formats only readings supplied in chat and works anywhere skills load.
