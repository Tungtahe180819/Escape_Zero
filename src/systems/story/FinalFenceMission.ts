/** Preparation survives checkpoint retries; only Restart Level creates a new mission. */
export class FinalFenceMission {
    readonly clues = new Set<string>()
    fenceSolved = false
    powerSolved = false
    bagReturned = false
    motorPowered = false
    bridgeLowering = false
    bridgeProgress = 0

    get bridgeLowered(): boolean { return this.bridgeProgress === 1 }

    powerMotor(): boolean {
        if (!this.clues.has('diagram')) return false
        this.motorPowered = true
        return true
    }

    lowerBridge(): boolean {
        if (!this.motorPowered || this.bridgeLowering || this.bridgeLowered) return false
        this.bridgeLowering = true
        return true
    }

    tickBridge(delta: number): void {
        if (!this.bridgeLowering || !Number.isFinite(delta)) return
        this.bridgeProgress = Math.min(1, this.bridgeProgress + Math.min(100, Math.max(0, delta)) / 2400)
        if (this.bridgeLowered) this.bridgeLowering = false
    }
    remainingMs = 0
    running = false
    escaped = false

    identifyFence(answer: number): boolean {
        if (!['map', 'pole', 'drain'].every(key => this.clues.has(key))) return false
        if (answer !== 2) return false
        this.fenceSolved = true
        return true
    }

    isolatePower(answer: number): boolean {
        if (!this.fenceSolved || !this.clues.has('diagram') || answer !== 1) return false
        this.powerSolved = true
        return true
    }

    start(): boolean {
        if (!this.powerSolved || !this.bridgeLowered || this.running || this.escaped) return false
        this.remainingMs = 30000
        this.running = true
        return true
    }

    tick(delta: number): boolean {
        if (!this.running || !Number.isFinite(delta)) return false
        this.remainingMs = Math.max(0, this.remainingMs - Math.min(100, Math.max(0, delta)))
        return this.remainingMs === 0
    }

    retry(): void {
        this.running = false
        this.remainingMs = 0
        this.escaped = false
    }

    finish(): void {
        this.running = false
        this.escaped = true
    }

    objective(): string {
        if (this.running) return `Còn ${Math.ceil(this.remainingMs / 1000)}s — mang chứng cứ tới khe rào!`
        if (this.escaped) return 'Ba nhịp ngắn, một nhịp dài. Lan và Tuấn còn chờ.'
        if (this.bridgeLowering) return 'Cầu đang hạ — chờ cầu chạm bờ bên kia.'
        if (this.clues.has('diagram') && !this.motorPowered) return 'Bật nguồn mô-tơ tại tủ cấp điện cầu nâng.'
        if (this.motorPowered && !this.bridgeLowered) return 'Tới cần điều khiển bên mương để hạ cầu.'
        if (this.powerSolved) return 'Chuẩn bị xong. Tới cầu dao, nhấn E khi sẵn sàng.'
        if (this.fenceSolved) return 'Đọc sơ đồ bảo trì và cô lập đúng nhánh điện.'
        return 'Đối chiếu bản đồ Lan, cột điện và hướng mương để tìm khe rào.'
    }
}
