export class MissionSystem {
    private keyCollected = false
    private doorUnlocked = false
    private finished = false

    get hasKey(): boolean {
        return this.keyCollected
    }

    get doorOpened(): boolean {
        return this.doorUnlocked
    }

    collectKey(): void {
        this.keyCollected = true
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
            return 'Level complete'
        }

        if (!this.keyCollected) {
            return 'Find the key'
        }

        if (!this.doorUnlocked) {
            return 'Unlock the door'
        }

        return 'Reach the exit'
    }

    tryComplete(): boolean {
        if (this.finished || !this.keyCollected || !this.doorUnlocked) {
            return false
        }

        this.finished = true
        return true
    }

    reset(): void {
        this.keyCollected = false
        this.doorUnlocked = false
        this.finished = false
    }
}
