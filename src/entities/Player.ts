import Phaser from 'phaser'
import { playSfx } from '../systems/audio/AudioSystem'
import { CHARACTER_SCALE } from '../config/characterConfig'
import { PlayerAnimationState } from './PlayerAnimationState'

export class Player extends Phaser.Physics.Arcade.Sprite {
    private readonly moveSpeed = 120
    private readonly jumpSpeed = 220
    private crouching = false
    private readonly animationState = new PlayerAnimationState()

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'minh', 0)

        scene.add.existing(this)

        // Standing artwork is 39–40 px tall inside the padded 48 px frame.
        // Scale 0.9 displays at least 35.1 px: 73% of the 48 px cell door.
        const visualScale = CHARACTER_SCALE
        this.setScale(visualScale)
        this.setOrigin(0.5, 1 - 12 / (48 * visualScale))

        scene.physics.add.existing(this)

        // Keep 16x24 collision size, but align its bottom to the visible sole (row 46),
        // not the two transparent padding rows at the bottom of the 48px frame.
        const sourceBodyWidth = 16 / visualScale
        const sourceBodyHeight = 24 / visualScale
        this.setBodySize(sourceBodyWidth, sourceBodyHeight, false)
        this.setOffset((32 - sourceBodyWidth) / 2, 46 - sourceBodyHeight)
        this.setCollideWorldBounds(true)

        this.play('minh-idle')
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta)

        if (!this.body) {
            return
        }

        const animation = this.animationState.select(this.body, this.crouching, time)
        // A completed jump/fall sequence holds its last frame instead of restarting every render.
        if (this.anims.currentAnim?.key !== animation) this.play(animation, true)
    }

    move(horizontalAxis: number): void {
        const speed = this.crouching
            ? this.moveSpeed * 0.5
            : this.moveSpeed

        this.setVelocityX(horizontalAxis * speed)

        if (horizontalAxis !== 0) {
            this.setFlipX(horizontalAxis < 0)
        }
    }

    jump(): void {
        if (this.crouching || !this.body) {
            return
        }

        const grounded =
            this.body.blocked.down ||
            this.body.touching.down

        if (grounded) {
            this.setVelocityY(-this.jumpSpeed)
            playSfx(this.scene, 'jump')
        }
    }

    setCrouching(value: boolean): void {
        this.crouching = value
    }

    isCrouching(): boolean {
        return this.crouching
    }
}
