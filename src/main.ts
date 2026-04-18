import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type Feature, type GoldilocksSettings } from "./types";
import { findConflictingPlugin, warnConflict } from "./conflicts";
import { GoldilocksSettingTab } from "./settings";
import { pluginShortcut } from "./features/pluginShortcut";
import { pressEForEdit } from "./features/pressEForEdit";
import { printFromMenu } from "./features/printFromMenu";
import { newNoteInFolder } from "./features/newNoteInFolder";
import { tabColorsRename } from "./features/tabColorsRename";

export const FEATURES: Feature[] = [
  pluginShortcut,
  tabColorsRename,
  newNoteInFolder,
  printFromMenu,
  pressEForEdit,
];

export default class GoldilocksEssentialsPlugin extends Plugin {
  settings!: GoldilocksSettings;
  private loadedFeatures: Feature[] = [];

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GoldilocksSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => this.loadFeatures());
  }

  onunload() {
    this.unloadFeatures();
  }

  private loadFeatures(): void {
    for (const feature of FEATURES) {
      if (!this.isFeatureEnabled(feature.id)) continue;
      const conflict = findConflictingPlugin(this.app, feature.conflictsWith);
      if (conflict) {
        warnConflict(this.app, feature.name, conflict);
        continue;
      }
      feature.load(this);
      this.loadedFeatures.push(feature);
    }
  }

  private unloadFeatures(): void {
    for (const feature of this.loadedFeatures) feature.unload(this);
    this.loadedFeatures = [];
  }

  isFeatureEnabled(id: string): boolean {
    return this.settings.enabled[id] ?? true;
  }

  async setFeatureEnabled(id: string, enabled: boolean): Promise<void> {
    this.settings.enabled[id] = enabled;
    await this.saveSettings();
  }

  async reloadSelf(): Promise<void> {
    const manifestId = this.manifest.id;
    const appPlugins = (this.app as unknown as {
      plugins: { disablePlugin(id: string): Promise<void>; enablePlugin(id: string): Promise<void> };
    }).plugins;
    await appPlugins.disablePlugin(manifestId);
    await appPlugins.enablePlugin(manifestId);
  }

  async loadSettings(): Promise<void> {
    const raw = (await this.loadData()) as Partial<GoldilocksSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
