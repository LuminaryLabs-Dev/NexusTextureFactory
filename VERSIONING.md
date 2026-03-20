## Versioning

This repository tracks three product versions with different validation goals.

### V1 / Stegosaurus

Stegosaurus validates that the deterministic texture-generation system works.

- Purpose: prove the engine can generate usable deterministic outputs.
- Focus: technical feasibility, prototype behavior, and basic end-to-end rendering.
- Standard: same seed and same configuration should produce the same result.

### V2 / Triceratops

Triceratops validates that the product solves the business use case end to end.

- Purpose: prove the workflow is commercially useful, not just technically possible.
- Focus: modularization, broader operational coverage, packaging, and user-facing workflow validation.
- Standard: the system can support the real business process with the required controls and export path.

### V3 / Spinosaurus

Spinosaurus optimizes the product for the workflow it is best at without reducing configurability.

- Purpose: preserve the existing naming surface and feature breadth while making routed sets first-class.
- Focus: generation into a target set, per-set quality evaluation, visible fail routing, and export from sets.
- Standard: broad control still comes from randomization ranges and complexity, fine control still comes from exact step parameters, thresholds, layering, and deterministic configuration.

### V3 Design Principles

- `savedLibrary` remains the canonical asset store and blob ownership layer.
- Sets are first-class persisted records, not derived views.
- Each set owns:
  - `id`
  - `name`
  - `itemIds`
  - `qualityFilters`
  - `evaluationStage`
  - `failTargetSetId`
- Failures move between sets instead of being discarded.
- Routing is single-hop per evaluation cycle to keep behavior explicit and deterministic.
- Determinism is preserved: routing changes where an item is held, not how the item is rendered.

### Version Summary

- `V1 / Stegosaurus`: validate that it works.
- `V2 / Triceratops`: validate the business use case.
- `V3 / Spinosaurus`: optimize the best-fit workflow while keeping naming, structure, and configurability intact.
