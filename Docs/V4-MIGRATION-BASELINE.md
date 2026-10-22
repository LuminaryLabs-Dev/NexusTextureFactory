# NexusTextureFactory V4 - Verified Migration Baseline

Status: PARTIAL - preservation and read-only feature audit completed. This document is not a claim that V4 has been implemented.

## Baseline and preservation
- Source branch: main
- Source commit: 16aa67c8b6961e9fd434f9d7182feb6889e7eb78
- Preservation branch: archive-11-2026, independently read back at the exact source commit.
- Existing default-branch directories: NexusTextureFactory-Stegosaurus/, NexusTextureFactory-Triceratops/, NexusTextureFactory-Spinosaurus/.
- Historical code must remain on main until clean local build, browser render checks, feature parity and output comparison have passed.
- Only LuminaryLabs-Dev/NexusTextureFactory is in scope. Other NexusFactory and NexusEngine repositories must not be changed.

## Observed functionality
Spinosaurus is the most developed current UI and includes the local toolkit-http service; versioning documentation describes its savedLibrary, persisted sets, quality filters and single-hop reject routing.
The Triceratops and Spinosaurus core source files expose 22 operation descriptors:
Base Shape, Gradient, Perlin Noise, Worley Noise, Threshold, Fractalize, Spiral, Vignette, Basic / Note, Smear, Domain Warp, Radial Warp, Kaleidoscope, Morph Dilate/Erode, Morph Open/Close, Edge Detect, Outline, Posterize Alpha, Distance Bands, Grunge Scratch, Library Stamp/Scatter, Library Displace.
These operation names alone do not prove complete functional parity across implementations.
Stegosaurus is an earlier stand-alone implementation. Its equivalent source requires additional behavioral comparison and retained baseline fixtures.

## Intended target
Studio/ - visual editor
Kits/ - operation definitions and implementations
Modules/ - composition, batch, sets, quality and export
Core/ - operation contracts, graph, validated artifacts and renderer adapters
CLI/ - local commands
MCP/ - AI tool transport
HTTP/ - local API, adapting existing toolkit-http
Presets/ - versioned data recipes
Tests/ - deterministic and integration checks
Docs/ - documentation

## Non-negotiable implementation sequence
1. Capture per-version operation IDs, every parameter descriptor, saved-state schemas, texture outputs and UI workflow.
2. Obtain actual baseline renders and deterministic fixtures from all three versions using the current code.
3. Introduce one operation registry and data recipe schema without modifying legacy runtime.
4. Extract existing implementation with tested output parity and compatibility adapters; preserve browser GPU behavior.
5. Wire the editor to the same Kits and Modules as CLI/MCP/HTTP.
6. Prove real local imports, live previews, headless generation, exports, saved libraries, set routing, failures and replay.
7. Produce Magic Initiation particle-texture reference outputs and inspect them.
8. Remove old app directories only after the complete acceptance gate and archive proof.

## Current blockers
The working container could not clone GitHub: git returned 'Could not resolve host: github.com'. The connected GitHub API can read and write repository data, but cannot substitute for a local runtime test of the exact checkout.
No V4 runtime or new CLI/MCP code has been validated. Do not assert V4 completion.

## Acceptance gate
No feature loss; all 22 observed operations plus any earlier unique behavior accounted for; validated recipe compatibility; no hidden browser-only dependencies for headless use; deterministic replay on a pinned renderer; PNG/atlas/flipbook export and preserved alpha; Studio, CLI, MCP and HTTP invoke one authoritative backend; saved-library and set routing preserved; actual browser images and repeatable test evidence.
