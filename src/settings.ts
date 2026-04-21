import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type GoldilocksEssentialsPlugin from "./main";
import { FEATURES } from "./main";
import { displayName, findConflictingPlugin } from "./conflicts";
import type { CompactTableSize, NoteWidthId } from "./types";
import { NOTE_WIDTHS } from "./types";
import { noteWidthUpdateStatusBar } from "./features/noteWidth";

export class GoldilocksSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: GoldilocksEssentialsPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Goldilocks Essentials" });
    containerEl.createEl("p", {
      text: "A curated kit of small UX upgrades. Toggle any feature off if you prefer a standalone plugin for it — Goldilocks will auto-skip features whose standalone siblings are enabled.",
    });

    for (const feature of FEATURES) {
      const setting = new Setting(containerEl).setName(feature.name).setDesc(feature.description);

      const conflict = findConflictingPlugin(this.app, feature.conflictsWith);
      if (conflict) {
        const warning = containerEl.createEl("div", {
          text: `Standalone plugin "${displayName(this.app, conflict)}" is enabled — this feature is skipped to avoid conflicts.`,
        });
        warning.style.cssText = "color: var(--text-warning); font-size: 0.85em; margin: -0.5em 0 1em 0;";
      }

      setting.addToggle((toggle) =>
        toggle.setValue(this.plugin.isFeatureEnabled(feature.id)).onChange(async (value) => {
          await this.plugin.setFeatureEnabled(feature.id, value);
          new Notice(`${feature.name}: ${value ? "enabled" : "disabled"}. Reload plugin to apply.`);
        }),
      );

      if (feature.id === "compact-tables" && this.plugin.isFeatureEnabled(feature.id)) {
        setting.settingEl.addClass("has-goldilocks-density");
        const densityRow = setting.settingEl.createDiv({ cls: "goldilocks-density-row" });
        densityRow.createSpan({ text: "Choose Small or Extra small density.", cls: "goldilocks-density-label" });
        const select = densityRow.createEl("select", { cls: "dropdown" });
        select.createEl("option", { text: "Extra small", value: "xs" });
        select.createEl("option", { text: "Small", value: "sm" });
        select.value = this.plugin.settings.compactTableSize;
        select.addEventListener("change", async () => {
          this.plugin.settings.compactTableSize = select.value as CompactTableSize;
          await this.plugin.saveSettings();
          const label = select.value === "xs" ? "Extra small" : "Small";
          new Notice(`Table density: ${label}. Reload plugin to apply.`);
        });
      }

      if (feature.id === "note-width" && this.plugin.isFeatureEnabled(feature.id)) {
        setting.settingEl.addClass("has-goldilocks-width");
        const widthRow = setting.settingEl.createDiv({ cls: "goldilocks-width-row" });
        const btnContainer = widthRow.createDiv({ cls: "goldilocks-width-buttons" });
        for (const w of NOTE_WIDTHS) {
          const btn = btnContainer.createEl("button", { text: w.name, cls: "goldilocks-width-btn" });
          if (this.plugin.settings.noteWidth === w.id) btn.addClass("is-active");
          btn.addEventListener("click", async () => {
            this.plugin.settings.noteWidth = w.id as NoteWidthId;
            await this.plugin.saveSettings();
            document.body.setAttribute("data-note-width", w.id);
            noteWidthUpdateStatusBar(this.plugin);
            new Notice(`Note width: ${w.name}`);
            this.display();
          });
        }
      }
    }

    new Setting(containerEl)
      .setName("Apply changes")
      .setDesc("Reloads the plugin so enable/disable toggles take effect.")
      .addButton((btn) =>
        btn.setButtonText("Reload plugin").setCta().onClick(async () => {
          await this.plugin.reloadSelf();
        }),
      );
  }
}
