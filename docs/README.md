# Documentation map

- `ACCEPTANCE.md` — v1 acceptance matrix and evidence.
- `CLASSIFICATION.md` — honest release classification and limits.

Implementation is intentionally small and navigable: `src/model.mjs` owns exact state and bounds, `src/generator.mjs` owns deterministic geometry and SVG, `src/serialize.mjs` owns portable files, and `src/app.mjs` owns browser interaction.
