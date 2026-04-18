import { TFile, TFolder, Vault } from "obsidian";
import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";

type VaultCreate = Vault["create"];

let selectedFolder: TFolder | null = null;
let origCreate: VaultCreate | null = null;
let clickListener: ((evt: MouseEvent) => void) | null = null;

function selectFolder(folder: TFolder): void {
  clearSelection();
  selectedFolder = folder;
  const el = document.querySelector(`.nav-folder-title[data-path="${CSS.escape(folder.path)}"]`);
  if (el) el.classList.add("is-selected-folder");
}

function clearSelection(): void {
  selectedFolder = null;
  document.querySelectorAll(".is-selected-folder").forEach((el) => el.classList.remove("is-selected-folder"));
}

function expandFolder(folder: TFolder | null): void {
  if (!folder || folder.path === "/") return;
  const folderEl = document.querySelector<HTMLElement>(
    `.nav-folder-title[data-path="${CSS.escape(folder.path)}"]`,
  );
  if (!folderEl) return;
  const navFolder = folderEl.closest(".nav-folder");
  if (navFolder?.classList.contains("is-collapsed")) folderEl.click();
}

function openInEditMode(plugin: GoldilocksEssentialsPlugin, file: TFile): void {
  const leaf = plugin.app.workspace.getLeaf(false);
  void leaf.openFile(file, { state: { mode: "source" } });
}

async function createNoteInFolder(plugin: GoldilocksEssentialsPlugin, folder: TFolder): Promise<void> {
  if (!origCreate) return;
  const basePath = folder.path === "/" ? "" : folder.path;
  const name = "Untitled";
  let fullPath = basePath ? `${basePath}/${name}.md` : `${name}.md`;
  let counter = 1;
  while (plugin.app.vault.getAbstractFileByPath(fullPath)) {
    const tryName = `${name} ${counter}`;
    fullPath = basePath ? `${basePath}/${tryName}.md` : `${tryName}.md`;
    counter++;
  }
  const newFile = await origCreate.call(plugin.app.vault, fullPath, "");
  expandFolder(folder);
  clearSelection();
  if (newFile instanceof TFile) openInEditMode(plugin, newFile);
}

export const newNoteInFolder: Feature = {
  id: "new-note-in-folder",
  name: "Smart new-note placement",
  description:
    "Clicking a folder/file in the explorer sets the target folder. New notes land there instead of vault root. Adds New note here to the folder right-click menu.",
  conflictsWith: ["new-note-in-folder"],

  load(plugin: GoldilocksEssentialsPlugin) {
    plugin.registerEvent(
      plugin.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFolder)) return;
        menu.addItem((item) => {
          item.setTitle("New note here")
            .setIcon("file-plus")
            .onClick(() => void createNoteInFolder(plugin, file));
        });
      }),
    );

    clickListener = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".nav-action-button") || target.closest(".clickable-icon")) return;

      const navFolder = target.closest<HTMLElement>(".nav-folder-title");
      if (navFolder) {
        const path = navFolder.getAttribute("data-path");
        if (path) {
          const folder = plugin.app.vault.getAbstractFileByPath(path);
          if (folder instanceof TFolder) {
            selectFolder(folder);
            return;
          }
        }
      }

      const navFile = target.closest<HTMLElement>(".nav-file-title");
      if (navFile) {
        const path = navFile.getAttribute("data-path");
        if (path) {
          const file = plugin.app.vault.getAbstractFileByPath(path);
          if (file instanceof TFile && file.parent) {
            selectFolder(file.parent);
            return;
          }
        }
      }

      clearSelection();
    };
    plugin.registerDomEvent(document, "click", clickListener);

    plugin.addCommand({
      id: "new-note-in-current-folder",
      name: "New note in current folder",
      callback: () => {
        let folder: TFolder | null = selectedFolder;
        if (!folder) {
          const activeFile = plugin.app.workspace.getActiveFile();
          folder = activeFile?.parent ?? plugin.app.vault.getRoot();
        }
        void createNoteInFolder(plugin, folder);
      },
    });

    origCreate = plugin.app.vault.create.bind(plugin.app.vault);
    const patchedCreate = async function (
      this: Vault,
      path: string,
      data: string,
      options?: Parameters<VaultCreate>[2],
    ) {
      let target = selectedFolder;
      if (!target) {
        const activeFile = plugin.app.workspace.getActiveFile();
        if (activeFile?.parent && activeFile.parent.path !== "/") target = activeFile.parent;
      }

      if (target && /^Untitled( \d+)?\.md$/.test(path)) {
        const basePath = target.path;
        let redirected = `${basePath}/Untitled.md`;
        let counter = 1;
        while (plugin.app.vault.getAbstractFileByPath(redirected)) {
          redirected = `${basePath}/Untitled ${counter}.md`;
          counter++;
        }
        clearSelection();
        const newFile = await origCreate!.call(plugin.app.vault, redirected, data, options);
        expandFolder(target);
        if (newFile instanceof TFile) openInEditMode(plugin, newFile);
        return newFile;
      }
      return origCreate!.call(plugin.app.vault, path, data, options);
    };
    (plugin.app.vault as unknown as { create: VaultCreate }).create = patchedCreate as VaultCreate;
  },

  unload(plugin: GoldilocksEssentialsPlugin) {
    if (origCreate) {
      (plugin.app.vault as unknown as { create: VaultCreate }).create = origCreate;
      origCreate = null;
    }
    clickListener = null;
    clearSelection();
  },
};
