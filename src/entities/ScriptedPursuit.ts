import Phaser from 'phaser'

export interface ScriptedPursuitConfig {
    speed: number
    startGap: number
    width: number
    worldHeight: number
}

type PursuitState = 'IDLE' | 'ACTIVE' | 'FINISHED'

export class ScriptedPursuit extends Phaser.GameObjects.Rectangle {
    private readonly config: ScriptedPursuitConfig
    private pursuitState: PursuitState = 'IDLE'

    constructor(scene: Phaser.Scene, config: ScriptedPursuitConfig) {
        super(
            scene,
            0,
            0,
            config.width,
            config.worldHeight,
            0xef4444,
            0.65,
        )

        if (
            config.speed <= 0
            || config.startGap <= 0
            || config.width <= 0
            || config.worldHeight <= 0
        ) {
            throw new Error('Invalid pursuit configuration')
        }

        this.config = { ...config }

        scene.add.existing(this)
        this.setOrigin(1, 0)
        this.setDepth(4)
        this.setVisible(false)
    }

    start(triggerX: number): void {
        if (this.pursuitState !== 'IDLE') {
            return
        }

        this.pursuitState = 'ACTIVE'
        this.setPosition(triggerX - this.config.startGap, 0)
        this.setVisible(true)
    }

    updatePursuit(deltaMs: number): void {
        if (
            this.pursuitState !== 'ACTIVE'
            || !Number.isFinite(deltaMs)
            || deltaMs <= 0
        ) {
            return
        }

        const seconds = Math.min(deltaMs, 100) / 1000
        this.x += this.config.speed * seconds
    }

    hasCaught(playerLeft: number): boolean {
        return this.pursuitState === 'ACTIVE' && playerLeft <= this.x
    }

    finish(): void {
        if (this.pursuitState !== 'ACTIVE') {
            return
        }

        this.pursuitState = 'FINISHED'
        this.setVisible(false)
    }

    resetPursuit(): void {
        this.pursuitState = 'IDLE'
        this.setPosition(0, 0)
        this.setVisible(false)
    }

    getState(): PursuitState {
        return this.pursuitState
    }
}