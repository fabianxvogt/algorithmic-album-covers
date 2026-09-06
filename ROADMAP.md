# Cover Foundry roadmap

## Now

- v1 released as a static, local-first editor with three deterministic composition systems.
- Square and banner variants, editable release text/layout, variation comparison, undo.
- Versioned project import/export, local save/reopen, SVG/PNG export and visible validation states.
- Desktop Chromium and narrow 390px responsive acceptance journey.

## Next

- Optional drag handles for direct canvas placement.
- Additional authored palettes and print-safe color profile guidance.
- Export presets for common distributor cover specifications.

## Later

- Local font file attachment with explicit embedding/substitution behavior.
- Multi-page release packs and batch variant export.

## Done

- Deterministic bounded generators: orbit, topo, modular.
- Preview/export dimension and color contract.
- Malformed-import safety and storage-quota download recovery.
- Correctness, serialization, and export contract tests.

## Release record

- Classification: INCREMENTAL (empirical correctness and runtime checks; no novelty claim).
- State: reviewed source published; browser and human gates remain open.
- Source: repository target `fabianxvogt/algorithmic-album-covers`; executable source `feabf62d997d11dedaaf06daa5f383abd9db5545` is independently accepted and published on `main`.
- Try it: GitHub source is public; no Cover Foundry Sites preview is bound in the existing Sites inventory. Local `index.html` remains the verified fallback.
- Compute: browser-only, bounded vector generation; no server or paid API.
- Persistence/export: version 1 JSON, localStorage, SVG and PNG downloads.
- Human legibility tests: unobserved; no real testers were available during this lane.
- Browser gates for `feabf62`: keyboard focus, file-picker import, and responsive/human recheck are pending; do not claim full-v1 acceptance.
