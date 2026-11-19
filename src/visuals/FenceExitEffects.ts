import Phaser from 'phaser'
import { playSfx } from '../systems/audio/AudioSystem'

/** Powered gate is visible from the breaker; the final opening marks the real finish. */
export class FenceExitEffects {
    private readonly scene: Phaser.Scene
    private readonly gateX: number
    private readonly finish: Phaser.Geom.Rectangle
    private readonly art: Phaser.GameObjects.Graphics
    private readonly gateLabel: Phaser.GameObjects.Text
    private readonly exitLabel: Phaser.GameObjects.Text
    private off = false
    private elapsed = 0
    private discharge = 0
    private renderedState = ''

    constructor(scene: Phaser.Scene, gateX: number, finish: Phaser.Geom.Rectangle) {
        this.scene = scene
        this.gateX = gateX
        this.finish = finish
        this.art = scene.add.graphics().setDepth(1)
        this.gateLabel = scene.add.text(gateX, 206, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#e6c583',
            stroke: '#0b141b', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(4)
        this.exitLabel = scene.add.text(finish.centerX, finish.top - 25, 'KHE RÀO THOÁT HIỂM', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#cfb77f',
            stroke: '#0b141b', strokeThickness: 3,
        }).setOrigin(1, 0.5).setX(finish.right + 8).setDepth(4)
        this.update(0, false, false)
    }

    update(delta: number, powerOff: boolean, pursuitEscaped: boolean): void {
        const step = Number.isFinite(delta) ? Math.min(100, Math.max(0, delta)) : 0
        this.elapsed += step
        if (powerOff !== this.off) {
            if (powerOff) {
                playSfx(this.scene, 'interact')
                this.discharge = 350
            } else this.discharge = 0
            this.off = powerOff
        }
        this.discharge = Math.max(0, this.discharge - step)
        const visualState = `${powerOff}:${pursuitEscaped}:${powerOff ? Math.ceil(this.discharge / 35) : Math.floor(this.elapsed / 140) % 3}`
        if (visualState === this.renderedState) return
        this.renderedState = visualState
        const g = this.art.clear(), y = this.finish.bottom
        // Gateposts and insulators at the live boundary.
        g.fillStyle(0x66756e).fillRect(this.gateX - 20, y - 68, 4, 68)
            .fillRect(this.gateX + 16, y - 68, 4, 68)
        g.fillStyle(0x9ca697).fillRect(this.gateX - 22, y - 70, 8, 4)
            .fillRect(this.gateX + 14, y - 70, 8, 4)
        const lamp = powerOff ? 0x46534d : 0xf2bf62
        if (!powerOff) g.fillStyle(lamp, 0.12).fillCircle(this.gateX - 18, y - 62, 10)
        g.fillStyle(lamp).fillCircle(this.gateX - 18, y - 62, 2)
        if (!powerOff) {
            g.lineStyle(1, 0x9b9d7a)
            for (let x = this.gateX - 14; x <= this.gateX + 14; x += 7) g.lineBetween(x, y - 60, x, y)
            for (let dy = 12; dy <= 60; dy += 12) g.lineBetween(this.gateX - 16, y - dy, this.gateX + 16, y - dy)
            if (Math.floor(this.elapsed / 140) % 3 !== 0) {
                g.lineStyle(1, 0xe9d78c)
                for (const x of [this.gateX - 12, this.finish.left - 4, this.finish.right + 4]) {
                    g.lineBetween(x, y - 49, x + 5, y - 39)
                        .lineBetween(x + 5, y - 39, x - 2, y - 32)
                        .lineBetween(x - 2, y - 32, x + 4, y - 21)
                }
            }
        } else {
            // De-energized mesh slides to the side; the walking opening is empty.
            g.lineStyle(1, 0x586862)
            for (let dy = 12; dy <= 60; dy += 12) g.lineBetween(this.gateX + 20, y - dy, this.gateX + 34, y - dy)
            if (this.discharge > 0) {
                g.lineStyle(1, 0xc9e3cb, this.discharge / 350)
                g.lineBetween(this.gateX - 25, y - 64, this.gateX - 32, y - 69)
                    .lineBetween(this.gateX - 23, y - 58, this.gateX - 31, y - 54)
            }
        }
        this.gateLabel.setText(powerOff ? 'ĐÃ NGẮT ĐIỆN — ĐI QUA →' : 'HÀNG RÀO CÒN ĐIỆN')
            .setColor(powerOff ? '#86c5a1' : '#e6c583')

        // Broken fence frame and footprints emphasize the exact finish bounds.
        g.fillStyle(0x101c22, 0.96).fillRect(this.finish.left, this.finish.top, this.finish.width, this.finish.height)
        if (!powerOff) {
            g.lineStyle(1, 0x69715d)
            for (let x = this.finish.left + 4; x < this.finish.right; x += 8) g.lineBetween(x, this.finish.top, x, y)
        }
        g.fillStyle(0x69756a).fillRect(this.finish.left - 5, this.finish.top, 4, this.finish.height)
            .fillRect(this.finish.right + 1, this.finish.top, 4, this.finish.height)
        g.lineStyle(2, 0x9a8c67).lineBetween(this.finish.left - 2, this.finish.top + 2, this.finish.left + 12, this.finish.top - 5)
            .lineBetween(this.finish.right - 12, this.finish.top - 5, this.finish.right + 3, this.finish.top + 2)
        const ready = powerOff && pursuitEscaped
        g.fillStyle(ready ? 0x86c5a1 : 0xa99973, ready ? 0.8 : 0.35)
        for (let x = this.finish.left + 8; x < this.finish.right - 4; x += 13) g.fillRect(x, y - 2, 6, 2)
        g.fillTriangle(this.finish.centerX - 4, this.finish.top - 12, this.finish.centerX + 4, this.finish.top - 12,
            this.finish.centerX, this.finish.top - 6)
        this.exitLabel.setText(ready ? 'LỐI THOÁT — ĐI VÀO ĐÂY ↓' : 'KHE RÀO THOÁT HIỂM ↓')
            .setColor(ready ? '#a5e0b5' : '#cfb77f')
    }
}
