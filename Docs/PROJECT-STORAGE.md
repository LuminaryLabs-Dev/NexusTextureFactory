# Project storage - V4 working implementation

This update introduces an optional browser-local project manager in the existing V3 Studio. It does not change V3 texture generation.

Storage: `nexustexture-projects-v1` IndexedDB with project metadata and checkpoints. An initial `Legacy V3 Workspace` checkpoint is captured from known `alphacarve-*` and `spinosaurus-*` localStorage keys, and from referenced PNG Blobs in `alphacarve-texture-cache/textures`. Legacy keys are not deleted at capture. Opening a project copies its checkpoint into the active V3 keys and reloads the page.

Project actions: create, list, open, rename, duplicate, delete inactive, JSON backup export/import. An active project can be saved manually; background autosave checks changes every six seconds after initial stabilization. Saving a project that is not active is rejected.

Limitations: this is a first milestone, not all proposed requirements are certified. Backups may be large; the JSON format inlines Base64 PNG blobs. Import from another origin requires a manually exported package. Saved V3 state may not contain every browser-local key from earlier versions. Browser-origin IndexedDB can be evicted; regularly export backups. V3's own persistence may report errors separately. Cross-project restoration has not yet passed browser/crash tests. Do not delete legacy storage or historical app directories.

Acceptance remaining: test real browser IndexedDB reads/writes, switching isolation, missing blobs, quota errors, interruption recovery, portable import, and V1/V2 fixture compatibility. Existing `deploy.yml` remains the only workflow.
