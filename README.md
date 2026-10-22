# NexusTextureFactory V4 (alpha)

A local-first data-driven texture pipeline. This is an additive initial foundation, NOT full V1-V3 parity. The previous applications remain on main while parity work continues; the pre-migration archive is `archive-11-2026`.

Run `npm test`, `npm run texture -- list`, `npm run texture -- render Presets/mana-mote.json texture.png`, `npm run http`, or `npm run mcp`. These entrypoints call one shared command handler and Kit registry. Current prototype kits: shape, gradient, noise, threshold, blend; these do not yet replace the 22 original GPU operations. Studio is the preserved Spinosaurus source snapshot in `Studio/` pending integration with the shared operation registry. No assertion of full Studio parity or Unity compatibility is made.
