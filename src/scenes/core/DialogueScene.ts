import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import type { DialogueData } from '../../systems/story/DialogueTypes'

export class DialogueScene extends Phaser.Scene {
    constructor() {
        super('DialogueScene')
    }

    create(data: Partial<DialogueData> = {}): void {
        const { returnScene, lines, onComplete } = data

        if (
            !returnScene ||
            !['Level01Scene', 'Level02Scene', 'Level03Scene'].includes(returnScene) ||
            !lines?.length
        ) {
            this.scene.stop()
            return
        }

        playSfx(this, 'dialogue')
        let index = 0
        let closing = false
        const inputReadyAt = this.time.now + 180
        const { width, height } = this.scale

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.25)
            .setInteractive()
        this.add.rectangle(width / 2, height - 66, width - 16, 124, 0x111827, 0.97)
            .setStrokeStyle(1, 0x64748b)

        const speaker = this.add.text(24, height - 118, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '12px', color: '#c4b5fd',
        })
        const text = this.add.text(24, height - 96, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '11px', color: '#e5e7eb',
            wordWrap: { width: width - 48 }, lineSpacing: 4,
        })
        const page = this.add.text(24, height - 25, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#9ca3af',
        })

        const render = (): void => {
            speaker.setText(lines[index].speaker)
            text.setText(lines[index].text)
            page.setText(`${index + 1}/${lines.length} · ${index + 1 === lines.length ? 'Đóng' : 'Tiếp →'}`)
        }

        const finish = (event?: KeyboardEvent): void => {
            if (closing || event?.repeat) {
                return
            }

            closing = true
            onComplete?.()
            const parent = this.scene.get(returnScene)
            parent.input.keyboard?.resetKeys()
            this.scene.resume(returnScene)
            this.scene.stop()
        }

        const advance = (event?: KeyboardEvent): void => {
            if (closing || event?.repeat || this.time.now < inputReadyAt) {
                return
            }

            if (index + 1 >= lines.length) {
                finish()
            } else {
                index++
                render()
            }
        }

        this.add.text(width - 24, height - 25, '[ Bỏ qua — Esc ]', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#86efac',
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => finish())

        // Clicking the dialogue body is an alternative to keyboard advance.
        text.setInteractive({ useHandCursor: true }).on('pointerdown', () => advance())
        page.setPadding(0, 4).setInteractive({ useHandCursor: true }).on('pointerdown', () => advance())

        for (const key of ['E', 'SPACE', 'ENTER']) {
            this.input.keyboard?.on(`keydown-${key}`, advance)
        }
        this.input.keyboard?.on('keydown-ESC', finish)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            for (const key of ['E', 'SPACE', 'ENTER']) {
                this.input.keyboard?.off(`keydown-${key}`, advance)
            }
            this.input.keyboard?.off('keydown-ESC', finish)
        })

        render()
    }
}
