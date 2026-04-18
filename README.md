# Goldilocks Essentials

> Obsidian, just the way you like it.

A curated kit of small UX upgrades — the ones that make Obsidian feel *just right*. Each feature is opt-in, conflict-aware, and can be toggled individually in settings.

## Features

| Feature | What it does |
|---|---|
| **Tab rename & colors** | Right-click any tab to rename it or pick a color. Works on all tab types. |
| **Smart new-note placement** | New notes land in the folder you last clicked — not vault root. Adds "New note here" to folder right-click. |
| **Print from menu** | Adds Print… to the right-click menu for markdown files, plus a palette command. |
| **Press E to edit** | In reading mode, press E to switch to edit. In edit mode, Escape to return to preview. |
| **Community plugins ribbon** | Puzzle-piece icon in the sidebar that jumps to Community Plugins. |

## Why one plugin instead of five?

Because each feature is tiny and you probably want the whole curated set. One install, one settings pane, one update.

## Conflicts with standalone plugins

If you already have one of these installed as a standalone plugin, Goldilocks will detect it on load, skip that feature, and show a notice. You can also disable the feature manually in settings. The standalone plugin ids that trigger auto-skip:

| Feature | Conflicts with |
|---|---|
| Tab rename & colors | `tab-rename` |
| Smart new-note placement | `new-note-in-folder` |
| Print from menu | `print-note` |
| Press E to edit | `press-e-for-edit` |
| Community plugins ribbon | `plugin-store-shortcut` |

## Installation

**Community store** (once published): search "Goldilocks Essentials".

**Manual:**
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Drop them in `.obsidian/plugins/goldilocks-essentials/` in your vault.
3. Enable the plugin in Community Plugins.

## Development

```bash
pnpm install
pnpm dev      # watch build into ./main.js
pnpm build    # type-check + minified production build
```

Symlink the repo into your test vault's `.obsidian/plugins/` to test live:

```bash
ln -s "$PWD" /path/to/vault/.obsidian/plugins/goldilocks-essentials
```

## License

MIT
