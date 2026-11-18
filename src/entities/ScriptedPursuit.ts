import Phaser from 'phaser'
import { pursuitJumpHeight } from '../systems/pursuit/PursuitRoute'
import type { PursuitGap } from '../systems/pursuit/PursuitRoute'
import { CHARACTER_SCALE } from '../config/characterConfig'

export interface ScriptedPursuitConfig {
    speed: number
    startGap: number
    guardCount: number
    guardSpacing: number
    jumpHeight: number
    groundY: number
    gaps: readonly PursuitGap[]
}

type PursuitState = 'IDLE' | 'ACTIVE' | 'FINISHED'

export class ScriptedPursuit extends Phaser.GameObjects.Container {
    private readonly config: ScriptedPursuitConfig
    private pursuitState: PursuitState = 'IDLE'
    private readonly runners: Phaser.GameObjects.Sprite[] = []

    constructor(scene: Phaser.Scene, config: ScriptedPursuitConfig) {
        super(scene, 0, config.groundY)

        if (
            !Number.isFinite(config.speed) || config.speed <= 0
            || !Number.isFinite(config.startGap) || config.startGap <= 0
            || !Number.isInteger(config.guardCount)
            || config.guardCount < 1 || config.guardCount > 8
            || !Number.isFinite(config.guardSpacing) || config.guardSpacing < 16
            || !Number.isFinite(config.jumpHeight) || config.jumpHeight <= 0
            || !Number.isFinite(config.groundY)
            || config.gaps.some((gap) => (
                !Number.isFinite(gap.left) || !Number.isFinite(gap.right)
                || gap.right <= gap.left
            ))
        ) {
            throw new Error('Invalid pursuit configuration')
        }

        if (!scene.textures.exists('guard') || !scene.anims.exists('guard-run')) {
            throw new Error('Pursuit requires the guard texture and run animation')
        }

        this.config = {
            ...config,
            gaps: config.gaps.map((gap) => ({ ...gap })),
        }

        scene.add.existing(this)
        this.setDepth(4)
        this.setVisible(false)

        // Rear guards first, so the leading guard is drawn in front.
        for (let index = config.guardCount - 1; index >= 0; index--) {
            const runner = scene.add.sprite(
                -index * config.guardSpacing, 0, 'guard', 12,
            )
                .setScale(CHARACTER_SCALE)
                // Right edge follows the old capture boundary; feet at row 46.
                .setOrigin(1, 46 / 48)

            this.runners[index] = runner
            this.add(runner)
        }
    }

    start(triggerX: number): void {
        if (this.pursuitState !== 'IDLE') {
            return
        }

        this.pursuitState = 'ACTIVE'
        this.setPosition(triggerX - this.config.startGap, this.config.groundY)
        this.setVisible(true)

        this.runners.forEach((runner, index) => {
            runner.play({ key: 'guard-run', startFrame: index % 6 })
        })
        this.positionRunners()
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
        this.positionRunners()
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
        this.stopRunners()
    }

    resetPursuit(): void {
        this.pursuitState = 'IDLE'
        this.setPosition(0, this.config.groundY)
        this.setVisible(false)
        this.stopRunners()
        this.positionRunners()
    }

    getState(): PursuitState {
        return this.pursuitState
    }

    private positionRunners(): void {
        this.runners.forEach((runner, index) => {
            const localX = -index * this.config.guardSpacing
            // Sample near the torso, not the sprite's right-most transparent edge.
            const hop = pursuitJumpHeight(
                this.x + localX - 8,
                this.config.gaps,
                this.config.jumpHeight,
            )
            runner.setPosition(localX, -hop)

            if (this.pursuitState === 'ACTIVE') {
                if (hop > 0) {
                    runner.anims.pause()
                } else {
                    runner.anims.resume()
                }
            }
        })
    }

    private stopRunners(): void {
        for (const runner of this.runners) {
            runner.anims.stop()
            runner.setFrame(12)
        }
    }
}
