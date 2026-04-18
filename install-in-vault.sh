#!/usr/bin/env bash
# Symlink this plugin into a vault's .obsidian/plugins directory.
# Usage: ./install-in-vault.sh <vault-path>

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <vault-path>" >&2
  exit 1
fi

VAULT="$1"
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ID="$(sed -n 's/.*"id":[[:space:]]*"\([^"]*\)".*/\1/p' "$PLUGIN_DIR/manifest.json" | head -1)"

if [[ -z "$PLUGIN_ID" ]]; then
  echo "Error: could not read plugin id from $PLUGIN_DIR/manifest.json" >&2
  exit 1
fi

if [[ ! -d "$VAULT/.obsidian" ]]; then
  echo "Error: $VAULT does not look like an Obsidian vault (no .obsidian/)" >&2
  exit 1
fi

TARGET="$VAULT/.obsidian/plugins/$PLUGIN_ID"
mkdir -p "$VAULT/.obsidian/plugins"

if [[ -L "$TARGET" ]]; then
  if [[ "$(readlink -f "$TARGET")" == "$PLUGIN_DIR" ]]; then
    echo "[ok]   $VAULT — already linked"
    exit 0
  fi
  echo "Error: $TARGET is a symlink to a different location ($(readlink -f "$TARGET")). Remove it manually." >&2
  exit 1
fi

if [[ -e "$TARGET" ]]; then
  echo "Error: $TARGET exists and is not a symlink. Remove it manually." >&2
  exit 1
fi

ln -s "$PLUGIN_DIR" "$TARGET"
echo "[new]  $VAULT — linked"
echo
echo "Next: open the vault in Obsidian and enable 'Goldilocks Essentials' in Community Plugins."
