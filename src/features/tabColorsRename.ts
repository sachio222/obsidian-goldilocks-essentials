import { App, Menu, Modal, Notice, TFile, WorkspaceLeaf } from "obsidian";
import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";

const TAB_COLORS: { name: string; value: string }[] = [
  { name: "Red", value: "#e74c3c" },
  { name: "Orange", value: "#e67e22" },
  { name: "Yellow", value: "#f1c40f" },
  { name: "Green", value: "#27ae60" },
  { name: "Blue", value: "#3498db" },
  { name: "Purple", value: "#9b59b6" },
  { name: "Pink", value: "#e84393" },
];

type ShowAtMouseEvent = (this: Menu, evt: MouseEvent) => Menu;
type ShowAtPosition = (this: Menu, position: { x: number; y: number }, doc?: Document) => Menu;

interface LeafWithTabHeader extends WorkspaceLeaf {
  tabHeaderEl?: HTMLElement;
  id?: string;
  updateHeader?: () => void;
  view: WorkspaceLeaf["view"] & {
    file?: TFile;
    _origGetDisplayText?: () => string;
  };
}

let pendingLeaf: LeafWithTabHeader | null = null;
let origShowAtMouseEvent: ShowAtMouseEvent | null = null;
let origShowAtPosition: ShowAtPosition | null = null;

class RenameModal extends Modal {
  private inputEl!: HTMLInputElement;
  constructor(
    app: App,
    private readonly heading: string,
    private readonly currentName: string,
    private readonly onSubmit: (name: string) => void,
  ) {
    super(app);
  }

  onOpen() {
    this.titleEl.setText(this.heading);
    this.inputEl = this.contentEl.createEl("input", { type: "text", value: this.currentName });
    this.inputEl.addClass("goldilocks-rename-input");
    window.setTimeout(() => {
      this.inputEl.focus();
      this.inputEl.select();
    }, 10);
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      }
      if (e.key === "Escape") this.close();
    });
    const btns = this.contentEl.createDiv();
    btns.addClass("goldilocks-modal-buttons");
    btns.createEl("button", { text: "Cancel" }).addEventListener("click", () => this.close());
    btns.createEl("button", { text: "Rename", cls: "mod-cta" }).addEventListener("click", () => this.submit());
  }

  private submit() {
    this.onSubmit(this.inputEl.value.trim());
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

function findLeafByTabHeader(plugin: GoldilocksEssentialsPlugin, el: HTMLElement): LeafWithTabHeader | null {
  let found: LeafWithTabHeader | null = null;
  plugin.app.workspace.iterateAllLeaves((leaf) => {
    if (found) return;
    if ((leaf as LeafWithTabHeader).tabHeaderEl === el) found = leaf as LeafWithTabHeader;
  });
  return found;
}

function applyCustomTitle(plugin: GoldilocksEssentialsPlugin, leaf: LeafWithTabHeader): void {
  if (!leaf.id) return;
  const title = plugin.settings.customTitles[leaf.id];
  if (!title || !leaf.view) return;
  if (!leaf.view._origGetDisplayText) {
    leaf.view._origGetDisplayText = leaf.view.getDisplayText.bind(leaf.view);
  }
  leaf.view.getDisplayText = () => title;
  leaf.updateHeader?.();
}

function applyTabColor(plugin: GoldilocksEssentialsPlugin, leaf: LeafWithTabHeader): void {
  if (!leaf.id) return;
  const color = plugin.settings.tabColors[leaf.id];
  if (!color || !leaf.tabHeaderEl) return;
  leaf.tabHeaderEl.style.setProperty("--tab-color", color);
  leaf.tabHeaderEl.classList.add("has-tab-color");
}

function clearTabColor(plugin: GoldilocksEssentialsPlugin, leaf: LeafWithTabHeader): void {
  if (!leaf.id) return;
  delete plugin.settings.tabColors[leaf.id];
  void plugin.saveSettings();
  if (leaf.tabHeaderEl) {
    leaf.tabHeaderEl.style.removeProperty("--tab-color");
    leaf.tabHeaderEl.classList.remove("has-tab-color");
  }
  new Notice("Tab color removed");
}

function setTabColor(plugin: GoldilocksEssentialsPlugin, leaf: LeafWithTabHeader, color: string): void {
  if (!leaf.id) return;
  plugin.settings.tabColors[leaf.id] = color;
  void plugin.saveSettings();
  applyTabColor(plugin, leaf);
  new Notice("Tab color set");
}

function promptTabRename(plugin: GoldilocksEssentialsPlugin, leaf: LeafWithTabHeader): void {
  if (!leaf.id) return;
  const current = plugin.settings.customTitles[leaf.id] ?? leaf.getDisplayText();
  new RenameModal(plugin.app, "Rename tab", current, (newTitle) => {
    if (!newTitle || !leaf.id) return;
    plugin.settings.customTitles[leaf.id] = newTitle;
    void plugin.saveSettings().then(() => {
      applyCustomTitle(plugin, leaf);
      new Notice(`Tab renamed to ${newTitle}`);
    });
  }).open();
}

function promptFileRename(plugin: GoldilocksEssentialsPlugin, file: TFile): void {
  new RenameModal(plugin.app, "Rename file", file.basename, (newName) => {
    if (!newName || newName === file.basename) return;
    const newPath = file.parent
      ? `${file.parent.path}/${newName}.${file.extension}`
      : `${newName}.${file.extension}`;
    if (plugin.app.vault.getAbstractFileByPath(newPath)) {
      new Notice("A file with that name already exists.");
      return;
    }
    void plugin.app.fileManager.renameFile(file, newPath).then(() => {
      new Notice(`Renamed to ${newName}`);
    });
  }).open();
}

function addTabMenuItems(plugin: GoldilocksEssentialsPlugin, menu: Menu, leaf: LeafWithTabHeader): void {
  menu.addSeparator();
  menu.addItem((item) => {
    item.setTitle("Rename tab").setIcon("pencil").onClick(() => promptTabRename(plugin, leaf));
  });
  menu.addItem((item) => {
    item.setTitle("Tab color").setIcon("palette");
    const sub = (item as unknown as { setSubmenu: () => Menu }).setSubmenu();
    for (const color of TAB_COLORS) {
      sub.addItem((si) => {
        si.setTitle(color.name).onClick(() => setTabColor(plugin, leaf, color.value));
      });
    }
    if (leaf.id && plugin.settings.tabColors[leaf.id]) {
      sub.addSeparator();
      sub.addItem((si) => {
        si.setTitle("None").setIcon("x").onClick(() => clearTabColor(plugin, leaf));
      });
    }
  });
}

function applyAll(plugin: GoldilocksEssentialsPlugin): void {
  plugin.app.workspace.iterateAllLeaves((leaf) => {
    const l = leaf as LeafWithTabHeader;
    if (!l.id) return;
    if (plugin.settings.customTitles[l.id]) applyCustomTitle(plugin, l);
    if (plugin.settings.tabColors[l.id]) applyTabColor(plugin, l);
  });
}

export const tabColorsRename: Feature = {
  id: "tab-colors-rename",
  name: "Tab rename & colors",
  description: "Right-click any tab to rename it or pick a color. Rename command in the palette.",
  conflictsWith: ["tab-rename"],

  load(plugin: GoldilocksEssentialsPlugin) {
    plugin.registerEvent(
      plugin.app.workspace.on("file-menu", (menu, file, _source, leaf) => {
        if (!(file instanceof TFile)) return;
        menu.addItem((item) => {
          item.setTitle("Rename file").setIcon("pencil").setSection("action").onClick(() => promptFileRename(plugin, file));
        });
        if (leaf) addTabMenuItems(plugin, menu, leaf as LeafWithTabHeader);
      }),
    );

    plugin.registerDomEvent(document, "contextmenu", (evt) => {
      const target = evt.target as HTMLElement | null;
      const tabHeader = target?.closest<HTMLElement>(".workspace-tab-header");
      if (!tabHeader) return;
      const leaf = findLeafByTabHeader(plugin, tabHeader);
      if (!leaf) return;
      if (leaf.view?.file) return; // file tabs handled by file-menu
      pendingLeaf = leaf;
    });

    origShowAtMouseEvent = Menu.prototype.showAtMouseEvent;
    Menu.prototype.showAtMouseEvent = function (this: Menu, evt: MouseEvent) {
      if (pendingLeaf) {
        addTabMenuItems(plugin, this, pendingLeaf);
        pendingLeaf = null;
      }
      return origShowAtMouseEvent!.call(this, evt);
    };

    origShowAtPosition = Menu.prototype.showAtPosition as ShowAtPosition;
    Menu.prototype.showAtPosition = function (this: Menu, position: { x: number; y: number }, doc?: Document) {
      if (pendingLeaf) {
        addTabMenuItems(plugin, this, pendingLeaf);
        pendingLeaf = null;
      }
      return origShowAtPosition!.call(this, position, doc);
    };

    plugin.addCommand({
      id: "rename-active-tab",
      name: "Rename active tab",
      callback: () => {
        const leaf = plugin.app.workspace.getMostRecentLeaf() as LeafWithTabHeader | null;
        if (leaf) promptTabRename(plugin, leaf);
      },
    });

    plugin.app.workspace.onLayoutReady(() => applyAll(plugin));
    plugin.registerEvent(plugin.app.workspace.on("layout-change", () => applyAll(plugin)));
  },

  unload(plugin: GoldilocksEssentialsPlugin) {
    if (origShowAtMouseEvent) {
      Menu.prototype.showAtMouseEvent = origShowAtMouseEvent;
      origShowAtMouseEvent = null;
    }
    if (origShowAtPosition) {
      Menu.prototype.showAtPosition = origShowAtPosition;
      origShowAtPosition = null;
    }
    plugin.app.workspace.iterateAllLeaves((leaf) => {
      const l = leaf as LeafWithTabHeader;
      if (l.view?._origGetDisplayText) {
        l.view.getDisplayText = l.view._origGetDisplayText;
        delete l.view._origGetDisplayText;
      }
      if (l.tabHeaderEl) {
        l.tabHeaderEl.style.removeProperty("--tab-color");
        l.tabHeaderEl.classList.remove("has-tab-color");
      }
    });
    pendingLeaf = null;
  },
};
