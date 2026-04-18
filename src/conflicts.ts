import { App, Notice } from "obsidian";

interface AppWithPlugins extends App {
  plugins: {
    enabledPlugins: Set<string>;
    manifests: Record<string, { name?: string } | undefined>;
  };
}

export function findConflictingPlugin(app: App, ids: string[]): string | null {
  const { enabledPlugins } = (app as AppWithPlugins).plugins;
  for (const id of ids) {
    if (enabledPlugins.has(id)) return id;
  }
  return null;
}

export function displayName(app: App, id: string): string {
  const manifest = (app as AppWithPlugins).plugins.manifests[id];
  return manifest?.name ?? id;
}

export function warnConflict(app: App, featureName: string, conflictId: string): void {
  const other = displayName(app, conflictId);
  new Notice(
    `Goldilocks: "${featureName}" skipped — conflicts with "${other}". Disable the standalone plugin or turn off this feature in settings.`,
    8000,
  );
}
