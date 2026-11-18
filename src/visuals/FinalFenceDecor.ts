import Phaser from 'phaser'
import { level03X } from '../config/level03Layout'

export function labelOutdoorAreas(scene: Phaser.Scene): void {
    for (const [x, title, subtitle] of [
        [240, 'KHO TIẾP TẾ', 'Bản đồ • Người khuân hàng'],
        [800, 'SÂN TUẦN TRA', 'Cột điện • Biển mương • Bàn đối chiếu'],
        [1456, 'TRẠM ĐIỆN', 'Tủ nhánh • Cầu dao'],
    ] as const) {
        scene.add.text(level03X(x), 178, title, {
            fontFamily: 'monospace', fontSize: '10px', color: '#9da995',
            stroke: '#101b23', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(0)
        scene.add.text(level03X(x), 193, subtitle, {
            fontFamily: 'monospace', fontSize: '7px', color: '#76877e',
            stroke: '#101b23', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(0)
    }
}

/** Each interaction has its own silhouette; names appear only in interaction range. */
export function drawFenceClue(scene: Phaser.Scene, x: number, id: string): void {
    const g = scene.add.graphics().setDepth(0)
    const rect = (dx: number, y: number, w: number, h: number, color: number): void => {
        g.fillStyle(color).fillRect(x + dx, y, w, h)
    }
    if (id === 'porter') return
    if (id === 'drainEntry' || id === 'drainExit') {
        rect(-13, 284, 26, 4, 0x29373b)
        for (let i = -10; i <= 10; i += 5) rect(i, 284, 2, 3, 0x7b8985)
    } else if (id === 'bag') {
        rect(-7, 276, 14, 11, 0x867356)
        rect(-5, 273, 10, 4, 0xa5906b)
        rect(-2, 273, 3, 14, 0x514735)
        rect(1, 278, 5, 2, 0xc4ad7f)
    } else if (id === 'pole') {
        rect(-3, 204, 6, 84, 0x697873)
        rect(-5, 201, 10, 6, 0x95a39b)
        rect(-4, 238, 8, 3, 0xe0ded0)
        rect(-4, 244, 8, 3, 0xe0ded0)
        rect(4, 251, 9, 3, 0xa9684e)
        g.fillStyle(0xa9684e).fillTriangle(x + 13, 248, x + 19, 252, x + 13, 256)
        scene.add.text(x - 2, 220, 'B', { fontFamily: 'monospace', fontSize: '9px', color: '#ece7cf' }).setOrigin(0.5)
    } else if (id === 'bridgeLever') {
        rect(-8, 279, 16, 9, 0x4c5652)
        rect(-3, 264, 6, 17, 0x75827a)
        g.lineStyle(3, 0xb4a37f).lineBetween(x, 270, x + 7, 256)
        rect(3, 253, 10, 4, 0xd0b97e)
    } else if (id === 'power' || id === 'breaker' || id === 'motor') {
        rect(-14, 247, 28, 40, 0x323e42)
        rect(-12, 249, 24, 34, 0x65716b)
        rect(-10, 251, 20, 2, 0x98a39a)
        if (id === 'motor') {
            rect(-8, 258, 16, 14, 0x303e3b)
            g.lineStyle(1, 0xb2bca2).strokeCircle(x, 265, 5)
            rect(-1, 261, 2, 8, 0xc6b778)
            rect(-6, 277, 12, 3, 0xa29566)
        } else if (id === 'breaker') {
            rect(-5, 258, 10, 18, 0x222d30)
            rect(-2, 258, 4, 14, 0x9f8960)
            rect(-6, 256, 12, 5, 0xb1a581)
        } else {
            for (let i = -7; i <= 7; i += 7) {
                rect(i, 258, 4, 12, 0x273438)
                rect(i, 258, 4, 3, 0xc5b47a)
            }
            rect(-8, 278, 16, 2, 0x313d3d)
        }
    } else if (id === 'drain') {
        rect(-2, 240, 4, 48, 0x5f6353)
        rect(-19, 237, 38, 18, 0x76806a)
        rect(-16, 240, 32, 12, 0x3c4b43)
        rect(-11, 245, 19, 2, 0xc0c6a6)
        g.fillStyle(0xc0c6a6).fillTriangle(x + 8, 242, x + 14, 246, x + 8, 250)
    } else if (id === 'fence') {
        rect(-14, 266, 28, 4, 0x6f6654)
        rect(-12, 270, 3, 18, 0x514d43)
        rect(9, 270, 3, 18, 0x514d43)
        rect(-9, 258, 18, 8, 0xb3aa89)
        rect(-6, 260, 8, 1, 0x625e50)
        rect(3, 260, 3, 4, 0x966644)
    } else {
        // Map on a wooden stand vs maintenance diagram on a steel noticeboard.
        const diagram = id === 'diagram'
        rect(-2, 264, 4, 24, diagram ? 0x697975 : 0x675944)
        rect(-15, 242, 30, 24, diagram ? 0x566d6e : 0x76654b)
        rect(-12, 245, 24, 18, diagram ? 0xa3b6ac : 0xc5b890)
        if (diagram) {
            for (let i = -7; i <= 7; i += 7) {
                rect(i, 249, 1, 10, 0x4c6864)
                rect(i - 2, 253, 5, 3, 0x4c6864)
            }
        } else {
            rect(-8, 255, 10, 1, 0x6d785e)
            rect(1, 249, 1, 7, 0x6d785e)
            rect(1, 249, 8, 1, 0x6d785e)
            rect(7, 248, 3, 3, 0x925b44)
        }
    }
}

export function drawYardCrate(scene: Phaser.Scene, x: number): Phaser.GameObjects.Graphics {
    const g = scene.add.graphics().setDepth(3)
    g.fillStyle(0x453b30).fillRect(x - 24, 256, 48, 32)
    g.fillStyle(0x716147).fillRect(x - 22, 258, 44, 28)
    g.lineStyle(1, 0x4e4434)
    for (let y = 264; y < 286; y += 7) g.lineBetween(x - 22, y, x + 22, y)
    g.fillStyle(0x95805b).fillRect(x - 23, 257, 4, 30).fillRect(x + 19, 257, 4, 30)
    g.lineStyle(3, 0x95805b).lineBetween(x - 19, 283, x + 19, 260)
    g.fillStyle(0xb1a07b).fillRect(x - 24, 255, 48, 3)
    return g
}

export function drawDrainPit(scene: Phaser.Scene, x: number, y: number, width: number, height: number): void {
    const g = scene.add.graphics().setDepth(0)
    g.fillStyle(0x111d24).fillRect(x, y, width, height)
    g.fillStyle(0x23383d).fillRect(x, y + 4, width, height - 4)
    for (let i = 4; i < width - 6; i += 19) {
        g.fillStyle(0x425659).fillRect(x + i, y + 7 + (i % 3), 8, 1)
    }
    g.fillStyle(0x5e6256).fillRect(x - 3, 288, 3, y + height - 288)
        .fillRect(x + width, 288, 3, y + height - 288)
}

/** Skin only: physics and platform endpoint logic stay in MovingPlatform. */
export function dressMovingPlatform(scene: Phaser.Scene, platform: Phaser.GameObjects.Rectangle): void {
    platform.setFillStyle(0x514a3d)
    const deck = scene.add.graphics().setDepth(1)
    const render = (): void => {
        const { x, y, width: w, height: h } = platform
        deck.clear().fillStyle(0xa5946c).fillRect(x - w / 2, y - h / 2, w, 2)
        deck.lineStyle(1, 0x2b3030)
        for (let dx = 5; dx < w; dx += 7) deck.lineBetween(x - w / 2 + dx, y - h / 2 + 2, x - w / 2 + dx, y + h / 2)
        deck.fillStyle(0x85918a).fillRect(x - w / 2, y - h / 2, 3, h)
            .fillRect(x + w / 2 - 3, y - h / 2, 3, h)
    }
    render()
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, render)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, render))
}
