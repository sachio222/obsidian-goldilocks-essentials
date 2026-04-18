import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";

interface AppWithSetting {
  setting: {
    open(): void;
    openTabById(id: string): void;
  };
}

let ribbonEl: HTMLElement | null = null;

export const pluginShortcut: Feature = {
  id: "plugin-shortcut",
  name: "Community plugins ribbon",
  description: "Puzzle-piece icon in the sidebar that jumps straight to Community Plugins.",
  conflictsWith: ["plugin-store-shortcut"],

  load(plugin: GoldilocksEssentialsPlugin) {
    ribbonEl = plugin.addRibbonIcon("puzzle", "Installed plugins", () => {
      const app = plugin.app as unknown as AppWithSetting;
      app.setting.open();
      app.setting.openTabById("community-plugins");
    });
  },

  unload() {
    ribbonEl?.remove();
    ribbonEl = null;
  },
};
