# Codex CLI live status line

In an interactive Codex CLI session, run `/statusline` and select **model with reasoning**, **context used**, **five-hour limit**, **weekly limit**, and optionally **used tokens**. The limit items show **remaining** usage. Codex shows items only when their readings are available.

Alternatively, add or update this key inside the existing `[tui]` section of `~/.codex/config.toml` (or the active `$CODEX_HOME/config.toml`), preserving other settings:

```toml
[tui]
status_line = ["model-with-reasoning", "context-used", "five-hour-limit", "weekly-limit", "used-tokens"]
```

Do not add a second `[tui]` section if one already exists. The CLI picker is the simplest way to merge with an existing configuration. Codex's native footer displays live textual values; it does not render this skill's ten-cell meters. The cost item `estimated-thread-cost` is available only when the Enterprise thread estimate is present; it is not a general billing total. Reset countdowns and output tokens per second are not included in this preset.

For a chat meter, paste the footer, `/status` output, `/usage daily` or `/usage weekly` output into the conversation and invoke `usage-meter`. Explicitly label numbers as used or remaining when the pasted output omits that direction.
