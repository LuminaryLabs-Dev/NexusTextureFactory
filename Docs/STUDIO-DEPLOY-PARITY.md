# Studio V3 parity and main deployment

The active V4 web application is hosted from `Studio/`. Its index, scripts, layout, CSS, viewmodel and preview files were copied unchanged from `NexusTextureFactory-Spinosaurus/`; the critical files match their V3 Git blob SHAs at the deployment update.

The single `.github/workflows/deploy.yml` runs on every push to `main`, syntax-checks V4 modules, runs the V4 unit suite, builds `Studio/dist`, verifies its entrypoint files, and publishes that artifact through GitHub Pages. The old Spinosaurus and validation workflows have been removed.

**Evidence boundary:** Matching file contents establish static code parity, not runtime equivalence. Browser visual snapshots, UI interaction tests, saved-set tests and actual GitHub Pages deployment must still be run and reviewed. External CDN dependencies in Studio require network availability in the user's browser. The staged Studio still runs V3's own rendering engine, not the new V4 Core. Do not claim complete Core/Studio integration.

No legacy application directories are deleted by this deployment change. The archive remains untouched.
