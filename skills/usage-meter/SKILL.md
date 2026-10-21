---
name: usage-meter
description: Use when the user asks for a usage bar or meter from supplied usage numbers, a screenshot, or pasted ChatGPT, Codex, or Claude usage output, or asks how to show live usage in Codex CLI.
---

# Usage meter

Format the user's readings as a compact, accessible text bar. The skill does not have an account usage feed. Do not claim to read live ChatGPT or Codex account usage merely because this skill is installed.

## Readings

1. Extract each available context, five-hour, weekly/seven-day, and spend percentage. Read screenshots and pasted `/status` or `/usage` output when supplied. Show a figure only when its source is clear. Treat spend as a percentage only when a budget and amount used, or an explicit spend percentage, is supplied.
2. The meters mean **percent used**. Convert an explicitly stated remaining percentage with `used = 100 - remaining`. For example, Codex CLI's `five-hour-limit` and `weekly-limit` footer items report **remaining** usage, so `81% remaining` becomes `19% used`. Do not convert when the direction is unknown. If a raw `5h 81%` has no used/remaining label, display `direction unknown` instead of a misleading meter and ask for the label.
3. If a used percentage is outside 0–100, keep the reported number in the label and clamp only the filled cells. If a value is invalid or missing, show `n/a` with empty cells. Do not infer a context percentage from a total-token count unless the window size and used context are both supplied.
4. Show reset times only when given. If the user provides an absolute reset timestamp, calculate the remaining duration using the current time and the timestamp's timezone. Never invent resets, cost, tok/s, or a shared quota between different accounts or products.

## Render

- Each known meter has ten cells: `round(clamp(used, 0, 100) / 10)` filled `█` and the rest `░`. Use 🟢 below 70%, 🟡 from 70% to below 90%, and 🔴 from 90% upward. Those are display thresholds, not provider warnings.
- Put meters in one code block, one per line. Label sources when readings cover multiple products/accounts. Add session cost and output tok/s only if explicitly supplied; keep estimated values marked estimated.
- End with one short sentence naming the closest reported limit to full, or say that no comparable limit reading was supplied. If the user supplied no readings, ask for a screenshot or pasted usage output and explain where to find it.

```text
ctx   ████░░░░░░  38% used 🟢
5h    ███████░░░  71% used 🟡  resets in 2h05m
7d    ██░░░░░░░░  19% used 🟢  resets in 3d4h
spend ░░░░░░░░░░  n/a
```

## Host guidance

- In ChatGPT Chat or Work, ask the user for readings or a screenshot of any usage panel they can access. A skill cannot add a persistent footer to the ChatGPT UI.
- In Codex CLI, suggest `/statusline` for live model, context, and rate-limit values; `/status` for current session token usage; `/usage daily` or `/usage weekly` for account activity. The setup and a pasteable preset are in [Codex CLI status line](references/codex-statusline.md). A plugin skill does not change the TUI configuration on installation.
- In Claude Code, this repository's separate mod renders a live bar. It is host-specific and is not part of the OpenAI plugin package.
