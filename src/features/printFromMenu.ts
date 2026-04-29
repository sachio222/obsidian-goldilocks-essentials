import { MarkdownRenderer, MarkdownView, TFile } from "obsidian";
import type GoldilocksEssentialsPlugin from "../main";
import type { Feature } from "../types";

const PRINT_CSS = [
  "body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 750px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1a1a1a; font-size: 14px; }",
  "h1 { font-size: 1.8em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }",
  "h2 { font-size: 1.4em; } h3 { font-size: 1.2em; }",
  "code { background: #f4f4f4; padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.9em; }",
  "pre { background: #f4f4f4; padding: 12px 16px; border-radius: 4px; overflow-x: auto; }",
  "pre code { background: none; padding: 0; }",
  "blockquote { border-left: 3px solid #888; margin: 0.8em 0; padding: 0.4em 1em; color: #555; }",
  "table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }",
  "th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }",
  "th { background: #f4f4f4; } img { max-width: 100%; }",
  "a { color: #1a1a1a; text-decoration: underline; }",
  "@media print { body { margin: 0; padding: 0; } }",
].join("\n");

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function printNote(plugin: GoldilocksEssentialsPlugin, view: MarkdownView): Promise<void> {
  const file = view.file;
  if (!file) return;

  const content = await plugin.app.vault.read(file);
  const container = document.createElement("div");
  await MarkdownRenderer.render(plugin.app, content, container, file.path, view);

  const html = [
    "<!DOCTYPE html><html><head>",
    `<title>${escapeHtml(file.basename)}</title>`,
    `<style>${PRINT_CSS}</style>`,
    "</head><body>",
    `<h1>${escapeHtml(file.basename)}</h1>`,
    container.innerHTML,
    "</body></html>",
  ].join("\n");

  const iframe = document.createElement("iframe");
  iframe.addClass("goldilocks-print-iframe");
  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  iframe.addEventListener("load", () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.focus();
    win.print();
    window.setTimeout(cleanup, 1000);
  });
}

export const printFromMenu: Feature = {
  id: "print-from-menu",
  name: "Print from right-click menu",
  description: "Adds Print\u2026 to the right-click menu for markdown files, plus a Print current note command.",
  conflictsWith: ["print-note"],

  load(plugin: GoldilocksEssentialsPlugin) {
    plugin.addCommand({
      id: "print-current-note",
      name: "Print current note",
      checkCallback: (checking: boolean) => {
        const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return false;
        if (checking) return true;
        void printNote(plugin, view);
        return true;
      },
    });

    plugin.registerEvent(
      plugin.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        menu.addItem((item) => {
          item
            .setTitle("Print\u2026")
            .setIcon("printer")
            .setSection("action")
            .onClick(async () => {
              const leaf = plugin.app.workspace.getLeaf(false);
              await leaf.openFile(file);
              const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
              if (view) await printNote(plugin, view);
            });
        });
      }),
    );
  },

  unload() {
    // Command + event are registered through plugin.addCommand/registerEvent,
    // so Obsidian unregisters them automatically on plugin unload.
  },
};
