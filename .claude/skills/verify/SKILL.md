---
name: verify
description: Build-free static portfolio site (index.html + ocean.js Three.js scene). How to run it locally and capture rendered frames headlessly.
---

# Verifying rhm.dev (this repo)

Static site, no build step. Serve and screenshot:

```bash
python3 -m http.server 8741 &   # serve repo root
```

Headless Chromium is available via flatpak (`org.chromium.Chromium`). Two gotchas:

- The flatpak sandbox cannot write to `/tmp/claude-*` — write screenshots to `$HOME` and move them afterwards.
- The page is a WebGL animation driven by requestAnimationFrame; a plain `--screenshot` fires too early. Use `--virtual-time-budget=<ms>` to let the scene run before capture.

```bash
flatpak run org.chromium.Chromium --headless --disable-gpu --no-sandbox \
  --enable-unsafe-swiftshader --window-size=1600,900 \
  --virtual-time-budget=8000 \
  --screenshot="$HOME/shot.png" http://localhost:8741/
```

Useful probes:
- `--force-prefers-reduced-motion` exercises the static single-frame path in ocean.js (constellations statically visible, beam parked).
- Re-shoot at `--window-size=400,860` (portrait) and `2560,1080` (ultrawide): the Tupi-Guarani constellation layout in ocean.js is aspect-corrected and these are the sizes where placement bugs show.
- WebGL "GPU stall due to ReadPixels" messages in the log are harmless swiftshader perf warnings, not errors.
- Under `--virtual-time-budget` the idle "attract" cycle highlights a different constellation roughly every 5.2 s of virtual time; glow decay between frames can look exaggerated compared to a real browser.

`node --check` refuses the `import` in ocean.js (treats it as CJS); copy to a `.mjs` name first.
