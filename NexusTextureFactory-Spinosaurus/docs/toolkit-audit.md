# Toolkit Audit

Scope: local toolkit validation for Spinosaurus through the categorized HTTP tool surface.

## HTTP Paths

- `GET /toolkit/health`
- `GET /toolkit/catalog`
- `POST /toolkit/run`
- `GET /toolkit/runs/latest`
- `GET /toolkit/logs`

## Categories

- `session`
- `app`
- `capture`
- `inspect`
- `input`
- `preview`
- `loop`

## Notes

- Browser-driving tools are exposed as categorized toolkit tools, but they are executed through Codex Browser View and local Playwright MCP as external operator steps.
- The toolkit is local-only and optional.
- The static site continues to work without the toolkit server.
