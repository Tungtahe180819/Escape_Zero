import Phaser from 'phaser'

const SFX = {
    jump: { file: 'jump.wav', volume: 0.5, gap: 100 },
    key: { file: 'key.wav', volume: 0.65, gap: 150 },
    interact: { file: 'interact.wav', volume: 0.65, gap: 150 },
    checkpoint: { file: 'checkpoint.wav', volume: 0.6, gap: 250 },
    caught: { file: 'caught.wav', volume: 0.65, gap: 600 },
    complete: { file: 'complete.wav', volume: 0.65, gap: 600 },
    ui: { file: 'ui.wav', volume: 0.6, gap: 60 },
    chase: { file: 'chase.wav', volume: 0.65, gap: 600 },
} as const

export type SfxName = keyof typeof SFX

const installed = new WeakSet<Phaser.Sound.BaseSoundManager>()
const lastPlayed = new WeakMap<Phaser.Sound.BaseSoundManager, Map<SfxName, number>>()

export function preloadAudio(scene: Phaser.Scene): void {
    scene.load.audio('ambient', 'assets/audio/ambient.wav')

    for (const [name, config] of Object.entries(SFX)) {
        scene.load.audio(`sfx-${name}`, `assets/audio/${config.file}`)
    }
}

export function startAudio(scene: Phaser.Scene): void {
    const sound = scene.sound

    if (installed.has(sound)) {
        return
    }

    installed.add(sound)
    const audioCache = scene.cache.audio

    // Capture global managers, not BootScene, which shuts down after loading.
    const startMusic = (): void => {
        if (!audioCache.exists('ambient')) {
            return
        }

        const existing = sound.get('ambient')

        if (existing?.isPlaying || existing?.isPaused) {
            return
        }

        sound.play('ambient', { loop: true, volume: 0.45 })
    }

    if (sound.locked) {
        sound.once(Phaser.Sound.Events.UNLOCKED, startMusic)
    } else {
        startMusic()
    }
}

export function playSfx(scene: Phaser.Scene, name: SfxName): void {
    const sound = scene.sound

    // Never queue stale gameplay sounds while browser audio is locked.
    if (sound.locked || sound.mute || !scene.cache.audio.exists(`sfx-${name}`)) {
        return
    }

    const config = SFX[name]
    let timestamps = lastPlayed.get(sound)

    if (!timestamps) {
        timestamps = new Map()
        lastPlayed.set(sound, timestamps)
    }

    const now = performance.now()
    const last = timestamps.get(name)

    if (last !== undefined && now - last < config.gap) {
        return
    }

    timestamps.set(name, now)
    sound.play(`sfx-${name}`, { volume: config.volume })
}
