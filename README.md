<!-- portfolio
{
  "title": "Cover Foundry",
  "topic": "Creative tools/Generative art",
  "type": "product",
  "description": "Compose deterministic album artwork and export your own cover.",
  "demo": "https://cover-foundry.fabian523417.chatgpt.site"
}
-->

# Cover Foundry

Cover Foundry is a browser-first, deterministic album artwork editor for musicians and independent releases. Choose one of three original composition systems, tune the seed and palette, set release typography, compare variations, and export square cover or banner artwork as SVG or PNG.

## Try it

Open `index.html` in a modern desktop browser or serve this folder with any static file server. No account, upload, API key, or network request is required. The example project opens ready to edit and all work stays in the browser.

## v1 workflow

- Three original systems: Orbit Field, Topographic Drift, and Modular Bloom.
- Reproducible seed, palette, artist/release text, font and layout controls.
- Square (1400×1400) and banner (2400×960) variants with a live contract badge.
- Variation comparison, undo, local save/reopen, versioned JSON project import/export.
- SVG and PNG downloads, with clear overflow, missing-font, and invalid-file states.

The artwork is generated from bounded vector geometry and authored system fonts. SVG export embeds the selected font family name and explicitly warns when a custom family is unavailable; PNG export uses the browser's local font resolution.

## Verification

```sh
npm test
npm run check
```

The tests cover deterministic geometry, bounded output, layout overflow, JSON round trips, malformed import rejection, and export dimensions/color metadata.

## Privacy and limits

Projects use `localStorage` when available and can always be downloaded as a portable JSON file. Browser storage is not a backup service. PNG rendering depends on the browser's canvas implementation; SVG is the portable vector fallback. The app supports Chromium desktop and responsive narrow layouts; the narrow layout is intended for editing, while export is optimized for desktop browsers.

## Classification

`INCREMENTAL` — a finished, practical creative tool built from deterministic browser primitives. No claim of research novelty.

License: MIT.
