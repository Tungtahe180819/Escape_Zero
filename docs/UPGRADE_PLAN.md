# Prototype upgrade plan

Level 02 integration implemented for review: see LEVEL02_IMPLEMENTATION.md. NightShiftMission/NightShiftGameplay replace the old switch-only win condition, with two routes, four NPCs, maintenance-account prerequisite, three-part data ordering, guarded per-block copying, optional message/evidence, USB handoff and once-only story/bridge ending. Map expanded vertically with a safe work checkpoint. DataOrderScene added; Level 01 retained. Automated mission/controller/actual respawn and exit/UI/map tests PASS; browser acceptance pending. Story panels are text-based prototype presentation, not finished videos. No push or deploy.

Approved next Level 02 story: LEVEL02_STORY.md. The owner confirmed the Ca trực ban đêm proposal: reach Lan, collaborate with food-delivery/workstation NPCs, reconstruct three data parts, copy them under patrol pressure, then receive the USB and leave through the technical door. Plan implementation in separate reviewable stages, beginning with Level02Scene map layout. Keep all existing Level 01 work; no Level 02 gameplay changes were made while saving this approval.

Scope clarification: the owner explicitly requested retaining the completed floor-2 work inside Level 01. The interrupted attempt to move it was reversed; the richer archivist arc remains in Level01Scene and its checks/build pass. Level 02 now needs a separate story proposal; do not move or duplicate the Level 01 archivist investigation into it.

Current approved narrative work: integrate LEVEL01_FLOOR02_STORY.md in reviewable steps. The first records-keeper arc is implemented for browser review: denial, altered-ledger clue, transfer-order clue, contradiction choice, confession and original-page award. Reverse-order discovery is supported; premature/wrong accusations do not erase clues. Roster access requires the original page, not merely selecting a matching age. Journal distinguishes unverified testimony, observations, documents and verified original. Checkpoint respawn retains this attempt's story flags; Restart Level resets them. Backup-power deduction and optional warehouse bypass remain pending; the existing three-button electricity puzzle is not the new design's final implementation.

Agreed direction: improve readable props, replace the red pursuit placeholder with a group of guards, then redesign the three-level story flow around Minh and Lan. Preserve the escape/stealth MVP; do not add combat or expand to five chapters.

The existing GitHub/Vercel version is the baseline. Local upgrades are NOT published automatically by this work; do not push until the owner approves the tested result.

## UP-01 — Level 01 cell key and door

Status: DONE — implementation, automated checks and all browser acceptance cases confirmed by the owner.

- Replace yellow key rectangle with a brass key sprite, keeping the existing object position and E interaction radius. Add a gentle 800 ms alpha pulse (1 to 0.7), paused when collected and restarted on respawn.
- Replace brown door rectangle with a steel cell door image. Closed and open images have identical 32x96 source dimensions and map-derived display dimensions (currently 16x48).
- Create the static body only after the image has been sized. Preserve the original door bounds used for collisions and line-of-sight blocking while locked.
- Unlock swaps to the open image, disables the existing player collider and static body, and leaves a visible empty frame rather than removing the door artwork.
- Respawn restores the closed texture, key visibility/pulse, body and collider according to the existing mission reset behavior.
- Source assets: built-in AI generation without external reference images; processed with Python/Pillow. See `public/assets/props/props-manifest.json` for dimensions and prompt summaries.
- No map, movement speed, mission rules, save schema or audio settings changed.

Verification: TypeScript and production build PASS (37 modules). Isolated tests execute the actual Level01 interaction and respawn callbacks: locked-door gating, once-only key/unlock SFX, pulse pause/restart, open texture persistence, body/collider disable and restoration all PASS. Existing 19 system tests and 6 map/asset audit groups still PASS. PNG checks confirm a 32x16 key, two matching 32x96 door images, binary transparency and a transparent open-door center. These checks do not replace browser collision/visual testing. No commit, push or Vercel deployment performed.

Browser acceptance:

- [x] Key looks like a key and remains easy to see against the prison background.
- [x] Closed steel door fills the existing opening; it blocks passage without a key and E reports locked.
- [x] Key collection occurs once and hides the sprite; audio and HUD update as before.
- [x] Unlock displays an open doorway; player can pass through with no invisible collision.
- [x] Capture/restart checkpoint restores the key and closed door; no stale pulse, duplicate SFX or broken collision.
- [x] Pause/Settings/Resume pauses and resumes the pulse without resetting mission state.
- [x] Level 01 completion and Level 02/03 remain unchanged.

## UP-02 — Pursuit guard group

Status: DONE — automated checks passed; user confirmed all browser cases passed.

- Replace the red full-height Rectangle with a Container holding four existing guard sprites at 0.5 scale; 22 px formation spacing and staggered run-animation start frames.
- Speed 140 and initial gap 160 are unchanged. The leading sprite's right frame edge is aligned with the existing capture X boundary. This remains scripted pursuit: falling behind the leader means capture, not independent per-guard physics contact or AI.
- Read ground height (currently Y=288) and exact gaps from the Ground layer. A pure route helper provides a 30 px parabolic visual hop starting 12 px before each bank and ending 12 px after it. Each guard samples its own position, freezes its running pose while airborne, then resumes running after landing. No map/hole/platform edits.
- Reset and finish stop animations and hide the formation; restart reuses the same sprites, avoiding duplicate groups. Container ownership lets Phaser destroy the children when the level shuts down; no new world listeners or timers are added.
- Files: `src/entities/ScriptedPursuit.ts`, `src/systems/pursuit/PursuitRoute.ts`, `src/config/level03Config.ts`, `src/scenes/levels/Level03Scene.ts`.
- Verification: TypeScript and production build PASS (38 modules). Isolated tests using the actual route/class and mocked Phaser rendering verify all map gaps, four sprites, unchanged speed/gap/capture X rule, invalid-delta handling, staggered pit hops, state transitions, reset and restart. Existing 19 system tests and 6 map/asset audit groups still PASS. These are not browser rendering tests.
- No new image generation, no new bitmap assets, no independent guard pathfinding, no GitHub push or Vercel deploy.

Browser acceptance:

- [ ] Chase starts once with four guard sprites; no full-height red pursuit block.
- [ ] Guards face right, animate while running and visibly jump over the final pit instead of running on air.
- [ ] Falling behind the lead guard triggers capture at the visible front; difficulty feels consistent with baseline.
- [ ] Fall/capture/restart checkpoint clears the group; triggering chase again creates no duplicate formation.
- [ ] Pause/Settings/Resume freezes and resumes the entire formation, including a mid-jump pause.
- [ ] Chase end hides the group; finish and scene changes do not freeze or produce Console errors.
- [ ] Level 01 key/door upgrade and Level 02 behavior remain unchanged.

## UP-03 — Story and level pacing

Latest user balance request: reduced cover from 20 to 12 recesses, allocated 3 bottom / 3 middle / 6 upper. Each patrol has approach, intermediate and exit cover; dense redundant pockets removed. Width remains 80, body-based hiding/indicators unchanged. Geometry checks confirm up to 128 px exposed within short patrols and 192 px bottom/between upper groups at running speed 120. NPCs, puzzle, guard routes/speeds and checkpoints unchanged. TMX/JSON and build validation PASS; browser difficulty review pending. Supersedes earlier 20-cover/dense transfer notes. No push or deployment.

Latest cover optimization: shared HidingSystem for Level 01/02 checks actual body containment, crouch and grounding; enlarged decorative frames no longer make cover unexpectedly fail. CoverIndicators provide blue/green/orange feedback for inside/hidden/alerted, with matching Vietnamese HUD labels. Bottom Level 01 recesses form five 80 px pockets with <=64 px exposed transfers, and a neutral upper-floor recess was added between patrols. Patrol-hidden immunity and alerted contact/grab remain unchanged. Model/geometry/guard tests PASS; browser traversal and visual acceptance pending. No publishing.

### Current expansion — three supporting NPCs and two additional puzzles

Added records keeper/electrician in the safe middle room and cleaner near its guarded-side doorway. Identity selection now gates roster access, using Tuấn's canonical age/family-debt clue. A separate ordered maintenance circuit requires the electrician's explanation and powers the exit lock; wrong order resets circuit progress for retry, not the whole level. The cleaner provides optional stealth advice. New dialogue and acquired states join J journal; final keypad notes remain compact. Record-choice UI supports 1–3/mouse/Esc and pauses the level. Existing guard speed/count/hiding rules, map partition, stairs and checkpoints are unchanged. New NPCs use existing sprite variants for prototype presentation. Automated model, actual interaction callback, choice UI and keypad tests PASS; browser acceptance pending. No push/deployment.

Checkpoint cleanup: removed the remaining isolated 32 px-high test pillars at X=544 on the bottom floor and X=640 on the middle floor from both TMX/JSON. Structural cell, room-divider and perimeter walls remain. Checkpoint visuals are now small floor beacons (gray before activation, green for the active checkpoint), replacing the full-height green debug rectangles. Invisible overlap dimensions, checkpoint order, spawn positions and puzzle retention remain unchanged. Removing the pillars also removes their line-of-sight cover; hiding recesses remain the designated stealth route. Build/map tests run; browser acceptance pending.

### Current playable redesign — Cell 07 investigation and exit puzzle

Level 01 now requires Tuấn's lock-order clue plus the records-room shift roster to open the upper exit. A CodeLockScene provides keyboard/click input, errors and cancellation; the gate has a real static body and the actual exit callback independently checks puzzle completion. A J journal replays discovered clues; optional chat-script evidence is tracked separately and is not required to win. Dialogue completion/skip awards clues. Keypad use is blocked while any guard remains alerted. Puzzle/clue state survives checkpoint resets in the current attempt and resets on Restart Level; page-reload persistence and full-game evidence endings are not implemented. See LEVEL01_REDESIGN.md for the spatial roles, route and review cases. Automated model/callback/UI tests PASS; browser acceptance pending. No push or deployment.

Official narrative adopted: see STORY_CANON.md. Current Cell 07 opening uses Lan's bent hairpin to retrieve a key hanging outside the bars; the former under-bed search is superseded. Prototype scenes map to Doors 05/06/09; Doors 07–08 need an explicit narrative bridge. This step does not implement all cutscenes, evidence or endings.

### Current approved layout — middle story/stealth rooms, two upper guards

User clarified that "room 3" means floor 3. Middle floor now has a safe records/story room on the right (arrival stairs and checkpoint) and a single-guard room on the left (stairs to upper floor). A solid full-height divider at X=800 separates them. Approach the marked door and press E to pass in either direction; guards cannot cross the divider or see through it. Door transitions are paired point transfers like the existing stairs. The story room has a records desk; its conversations/puzzle are not implemented in this layout step.

Guard02 remains on the middle left patrol X=320–560. Guard03 moves to upper X=320–560; Guard04 remains upper X=960–1200. With the bottom guard, total remains four (1/1/2 per floor). Middle hiding recesses simplify to five, all in the guard room. Upper floor has nine recesses across the two patrols. The X=896 middle obstacle is removed; the X=640 obstacle remains. Other floors, stairs, checkpoint semantics, speed 110 and approved hiding/contact rules remain intact. Earlier two-middle/one-upper and nine-middle-cover descriptions are superseded.

Verification: actual door callback tests check gating, both directions and landing clearance; map checks verify a solid divider, 1/1/2 guard allocation, safe stairs/checkpoints, clear patrols and middle cover transfers. Browser acceptance pending: safe arrival room, E door traversal, single middle patrol, two upper patrols, reset and Level 02 transition. No push or deployment.

### UP-03.2b — Four-guard coverage

Middle-floor cover rebalance after user feedback: expanded/repositioned the four original recesses and added five, for nine total. Right-to-left route now has cover at X=1120/1008/912 before the right obstacle, X=736/672 between obstacles, then X=544/416/288/192 across the left patrol. Widths are 80 px (entry 96); each fits the enlarged sprite. Cover inside the two patrol routes limits exposed transfers to less than 80 px (under 0.67 s at running speed). Guard speed, sight, contact and hiding rules are unchanged. Geometry checks confirm no recess intersects a wall; browser balance still pending. Do not interpret these timing bounds as proof that arbitrary movement through the route is safe.

Final landing-safety adjustment: bottom patrol turns at X=1120 (not the earlier 1200), leaving 160 px to the lower stair. All stair/checkpoint centers pass the >140 px patrol-vision separation check.

User accepted the three-floor traversal. Level 01 now owns four Guards: bottom route X=650–1200/Y=768; middle routes X=320–560 and X=960–1088/Y=496; upper route X=960–1200/Y=224. All use the approved 110 chase speed, immediate sight response, patrol/hidden exemption, alerted grab and last-seen search. Every guard updates, checks tile/closed-door line of sight and resets on capture/checkpoint restart. A single capture response runs even when multiple guards overlap. HUD reflects the highest alert state across the group.

Six locker recesses and two short route hints were added on middle/top floors. The middle checkpoint moves 48 px right to X=1248 (spawn center 1264), outside patrol sight range; stair landings are also outside normal patrol vision. Map floors and stair links are unchanged. Extra dialogue, journal and code puzzle remain subsequent work. Automated checks validate patrol endpoints, obstacle-free ground, landing/checkpoint separation, shared guard behavior and respawn callbacks; browser stealth balance pending. No push/deploy.

### UP-03.2a — Three-floor Cell 07 blockout

User approved replacing the simple corridor with a three-floor prison, followed by more guards and clue-based conversations. First step implemented: Level 01 is now 1440x816 (90x51 tiles), with floors at Y=784 (cells), 512 (guard station), and 240 (control room). The old cell, Lan, bed, key, guard and first checkpoint move down 544 px. Exit stays at X=1360 on the upper floor. Two 32 px-high obstacles are added on the middle floor.

Four point objects define two reciprocal stair links: X=1280 connects bottom/middle, X=160 connects middle/top. Approach and press E to transition; these are stylized interactive stairs, not continuous walking/climbing animations. Each landing retains the original player body and has clearance for the enlarged artwork. Opening the cell door enables stair interaction. A new cp-01-middle saves progress on the middle floor; revisiting the old checkpoint cannot downgrade it. Checkpoint respawn retains key/open door, while Restart Level returns to the initial cell/story.

This blockout still has the existing single guard and no code puzzle. The additional guards, conversations, journal, code lock and unlockable shortcut belong to subsequent steps after traversal acceptance. Level 02/03 were not redesigned. Automated checks cover linked stair callbacks, both travel directions, door gating, clear landings and matching TMX/JSON; browser acceptance pending. No GitHub push or deployment.

Browser acceptance: traverse bottom → middle → top → middle → bottom; confirm no trapping/floating/camera clipping; activate middle checkpoint then revisit bottom checkpoint and restart checkpoint; confirm return remains on middle floor with door open; verify Restart Level resets to Lan/cell and upper exit still reaches Level 02.

Status: IN_PROGRESS. User approved the Level 01 route. First implementation: Lan dialogue → search bed → collect key → unlock cell → checkpoint beyond door. Corridor pacing redesign remains pending.

### UP-03.1b — Corridor observation and hiding

All existing character sprites now share CHARACTER_SCALE=0.9 in characterConfig.ts: Minh, Level 01/02 patrol guards and all four scripted-pursuit guards. Standing guard silhouette is 34.2 px (71.25% of a 48 px door); Minh is 35.1–36 px. Patrol guard world body remains 16x24 and the previous feet anchor is retained; label moves above the larger frame. Pursuit retains its right-edge capture boundary, feet anchor, formation spacing and speed. Guard manifest updated; browser visual acceptance pending across all levels.

Latest Minh size: idle frames have 39–40 px of nontransparent artwork in a 48 px frame. Scale 0.9 displays the standing figure at 35.1–36 px, at least 73% of the 48 px cell door. Supersedes previous 0.6 scale. Physics body remains 16x24 and frame-bottom anchor stays unchanged; character manifest updated to match. Crouching intentionally appears shorter. Browser visual/hiding acceptance pending.

Player presentation: Minh frame scale increases from 0.5 to 0.6 (20% larger); adjusted origin/source body dimensions preserve the old feet anchor and world-space 16x24 physics body. No bitmap regeneration. Guard grab bounds now reach 24 px above the body with no horizontal expansion, preventing the current roughly 40 px jump from vaulting a guard. PATROL ignores fully hidden players as requested; alerted contact/grab still captures. Browser review pending for feet alignment, hiding, platform travel and grab readability.

Player jump tuning: reduced initial vertical speed from 250 to 220 at gravity 600. Theoretical apex falls from 52.1 to 40.3 px; current Level 01/02 obstacles are 32 px. Same-height running jump range falls from 100 to 88 px at speed 120; Level 03 pit/platform traversal requires renewed browser acceptance. No map or moving-platform edits in this tuning step.

Latest concealment rule: a fully concealed, grounded, crouching player is safe from contact with a PATROL guard. Once alerted, CHASE/SEARCH guards still capture on contact, even inside a hiding recess. Exposed contact always captures. Both Level 01/02 pass their computed hidden flag into the shared Guard contact check. Supersedes earlier unconditional contact-capture notes; speed remains 110. Browser acceptance pending.

Latest tuning: chase speed 110 for Level 01/02, below player running speed 120 but above crouching speed 60. This gives a modest 10 px/s escape margin before attempting concealment. Immediate chase, last-seen search and contact capture remain enabled. Supersedes earlier 160/140 tuning. Browser balance review pending.

User requested stronger guards after playtesting: Level 01/02 guards now enter CHASE immediately on valid sight, run at 160 versus player speed 120, and capture only on physics-body contact (including contact while hiding). Vision alone no longer causes a timed capture. Lost sight pursues the last seen X for at most 3 seconds or until arrival, then searches for 3 seconds before patrol; invisible live player positions are not followed. HUD displays alert state; its bar represents alert state, not a death countdown. Camera alarm and Level 03 scripted pursuit retain their own rules. Isolated actual-class tests cover immediate chase, no sight-only death, last-seen behavior, walls/concealment, contact/jump separation, disabled bodies and reset. Browser acceptance pending.

Implemented; browser playtest pending. Guard now starts at X=960 and patrols X=650–1200. Three marked locker recesses at X=576/848/1120 provide crouching concealment. Four one-shot spatial hints introduce observation, hiding, crossing and the monitored-area destination. The prototype red floor hazard is removed; the opening cell, checkpoint, ground, obstacle and exit stay in place. Detection/capture rules and guard speeds are unchanged, so a well-timed direct run remains possible; this step supplies readable cover and story pacing, not a mandatory hiding gate. TMX/JSON are updated together. Verify both a direct run and a cover-based route before further difficulty tuning.

### UP-03.1a — Cell opening

- Lan speaks through the adjoining cell grille; E opens a short dialogue. E/Space/Enter advances; Esc or the skip button finishes and grants the clue. The level pauses during dialogue.
- The key starts hidden. Searching the bed requires Lan's clue, reveals the key, then a separate interaction collects it.
- Checkpoint cp-01 moves to X=448 beyond the cell door and activates only after unlocking. Checkpoint respawn preserves the open door/key; full level restart resets the story. A respawn before checkpoint retains the clue/discovery but restores the key and locked door.
- TMX and JSON both contain the Lan and bed objects. No ground tiles, guard route, speed, save schema, Level 02 or Level 03 mechanics changed.
- Browser acceptance passed: user confirmed the cell-opening cases. Changes remain local; no push or deployment.

- Level 01: Cell 07, a short hint from Lan about the guard change, key/clue discovery and door escape.
- Level 02: monitored corridor, safe pauses and short hints, exit control panel, readable observation/movement/hiding sequences.
- Level 03: quiet outdoor preparation, alarm, guard pursuit and safe-zone ending.
- Re-run affected QA cases after map or objective changes; baseline P7-01 evidence does not automatically validate the redesign.
