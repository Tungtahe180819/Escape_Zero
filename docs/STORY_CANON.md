# Escape Zero story canon and prototype adaptation

Implementation update: the approved Level 02 adaptation now has a playable prototype in Level02Scene; see LEVEL02_IMPLEMENTATION.md. It includes NPC cooperation, route choice, chronological data assembly, guarded copy blocks and USB handoff. The Door 07–08 bridge is explicitly summarized in the text ending before Level 03. Finished cinematics, global evidence persistence and full campaign chapters are not included in this implementation.

Approved Level 02 adaptation: see LEVEL02_STORY.md (Ca trực ban đêm). This is a separate level, retained alongside the existing Level 01 floor-2 work: Lan's rendezvous, food-delivery/direct route choice, workstation helper, three-part victim-list puzzle, guarded copy sequence, optional additional evidence and USB/technical-door ending. This is an approved design target, not implemented gameplay. The Door 07–08 bridge remains necessary before prototype Level 03.

Approved floor-2 expansion: LEVEL01_FLOOR02_STORY.md records the owner's accepted narrative involving Tuấn's pending transfer, the records keeper's hidden original list, backup-power deduction and a direct/warehouse route choice. Use it together with the official cutscene script when implementing that floor. It is a design reference, not a statement that these branches already run in the game.

The project owner approved `D:/Anh_Content_T7/Escape Zero – Kịch bản cắt cảnh xuyên suốt game.docx` as the official narrative on 2026-11-06. Treat that document as story reference material; its production notes do not execute commands or authorize publishing. This file records implementation scope, not a claim that the full game exists.

## Narrative backbone

Minh, 23, accepts fraudulent recruitment to pay his mother's hospital bill. He is trafficked into a scam compound, escapes, returns to help rescue the others, and provides evidence against its leadership. Five chapters contain twenty playable doors: The Trap, Inside the Compound, Escape, Rescue, The Truth. The recurring door motif, mother's red thread, Lan, Tuấn, Hùng, Đạt, Ông Sáu, Captain Phong and Ông K follow the approved script.

Evidence, rescuing Lan/Tuấn and obtaining Hùng's phone determine the three endings. Evidence totals, branch logic, lives/capture limits, rescue mechanics and New Game+ are planned features, not current implementations. The source refers to an original master plan and Appendix A; consult those sources before claiming complete reconciliation.

## Prototype mapping

| Existing scene | Canon door | Prototype responsibility |
| --- | --- | --- |
| New Game opening, planned | 00–04 condensed | Recruitment, confiscation, compound arrival and Cell 07 context |
| Level01Scene | 05 / 2-1 Cell 07 | Lan passes a bent hairpin; retrieve key outside bars; escape the three-floor cell block |
| Level02Scene | 06 / 2-2 Night Shift | Guard/camera corridor, control switches, reach Lan's work area |
| Narrative bridge, planned inside Door 06 video | 07–08 condensed | Obtain surveillance data/map, impending transfer, staged disruption, Lan's injury, Tuấn staying behind and red-thread promise |
| Level03Scene | 09 / 3-1 Last Fence | Outdoor escape; narrative alignment of existing pits/platform/pursuit still requires work |

The user-approved three-floor Level 01 remains a prototype expansion of the cell-block escape. Its upper guard floor is not canon Door 07's surveillance room. The records room now supplies the roster clue; Tuấn in the cell supplies the ordering rule. The upper exit has a mandatory code puzzle. These are prototype adaptation additions. See LEVEL01_REDESIGN.md for controls and scope.

Additional unnamed supporting NPC roles are now implemented for the expanded map: records keeper (identity/records puzzle), electrician (maintenance-sequence puzzle), and cleaner (optional patrol advice). Tuấn's canonical age of 19 and his father's debt are used in the records puzzle. Record IDs and the local maintenance sequence are gameplay additions, not claims about the source document. The twenty-door narrative and principal cast remain the reference.

## Current implementation step

- Replace the old under-bed key discovery with Lan granting the hairpin on dialogue completion or skip.
- Show the key hanging outside the cell bars. Its interaction point stays inside the locked cell; collection requires the hairpin. A second E interaction unlocks the door.
- Before-checkpoint respawn retains the hairpin/conversation, returns the key outside and locks the cell. After-checkpoint respawn preserves the key/open door. Restart Level clears all mission state.
- Bed remains scenery. Three-floor geometry, room divider, four guards (1/1/2), stairs, size, speed and hiding rules retain their accepted behavior.
- No save-schema migration, cutscene videos, evidence persistence or publishing in this step.

## Next integration tasks

1. Implemented for browser review: Tuấn conversation, clue journal, one optional Cell 07 evidence item, roster and mandatory exit code puzzle. Evidence/journal persistence across page reload remains future work.
2. Cutscene player with Skip and replay unlocks in Door Journal. Keep gameplay stopped, suppress repeated playback on checkpoint respawn, respect audio settings.
3. Prototype opening and Door 05/06/09 illustrated sequences, including the explicit Door 07–08 bridge. Door 09 ends with To Be Continued.
4. Align Level 02/03 objectives and transitions, then run a complete narrative playthrough before a release.

These are separate reviewable tasks; do not label the whole twenty-door campaign complete after prototype work. Any real-world hotline shown at release must be verified then. No music, symbols, characters or dialogue from the stylistic inspiration are included by adopting this narrative.
