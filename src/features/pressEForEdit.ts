import { MarkdownView } from "obsidian";
import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";

let handler: ((e: KeyboardEvent) => void) | null = null;

export const pressEForEdit: Feature = {
  id: "press-e-for-edit",
  name: "Press E to edit, Escape to preview",
  description: "In reading mode, press E to switch to edit. In edit mode, Escape switches back.",
  conflictsWith: ["press-e-for-edit"],

  load(plugin: GoldilocksEssentialsPlugin) {
    handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const active = document.activeElement;
      if (e.key !== "Escape") {
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          (active instanceof HTMLElement && active.isContentEditable)
        ) {
          return;
        }
      }

      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) return;

      if (e.key === "e" && view.getMode() === "preview") {
        e.preventDefault();
        const state = view.leaf.getViewState();
        if (state.state) {
          state.state.mode = "source";
          void view.leaf.setViewState(state);
        }
      } else if (e.key === "Escape" && view.getMode() === "source") {
        e.preventDefault();
        const state = view.leaf.getViewState();
        if (state.state) {
          state.state.mode = "preview";
          void view.leaf.setViewState(state);
        }
      }
    };
    document.addEventListener("keydown", handler);
  },

  unload() {
    if (handler) document.removeEventListener("keydown", handler);
    handler = null;
  },
};
