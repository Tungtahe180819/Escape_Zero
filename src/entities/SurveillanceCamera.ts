import Phaser from 'phaser'
import { DetectionSystem } from '../systems/stealth/DetectionSystem'
import { DetectionMeter } from '../systems/stealth/DetectionMeter'

export interface SurveillanceCameraConfig {
    x: number
    y: number
    minAngle: number
    maxAngle: number
    cycleMs: number
    range: number
    halfAngle: number
    detectionGain: number
    detectionDecay: number
}

export class SurveillanceCamera extends Phaser.GameObjects.Rectangle {
    private readonly config: SurveillanceCameraConfig
    private readonly detection: DetectionSystem
    private readonly meter: DetectionMeter
    private readonly cone: Phaser.GameObjects.Graphics
    private readonly label: Phaser.GameObjects.Text

    private elapsedMs = 0
    private scanAngle: number
    private targetVisible = false

    constructor(
        scene: Phaser.Scene,
        config: SurveillanceCameraConfig,
        detection: DetectionSystem,
    ) {
        super(scene, config.x, config.y, 16, 8, 0x38bdf8)

        if (config.cycleMs <= 0 || config.minAngle >= config.maxAngle) {
            throw new Error('Invalid surveillance camera sweep configuration')
        }

        this.config = { ...config }
        this.detection = detection
        this.meter = new DetectionMeter(
            config.detectionGain,
            config.detectionDecay,
        )
        this.scanAngle = Phaser.Math.DegToRad(config.minAngle)

        scene.add.existing(this)
        this.setDepth(3)

        this.cone = scene.add.graphics().setDepth(1)
        this.label = scene.add.text(config.x, config.y - 12, '', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e5e7eb',
            backgroundColor: '#111827',
        }).setOrigin(0.5, 1).setDepth(3)
    }

    updateScan(
        delta: number,
        targetX: number,
        targetY: number,
        hidden: boolean,
    ): void {
        const step = Number.isFinite(delta)
            ? Phaser.Math.Clamp(delta, 0, 100)
            : 0

        this.elapsedMs = (this.elapsedMs + step) % this.config.cycleMs

        const phase = this.elapsedMs / this.config.cycleMs
        const sweep = (1 - Math.cos(phase * Math.PI * 2)) / 2

        this.scanAngle = Phaser.Math.DegToRad(
            Phaser.Math.Linear(
                this.config.minAngle,
                this.config.maxAngle,
                sweep,
            ),
        )

        const dx = targetX - this.x
        const dy = targetY - this.y
        const distance = Math.hypot(dx, dy)

        const difference = Phaser.Math.Angle.Wrap(
            Math.atan2(dy, dx) - this.scanAngle,
        )

        const visible = !hidden
            && distance <= this.config.range
            && Math.abs(difference) <= Phaser.Math.DegToRad(
                this.config.halfAngle,
            )
            && this.detection.hasClearLine(
                this.x, this.y, targetX, targetY,
            )

        this.targetVisible = visible
        this.meter.update(visible, step)
        this.setRotation(this.scanAngle)

        const start = this.scanAngle - Phaser.Math.DegToRad(
            this.config.halfAngle,
        )
        const end = this.scanAngle + Phaser.Math.DegToRad(
            this.config.halfAngle,
        )

        this.cone.clear()
        this.cone.fillStyle(visible ? 0xef4444 : 0x38bdf8, 0.15)
        this.cone.beginPath()
        this.cone.moveTo(this.x, this.y)
        this.cone.lineTo(
            this.x + Math.cos(start) * this.config.range,
            this.y + Math.sin(start) * this.config.range,
        )
        this.cone.arc(
            this.x, this.y, this.config.range, start, end, false,
        )
        this.cone.closePath()
        this.cone.fillPath()

        this.label.setText(
            `CAM ${visible ? 'SEEN' : 'CLEAR'} ${
                visible ? '| BÁO LÍNH' : ''
            }`,
        )
    }

    getDetectionLevel(): number {
        return this.targetVisible ? 1 : 0
    }

    isTargetVisible(): boolean {
        return this.targetVisible
    }

    resetCamera(): void {
        this.elapsedMs = 0
        this.scanAngle = Phaser.Math.DegToRad(this.config.minAngle)
        this.meter.reset()
        this.targetVisible = false
    }
}
