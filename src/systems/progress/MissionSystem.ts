export class MissionSystem {
    private hairpinReceived = false
    private keyCollected = false
    private doorUnlocked = false
    private finished = false

    get hasKey(): boolean {
        return this.keyCollected
    }

    get doorOpened(): boolean {
        return this.doorUnlocked
    }

    get hasHairpin(): boolean {
        return this.hairpinReceived
    }

    receiveHairpin(): boolean {
        if (this.hairpinReceived) {
            return false
        }

        this.hairpinReceived = true
        return true
    }

    collectKey(): boolean {
        if (!this.hairpinReceived || this.keyCollected) {
            return false
        }

        this.keyCollected = true
        return true
    }

    unlockDoor(): boolean {
        if (!this.keyCollected) {
            return false
        }

        this.doorUnlocked = true
        return true
    }

    getObjective(): string {
        if (this.finished) {
            return 'Đã thoát phòng giam'
        }

        if (!this.hairpinReceived) {
            return 'Nói chuyện với Lan'
        }

        if (!this.keyCollected) {
            return 'Dùng kẹp tóc móc chìa ngoài song cửa'
        }

        if (!this.doorUnlocked) {
            return 'Mở cửa phòng giam'
        }

        return 'Tìm lối sang hành lang giám sát'
    }

    tryComplete(): boolean {
        if (this.finished || !this.keyCollected || !this.doorUnlocked) {
            return false
        }

        this.finished = true
        return true
    }

    reset(): void {
        this.hairpinReceived = false
        this.keyCollected = false
        this.doorUnlocked = false
        this.finished = false
    }

    restoreAtCheckpoint(preserveOpenDoor: boolean): void {
        // Lan's conversation and hairpin are remembered for this level attempt.
        // Only a full level restart creates a new mission and repeats the intro.
        this.doorUnlocked = preserveOpenDoor && this.doorUnlocked
        this.keyCollected = this.doorUnlocked
        this.finished = false
    }
}
