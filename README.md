# HX2 TypeScript Config Pack (Drop‑In)

This zip provides the baseline TypeScript setup your devs reported missing for the HX2 Next.js/Vercel build.

## Included
- `tsconfig.json` — strict, modern TS config tuned for HX2 with useful path aliases:
  - `@core/*`  → `src/core/*`
  - `@nodes/*` → `src/nodes/*`
  - `@ui/*`    → `src/ui/*`
  - `@lib/*`   → `src/lib/*`
  - `@components/*` → `src/components/*`
  - `@config/*` → `src/config/*`
- `next-env.d.ts` — required by Next.js (do not edit).
- `next.config.js` — safe defaults (strict mode, SWC minify).

## How to install (60 seconds)
1) Unzip into your project root **(same folder as `package.json`)**.
2) Ensure your source lives under `src/` (e.g., `src/pages`, `src/components`, `src/nodes`, etc.).
   - If your structure differs, update the `paths` in `tsconfig.json` accordingly.
3) If you don’t have TypeScript installed:
   ```bash
   npm i -D typescript @types/node @types/react
   ```
4) Start dev:
   ```bash
   npm run dev
   ```

## Notes
- `noEmit: true` lets Next.js handle compilation (recommended).
- `strict: true` improves code quality; loosen if needed.
- Vercel builds will respect this config automatically.

## Troubleshooting
- **Module not found with alias**: update `baseUrl`/`paths` or move files into `src/`.
- **TS errors break CI**: set `typescript.ignoreBuildErrors` to `true` in `next.config.js` temporarily.
- **JS only project**: keep this config; it won’t interfere (Next.js supports JS with TS tooling).
