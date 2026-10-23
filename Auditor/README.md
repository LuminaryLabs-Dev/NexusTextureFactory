# NexusTextureFactory - full playthrough auditor

This directory is a **thin orchestration layer**, not a second testing engine. It uses [LuminaryLabs-Dev/NexusAuditor](https://github.com/LuminaryLabs-Dev/NexusAuditor) (Python package `nexus-auditor`) as the runner.

## Objective

Audit complete, stateful human journeys rather than "page loaded" smoke checks. Each journey needs its own browser profile, disposable storage, fixture, persisted assertions, evidence, and a PASS/FAIL result.

## Current NexusAuditor capability boundary

The shared runner currently supports JSONL steps: `open`, `fill`, `click`, `wait`, `reload`, `back`, `expect` (visible text/selector/URL/no browser errors), `screenshot`, local HTTP requests, and allowlisted commands. It does **not yet** expose IndexedDB assertions, browser dialog responses, file chooser uploads, browser-context restart with persistent profiles, quota fault injection, or storage snapshot comparison.

**A screenshot or a successful reload is not project-recovery acceptance.** Those gaps must be implemented in NexusAuditor itself, not worked around with a parallel test engine here.

## Required journeys

1. **PB-01 Create > generate > save > reload > reopen > compare**: use a fixed texture recipe; compare project ID, recipe, texture SHA-256 and blob metadata across a fresh browser session.
2. **PB-02 Switch A > B > A**: create distinct recipes/textures in A and B; assert no leaks or overwritten legacy keys.
3. **PB-03 Rename > duplicate > modify duplicate > delete**: confirm independent IDs and blobs, then delete only the inactive project.
4. **PB-04 Export > clear disposable profile > import > reopen**: compare full canonical project records and PNG checksums.
5. **PB-05 Legacy V1/V2/V3**: seed **real, sanitized artifacts** taken from each historical application, preview non-destructive conversion, migrate, compare assets, verify original records unchanged.
6. **PB-06 Quota/write failures**: inject quota and aborted transactions, assert visible error, no false Saved, previous commit intact, retry succeeds.
7. **PB-07 Crash/interrupted save**: terminate browser during a write, relaunch profile, verify last committed snapshot is recoverable.
8. **PB-08 Session growth**: generate and revisit multiple textures and projects, collect memory/console evidence, confirm no persistent degradation.

## Run workflow

```bash
python -m pip install -e ../NexusAuditor'[browser]'
python -m playwright install chromium
# from the NexusTextureFactory repo root:
bash Auditor/run.sh doctor
bash Auditor/run.sh dry-run
bash Auditor/run.sh full
```

`run.sh` expects `nexus-auditor` to be installed in PATH and never clones or modifies the shared NexusAuditor. It does not touch GitHub Actions or deploy to production.

**Current readiness:** scenario specifications are maintained under `playthroughs/`; automatic full browser execution remains BLOCKED until the upstream engine adds the required storage/dialog/browser-profile capabilities and V3 CDN dependencies are available under its loopback-only network policy. The driver deliberately refuses to claim a full PASS while these blockers exist.

## Evidence rules

Every eventual executed case must emit step log, failure screenshot, browser console/network traces, before/after project state and binary checksums. A single step failure fails the journey, and any failed or skipped required journey fails the whole audit.

Only run against an isolated localhost server and disposable test profile, never a user's actual saved browser data.
