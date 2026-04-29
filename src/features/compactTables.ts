import type GoldilocksEssentialsPlugin from "../main";
import type { Feature, CompactTableSize } from "../types";

const BODY_ATTR = "data-goldilocks-compact-tables";

function applyDensity(size: CompactTableSize): void {
  document.body.setAttribute(BODY_ATTR, size);
}

function clearDensity(): void {
  document.body.removeAttribute(BODY_ATTR);
}

export const compactTables: Feature = {
  id: "compact-tables",
  name: "Compact tables",
  description: "Tighter table styling \u2014 less padding, smaller font.",
  conflictsWith: [],

  load(plugin: GoldilocksEssentialsPlugin) {
    applyDensity(plugin.settings.compactTableSize);
  },

  unload() {
    clearDensity();
  },
};
