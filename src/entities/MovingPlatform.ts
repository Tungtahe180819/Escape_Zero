import Phaser from 'phaser'

export interface MovingPlatformConfig {
    x: number
    y: number
    width: number
    height: number
    endX: number
    speed: number
}

export class MovingPlatform extends Phaser.GameObjects.Rectangle {
    private readonly arcadeBody: Phaser.Physics.Arcade.Body
    private readonly config: MovingPlatformConfig
    private direction = 1

    constructor(scene: Phaser.Scene, config: MovingPlatformConfig) {
        super(
            scene,
            config.x,
            config.y,
            config.width,
            config.height,
            0x22d3ee,
        )

        if (
            config.endX <= config.x
            || config.speed <= 0
            || config.width <= 0
            || config.height <= 0
        ) {
            throw new Error('Invalid moving platform configuration')
        }

        this.config = { ...config }

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setDepth(1)

        this.arcadeBody = this.body as Phaser.Physics.Arcade.Body
        this.arcadeBody.allowGravity = false
        this.arcadeBody.immovable = true

        // Transfer horizontal platform movement to a standing player.
        this.arcadeBody.friction.set(1, 0)

        // Land on top; allow passage from below and from the sides.
        this.arcadeBody.checkCollision.down = false
        this.arcadeBody.checkCollision.left = false
        this.arcadeBody.checkCollision.right = false

        this.arcadeBody.setVelocityX(config.speed)

        const world = scene.physics.world

        world.on(
            Phaser.Physics.Arcade.Events.WORLD_STEP,
            this.turnAtEdges,
            this,
        )

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            world.off(
                Phaser.Physics.Arcade.Events.WORLD_STEP,
                this.turnAtEdges,
                this,
            )
        })
    }

    resetPlatform(): void {
        this.direction = 1
        this.arcadeBody.reset(this.config.x, this.config.y)
        this.arcadeBody.setVelocity(0, 0)
        this.arcadeBody.setVelocityX(this.config.speed)
    }

    private turnAtEdges(): void {
        const x = this.arcadeBody.center.x

        if (this.direction > 0 && x >= this.config.endX) {
            this.direction = -1
        } else if (this.direction < 0 && x <= this.config.x) {
            this.direction = 1
        }

        this.arcadeBody.setVelocityX(
            this.direction * this.config.speed,
        )
    }
}