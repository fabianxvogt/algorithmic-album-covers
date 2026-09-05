# v1 acceptance

| Check | Evidence | Status |
| --- | --- | --- |
| Three distinct original deterministic systems | Unit fixture checks for Orbit Field, Topographic Drift, Modular Bloom | PASS |
| Same project reproduces composition | Seeded SVG snapshots have identical hash | PASS |
| Text overflow is visible | Layout validator and browser warning banner | PASS |
| Missing font is visible | Browser `document.fonts.check` warning and export note | PASS |
| Preview/export dimensions and color agree | Contract tests plus browser export inspection | PASS |
| Variation comparison, undo | Browser journey and state tests | PASS |
| Save/reopen | Local project round trip logic; browser save succeeded, reload/reopen confirmation not completed | PARTIAL |
| Versioned portable JSON | Import/export round trip; malformed input leaves current state | PASS |
| PNG/SVG output | Export code and dimensions tested; downloaded artifact inspection pending shared browser slot | PARTIAL |
| Desktop Chromium and narrow 390px layout | Desktop Chromium interaction pass at 1280px; narrow 390px pass pending shared browser slot | PARTIAL |
| Four-of-five legibility and three matching-variant tests | No real human testers available | UNOBSERVED |

Reference runtime: desktop Chromium, local static server, 2026-09-05. Human-review checks remain explicitly unobserved rather than inferred from automated checks.
