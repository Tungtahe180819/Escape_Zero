import Phaser from 'phaser'
import { createCoverLabels } from './CoverIndicators'
import type { HidingState } from '../systems/stealth/HidingSystem'

export function createCorridorHidingPlaces(scene: Phaser.Scene, zones: readonly Phaser.Geom.Rectangle[]): (state: HidingState, alerted: boolean) => void {
    const names = ['Tủ đầu hành lang', 'Tủ phòng gác', 'Tủ cạnh hồ sơ A', 'Tủ dưới camera',
        'Tủ đầu khu máy', 'Tủ khu máy B', 'Tủ khu máy A', 'Tủ gần cửa kỹ thuật']
    for (const zone of zones) {
        const g = scene.add.graphics().setDepth(1)
        g.fillStyle(0x16262d).fillRect(zone.x, zone.y, zone.width, zone.height)
        g.fillStyle(0x53686d).fillRect(zone.x, zone.y, 7, zone.height)
            .fillRect(zone.right - 7, zone.y, 7, zone.height).fillRect(zone.x, zone.y, zone.width, 5)
        g.fillStyle(0x859590).fillRect(zone.x, zone.y, zone.width, 2)
        g.lineStyle(1, 0x33494e)
        for (let y = zone.y + 12; y < zone.bottom - 5; y += 9) g.lineBetween(zone.x + 2, y, zone.x + 6, y)
        g.fillStyle(0xa59d6f).fillRect(zone.x + 9, zone.y + 7, 9, 3)
    }
    return createCoverLabels(scene, zones, names)
}

export function createCorridorDecor(
    scene: Phaser.Scene,
    worldWidth: number,
    floorOffset = 0,
): void {
    const decor = scene.add.graphics().setDepth(-1).setPosition(0, floorOffset)

    // Cable tray running along the background wall.
    decor.fillStyle(0x101c23)
    decor.fillRect(16, 54, worldWidth - 32, 8)

    decor.fillStyle(0x354a55)
    decor.fillRect(16, 54, worldWidth - 32, 2)

    decor.fillStyle(0x263943)
    decor.fillRect(16, 61, worldWidth - 32, 1)

    // Mounting brackets.
    for (let x = 64; x < worldWidth - 16; x += 128) {
        decor.fillStyle(0x40535c)
        decor.fillRect(x, 52, 3, 12)

        decor.fillStyle(0x182831)
        decor.fillRect(x + 1, 55, 1, 6)
    }

    // Decorative ceiling lights, separate from surveillance cameras.
    for (let x = 160; x + 48 < worldWidth - 16; x += 320) {
        decor.fillStyle(0x15252e)
        decor.fillRect(x - 2, 77, 52, 10)

        decor.fillStyle(0x50616a)
        decor.fillRect(x, 78, 48, 6)

        decor.fillStyle(0xa5bdb9)
        decor.fillRect(x + 4, 80, 40, 2)

        // Dim reflected light on the wall only.
        decor.fillStyle(0x91b4ac, 0.04)
        decor.fillRect(x - 8, 88, 64, 24)
    }
}
