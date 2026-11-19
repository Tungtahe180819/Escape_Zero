import Phaser from 'phaser'
import type { Interactable } from '../interaction/Interactable'

export const CELL_STAIR_LINKS = [
    { from: 'stairs-01-bottom', to: 'stairs-01-middle', label: 'Lên tầng 2 · Khu trực' },
    { from: 'stairs-01-middle', to: 'stairs-01-bottom', label: 'Xuống tầng 1 · Buồng giam' },
    { from: 'stairs-02-middle', to: 'stairs-02-top', label: 'Lên tầng 3 · Điều khiển' },
    { from: 'stairs-02-top', to: 'stairs-02-middle', label: 'Xuống tầng 2 · Khu trực' },
] as const

export function createCellStairs(
    scene: Phaser.Scene,
    getPoint: (name: string) => { x: number; y: number },
    available: () => boolean,
    travel: (point: { x: number; y: number }, label: string) => void,
): Interactable[] {
    return CELL_STAIR_LINKS.map((link) => {
        const point = getPoint(link.from)
        const destination = getPoint(link.to)
        const door = scene.add.graphics().setDepth(0)
        door.fillStyle(0x75878b).fillRect(point.x - 15, point.y - 26, 30, 42)
        door.fillStyle(0x263740).fillRect(point.x - 12, point.y - 23, 24, 39)
        door.fillStyle(0x415a64).fillRect(point.x - 9, point.y - 20, 18, 14)
        door.fillStyle(0xbac8c5).fillRect(point.x + 4, point.y - 2, 6, 2)
        scene.add.text(point.x, point.y - 37, link.label, {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#93c5fd',
            stroke: '#080d14', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(1)
        return {
            id: link.from, ...point, radius: 28, prompt: link.label,
            isAvailable: available,
            interact: () => {
                if (available()) travel(destination, link.label)
            },
        }
    })
}
