# Escape Zero — Progress

Updated: 2026-10-22
Current phase: P4
Current task: ORG-01 (organization before P5)

| Task ID | Status | Evidence / files | Blocker |
|---|--------|---|---|
| EZ-P0-01 | DONE   | Node 22.21.1, npm 10.9.4, Git 2.49.0; developer confirmed IntelliJ setup | None |
| EZ-P0-02 | DONE   | Typecheck/build passed; Phaser 3.90.0 installed; browser confirmed | None |
| EZ-P0-03 | DONE   | Typecheck/build passed; developer confirmed gravity, collision, scaling and no Console errors | None |
| EZ-P0-04 | DONE   | Typecheck/build passed; developer confirmed mouse/keyboard scene flow, 5 cycles and no Console errors; G0 passed | None |
| EZ-P1-01 | DONE   | Movement tests confirmed by developer; fresh typecheck/build passed | None |
| EZ-P1-02 | DONE   | Typecheck/build passed; developer confirmed jumping, no midair jumps, platform/wall collisions and scene re-entry | None |
| EZ-P1-03 | DONE   | Typecheck/build passed; developer confirmed camera follow, world bounds and facing | None |
| EZ-P1-04 | DONE   | Typecheck/build passed; developer confirmed stable movement, jumping, collisions and hazard restart at 30/60 limits; G1 passed | None |
| EZ-P2-01 | DONE   | Typecheck/build passed; Tiled map and markers render correctly; developer confirmed collisions, camera, menu and no Console errors | None |
| EZ-P2-02 | DONE   | Typecheck/build passed; developer confirmed all 7 interaction checks | None |
| EZ-P2-03 | DONE   | Typecheck/build passed; developer confirmed all 7 key/door checks | None |
| EZ-P2-04 | DONE   | Typecheck/build passed; developer confirmed objectives, gated exit, completion and replay | None |
| EZ-P2-05 | DONE   | Typecheck/build passed; developer confirmed all 7 checkpoint/respawn checks; G2 passed | None |
| EZ-P3-01 | DONE | Typecheck/build passed; developer confirmed FSM transitions, reset, repeated detection and Level-01 regression checks | None |
| EZ-P3-02 | DONE | Typecheck/build passed; developer confirmed patrol, facing, vision cone, FSM and regression checks | None |
| EZ-P3-03 | DONE | Typecheck/build passed; occlusion and crouch/hiding checks confirmed; TMX/JSON and tileset paths synchronized | None |
| EZ-P3-04 | DONE | Typecheck/build and detection/capture regression checks confirmed by developer; G3 passed | None |
| EZ-P4-01 | DONE | Typecheck/build passed; developer confirmed all 7 Level-02 map preview checks | None |
| EZ-P4-02 | DONE | Typecheck/build passed; developer confirmed all 8 surveillance camera checks | None |
| EZ-P4-03 | DONE | Typecheck/build passed; developer confirmed switch/exit, checkpoint, capture/respawn and NEXT LEVEL | None |
| EZ-P4-04 | DONE | Three developer runs: zero captures; configuration-value assertions and build passed (24 modules); developer confirmed post-refactor smoke test with no errors; G4 passed | None |
| ORG-01 | IN_PROGRESS | Build passed (24 modules); scene keys/registration, TMX/JSON/tilesets and production asset paths passed; moved asset hashes verified; manual game/Tiled smoke test pending | None |

## Last completed
- Task: EZ-P4-04
- Verification: Configuration assertions and typecheck/build passed; developer confirmed Level-01 -> NEXT LEVEL -> Level-02 and post-refactor gameplay checks without errors on 2026-10-22. G4 passed.

## Next action
- Check hide-03 under camera after MAP-02-01: crouch hides; standing remains detectable.
- Developer smoke test game flow and reopen Tiled maps from public/assets/maps.
- Next roadmap task remains EZ-P5-01; G4 remains passed.

## Decisions / changes
- 2026-10-22: MAP-02-01 at developer request: move hide-03 to X=1168, Y=192 (64x48), centered beneath camera X=1200; update TMX/JSON together. Manual layout check pending.
- 2026-10-22: Keep playtested stealth difficulty; three developer runs completed with zero captures. See docs/playtests/level-02.md.
- 2026-10-22: ORG-01 accepted at developer request before P5. See docs/PROJECT_STRUCTURE.md and docs/CHANGES.md. Old maps/template assets preserved in archive/2026-10-22-cleanup.
- 2026-10-22: Centralize guard/camera tuning with separate level profiles; preserve all previous values and Tiled coordinates.
- 2026-10-20: Add NEXT LEVEL button and N shortcut from Level-01 to Level-02 at developer request.
- 2026-10-15: Project folder is D:\Anh_Content_T7\escape-zero.
- 2026-10-15: Git is installed; repository has not been initialized.
- 2026-10-15: Esc temporarily returns to menu during the scene-flow test.
- 2026-10-15: Bundle-size warning observed; production build succeeded.
- 2026-10-15: Default text looks rough when enlarged; revisit bitmap/pixel font during EZ-P6-03.
