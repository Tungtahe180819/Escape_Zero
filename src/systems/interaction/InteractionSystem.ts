import Phaser from 'phaser'
import type { Interactable } from './Interactable'
import { showGameplayCue } from '../audio/GameplayCue'

export class InteractionSystem {
    private readonly targets: Interactable[]
    private readonly promptText: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, targets: Interactable[]) {
        this.targets = targets

        this.promptText = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height - 10,
            '',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '10px',
                color: '#fef08a',
                backgroundColor: '#111827',
                padding: { x: 4, y: 3 },
            },
        )
            .setOrigin(0.5, 1)
            .setScrollFactor(0)
            .setDepth(20)
            .setVisible(false)
    }

    update(x: number, y: number, pressed: boolean): void {
        let nearest: Interactable | undefined
        let nearestDistance = Infinity

        for (const target of this.targets) {
            if (!target.isAvailable()) {
                continue
            }

            const distance = Phaser.Math.Distance.Between(
                x, y, target.x, target.y,
            )

            if (distance <= target.radius && distance < nearestDistance) {
                nearest = target
                nearestDistance = distance
            }
        }

        if (!nearest) {
            this.promptText.setVisible(false)
            return
        }

        this.promptText
            .setText(`[E] ${nearest.prompt}`)
            .setVisible(true)

        if (pressed) {
            showGameplayCue(this.promptText.scene, 'item', nearest.prompt)
            nearest.interact()
        }
    }

    destroy(): void {
        this.promptText.destroy()
    }
}
