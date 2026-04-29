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
| **Compact tables** | Tighter table styling — less padding, smaller font. Pick *Small* or *Extra small* density in settings. |
| **Note width** | Adjust note width with six presets (S / M / D / L / XL / Full). Click the status bar widget to cycle, or bind a hotkey to "Cycle note width" / a specific preset. |

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
| Note width | `note-width` |

Compact tables doesn't auto-skip — it's pure CSS, so if you have another table-density plugin running, just toggle this one off in settings.

## Installation

**Community store** (once published): search "Goldilocks Essentials".

**Via BRAT** (recommended until it's in the community store):
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the community store and enable it.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Paste the repo URL: `https://github.com/sachio222/obsidian-goldilocks-essentials`
4. Choose the latest version (or leave blank for latest release) and click **Add Plugin**.
5. Go to **Settings → Community plugins** and enable **Goldilocks Essentials**.

BRAT will auto-update the plugin whenever a new release is published.

**Manual:**
1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/sachio222/obsidian-goldilocks-essentials/releases/latest).
2. Create a folder `.obsidian/plugins/goldilocks-essentials/` in your vault and drop the three files in.
3. In Obsidian, go to **Settings → Community plugins**, click the reload icon, and enable **Goldilocks Essentials**.

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
