# Handoff for the next Claude

You're inheriting a copy of the `krallicetour-astro` project, which the user is reshaping into **krallice.com** — the band's general site. The original codebase shipped a single tour-announcement page on 2026-05-26.

## Stack

- Astro 6.3 (static output, no SSR)
- Tailwind CSS 4.3 (via `@tailwindcss/vite`)
- TypeScript
- `@astrojs/netlify` adapter — deployed to Netlify
- Node 22+
- **No JS frameworks.** Vanilla TS in Astro `<script>` blocks. Don't add React/Vue/Svelte unless the user explicitly asks.

## Project structure

```
src/
  pages/        Astro file-based routing
  layouts/      BaseLayout.astro (shared shell)
  components/   LoopPlayer.astro (see below)
  data/         tour.ts parses ../../data/links.csv via Vite ?raw
  styles/       global.css (Tailwind directives + minimal customs)
public/         Static assets served as-is
  loops/        Audio + manifest.json for the loop player
data/           Source-of-truth CSVs (links.csv = tour dates)
```

## Things to preserve as-is

### LoopPlayer (`src/components/LoopPlayer.astro`)
A fixed bottom-center audio player built from scratch. The user is happy with it — **don't redesign or refactor it without being asked.** Key facts:

- Reads `public/loops/manifest.json` (`[{title, file}]`)
- Renders nothing if the manifest is empty or missing
- Plays each track once, auto-advances on `ended`, wraps the playlist
- Pulses the play button until first user interaction (browser autoplay policy)
- Long titles get a slide-pause-fade-reset marquee via Web Animations API (no continuous scroll, no backward scroll)
- Tunable knobs at the top of `renderTitle` in the script block: `speed` (px/sec), `pauseSec`, `fadeSec`
- Audio is `preload="metadata"` — only metadata fetched until user clicks play

To add a track on the new site: drop the file into `public/loops/<subdir>/` and add an entry to `public/loops/manifest.json`. No rebuild needed beyond what Astro does on file change.

### CSV-driven content pattern
`src/data/tour.ts` imports a CSV with `?raw`, parses it at build time, and exports typed objects. Reuse this pattern for any structured content (releases, members, etc.) before reaching for a CMS.

### Visual language
Dark, atmospheric, stone-colored. `font-display` for headers, uppercase + wide letter-spacing for labels (`tracking-[0.3em]` to `tracking-[0.5em]`), monospace tabular nums for dates. Background image with semi-opaque dark overlay. See `src/pages/index.astro` and `src/layouts/BaseLayout.astro`.

## Astro gotchas already learned

1. **`<style>` blocks are scoped by default.** Selectors get a `[data-astro-cid-XYZ]` attribute appended. Styles will NOT apply to elements created via `document.createElement` at runtime. `@keyframes` names are also rewritten, breaking JS-assigned `animation` strings. Fix: `<style is:global>`. The LoopPlayer uses this.

2. **Component `<script>` tags get bundled as deferred ES modules.** They run after DOMContentLoaded. Don't rely on script order between components.

3. **Tailwind's `hidden` is `display: none`.** Don't measure layout on hidden elements — `clientWidth`/`scrollWidth` will be 0. Make visible first, then measure (rAF is fine).

## User preferences (carry over)

- **Don't start the dev server.** The user keeps `npm run dev` running in a separate terminal at `http://localhost:4321`. Use curl/WebFetch to verify changes.
- Terse responses, no chatty narration, no emojis unless asked.
- No premature abstractions, speculative features, or unrequested refactors.
- For UI work, verify in the browser before declaring complete.
- Confirm before destructive or shared-state actions (deploys, force-pushes, etc.).

## What krallice.com probably needs that this doesn't have

These are guesses — ask the user, don't assume:

- Multi-page routing (likely `/`, `/tour`, `/music`, `/about`, `/contact`)
- Discography — could be JSON/CSV-driven, or pulled from Bandcamp
- News/announcements — Astro content collections (`src/content/`) are a good fit for markdown posts
- Real navigation (current site has none — just header + list + footer)
- Social/streaming links section

## Things worth reconsidering for a bigger site

- **Audio file sizes**: current loops are 320 kbps MP3. For multi-page nav where audio might persist, re-encode at 128–160 kbps. If Netlify bandwidth becomes a concern, offload audio to Bunny CDN (~$0.01/GB) or Cloudflare R2 (egress-free) and update manifest `file` values to absolute URLs.
- **Site-wide LoopPlayer persistence across page nav**: Astro is MPA by default, so each navigation reloads the page and the audio restarts. If the user wants gapless cross-page audio, options are (a) Astro View Transitions with the player in the persistent shell, or (b) move to a single-page-app-ish setup. Don't do this preemptively.
- **Netlify free tier**: 100 GB/month bandwidth. See the conversation transcript for usage math.

## Where the user keeps your memory

`~/.claude/projects/-Users-nicholasmcmaster-dev-<project-name>/memory/`

This will be a new path for the krallice.com project (based on its directory name), so your memory starts fresh. The current project has one feedback note saved about the dev server.

## First moves on krallice.com

1. Confirm with the user: keep this codebase as the starting point, or start fresh?
2. If keeping: rename `package.json` `name`, update `astro.config.mjs` site URL, decide what to do with `src/pages/index.astro` (replace or repurpose as `/tour`)
3. Ask what pages they want first — don't scaffold speculatively
4. Keep the LoopPlayer and CSV pattern; they're load-bearing
