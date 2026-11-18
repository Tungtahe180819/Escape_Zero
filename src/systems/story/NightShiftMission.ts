export type DataPart = 'A' | 'B' | 'C'
export const DATA_PARTS: readonly DataPart[] = ['A', 'B', 'C']
export const DATA_NOTES: Record<DataPart, string> = {
    A: 'A · 01:10 · Phòng 12 · ca giữa: tên đổi thành mã, ép chỉ tiêu',
    B: 'B · 02:00 · Phòng 19 · cuối ca: HS19 chờ chuyển trại',
    C: 'C · 00:15 · Phòng 07 · đầu ca: Tuấn, nợ của bố, HS19',
}
const DATA_MEANING: Record<DataPart, string> = {
    C: 'Tên thật và khoản nợ nối Tuấn ở buồng 07 với mã HS19.',
    A: 'Bảng ca giữa cho thấy việc ép chỉ tiêu và tăng nợ; người trực máy cũng là nạn nhân.',
    B: 'HS19 xuất hiện trong danh sách chuyển trại cuối ca. Ghép đủ ba phần mới lần ra được một người.',
}

export class NightShiftMission {
    foodMet = false
    messageDelivered = false
    lanMet = false
    workerMet = false
    maintenanceFound = false
    accountReady = false
    ordered = false
    usbReceived = false
    bonusCopied = false
    readonly found = new Set<DataPart>()
    readonly copied = new Set<DataPart>()
    private active: DataPart | 'bonus' | null = null
    private elapsed = 0

    get hasServiceCard(): boolean { return this.foodMet }
    get activeCopy(): DataPart | 'bonus' | null { return this.active }
    get copyPercent(): number { return Math.floor(this.elapsed / 2400 * 100) }
    meetFood(): void { this.foodMet = true }
    meetLan(): void { this.lanMet = true }
    meetWorker(): void { this.workerMet = true; if (this.foodMet) this.messageDelivered = true }
    readMaintenance(): void { this.maintenanceFound = true }
    enableAccount(): boolean {
        if (!this.workerMet || !this.maintenanceFound) return false
        this.accountReady = true
        return true
    }
    discover(part: DataPart): void { this.found.add(part) }
    arrange(order: string): string | null {
        if (!this.lanMet) return 'Hãy gặp Lan để biết cách ghép dữ liệu.'
        if (this.found.size !== 3) return 'Chưa tìm đủ ba phần dữ liệu A, B, C.'
        if (order !== 'CAB') return 'Thứ tự chưa đúng. Lan yêu cầu xếp theo giờ từ đầu đến cuối ca.'
        this.ordered = true
        return null
    }
    startCopy(part: DataPart | 'bonus'): string | null {
        if (!this.lanMet || !this.ordered || !this.accountReady) return 'Cần gặp Lan, ghép dữ liệu và được cấp tài khoản bảo dưỡng.'
        if (part === 'bonus' && !this.messageDelivered) return 'Người trực máy chưa chỉ chỗ dữ liệu bổ sung. Có thể bỏ qua phần này.'
        if (part === 'bonus' ? this.bonusCopied : this.copied.has(part)) return 'Phần này đã chép xong.'
        this.active = part
        this.elapsed = 0
        return null
    }
    interruptCopy(): void { this.active = null; this.elapsed = 0 }
    tickCopy(deltaMs: number, inPosition: boolean): boolean {
        if (!this.active) return false
        if (!inPosition) { this.interruptCopy(); return false }
        if (!Number.isFinite(deltaMs) || deltaMs <= 0) return false
        this.elapsed += Math.min(deltaMs, 100)
        if (this.elapsed < 2400) return false
        if (this.active === 'bonus') this.bonusCopied = true
        else this.copied.add(this.active)
        this.interruptCopy()
        return true
    }
    receiveUsb(): boolean {
        if (!this.lanMet || this.copied.size !== 3 || this.usbReceived) return false
        this.usbReceived = true
        return true
    }
    objective(): string {
        if (this.usbReceived) return 'Mang danh sách nạn nhân qua cửa kỹ thuật cuối hành lang'
        if (!this.lanMet) return 'Tìm Lan tại khu làm việc · Có hai đường tiếp cận'
        if (!this.workerMet) return 'Nhờ người trực máy giúp truy cập'
        if (!this.maintenanceFound) return 'Tìm ghi chú về tài khoản bảo dưỡng'
        if (!this.accountReady) return 'Mang ghi chú về cho người trực máy'
        if (this.found.size < 3) return `Tìm dữ liệu · ${this.found.size}/3 phần`
        if (!this.ordered) return 'Gặp Lan · Ghép thứ tự ba phần dữ liệu'
        if (this.copied.size < 3) return `Sao chép tại các máy trên hành lang · ${this.copied.size}/3`
        return 'Quay lại Lan để nhận USB'
    }
    journal(): { speaker: string; text: string }[] {
        const notes = [{ speaker: 'Lời hẹn của Lan', text: 'Tới khu làm việc phía dưới. Có thể vượt hành lang hoặc nhờ người cấp suất ăn mở lối phục vụ.' }]
        if (this.foodMet) notes.push({ speaker: 'Người cấp suất ăn', text: 'Đã cho mượn thẻ lối phục vụ và gửi lời nhắn cho anh ở phòng máy: mọi người vẫn chờ anh trở về.' })
        if (this.lanMet) notes.push({ speaker: 'Lan', text: 'Ba phần dữ liệu phải ghép theo mốc giờ từ đầu đến cuối ca, không theo chữ cái hay số phòng. Máy sao chép nằm trên hành lang có lính.' })
        if (this.workerMet) notes.push({ speaker: 'Người trực máy', text: 'Anh sợ tài khoản cá nhân bị truy ra. Cần chứng minh có tài khoản bảo dưỡng dùng cho máy xuất dữ liệu.' })
        if (this.maintenanceFound) notes.push({ speaker: 'Ghi chú bảo dưỡng', text: 'Tài khoản BV-02 dành cho máy xuất dữ liệu. Người trực máy có thể kích hoạt thay cho tài khoản cá nhân.' })
        if (this.accountReady) notes.push({ speaker: 'Phương án đã thống nhất', text: 'Tài khoản bảo dưỡng đã kích hoạt. Việc này không làm lính và camera ngừng giám sát.' })
        for (const part of DATA_PARTS) if (this.found.has(part)) notes.push({ speaker: `Dữ liệu ${part}`, text: `${DATA_NOTES[part]}\n${DATA_MEANING[part]}` })
        if (this.messageDelivered) notes.push({ speaker: 'Lời nhắn đã chuyển', text: 'Người trực máy cảm ơn và chỉ thêm một máy có danh sách khu khác. Đây là chứng cứ tùy chọn.' })
        notes.push({ speaker: 'Tiến trình', text: `Đã ghép: ${this.ordered ? 'có' : 'chưa'}. Đã chép ${this.copied.size}/3 phần. Bổ sung: ${this.bonusCopied ? 'có' : 'chưa'}. Các phần hoàn tất được giữ khi hồi sinh trong lượt chơi.` })
        return notes
    }
}
