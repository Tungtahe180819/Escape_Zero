import Phaser from 'phaser'
import { createStoryNPC } from './StoryNPC'

/** Native geometric props; no physics bodies or hiding-zone behavior. */
export function createCellStoryDecor(
    scene: Phaser.Scene,
    lan: { x: number; y: number },
    bed: { x: number; y: number; width: number; height: number },
): void {
    const decor = scene.add.graphics().setDepth(0)

    // A barred opening into Lan's adjoining cell, not a walkable passage.
    decor.fillStyle(0x10151f)
    decor.fillRect(lan.x - 18, lan.y - 36, 36, 32)
    // Lan stands inside the adjoining cell, below the opening. The wall occludes
    // her lower body; never put her visible soles on the window sill.
    createStoryNPC(scene, 'lan', lan.x, lan.y + 8)
        .setCrop(0, 0, 32, 32).setDepth(0.5)
    const bars = scene.add.graphics().setDepth(1)
    bars.lineStyle(2, 0x58636d)
    bars.strokeRect(lan.x - 18, lan.y - 36, 36, 32)
    bars.fillStyle(0x687580)
    for (let x = lan.x - 12; x <= lan.x + 12; x += 8) {
        bars.fillRect(x, lan.y - 35, 2, 30)
    }

    scene.add.text(lan.x, lan.y - 48, 'Lan', {
        fontFamily: 'monospace', fontSize: '9px', color: '#c4b5fd',
        stroke: '#080d14', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1)

    // Bed frame and mattress are scenery; the key hangs outside the cell bars.
    decor.fillStyle(0x28323a)
    decor.fillRect(bed.x, bed.y, bed.width, 2)
    decor.fillRect(bed.x + 2, bed.y + 8, bed.width - 4, 3)
    decor.fillStyle(0x68716b)
    decor.fillRect(bed.x + 2, bed.y + 2, bed.width - 4, 6)
    decor.fillStyle(0x9a9b83)
    decor.fillRect(bed.x + 4, bed.y + 2, 12, 4)
    decor.fillStyle(0x59636b)
    decor.fillRect(bed.x + 3, bed.y + 11, 3, bed.height - 11)
    decor.fillRect(bed.x + bed.width - 6, bed.y + 11, 3, bed.height - 11)

    scene.add.text(bed.x + bed.width / 2, bed.y - 10, 'Giường cũ', {
        fontFamily: 'monospace', fontSize: '8px', color: '#cbd5e1',
        stroke: '#080d14', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1)
}
