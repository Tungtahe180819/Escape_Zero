export type LevelNumber = 1 | 2 | 3

interface SaveData {
    version: 2
    highestUnlockedLevel: LevelNumber
    currentLevel: LevelNumber | null
    demoCompleted: boolean
}

const SAVE_KEY = 'escape-zero.progress'

function createDefaultSave(): SaveData {
    return {
        version: 2,
        highestUnlockedLevel: 1,
        currentLevel: null,
        demoCompleted: false,
    }
}

function isLevel(value: unknown): value is LevelNumber {
    return value === 1 || value === 2 || value === 3
}

function parseSave(value: unknown): SaveData | null {
    if (typeof value !== 'object' || value === null) {
        return null
    }

    const data = value as Record<string, unknown>
    const highest = data.highestUnlockedLevel

    if (
        !isLevel(highest) ||
        typeof data.demoCompleted !== 'boolean' ||
        (data.demoCompleted && highest !== 3)
    ) {
        return null
    }

    // Upgrade the old save without losing unlocked levels.
    if (data.version === 1) {
        return {
            version: 2,
            highestUnlockedLevel: highest,
            currentLevel: highest,
            demoCompleted: data.demoCompleted,
        }
    }

    if (data.version !== 2) {
        return null
    }

    const current = data.currentLevel

    if (current === null) {
        if (highest !== 1 || data.demoCompleted) {
            return null
        }
    } else if (!isLevel(current) || current > highest) {
        return null
    }

    return {
        version: 2,
        highestUnlockedLevel: highest,
        currentLevel: current as LevelNumber | null,
        demoCompleted: data.demoCompleted,
    }
}

export class SaveSystem {
    private data: SaveData

    constructor() {
        this.data = this.load()
    }

    private load(): SaveData {
        try {
            const raw = window.localStorage.getItem(SAVE_KEY)

            if (raw === null) {
                return createDefaultSave()
            }

            const parsed: unknown = JSON.parse(raw)
            const valid = parseSave(parsed)

            if (valid !== null) {
                this.persist(valid)
                return valid
            }
        } catch {
            // Invalid JSON or unavailable browser storage.
        }

        const fallback = createDefaultSave()
        this.persist(fallback)
        return fallback
    }

    private persist(data: SaveData): boolean {
        try {
            window.localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(data),
            )
            return true
        } catch {
            // Keep the current session playable without storage.
            return false
        }
    }

    isUnlocked(level: LevelNumber): boolean {
        return level <= this.data.highestUnlockedLevel
    }

    getHighestUnlockedLevel(): LevelNumber {
        return this.data.highestUnlockedLevel
    }

    getCurrentLevel(): LevelNumber | null {
        return this.data.currentLevel
    }

    isDemoCompleted(): boolean {
        return this.data.demoCompleted
    }

    enterLevel(level: LevelNumber): boolean {
        if (!this.isUnlocked(level)) {
            return false
        }

        this.data.currentLevel = level
        return this.persist(this.data)
    }

    completeLevel(level: LevelNumber): boolean {
        if (!this.isUnlocked(level)) {
            return false
        }

        const nextLevel: LevelNumber = level === 1 ? 2 : 3

        this.data = {
            version: 2,
            highestUnlockedLevel: Math.max(
                this.data.highestUnlockedLevel,
                nextLevel,
            ) as LevelNumber,
            currentLevel: nextLevel,
            demoCompleted:
                this.data.demoCompleted || level === 3,
        }

        return this.persist(this.data)
    }

    reset(): boolean {
        this.data = createDefaultSave()
        return this.persist(this.data)
    }
}

export const saveSystem = new SaveSystem()