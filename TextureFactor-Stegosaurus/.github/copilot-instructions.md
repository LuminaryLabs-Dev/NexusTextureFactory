# Copilot / AI Agent Instructions — TextureFactory

Short goal: be immediately productive editing, testing, and extending the procedural texture builder UI and renderer.

## Big picture
- Single-page Next.js (app router) client app. Entry: `app/page.js`. UI components live in `app/components/*`.
- Core renderer: `lib/TextureEngine.js` (WebGL shader-based stack renderer). It runs entirely in the browser (creates canvases via `document`).
- Step definitions / rules: `lib/constants.js` (contains `STEP_TYPES`, `FILTER_PIPELINE`, `generateSemanticName`).
- No server/API or external inference calls — AI-like features are local heuristics (see `generateSemanticName` & `FILTER_PIPELINE`).

## Quick start (dev & build)
- Run locally: `npm run dev` → open http://localhost:3000
- Build for prod: `npm run build` then `npm run start`
- Lint: `npm run lint`

## Key files to read or change first
- `app/page.js` — app state, tab routing, orchestration between UI and `TextureEngine`
- `lib/TextureEngine.js` — shader source, `renderStack`, `getTextureUrl`, `analyzeTexture`
- `lib/constants.js` — add/change step metadata or filter rules here (must align with shader IDs)
- `app/components/StepCard.js`, `BuilderTab.js`, `GeneratorTab.js` — UI + bindings for step data
- `app/globals.css` — Tailwind + small utility classes (checkerboard, sliders)

## Important conventions & invariants (must follow)
- All rendering is client-only. Do not move `TextureEngine` usage into server components — it depends on `document`/WebGL and requires `"use client"` in components that call it.
- `STEP_TYPES[].id` must match shader switch cases inside `FS_TEMPLATE` in `lib/TextureEngine.js`. If you add a new step type, update both `lib/constants.js` and the fragment shader logic.
- Step data model (used across UI + engine):
  - id, typeDef, active (bool), blendMode (int), params (p1..p7), universal (power/mult/scale/offsetX/offsetY), previewUrl, note
  - Example: `{ id: 's1', typeDef: STEP_TYPES.BASE_SHAPE, active: true, blendMode: 0, params: { p1:0, p2:0.8 }, universal: { power:1 } }`
- Texture images are data-URLs created by `TextureEngine.getTextureUrl()`; exports use `jszip` in `app/page.js`.

## Editing rules / implementation checklist for common changes
- To add a new generator/modifier:
  1. Add entry in `lib/constants.js` (controls + default params).
  2. Implement shader logic / branching in `lib/TextureEngine.js` (match `typeDef.id`).
  3. Add UI controls in `app/components/StepCard.js` (use same `controls` metadata).
  4. Update any unit helpers (e.g., `generateSemanticName`) if the new step affects naming.
- To change preview/export behavior: check `app/page.js` (engines created in useEffect) and `BuilderTab` export button.

## Debugging & testing tips specific to this repo
- WebGL shader compile/render errors appear in the browser console; inspect `createShader`/`createProgram` returns in `TextureEngine`.
- To reproduce a texture: copy a `steps` array from the UI (state) and call `engine.renderStack(steps)` in browser console (engine created in `app/page.js`).
- `analyzeTexture()` (in `TextureEngine`) produces `density`, `cScore`, `sScore` used by the generator filters — adjust thresholds in `FILTER_PIPELINE` for behavior changes.

## Patterns for AI agents (what to do / avoid)
- Prefer small, self-contained edits: update `constants.js` + `StepCard.js` together when adding controls.
- Avoid moving `TextureEngine` server-side; instead abstract shared logic into pure JS helpers if needed for testing.
- Use `jsconfig.json` alias `@/*` for imports (e.g. `@/lib/TextureEngine`).

## Known gaps / constraints (explicit)
- No automated tests exist; helpers like `generateSemanticName` and `lib/TextureEngine` are good targets for unit tests (pure functions can be extracted/tested).
- No backend — any persistence/remote inference must be added intentionally.

## Example changes (concrete snippets)
- Add step: update `lib/constants.js` + add matching `u_stepType` branch in `lib/TextureEngine.js`.
- To change naming heuristics: edit `generateSemanticName` in `lib/constants.js`.

---
If you'd like, I can:
- Add example unit tests for `generateSemanticName` and the constants shape, or
- Open a PR that wires CI linting/test steps.

Please tell me which section you want expanded or any missing details to include. ✅