# usage-bar

Context, cost and 5h/7d rate-limit usage at a glance.

## What it does

- **Claude Code mod** (`hooks/register.tsx`): a live row above the prompt with 10-cell meters for context, the 5-hour and 7-day windows and spend. Meters turn amber at 70% and red at 90%. It also shows time until each window resets, session cost and output tokens per second, and redraws every 30 seconds.
- **`usage-meter` skill** (`skills/usage-meter`): for chat, where live usage is not readable. Give it your numbers or a screenshot and it returns the same meters as text.

## Install

Local, always on in Claude Code: add the folder to `CLAUDE_CODE_PLUGIN_DIRS` in `~/.claude/settings.json`:

```json
{ "env": { "CLAUDE_CODE_PLUGIN_DIRS": "C:/Users/you/.claude/mods/usage-bar" } }
```

From a marketplace repository containing this folder and `.claude-plugin/marketplace.json`:

```
/plugin install usage-bar --marketplace ChatterBoxEntertainment/usage-bar
```

## Notes

The live bar needs a Claude Code session; rate-limit meters appear only on plans that report them. The skill works anywhere skills load.
