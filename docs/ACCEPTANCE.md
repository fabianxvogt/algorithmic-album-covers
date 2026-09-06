# v1 acceptance

| Check | Evidence | Status |
| --- | --- | --- |
| Three distinct original deterministic systems | Unit fixture checks for Orbit Field, Topographic Drift, Modular Bloom | PASS |
| Same project reproduces composition | Seeded SVG snapshots have identical hash | PASS |
| Text overflow is visible | Layout validator and browser warning banner | PASS |
| Missing font is visible | Browser `document.fonts.check` warning and export note | PASS |
| Preview/export dimensions and color agree | Contract tests plus browser export inspection | PASS |
| Variation comparison, undo | Browser journey and state tests | PASS |
| Save/reopen | Browser journey passed on prior source; native-dialog focus recheck for published `feabf62` remains pending | PARTIAL |
| Versioned portable JSON | Parser and round-trip tests pass; actual browser file-picker import remains unobserved | PARTIAL |
| PNG/SVG output | Prior browser artifacts inspected at exact square/banner sizes; published-source recheck remains pending | PARTIAL |
| Desktop Chromium and narrow 390px layout | Prior desktop and 390px journey passed; published-source recheck remains pending | PARTIAL |
| Four-of-five legibility and three matching-variant tests | No real human testers available | UNOBSERVED |

Reference runtime: desktop Chromium, local static server, prior source QA on 2026-09-06. Published source `feabf62` still needs keyboard/file-picker/browser recheck. Human-review checks remain explicitly unobserved rather than inferred from automated checks.
