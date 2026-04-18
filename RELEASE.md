# Release Checklist

End-to-end release flow, from local commit to community store listing.

## Prereqs (one-time)

- Push the repo to `https://github.com/sachio222/obsidian-goldilocks-essentials` (public).
- In your fork of `obsidianmd/obsidian-releases`, make sure `upstream` is wired up:
  ```bash
  cd ~/dev/obsidian-plugins/obsidian-releases
  git remote add upstream https://github.com/obsidianmd/obsidian-releases
  ```

## Cut a new release

1. Bump the version:
   ```bash
   pnpm version patch   # or minor / major / 1.2.3
   ```
   This runs `version-bump.mjs`, updates `manifest.json` and `versions.json`, commits, and creates a `v<x>` tag.

   Note: by default `pnpm version` creates a tag prefixed with `v` (e.g. `v0.1.1`). The Obsidian store wants the raw version as the tag (`0.1.1`). Set once in this repo:
   ```bash
   pnpm config set tag-version-prefix ""
   ```

2. Push the commit **and** the tag:
   ```bash
   git push && git push --tags
   ```

3. GitHub Actions picks up the tag, runs `pnpm build`, and creates a release with `main.js`, `manifest.json`, and `styles.css` attached. Check the release page — that's what the store and BRAT read from.

4. Edit the auto-generated release notes if you want, then publish.

## Submit to the community store (first release only)

1. Sync your fork:
   ```bash
   cd ~/dev/obsidian-plugins/obsidian-releases
   git fetch upstream
   git rebase upstream/master
   git push origin master
   ```

2. Branch and add the entry to the **end** of `community-plugins.json`:
   ```bash
   git checkout -b add-goldilocks-essentials
   ```

   Append this entry (keep the existing comma before it):
   ```json
   {
     "id": "goldilocks-essentials",
     "name": "Goldilocks Essentials",
     "author": "sachio222",
     "description": "A curated kit of small, opt-in UX upgrades for Obsidian: tab rename/colors, smart new-note placement, print from menu, press-E-to-edit, and a plugin shortcut.",
     "repo": "sachio222/obsidian-goldilocks-essentials"
   }
   ```

3. Commit, push, and open a PR against `obsidianmd/obsidian-releases:master`:
   ```bash
   git add community-plugins.json
   git commit -m "Add Goldilocks Essentials"
   git push -u origin add-goldilocks-essentials
   ```
   Then open the PR via the URL in the push output.

4. Wait. Reviews are slow. During the wait, share the BRAT install link on the portfolio (`sachio222/obsidian-goldilocks-essentials`).

## Subsequent releases

Once published to the store, every new release only needs steps 1–4 from **Cut a new release**. Obsidian's update checker picks it up automatically — no PR to `obsidian-releases` for updates.

## Pre-submission QA

Before opening the submission PR, validate against Obsidian's plugin guidelines:

- [ ] `manifest.json` — `id` is unique in community-plugins.json, `name` does not start with "Obsidian"
- [ ] README explains what the plugin does and how to install
- [ ] No `innerHTML`/`outerHTML` with user input (XSS) — we use `createEl` + `textContent` for dynamic content; inline `innerHTML` only comes from `MarkdownRenderer` (safe) and static HTML strings
- [ ] No console spam in production
- [ ] `main.js` is minified (esbuild `minify: true` in production mode — already set)
- [ ] Desktop-only features fail quietly on mobile (print uses `window.print` which is a no-op on mobile — acceptable)
- [ ] All monkey-patches are reversed in `onunload` / feature `unload`
