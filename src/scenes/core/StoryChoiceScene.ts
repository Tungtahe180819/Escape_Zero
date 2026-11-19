import Phaser from 'phaser'

interface StoryChoiceData {
    returnScene: string
    onSelect: (id: string) => string | null
    onSuccess: () => void
}

export class StoryChoiceScene extends Phaser.Scene {
    constructor() { super('StoryChoiceScene') }

    create(data: StoryChoiceData): void {
        if (!data || data.returnScene !== 'Level01Scene' || typeof data.onSelect !== 'function' || typeof data.onSuccess !== 'function') {
            this.scene.stop()
            return
        }
        let closing = false
        const readyAt = this.time.now + 180
        this.add.rectangle(240, 135, 480, 270, 0x0b1220, 0.98).setInteractive()
        this.add.text(20, 18, 'NGƯỜI GHI SỔ · ĐÂU LÀ MÂU THUẪN?', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '12px', color: '#e5e7eb', wordWrap: { width: 440 },
        })
        this.add.text(20, 58, 'Đối chiếu lời bà với hai tài liệu và lời Tuấn.\nEsc để tìm thêm thông tin; J để xem nhật ký.', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#94a3b8',
        })
        const feedback = this.add.text(20, 218, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#fca5a5', wordWrap: { width: 440 },
        })
        const close = (): void => {
            if (closing) return
            closing = true
            this.scene.get(data.returnScene).input.keyboard?.resetKeys()
            this.scene.resume(data.returnScene)
            this.scene.stop()
        }
        const options = [
            { id: 'identity-only', text: '1 · Tuấn 19 tuổi nên bà nhất định nói dối' },
            { id: 'ledger-order', text: '2 · HS19 bị gạch ở sổ, vẫn có trong lệnh chuyển' },
            { id: 'no-record', text: '3 · Không thấy tên tức là chưa từng có hồ sơ' },
        ]
        const select = (index: number): void => {
            if (closing || this.time.now < readyAt) return
            const error = data.onSelect(options[index].id)
            if (error) feedback.setText(error)
            else { data.onSuccess(); close() }
        }
        options.forEach((option, index) => {
            this.add.text(24, 105 + index * 34, option.text, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '11px', color: '#86efac',
                backgroundColor: '#263444', padding: { x: 8, y: 7 },
            }).setInteractive({ useHandCursor: true }).on('pointerdown', () => select(index))
        })
        this.add.text(385, 252, '[ Đóng · Esc ]', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#93c5fd' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', close)
        const keydown = (event: KeyboardEvent): void => {
            if (event.repeat) return
            if (/^[1-3]$/.test(event.key)) select(Number(event.key) - 1)
            else if (event.key === 'Escape') close()
        }
        this.input.keyboard?.on('keydown', keydown)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off('keydown', keydown))
    }
}
