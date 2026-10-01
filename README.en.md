# YouRen Toolbox (youren-tools)

[中文说明](./README.md)

[![CI](https://github.com/YouRen1320/youren-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/YouRen1320/youren-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

![Dusk theme](docs/preview-dusk.png)

A small, fast Chinese-first online toolbox. **Everything runs locally in your browser — no file ever leaves your device**, and it works offline once installed.

## Live

**https://youren1320.github.io/youren-tools/**

## Implemented (v1.5.0)

- **PDF**: merge, extract pages, convert pages to PNG/JPG (multi-page zip), watermark (tiled image or diagonal text)
- **Image**: compress / convert to WebP / JPEG / PNG
- **Text**: Base64, JSON formatter, word counter (CJK-aware), URL codec, Markdown preview (sanitized), text diff, text cleaner (dedupe / sort / trim)
- **Time**: Unix timestamp converter
- **Generate**: QR code generator
- **Design**: color converter (HEX / RGB / HSL), WCAG contrast checker
- **Convert**: unit converter (metric & Chinese units: 里/尺/寸/斤/两), JSON ↔ CSV (RFC 4180, round-trip safe)
- **Dev**: hash calculator (SHA-1/256/384/512 via WebCrypto), password generator (entropy-rated), UUID generator

Also included: tool registry (zero route changes to add a tool), service & component tests (110 cases), ESLint + Prettier, type checking, GitHub Actions CI (SHA-pinned actions), Dependabot, PWA (installable & offline), day/night themes, automatic deployment to GitHub Pages, sitemap + robots.txt, WCAG AA readability (glass panels audited with our own contrast tool).

## Not implemented (roadmap)

- Custom domain binding; PDF compression (needs a qpdf-wasm-grade solution — pdf-lib's useObjectStreams measured 0.0% reduction on both image-heavy and text PDFs)
- Douyin / Xiaohongshu tools (needs a small backend; compliance under review)
- Audio & video processing (ffmpeg.wasm), multi-language UI

## Quick start

Requires Node.js ≥ 22 and pnpm ≥ 11.

```bash
git clone https://github.com/YouRen1320/youren-tools.git
cd youren-tools
pnpm install
pnpm dev        # http://localhost:4321/youren-tools/
```

Other commands: `pnpm test` / `pnpm lint` / `pnpm typecheck` / `pnpm build` / `pnpm preview`.

Deployment is automatic: pushing to `main` builds and publishes via GitHub Actions.

## Adding a tool

1. Create `src/tools/<category>/<tool>/` with `meta.ts` (registration), `service.ts` (pure logic, unit-tested) and `index.tsx` (component, default export).
2. Import and append to `allTools` in `src/tools/index.ts` — routes and the home grid update automatically.
3. Add tests; the registry integrity test validates slug uniqueness and metadata.

## Tech stack

Astro (static output) + React (islands) + Tailwind CSS + pdf-lib + pdf.js + qrcode + TypeScript / Vitest / ESLint. The sky illustration is original SVG artwork inspired by Makoto Shinkai's aesthetic — no third-party copyrighted assets.

## Disclaimer

All tools run locally in your browser; nothing is collected or uploaded. Use only with files you are legally entitled to process.

## License

[MIT](./LICENSE) © 2026 YouRen (YouRen1320)
