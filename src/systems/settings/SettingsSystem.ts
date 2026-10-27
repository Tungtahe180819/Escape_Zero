import type Phaser from 'phaser'

interface SettingsData {
    version: 1
    volume: number
    muted: boolean
}

const SETTINGS_KEY = 'escape-zero.settings'

function defaults(): SettingsData {
    return {
        version: 1,
        volume: 0.7,
        muted: false,
    }
}

function isValid(value: unknown): value is SettingsData {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    const data = value as Record<string, unknown>

    return (
        data.version === 1 &&
        typeof data.volume === 'number' &&
        Number.isFinite(data.volume) &&
        data.volume >= 0 &&
        data.volume <= 1 &&
        typeof data.muted === 'boolean'
    )
}

export class SettingsSystem {
    private data: SettingsData

    constructor() {
        this.data = this.load()
    }

    private load(): SettingsData {
        try {
            const raw = window.localStorage.getItem(SETTINGS_KEY)

            if (raw === null) {
                return defaults()
            }

            const parsed: unknown = JSON.parse(raw)

            if (isValid(parsed)) {
                return { ...parsed }
            }
        } catch {
            // Invalid JSON or unavailable storage.
        }

        const fallback = defaults()
        this.persist(fallback)
        return fallback
    }

    private persist(data: SettingsData): boolean {
        try {
            window.localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(data),
            )
            return true
        } catch {
            // Settings remain usable for the current session.
            return false
        }
    }

    getVolume(): number {
        return this.data.volume
    }

    isMuted(): boolean {
        return this.data.muted
    }

    setVolume(value: number): boolean {
        if (!Number.isFinite(value)) {
            return false
        }

        this.data.volume = Math.round(
            Math.min(1, Math.max(0, value)) * 100,
        ) / 100

        return this.persist(this.data)
    }

    setMuted(value: boolean): boolean {
        this.data.muted = value
        return this.persist(this.data)
    }

    apply(scene: Phaser.Scene): void {
        scene.sound.volume = this.data.volume
        scene.sound.mute = this.data.muted
    }
}

export const settingsSystem = new SettingsSystem()