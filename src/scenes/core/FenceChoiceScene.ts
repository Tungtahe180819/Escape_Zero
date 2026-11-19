import Phaser from 'phaser'

interface FenceChoiceData {
    title: string
    options: string[]
    onSelect: (index: number) => void
}

export class FenceChoiceScene extends Phaser.Scene {
    constructor() { super('FenceChoiceScene') }

    create(data: FenceChoiceData): void {
        const readyAt = this.time.now + 180
        let closed = false
        const close = (answer?: number): void => {
            if (closed || this.time.now < readyAt) return
            closed = true
            if (answer !== undefined) data.onSelect(answer)
            this.scene.get('Level03Scene').input.keyboard?.resetKeys()
            this.scene.resume('Level03Scene')
            this.scene.stop()
        }
        this.add.rectangle(240, 135, 480, 270, 0x080d14, 0.96).setInteractive()
        this.add.text(20, 24, data.title, {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '12px', color: '#e5e7eb', wordWrap: { width: 440 },
        })
        data.options.forEach((option, i) => {
            this.add.text(24, 94 + i * 40, `${i + 1}. ${option}`, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '11px', color: '#86efac', wordWrap: { width: 430 },
            }).setInteractive({ useHandCursor: true }).on('pointerdown', () => close(i))
        })
        this.add.text(24, 244, '1 / 2 / 3: Chọn | Esc: Quay lại', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#94a3b8',
        })
        const keydown = (event: KeyboardEvent): void => {
            if (event.repeat) return
            if (event.key === 'Escape') close()
            const index = Number(event.key) - 1
            if (/^[1-3]$/.test(event.key) && index < data.options.length) close(index)
        }
        this.input.keyboard?.on('keydown', keydown)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off('keydown', keydown))
    }
}
