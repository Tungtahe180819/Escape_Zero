import Phaser from 'phaser'
import { playSfx } from '../systems/audio/AudioSystem'

export class Player extends Phaser.Physics.Arcade.Sprite {
    private readonly moveSpeed = 120
    private readonly jumpSpeed = 250
    private crouching = false

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'minh', 0)

        scene.add.existing(this)

        // 32x48 artwork displayed at the original 16x24 size.
        this.setScale(0.5)

        scene.physics.add.existing(this)

        // Unscaled body dimensions; world size is 16x24.
        this.setBodySize(32, 48, false)
        this.setOffset(0, 0)
        this.setCollideWorldBounds(true)

        this.play('minh-idle')
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta)

        if (!this.body) {
            return
        }

        const grounded =
            this.body.blocked.down ||
            this.body.touching.down

        let animation: string

        if (!grounded) {
            animation = this.body.velocity.y < 0
                ? 'minh-jump'
                : 'minh-fall'
        } else if (this.crouching) {
            animation = 'minh-crouch'
        } else if (Math.abs(this.body.velocity.x) > 1) {
            animation = 'minh-walk'
        } else {
            animation = 'minh-idle'
        }

        this.play(animation, true)
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
