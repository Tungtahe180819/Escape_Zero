# Level 02 Ca trực ban đêm implementation

Status: implemented for browser acceptance. Level 01 code, map and puzzles were retained; only Level 02's map/mission and a new registered data-order overlay are part of this integration.

## Spaces and routes

Level 02 is 1920x544 with the original upper corridor floor at Y=240 and a lower service/work floor at Y=512. Two upper guards patrol X=560–800 and X=1440–1776 at the existing Level 02 tuning. The camera remains at X=1200/Y=128. Eight 80x48 recesses provide staged cover; no old isolated test pillars remain to block guards.

The direct route crosses the upper corridor to the work-area access at X=1280. The alternate route requires the food-distributor's card, entering at upper X=256 and arriving at lower X=96; it is longer and avoids early surveillance, but cannot bypass the guarded data-copy objectives. Both passages are reciprocal E interactions. The lower area houses the worker, maintenance note, Lan and Tuấn, and has a safe checkpoint that cannot be downgraded by revisiting the entry checkpoint.

## Playable progression

1. Speak to the food distributor (optional) to borrow the service card and carry a message to the worker. Both route choices can reach Lan.
2. Speak to Lan at lower X=1600. She explains the three data pieces and their chronological order. Tuấn is also present, reinforcing the stakes.
3. The worker initially refuses to use his personal account. Find the maintenance note at lower X=1504, then ask again to activate the fictional maintenance account. Finding the note before the first conversation remains valid.
4. Discover fragments A at upper X=864, B at upper X=1696 and C at lower X=1472. Discovering them before meeting Lan does not discard progress.
5. Return to Lan and arrange the three letters by their timestamps in DataOrderScene (A/B/C keys or buttons, Backspace, Enter, Esc). The journal holds only discovered notes. Wrong order can be retried.
6. Copy the pieces at upper machines C=1328, B=1512, A=1712. E starts a block; remain within 22 px, grounded and standing for 2.4 seconds of active play. The world keeps running. Leaving, crouching, a conversation/journal or capture interrupts the incomplete block. Completed blocks are retained.
7. Optional: delivering the message lets the worker point out extra data at X=1792. Copying it increases local evidence state but is not a prerequisite for the main USB or completion. The machine is outside the exit trigger so it can still be used after receiving the USB.
8. Once all three mandatory blocks are copied, return to Lan to receive the USB. Walking to the exit before this is rejected. Entering the technical exit with the USB launches the ending once, then the level completion screen.

J opens a paused dialogue-style journal. NPC conversations/data arrangement pause the level; actual data-copy work does not. Pause/Settings freeze the world as before. Guard contact/hiding rules and the camera's alarm behavior are retained.

## Ending and presentation scope

The ending uses dialogue/story panels: technical door, Hùng's suspicion, then an explicitly labeled prototype summary of Doors 07–08 before the Door 09/Level 03 transition. It includes the missing-data discovery, transfer order, disruption, Lan's injury, Tuấn staying with her and the red-thread promise. These scenes are summaries, not playable surveillance/boss stages or rendered cutscene videos. NPCs currently reuse tinted character-sheet poses; unique artwork is not claimed.

The mission/evidence state is local to the current Level 02 attempt. Checkpoint respawn cancels only the active copy and resets actors/camera; conversations, fragments, arranged order, completed blocks and USB remain. Restart Level creates a fresh mission; page reload restores only existing level progress, not this mission's journal or per-block state. Global evidence/ending branches and replayable Door Journal remain separate tasks.

## Verification

Automated checks execute the real mission/controller callbacks, actual scene respawn/exit branches and data-order UI against mocked rendering. They cover gated/optional routes, reverse discovery, missing requirements, wrong ordering, real-time block completion, capped delta, interrupted copying, retained blocks, once-only USB/ending, Esc/listener cleanup and clear map landings. TMX/JSON and built asset parity are audited. These checks do not establish browser readability or stealth difficulty.

Browser acceptance: play once via the direct route without the card/bonus and once via the service route/message; retry wrong data ordering; begin copying then run/crouch/get captured; verify completed blocks survive and partial progress restarts; test journal/Pause/Settings; receive USB, finish and advance to Level 03; Restart Level must clear all local mission flags. No GitHub push or Vercel deployment performed.
