# Level-02 stealth playtest

Recorded: 2026-10-22
Task: EZ-P4-04
Source: developer reports in chat; three runs by the same developer.

| Run | Completed | Captures | Approach |
|---|---|---|---|
| 1 | Yes | 0 | Run/jump while limiting time visible to the guard and camera. |
| 2 | Yes | 0 | Wait for the guard/camera to turn away, then run/jump past. |
| 3 | Yes | 0 | Use hiding zones; reported as easier. |

## Decision

Layout note (2026-10-22, MAP-02-01): after these runs, hide-03 moved from X=1376
to X=1168, centered under cameraSpawn X=1200. The runs below are historical
evidence for the previous layout; the new hiding location needs a targeted check.

Keep the current difficulty values. Timing observation provides one viable route,
while hiding offers a safer alternative. This is developer testing, not an external
playtest or evidence about general player difficulty.

## Configuration

Tune values in `src/config/stealthConfig.ts`. Level-01 and Level-02 have separate
guard profiles; spawn and patrol coordinates continue to come from Tiled.
Guard detection rates are fractions of a full meter per second (0.4 gain,
0.6 decay). Camera rates are 1 gain and 0.3 decay. At uninterrupted visibility,
nominal time from empty to full is 2.5 seconds for the guard and 1 second for
the camera. Frame-stall protection may extend this time.

## Verification after configuration extraction

- Passed: `npm run build` (`tsc && vite build`), 24 modules, 2026-10-22.
- Passed: in-memory assertions comparing every extracted value with the previous
  guard/camera values, plus separate frozen level profiles.
- Existing non-blocking bundle-size warning remains.

- Passed: developer confirmed the requested post-refactor smoke test with no errors
  on 2026-10-22: Level-01 -> NEXT LEVEL -> Level-02, stealth/capture,
  switch and exit.
- EZ-P4-04 DONE; G4 passed.
