import { Notice } from "obsidian";
import type GoldilocksEssentialsPlugin from "../main";
import type { Feature, NoteWidthId } from "../types";
import { NOTE_WIDTHS } from "../types";

let statusBarEl: HTMLElement | null = null;

function applyWidth(id: NoteWidthId): void {
  document.body.setAttribute("data-note-width", id);
}

function updateStatusBar(plugin: GoldilocksEssentialsPlugin): void {
  if (!statusBarEl) return;
  const w = NOTE_WIDTHS.find((x) => x.id === plugin.settings.noteWidth);
  statusBarEl.textContent = `Width: ${w ? w.label : "?"}`;
}

function setWidth(plugin: GoldilocksEssentialsPlugin, id: NoteWidthId): void {
  plugin.settings.noteWidth = id;
  plugin.saveSettings();
  applyWidth(id);
  updateStatusBar(plugin);
  const w = NOTE_WIDTHS.find((x) => x.id === id);
  new Notice(`Note width: ${w ? w.name : id}`);
}

function cycleWidth(plugin: GoldilocksEssentialsPlugin): void {
  const currentIdx = NOTE_WIDTHS.findIndex((w) => w.id === plugin.settings.noteWidth);
  const nextIdx = (currentIdx + 1) % NOTE_WIDTHS.length;
  setWidth(plugin, NOTE_WIDTHS[nextIdx].id);
}

export { updateStatusBar as noteWidthUpdateStatusBar };

export const noteWidth: Feature = {
  id: "note-width",
  name: "Note width",
  description:
    "Adjust note width with presets (S/M/D/L/XL/Full). Click the status bar widget to cycle.",
  conflictsWith: ["note-width"],

  load(plugin: GoldilocksEssentialsPlugin) {
    applyWidth(plugin.settings.noteWidth);

    statusBarEl = plugin.addStatusBarItem();
    statusBarEl.classList.add("note-width-status");
    updateStatusBar(plugin);
    statusBarEl.addEventListener("click", () => cycleWidth(plugin));

    for (const w of NOTE_WIDTHS) {
      plugin.addCommand({
        id: `note-width-${w.id}`,
        name: `Set width: ${w.name}`,
        callback: () => setWidth(plugin, w.id),
      });
    }

    plugin.addCommand({
      id: "note-width-cycle",
      name: "Cycle note width",
      callback: () => cycleWidth(plugin),
    });
  },

  unload() {
    document.body.removeAttribute("data-note-width");
    statusBarEl = null;
  },
};
