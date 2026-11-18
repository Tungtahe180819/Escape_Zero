import type { DialogueLine } from './DialogueTypes'

export class CellEscapePuzzle {
    private tuanHeard = false
    private rosterRead = false
    private evidenceRead = false
    private unlocked = false
    private recordMatched = false
    private archivistHeard = false
    private tornLedgerSeen = false
    private transferOrderSeen = false
    private contradictionProven = false
    private technicianHeard = false
    private cleanerHeard = false
    private circuitStep = 0
    private powered = false

    get hasTuanClue(): boolean { return this.tuanHeard }
    get hasRosterClue(): boolean { return this.rosterRead }
    get hasEvidence(): boolean { return this.evidenceRead }
    get gateUnlocked(): boolean { return this.unlocked }
    get hasRecordMatch(): boolean { return this.recordMatched }
    get hasArchivistIntro(): boolean { return this.archivistHeard }
    get hasTornLedger(): boolean { return this.tornLedgerSeen }
    get hasTransferOrder(): boolean { return this.transferOrderSeen }
    get hasProvenContradiction(): boolean { return this.contradictionProven }
    get hasPowerHint(): boolean { return this.technicianHeard }
    get hasCleanerHint(): boolean { return this.cleanerHeard }
    get powerReady(): boolean { return this.powered }
    get circuitProgress(): number { return this.circuitStep }

    hearTuan(): void { this.tuanHeard = true }
    readRoster(): boolean {
        if (!this.recordMatched) return false
        this.rosterRead = true
        return true
    }
    collectEvidence(): void { this.evidenceRead = true }
    hearTechnician(): void { this.technicianHeard = true }
    hearArchivist(): void { this.archivistHeard = true }
    inspectTornLedger(): void { this.tornLedgerSeen = true }
    inspectTransferOrder(): void { this.transferOrderSeen = true }
    hearCleaner(): void { this.cleanerHeard = true }

    confrontArchivist(id: string): string | null {
        if (!this.tuanHeard) return 'Chưa biết người cần tìm. Hãy hỏi Tuấn trong buồng giam.'
        if (!this.archivistHeard) return 'Hãy nghe người ghi sổ giải thích trước khi đối chất.'
        if (!this.tornLedgerSeen) return 'Chưa kiểm tra sổ có trang bị xé trong phòng hồ sơ.'
        if (!this.transferOrderSeen) return 'Cần thêm tài liệu để xác minh. Tìm tập lệnh chuyển người.'
        if (id !== 'ledger-order') return 'Chưa chỉ ra mâu thuẫn giữa lời bà và hai tài liệu. Xem lại nhật ký.'
        this.contradictionProven = true
        return null
    }

    receiveOriginalPage(): boolean {
        if (!this.contradictionProven || this.recordMatched) return false
        this.recordMatched = true
        return true
    }

    operateCircuit(part: string): string {
        if (!this.technicianHeard) return 'Chưa rõ cách nối mạch. Hãy hỏi người thợ điện.'
        if (this.powered) return 'Nguồn khóa đã ổn định.'
        const order = ['alarm', 'lamp', 'lock']
        if (part !== order[this.circuitStep]) {
            this.circuitStep = 0
            return 'Sai thứ tự, mạch tự ngắt. Xem lại lời thợ điện rồi thử từ đầu.'
        }
        this.circuitStep++
        if (this.circuitStep === order.length) {
            this.powered = true
            return 'Mạch hoàn tất. Khóa cổng tầng 3 đã có điện.'
        }
        return `Đúng bước ${this.circuitStep}/3. Tiếp tục nối mạch.`
    }

    submit(code: string): string | null {
        if (!this.tuanHeard || !this.rosterRead) {
            return 'Còn thiếu manh mối. Hỏi Tuấn và đọc sổ đổi ca ở phòng hồ sơ.'
        }
        if (!this.powered) return 'Khóa chưa có điện. Hoàn tất mạch bảo dưỡng ở phòng hồ sơ.'
        if (!/^\d{3}$/.test(code)) return 'Khóa cần đúng 3 chữ số.'
        if (code !== '724') return 'Mã chưa đúng. Kiểm tra thứ tự và chữ số cuối của từng mục.'
        this.unlocked = true
        return null
    }

    getObjective(): string {
        if (this.unlocked) return 'Cổng đã mở · Đi sang khu giám sát'
        if (!this.tuanHeard) return 'Hỏi Tuấn trong buồng giam về khóa lối ra'
        if (!this.archivistHeard) return 'Hỏi người ghi sổ về hồ sơ Tuấn'
        if (!this.tornLedgerSeen) return 'Kiểm tra cuốn sổ có trang bị xé'
        if (!this.transferOrderSeen) return 'Tìm lệnh chuyển người để đối chiếu'
        if (!this.contradictionProven) return 'Quay lại người ghi sổ · Chỉ ra mâu thuẫn'
        if (!this.recordMatched) return 'Nghe lời thú nhận và nhận trang danh sách gốc'
        if (!this.rosterRead) return 'Tìm sổ đổi ca trong phòng hồ sơ tầng 2'
        if (!this.technicianHeard) return 'Hỏi thợ điện cách khôi phục nguồn khóa'
        if (!this.powered) return `Nối mạch bảo dưỡng · ${this.circuitStep}/3 bước đúng`
        return 'Ghép manh mối · Mở khóa ở cuối tầng 3'
    }

    getJournal(): DialogueLine[] {
        const notes: DialogueLine[] = []
        if (this.tuanHeard) notes.push({ speaker: 'Tuấn · Danh tính và quy tắc khóa', text: 'Tuấn 19 tuổi, đi làm để trả nợ cho bố. Khóa dùng thứ tự: buồng, ca, tổ; lấy chữ số cuối của từng mục.' })
        if (this.archivistHeard) notes.push({ speaker: 'Lời khai chưa xác minh · Người ghi sổ', text: 'Bà nói không có ai tên Tuấn trong danh sách hiện hành. Cần kiểm tra tài liệu trước khi tin lời này.' })
        if (this.tornLedgerSeen) notes.push({ speaker: 'Quan sát · Sổ bị sửa', text: 'Dòng HS19 bị gạch, ô tên để trống. Một trang gốc bị xé khỏi gáy sổ; vết mực mới phủ lên chữ cũ.' })
        if (this.transferOrderSeen) notes.push({ speaker: 'Tài liệu · Lệnh chuyển người', text: 'HS19 vẫn có trong danh sách dự kiến bàn giao: 19 tuổi, khoản nợ của bố. Tài liệu này trái với việc hồ sơ đã bị xóa khỏi sổ hiện hành.' })
        if (this.contradictionProven && !this.recordMatched) notes.push({ speaker: 'Suy luận · Mâu thuẫn đã chỉ ra', text: 'Sổ bị gạch không có nghĩa người đó không tồn tại. Người ghi sổ đã đồng ý giải thích; cần quay lại nghe và nhận trang gốc.' })
        if (this.recordMatched) notes.push({ speaker: 'Đã xác minh · Trang danh sách gốc', text: 'Trang gốc ghi tên Tuấn, 19 tuổi, nợ của bố, mã HS19. Bà giấu trang để giữ tên thật. Tuấn nằm trong kế hoạch chuyển người trước sáng; đã được xem sổ đổi ca.' })
        if (this.rosterRead) notes.push({ speaker: 'Sổ đổi ca · Phòng hồ sơ', text: 'Buồng: 07. Ca trực: 02. Tổ phụ trách: 04. Các mục phải được sắp theo quy tắc của người dùng khóa.' })
        if (this.technicianHeard) notes.push({ speaker: 'Thợ điện · Mạch bảo dưỡng', text: 'Đầu tiên ngắt đường BÁO ĐỘNG; sau đó nối ĐÈN KIỂM TRA; cuối cùng cấp NGUỒN KHÓA. Ba nút ở phòng hồ sơ, không cần giữ liên tục.' })
        if (this.powered) notes.push({ speaker: 'Mạch điện', text: 'Nguồn khóa đã ổn định. Có thể lên tầng 3 nhập mã khi lính hết cảnh giác.' })
        if (this.cleanerHeard) notes.push({ speaker: 'Người lau dọn · Tuyến gác', text: 'Núp trước khi bị nhìn thấy. Chờ lính quay lưng rồi chuyển từng hốc; nếu đã bị đuổi, chạy khuất tầm nhìn trước khi dừng.' })
        if (this.evidenceRead) notes.push({ speaker: 'Chứng cứ · Kịch bản chat', text: 'Tờ giấy ghi các câu nhắn bắt buộc và chỉ tiêu lừa tiền. Đây là dấu vết cho thấy người trong trại bị ép làm việc.' })
        if (!notes.length) notes.push({ speaker: 'Nhật ký', text: 'Chưa có manh mối. Tìm người có thể giúp mình và đọc tài liệu trên đường đi.' })
        return notes
    }

    getLockNotes(): string[] {
        return [
            this.tuanHeard ? 'Tuấn: Buồng trước, ca sau, tổ cuối; chỉ lấy chữ số cuối.' : 'Chưa có lời Tuấn.',
            this.rosterRead ? 'Sổ: Buồng 07 · Ca 02 · Tổ 04.' : 'Chưa đọc được sổ đổi ca.',
            this.powered ? 'Nguồn khóa: ĐÃ CÓ ĐIỆN.' : 'Nguồn khóa: CHƯA CÓ ĐIỆN.',
        ]
    }
}
