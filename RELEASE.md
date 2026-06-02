# Release Checklist

End-to-end release flow, from local commit to community store listing.

## Prereqs (one-time)

- Push the repo to `https://github.com/sachio222/obsidian-goldilocks-essentials` (public).
- Have a `community.obsidian.md` account with the GitHub identity linked (avatar → Profile → connect GitHub).

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

> The PR-to-`obsidianmd/obsidian-releases` flow is **deprecated**. PRs against that repo are disabled. Submissions now happen through a web form on `community.obsidian.md`, and an automated reviewer runs against the latest GitHub release.

1. Sign in at https://community.obsidian.md and confirm your GitHub identity is linked.
2. Navigate to **Plugins → New plugin**.
3. Enter the repo URL: `https://github.com/sachio222/obsidian-goldilocks-essentials`.
4. Agree to the Developer policies and submit.
5. The automated reviewer (ObsidianReviewBot / `eslint-plugin-obsidianmd`) runs against the latest GitHub release. Findings show on the plugin's page in `community.obsidian.md`.
6. Address findings by pushing a new release (see *Cut a new release* above), then revisit the plugin page — the bot re-runs against the new tag.
7. During the wait, share the BRAT install link on the portfolio (`sachio222/obsidian-goldilocks-essentials`).

Track the submission here: https://community.obsidian.md/plugins/goldilocks-essentials

## Subsequent releases

Once published to the store, every new release only needs steps 1–4 from **Cut a new release**. Obsidian's update checker picks it up automatically — no resubmission needed.

## Pre-submission QA

Before submitting, validate against Obsidian's plugin guidelines:

- [ ] `manifest.json` — `id` is unique in community-plugins.json, `name` does not start with "Obsidian"
- [ ] README explains what the plugin does and how to install
- [ ] No `innerHTML`/`outerHTML` with user input (XSS) — we use `createEl` + `textContent` for dynamic content; inline `innerHTML` only comes from `MarkdownRenderer` (safe) and static HTML strings
- [ ] No console spam in production
- [ ] `main.js` is minified (esbuild `minify: true` in production mode — already set)
- [ ] Desktop-only features fail quietly on mobile (print uses `window.print` which is a no-op on mobile — acceptable)
- [ ] All monkey-patches are reversed in `onunload` / feature `unload`
