import type GoldilocksEssentialsPlugin from "./main";

export interface Feature {
  id: string;
  name: string;
  description: string;
  conflictsWith: string[];
  load(plugin: GoldilocksEssentialsPlugin): void;
  unload(plugin: GoldilocksEssentialsPlugin): void;
}

export type CompactTableSize = "xs" | "sm";

export interface GoldilocksSettings {
  enabled: Record<string, boolean>;
  customTitles: Record<string, string>;
  tabColors: Record<string, string>;
  compactTableSize: CompactTableSize;
}

export const DEFAULT_SETTINGS: GoldilocksSettings = {
  enabled: {},
  customTitles: {},
  tabColors: {},
  compactTableSize: "xs",
};
