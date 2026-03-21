# Human View Audit

Scope: `INTEGRATIONS` tab, local HTTP RPC companion, and preview workflow validation for Spinosaurus.

## Tool Surfaces

### Companion control
- `GET /health`
- `POST /session/start`
- `POST /session/stop`
- `POST /app/open`
- `POST /app/reload`
- `GET /app/status`

### Capture and inspection
- `POST /capture/full_app`
- `POST /capture/viewport`
- `POST /capture/element`
- `GET /capture/latest`
- `GET /inspect/console`
- `GET /inspect/network`
- `POST /inspect/dom_snapshot`

### App actions
- `POST /action/navigate`
- `POST /action/click`
- `POST /action/type`
- `POST /action/select`
- `POST /action/press`

### Particle preview
- `POST /particle/open_preview`
- `POST /particle/select_source`
- `POST /particle/select_preset`
- `POST /particle/apply_control_set`
- `POST /particle/run_validation_pass`

### Loop control
- `POST /loop/run`
- `GET /loop/status`
- `POST /loop/stop`

## Verified Results

- The app loads locally and the top navigation includes `INTEGRATIONS`.
- The `INTEGRATIONS` tab renders a readable guide panel.
- The `COPY GUIDE` button is present, clickable, and uses clipboard readback when available.
- `POST /health` returns companion status data.
- `POST /session/start` succeeds.
- `POST /app/open` succeeds when pointed at the live local app URL.
- `POST /capture/full_app` writes a screenshot artifact.
- `GET /app/status` reports the live app URL, title, and visible tabs.
- `POST /action/navigate` successfully switches to the `integrations` tab.
- `POST /action/click` successfully activates the `COPY GUIDE` button.
- `POST /inspect/dom_snapshot` now returns a simplified visible-node snapshot instead of throwing.
- `POST /particle/open_preview` now asserts the preview layout is visible.
- `POST /loop/run` and `GET /loop/status` work for the toolchain readiness loop.

## Particle System Audit

### What is visible
- The `PREVIEW` tab opens.
- The preview UI shows the empty-state prompt when no source texture is available.
- The left rail shows the layer list.
- The right rail shows a Unity-style accordion module stack.
- `Main`, `Emission`, and `Shape` are visible and editable without a loaded source.

### What still needs proof
- A loaded source texture was not available during this audit, so visible particle emission was not verified.
- The particle field was not validated with an actual source texture loaded into the preview.

## Issues Found

1. Visible particle emission still needs to be proven with a loaded source texture.
2. Clipboard verification is browser-level only; OS clipboard state was not separately inspected.
3. The companion HTTP loop and capture surface are useful, but they still depend on a live browser session and app server being available.

## Notes

- The guide text is currently static in the app UI.
- The companion tool list is useful as an operator reference, but it should be kept in sync with the actual HTTP surface.
- This audit validates the current visible app shell and companion commands, not a fully emitted particle scene.
