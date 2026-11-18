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
        const visual = scene.add.graphics().setDepth(-1)
        visual.fillStyle(0x14232e)
        visual.fillRect(point.x - 24, point.y - 52, 48, 64)
        visual.lineStyle(2, 0x718b94)
        for (let step = 0; step < 6; step++) {
            const x = point.x - 20 + step * 6
            const y = point.y + 10 - step * 8
            visual.lineBetween(x, y, x + 6, y)
            visual.lineBetween(x + 6, y, x + 6, y - 8)
        }
        scene.add.text(point.x, point.y - 66, link.label, {
            fontFamily: 'monospace', fontSize: '8px', color: '#93c5fd',
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
