export class DetectionMeter {
    private level = 0

    private readonly gainPerSecond: number
    private readonly decayPerSecond: number

    constructor(gainPerSecond: number, decayPerSecond: number) {
        if (
            !Number.isFinite(gainPerSecond)
            || !Number.isFinite(decayPerSecond)
            || gainPerSecond <= 0
            || decayPerSecond <= 0
        ) {
            throw new Error('Detection rates must be positive finite numbers')
        }

        this.gainPerSecond = gainPerSecond
        this.decayPerSecond = decayPerSecond
    }

    update(visible: boolean, deltaMs: number): void {
        if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
            return
        }

        // Avoid a sudden capture after a long browser stall.
        const seconds = Math.min(deltaMs, 100) / 1000
        const rate = visible
            ? this.gainPerSecond
            : -this.decayPerSecond

        this.level = Math.max(0, Math.min(1, this.level + rate * seconds))
    }

    get value(): number {
        return this.level
    }

    get full(): boolean {
        return this.level >= 1
    }

    reset(): void {
        this.level = 0
    }
}
