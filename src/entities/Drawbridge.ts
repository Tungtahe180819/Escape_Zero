import Phaser from 'phaser'

/** A lowering deck. Its static walkable body is enabled only when fully horizontal. */
export class Drawbridge {
    readonly surface: Phaser.GameObjects.Rectangle
    private readonly art: Phaser.GameObjects.Graphics
    private readonly left: number
    private readonly right: number
    private readonly groundY: number
    private renderedProgress = NaN

    constructor(scene: Phaser.Scene, left: number, right: number, groundY: number) {
        if (!Number.isFinite(left + right + groundY) || right <= left) throw new Error('Invalid drawbridge span')
        this.left = left
        this.right = right
        this.groundY = groundY
        this.surface = scene.add.rectangle((left + right) / 2, groundY + 4, right - left + 4, 8, 0x000000, 0)
        scene.physics.add.existing(this.surface, true)
        this.art = scene.add.graphics().setDepth(1)
        this.setProgress(0)
    }

    setProgress(progress: number): void {
        const p = Number.isFinite(progress) ? Phaser.Math.Clamp(progress, 0, 1) : 0
        if (p === this.renderedProgress) return
        this.renderedProgress = p
        const body = this.surface.body as Phaser.Physics.Arcade.StaticBody
        body.enable = p === 1
        const angle = -(1 - p) * Math.PI / 2
        const length = this.right - this.left
        const point = (along: number, down = 0): { x: number; y: number } => ({
            x: this.left + Math.cos(angle) * along - Math.sin(angle) * down,
            y: this.groundY + Math.sin(angle) * along + Math.cos(angle) * down,
        })
        const g = this.art.clear()
        g.fillStyle(0x66543b).fillPoints([point(0), point(length), point(length, 7), point(0, 7)], true)
        g.lineStyle(2, 0xb09c70).lineBetween(point(0).x, point(0).y, point(length).x, point(length).y)
        g.lineStyle(1, 0x342f28)
        for (let x = 8; x < length; x += 10) {
            const a = point(x), b = point(x, 7)
            g.lineBetween(a.x, a.y, b.x, b.y)
        }
        // Steel frame and chain remain scenery, never invisible collision walls.
        g.fillStyle(0x536261).fillRect(this.left - 7, this.groundY - 43, 5, 43)
        g.fillStyle(0x81908a).fillRect(this.left - 9, this.groundY - 46, 9, 5)
        const tip = point(length * 0.8)
        g.lineStyle(1, 0x88918a).lineBetween(this.left - 4, this.groundY - 42, tip.x, tip.y)
        g.fillStyle(0x89948a).fillCircle(this.left, this.groundY + 2, 4)
        g.fillStyle(p === 1 ? 0x86c5a1 : 0xbca36c).fillRect(this.left - 7, this.groundY - 35, 3, 3)
    }
}
