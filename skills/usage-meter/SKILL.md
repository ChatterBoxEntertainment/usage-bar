---
name: usage-meter
description: Render context, rate-limit (5h / 7d) and spend figures as compact text meters. Use when the user shares usage numbers or a usage screenshot and asks for a usage bar, meter or at-a-glance summary, or says "usage bar" / "usage meter".
---

# Usage meter

Chat mode cannot read the user's live usage, so this skill only formats numbers the user gives you. Never invent or estimate a reading.

## Steps

1. Collect readings from the user's message (or a screenshot they attach): context %, 5h %, 7d %, spend %, time until each window resets, session cost, and output tok/s if supplied. If a value is missing, show that meter empty and say it was not provided. Do not guess.
2. Draw each meter with 10 cells: filled = round(percent / 10) `█`, the rest `░`.
3. Add a level marker: 🟢 under 70%, 🟡 70-89%, 🔴 90% and over.
4. Put the meters in one code block, one per line. Add cost and tok/s only when provided, then a one-line note on whichever reported limit is closest to full. If no limit was supplied, say there is no limit reading to compare.

## Format

```
ctx   ████░░░░░░  38% 🟢
5h    ███████░░░  71% 🟡  resets in 2h05m
7d    ██░░░░░░░░  19% 🟢  resets in 3d4h
spend ░░░░░░░░░░  n/a
```

## Live bar

The live, always-visible bar is the Claude Code mod in this same plugin. It needs a Claude Code session; tell the user so if they ask for a bar that updates by itself in chat.
