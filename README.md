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

## Why one plugin instead of many?

Because each feature is tiny and you probably want the whole curated set. One install, one settings pane, one update.

## Installation

**Community store** (once published): search "Goldilocks Essentials".

**Via BRAT** (recommended until it's in the community store):
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the community store and enable it.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Paste the repo URL: `https://github.com/sachio222/obsidian-goldilocks-essentials`
4. Choose the latest version (or leave blank for latest release) and click **Add Plugin**.
5. Go to **Settings → Community plugins** and enable **Goldilocks Essentials**.

BRAT will auto-update the plugin whenever a new release is published.

**Manual (one-liner):** from your vault root, run:

```bash
mkdir -p .obsidian/plugins/goldilocks-essentials && cd $_ && \
  for f in main.js manifest.json styles.css; do \
    curl -LO https://github.com/sachio222/obsidian-goldilocks-essentials/releases/latest/download/$f; \
  done
```

Then in Obsidian, **Settings → Community plugins**, hit the reload icon, and enable **Goldilocks Essentials**.

**Manual (clone + build):** if you'd rather build from source:

```bash
git clone https://github.com/sachio222/obsidian-goldilocks-essentials \
  /path/to/vault/.obsidian/plugins/goldilocks-essentials
cd /path/to/vault/.obsidian/plugins/goldilocks-essentials
pnpm install && pnpm build
```

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
