import Phaser from 'phaser'
import { GuardStateMachine } from '../systems/stealth/GuardStateMachine'
import { guardTouchesTarget } from '../systems/stealth/GuardContact'
import { CHARACTER_SCALE } from '../config/characterConfig'
import type { GuardTiming } from '../systems/stealth/GuardStateMachine'

export interface GuardConfig extends GuardTiming {
    spawnX: number
    spawnY: number
    leftX: number
    rightX: number
    patrolSpeed: number
    chaseSpeed: number
    visionRange: number
    visionHalfAngle: number
    crouchRangeMultiplier: number
    closeAwarenessRange: number
}

export class Guard extends Phaser.Physics.Arcade.Sprite {
    private readonly config: GuardConfig
    private readonly brain: GuardStateMachine
    private readonly cone: Phaser.GameObjects.Graphics
    private readonly label: Phaser.GameObjects.Text
    private lastSeenX: number
    private lostSightMs = 0

    private facing = 1
    private waypointX: number
    private lineOfSightTest: (
        startX: number,
        startY: number,
        endX: number,
        endY: number,
    ) => boolean = () => true

    constructor(scene: Phaser.Scene, config: GuardConfig) {
        super(scene, config.spawnX, config.spawnY, 'guard', 0)

        this.config = { ...config }
        this.lastSeenX = config.spawnX
        this.waypointX = config.rightX
        this.brain = new GuardStateMachine(config)

        scene.add.existing(this)
        this.setScale(CHARACTER_SCALE)
        this.setOrigin(0.5, 1 - 12 / (48 * CHARACTER_SCALE))

        scene.physics.add.existing(this)
        const sourceBodyWidth = 16 / CHARACTER_SCALE
        const sourceBodyHeight = 24 / CHARACTER_SCALE
        this.setBodySize(sourceBodyWidth, sourceBodyHeight, false)
        this.setOffset((32 - sourceBodyWidth) / 2, 48 - sourceBodyHeight)

        this.setCollideWorldBounds(true)
        this.setDepth(2)
        this.play('guard-idle')

        this.cone = scene.add.graphics().setDepth(1)
        this.label = scene.add.text(0, 0, '', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e5e7eb',
            backgroundColor: '#111827',
        }).setOrigin(0.5, 1).setDepth(3)
    }

    setLineOfSightTest(
        test: (
            startX: number,
            startY: number,
            endX: number,
            endY: number,
        ) => boolean,
    ): void {
        this.lineOfSightTest = test
    }

    updateAI(
        delta: number,
        targetX: number,
        targetY: number,
        crouching = false,
        hidden = false,
        reportedByCamera = false,
    ): void {
        const rangeMultiplier = crouching
            ? this.config.crouchRangeMultiplier
            : 1

        const visible = !hidden && (reportedByCamera || this.canSee(
            targetX, targetY, rangeMultiplier,
        ))

        const stepMs = Number.isFinite(delta) ? Math.min(Math.max(delta, 0), 100) : 0
        if (visible) {
            this.lastSeenX = targetX
            this.lostSightMs = 0
        } else {
            this.lostSightMs += stepMs
        }

        // Follow the last observed position, never an invisible player's live X.
        const pursuingLastSeen = this.brain.state === 'CHASE'
            && !visible
            && Math.abs(this.lastSeenX - this.x) > 4
            && this.lostSightMs < this.config.searchMs
        this.brain.setTargetVisible(visible || pursuingLastSeen)
        this.brain.update(stepMs)

        switch (this.brain.state) {
            case 'PATROL':
                this.patrol(stepMs)
                break

            case 'CHASE':
                this.walkToward(this.lastSeenX, this.config.chaseSpeed)
                break

            case 'SUSPICIOUS':
            case 'SEARCH':
                this.setVelocityX(0)
                break
        }

        const moving = this.body !== null
            && Math.abs(this.body.velocity.x) > 1

        const animation = !moving
            ? 'guard-idle'
            : this.brain.state === 'CHASE'
                ? 'guard-run'
                : 'guard-walk'

        this.play(animation, true)

        this.drawVision(visible)
        this.label
            .setPosition(this.x, this.y + 12 - 48 * CHARACTER_SCALE - 3)
            .setText(`${this.brain.state} | ${reportedByCamera && !hidden ? 'RADIO' : visible ? 'SEEN' : 'CLEAR'}`)
    }

    resetGuard(): void {
        this.brain.reset()
        this.facing = 1
        this.waypointX = this.config.rightX
        this.lastSeenX = this.config.spawnX
        this.lostSightMs = 0

        this.body?.reset(this.config.spawnX, this.config.spawnY)
        this.setVelocity(0, 0)
        this.setFlipX(false)

        this.play('guard-idle', true)
    }

    private patrol(delta: number): void {
        const tolerance = Math.max(
            2,
            this.config.patrolSpeed * delta / 1000,
        )

        if (Math.abs(this.waypointX - this.x) <= tolerance) {
            this.waypointX = this.waypointX === this.config.rightX
                ? this.config.leftX
                : this.config.rightX
        }

        this.walkToward(this.waypointX, this.config.patrolSpeed)
    }

    private walkToward(targetX: number, speed: number): void {
        const difference = targetX - this.x

        if (Math.abs(difference) < 2) {
            this.setVelocityX(0)
            return
        }

        this.facing = difference > 0 ? 1 : -1
        this.setFlipX(this.facing < 0)
        this.setVelocityX(this.facing * speed)
    }

    private canSee(
        targetX: number,
        targetY: number,
        rangeMultiplier: number,
    ): boolean {
        const dx = targetX - this.x
        const dy = targetY - (this.y - 6)
        const distance = Math.hypot(dx, dy)

        if (distance > this.config.visionRange * rangeMultiplier) {
            return false
        }
        const facingAngle = this.facing > 0 ? 0 : Math.PI
        const targetAngle = Math.atan2(dy, dx)
        const difference = Phaser.Math.Angle.Wrap(
            targetAngle - facingAngle,
        )

        const insideCone = Math.abs(difference) <= Phaser.Math.DegToRad(
            this.config.visionHalfAngle,
        )

        const insideCloseRange = distance <= this.config.closeAwarenessRange

        if (!insideCone && !insideCloseRange) {
            return false
        }

        return this.lineOfSightTest(
            this.x,
            this.y - 6,
            targetX,
            targetY,
        )
    }

    private drawVision(visible: boolean): void {
        const angle = this.facing > 0 ? 0 : Math.PI
        const halfAngle = Phaser.Math.DegToRad(
            this.config.visionHalfAngle,
        )
        const start = angle - halfAngle
        const end = angle + halfAngle
        const x = this.x
        const y = this.y - 6
        const range = this.config.visionRange

        this.cone.clear()
        this.cone.fillStyle(visible ? 0xef4444 : 0xfacc15, 0.15)
        this.cone.beginPath()
        this.cone.moveTo(x, y)
        this.cone.lineTo(
            x + Math.cos(start) * range,
            y + Math.sin(start) * range,
        )
        this.cone.arc(x, y, range, start, end, false)
        this.cone.closePath()
        this.cone.fillPath()
    }

    getDetectionLevel(): number {
        return this.brain.state === 'CHASE' ? 1
            : this.brain.state === 'SEARCH' || this.brain.state === 'SUSPICIOUS' ? 0.5 : 0
    }

    getAlertState(): string {
        return this.brain.state
    }

    hasCapturedTarget(target: Phaser.Physics.Arcade.Sprite, hidden = false): boolean {
        // An unaware patrol passes a concealed player. A guard already alerted
        // can still catch them on contact while chasing/searching the last sighting.
        if (hidden && this.brain.state === 'PATROL') return false
        return guardTouchesTarget(this.body, target.body)
    }
}
