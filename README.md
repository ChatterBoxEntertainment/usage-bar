# usage-bar

Context and rate-limit usage at a glance in Claude Code, ChatGPT, and Codex.

| Host | What works |
| --- | --- |
| Claude Code | Live ten-cell bar above the prompt: context, available 5h/7d/spend limits, reset times, session cost, and approximate output tok/s. |
| ChatGPT Chat and Work | `usage-meter` skill formats supplied readings or screenshots as ten-cell text meters in the conversation. |
| Codex CLI | Native live footer shows model, context used, and available 5h/weekly remaining limits. The skill formats pasted readings in chat. |
| Codex in ChatGPT | The same `usage-meter` skill works with supplied readings. |

The ChatGPT/Codex plugin does not have an account usage feed or add an always-visible ChatGPT bar. Its meters represent the readings you provide. Codex's live footer is a native CLI feature and is configured separately from plugin installation.

## ChatGPT and Codex plugin

The root [`plugin.json`](plugin.json) and [`skills/usage-meter/`](skills/usage-meter/) form a portable, skills-only plugin. Package those files together at the ZIP root and install the plugin in ChatGPT or Codex. Start a new chat after installation, then invoke `usage-meter` or ask for a usage bar with a screenshot or readings. See [Codex CLI status line](skills/usage-meter/references/codex-statusline.md) for `/statusline` and the pasteable `config.toml` preset.

The skill treats all bars as **percent used**. Codex footer limit values are **percent remaining**, so it converts those when labeled. Missing and ambiguous values stay `n/a` or `direction unknown`; they are never made up.

## Claude Code mod

Claude Code CLI v2.1.287 or later is required for mods. Install from this repository's marketplace at user scope (all local projects):

```sh
claude plugin marketplace add ChatterBoxEntertainment/usage-bar
claude plugin install usage-bar@usage-bar --scope user
```

In an open Claude Code session, run `/reload-plugins`, then check `/plugin` for `usage-bar` under Installed. The chat skill appears as `/usage-bar:usage-meter`. To try a downloaded copy for one session, use `claude --plugin-dir PATH_TO_USAGE_BAR` instead of installing it.

The mod (`hooks/register.ts`) refreshes on usage changes and every 30 seconds. It keeps other mods' content in the band. Meters turn amber at 70% used and red at 90% used. The speed figure divides output tokens by model request time, including request latency and excluding tool runs between requests. Cost is Claude Code's session estimate. Rate-limit meters appear only when Claude Code reports them.

## Development

```sh
node --test tests/usage-bar.test.mjs
claude plugin validate .
claude plugin test
```

The latter two commands require an installed Claude Code CLI.
