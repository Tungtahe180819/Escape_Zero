import type { Interactable } from '../interaction/Interactable'
import type { DialogueLine } from './DialogueTypes'
import type { CellEscapePuzzle } from './CellEscapePuzzle'
import { TUAN_LOCK_CLUE, ROSTER_CLUE, CHAT_EVIDENCE, ARCHIVIST_STORY, TECHNICIAN_STORY, CLEANER_STORY,
    TORN_LEDGER_CLUE, TRANSFER_ORDER_CLUE, ARCHIVIST_CONFESSION, ARCHIVIST_RECALL } from '../../config/cellPuzzleStory'

export function createCellPuzzleInteractions(
    puzzle: CellEscapePuzzle,
    getPoint: (name: string) => { x: number; y: number },
    available: () => boolean,
    speak: (lines: readonly DialogueLine[], onComplete: () => void) => void,
    changed: () => void,
    openLock: () => void,
    openRecords: () => void,
    notify: (message: string) => void,
): Interactable[] {
    return [
        { id: 'tuan', ...getPoint('tuan'), radius: 28, prompt: 'Hỏi Tuấn về lối ra',
            isAvailable: () => true,
            interact: () => speak(TUAN_LOCK_CLUE, () => { puzzle.hearTuan(); changed() }),
        },
        { id: 'roster', ...getPoint('roster'), radius: 28, prompt: 'Đọc sổ đổi ca',
            isAvailable: () => available() && !puzzle.hasRosterClue,
            interact: () => {
                if (!available()) return
                if (!puzzle.hasRecordMatch) { notify('Người ghi sổ chưa cho xem sổ. Cần xác minh lời bà và nhận trang danh sách gốc.'); return }
                speak(ROSTER_CLUE, () => { puzzle.readRoster(); changed() })
            },
        },
        { id: 'archivist', ...getPoint('archivist'), radius: 28,
            get prompt(): string {
                if (puzzle.hasRecordMatch) return 'Hỏi lại người ghi sổ'
                if (puzzle.hasProvenContradiction) return 'Nghe lời thú nhận · Nhận trang gốc'
                return puzzle.hasArchivistIntro ? 'Đối chất bằng tài liệu' : 'Nói chuyện với người ghi sổ'
            },
            isAvailable: available,
            interact: () => {
                if (!available()) return
                if (puzzle.hasRecordMatch) speak(ARCHIVIST_RECALL, () => {})
                else if (puzzle.hasProvenContradiction) speak(ARCHIVIST_CONFESSION, () => { puzzle.receiveOriginalPage(); changed() })
                else if (puzzle.hasArchivistIntro) openRecords()
                else speak(ARCHIVIST_STORY, () => { puzzle.hearArchivist(); changed() })
            },
        },
        { id: 'torn-ledger', ...getPoint('tornLedger'), radius: 24, prompt: 'Kiểm tra sổ bị sửa',
            isAvailable: available,
            interact: () => { if (available()) speak(TORN_LEDGER_CLUE, () => { puzzle.inspectTornLedger(); changed() }) },
        },
        { id: 'transfer-order', ...getPoint('transferOrder'), radius: 24, prompt: 'Đọc lệnh chuyển người',
            isAvailable: available,
            interact: () => { if (available()) speak(TRANSFER_ORDER_CLUE, () => { puzzle.inspectTransferOrder(); changed() }) },
        },
        { id: 'technician', ...getPoint('technician'), radius: 28, prompt: 'Hỏi người thợ điện',
            isAvailable: available,
            interact: () => { if (available()) speak(TECHNICIAN_STORY, () => { puzzle.hearTechnician(); changed() }) },
        },
        { id: 'cleaner', ...getPoint('cleaner'), radius: 28, prompt: 'Hỏi người lau dọn',
            isAvailable: available,
            interact: () => { if (available()) speak(CLEANER_STORY, () => { puzzle.hearCleaner(); changed() }) },
        },
        ...[
            { id: 'alarm', point: 'circuitAlarm', label: 'Ngắt đường báo động' },
            { id: 'lamp', point: 'circuitLamp', label: 'Nối đèn kiểm tra' },
            { id: 'lock', point: 'circuitLock', label: 'Cấp nguồn khóa' },
        ].map((part): Interactable => ({
            id: `circuit-${part.id}`, ...getPoint(part.point), radius: 24, prompt: part.label,
            isAvailable: () => available() && !puzzle.powerReady,
            interact: () => {
                if (!available() || puzzle.powerReady) return
                notify(puzzle.operateCircuit(part.id))
                changed()
            },
        })),
        { id: 'chat-evidence', ...getPoint('chatEvidence'), radius: 28, prompt: 'Ghi nhớ kịch bản chat',
            isAvailable: () => available() && !puzzle.hasEvidence,
            interact: () => { if (available()) speak(CHAT_EVIDENCE, () => { puzzle.collectEvidence(); changed() }) },
        },
        { id: 'exit-code', ...getPoint('exitPanel'), radius: 28, prompt: 'Giải khóa cổng',
            isAvailable: () => available() && !puzzle.gateUnlocked,
            interact: () => { if (available() && !puzzle.gateUnlocked) openLock() },
        },
    ]
}
