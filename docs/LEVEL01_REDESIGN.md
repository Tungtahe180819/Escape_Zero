# Level 01 Cell 07 gameplay redesign

Approved narrative target for floor 2: see LEVEL01_FLOOR02_STORY.md. The records keeper's protective lie and hidden original list are now playable for review: two discoverable documents plus Tuấn's testimony support a contradiction, followed by confession/original-page handoff and roster access. This supersedes the simple age-only identity selection. The electrician's backup-power deduction and cleaner's two-route choice remain future steps; the existing switch-order puzzle is still the interim implementation.

## Player experience

Latest NPC/puzzle expansion adds three supporting roles (prototype additions, not new named principals in the official script): a records keeper and electrician in the safe records room, plus a cleaner at the safe edge of the guard room. With Lan and Tuấn, the level now has five speaking roles. The new roles currently reuse tinted variants of the existing character sheet; bespoke portraits/animation are future art work.

The keeper first explains the records, then E opens a three-option identity puzzle. Tuấn's age and family debt identify his record; wrong selections allow retry and a missing Tuấn conversation cannot be bypassed. Correct selection grants access to the roster. The electrician supplies a different puzzle: operate the physical maintenance controls in the order described in dialogue. Correct steps light up; a wrong step resets only that circuit attempt. Completing the circuit powers the final lock. The cleaner supplies optional stealth information recorded in the journal. Clues, matched records and circuit progress remain through checkpoint respawn during the attempt.

Updated required route: Lan/hairpin → cell key → Tuấn's identity and order rule → records keeper/identity choice → roster → electrician → maintenance circuit → guard-room traversal → upper patrols → exit keypad. The optional evidence and cleaner conversation are not required for completion. Interactions can be explored in a different order; objective text guides missing prerequisites. NPC dialogue pauses the level; the records choice also pauses and supports mouse/1–3/Esc. The J journal retains all acquired information, while the final keypad shows only its three compact lock notes to avoid overflowing with unrelated NPC pages.

This is a three-floor escape investigation adapted from the approved cutscene script. Each floor serves a different purpose: learn and escape the cell, interpret information safely before crossing a guard room, then apply the answer after crossing two upper patrols. Walking to the exit alone cannot clear the level.

| Area | Story purpose | Play and reward |
| --- | --- | --- |
| Floor 1 cell | Lan helps Minh; Tuấn contributes what he overheard | Hairpin retrieves the outside key; Tuấn supplies the code-order rule |
| Cell wall | Show coercion inside the scam compound | Optional chat-script evidence, recorded in the journal |
| Floor 2 records room, right | Understand the camp's records | Read the shift roster; record the three values in the journal |
| Floor 2 guard room, left | Apply observation rather than sprinting through a long corridor | One patrol, connected cover, obstacle and upper stair |
| Floor 3 guard posts | Combine stealth and deduction | Two separate patrols; reach the exit keypad and arrange the clues |
| Locked exit | Give the investigation a concrete payoff | Correct code opens the physical gate; enter to reach Level 02 |

The number-order puzzle and records-room expansion are prototype adaptation additions; they are not passages quoted from the official Word script. Lan's hairpin/key sequence and the optional chat-script evidence follow that script. This floor is not the later canon surveillance-data level.

## Controls and progression

Latest balance pass supersedes the earlier dense cover layout: 12 recesses total, all 80x48. Bottom: X=560/816/1072 (3). Middle guard room: X=224/416/608 (3). Upper: X=224/416/608 and X=864/1056/1248 (6, three per patrol). The neutral upper rest recess is removed. Based on the 16 px body, middle/within-patrol transfers expose up to 128 px (~1.07 s sprinting), bottom and the gap between upper patrol groups up to 192 px (~1.6 s). These require waiting for patrol direction; timing bounds alone do not guarantee arbitrary movement is safe. Keep the shared body-based hiding, indicators, 110 chase speed and approved contact rules. Browser difficulty acceptance pending.

Cover optimization: hiding uses the full 16x24 physics body rather than the enlarged sprite frame, plus crouching and grounded checks. Only tiny floating-point tolerance is allowed; standing, jumping or leaving the recess exposes the player. Level 02 shares this rule. Active cover outlines are blue when inside but standing, green while hidden without alert, orange while hidden with an active guard/search (or camera meter in Level 02). Orange warns that concealment is not contact immunity from an alerted guard. The previously agreed patrol-hidden exemption remains.

Bottom floor now has five 80 px recesses at X=560/688/816/944/1072, limiting exposed body-to-body transfers to 64 px. Upper floor gains a neutral waiting recess at X=704 between the two patrols. Middle story rooms, clues, guards and checkpoint positions are unchanged. Static hide labels shorten to NÚP; HUD explains when to hold S. Browser stealth acceptance pending.

E interacts with Lan, Tuấn, documents, passages and the exit keypad. J opens the clue journal, pausing the level. Dialogue supports skip while retaining its clue. The keypad supports mouse buttons or digits 0–9, Backspace, Enter and Esc; wrong input keeps the panel open and gives feedback. It shows collected lock clues for reference, without automatically arranging the answer. Guards must return to patrol before the keypad can be used.

Both Tuấn's rule and the roster are mandatory. Guessing the correct code without discovering both is rejected. Evidence is optional and does not substitute for either clue. Before the gate is unlocked, the actual exit callback cannot complete the level and a physical door blocks the route.

Clues, optional evidence and gate state survive checkpoint respawn during the current attempt. Existing key/cell-door checkpoint behavior remains. Restart Level creates a fresh puzzle and story state. These entries are not yet global twenty-door collectibles and are not persisted through page reload; current save storage still records level progress only.

## Review cases

1. Start fresh; receive the hairpin, hook the key and open the cell. Talk to Tuấn, then inspect the optional wall evidence.
2. Verify J lists only discovered entries. Escape/skip closes the journal/dialogue and resumes play with no movement key stuck.
3. Read the roster in the safe room. Cross the guard room, take the upper stairs and avoid both upper patrols.
4. Attempt the exit without solving: the gate blocks completion. Try the panel without both clues, with an incomplete code and with an incorrect code.
5. Derive the three digits from both clues. Correct input opens the gate once. Exit starts LevelCompleteScene for level-01.
6. Capture or restart at a checkpoint retains discovered clues and a solved gate. Restart Level clears them.
7. Finish without collecting the optional evidence; it must remain possible. Level 02/03 traversal and shared guard behavior should still work.

Automated callback, model, map and keypad UI tests support these checks; browser readability and the difficulty of each traversal still need human acceptance.
