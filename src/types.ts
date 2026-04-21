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

export type NoteWidthId = "small" | "medium" | "default" | "large" | "xl" | "full";

export interface NoteWidthPreset {
  id: NoteWidthId;
  label: string;
  name: string;
  px: string;
}

export const NOTE_WIDTHS: NoteWidthPreset[] = [
  { id: "small",   label: "S",  name: "Small",   px: "550px" },
  { id: "medium",  label: "M",  name: "Medium",  px: "700px" },
  { id: "default", label: "D",  name: "Default", px: "760px" },
  { id: "large",   label: "L",  name: "Large",   px: "850px" },
  { id: "xl",      label: "XL", name: "XL",      px: "1050px" },
  { id: "full",    label: "W",  name: "Full",    px: "100%" },
];

export interface GoldilocksSettings {
  enabled: Record<string, boolean>;
  customTitles: Record<string, string>;
  tabColors: Record<string, string>;
  compactTableSize: CompactTableSize;
  noteWidth: NoteWidthId;
}

export const DEFAULT_SETTINGS: GoldilocksSettings = {
  enabled: {},
  customTitles: {},
  tabColors: {},
  compactTableSize: "sm",
  noteWidth: "default",
};
