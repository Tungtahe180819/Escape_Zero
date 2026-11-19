import Phaser from 'phaser'

interface CodeLockData {
    returnScene: string
    notes: string[]
    onSubmit: (code: string) => string | null
}

export class CodeLockScene extends Phaser.Scene {
    constructor() { super('CodeLockScene') }

    create(data: CodeLockData): void {
        if (!data || data.returnScene !== 'Level01Scene' || typeof data.onSubmit !== 'function') {
            this.scene.stop()
            return
        }
        let code = ''
        let closing = false
        const readyAt = this.time.now + 180
        this.add.rectangle(240, 135, 480, 270, 0x080d14, 0.98).setInteractive()
        this.add.text(16, 12, 'KHÓA CỔNG · KHU GIÁM SÁT', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '13px', color: '#e5e7eb' })
        this.add.text(16, 40, data.notes.join('\n\n'), {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#cbd5e1', wordWrap: { width: 250 }, lineSpacing: 3,
        })
        const display = this.add.text(370, 43, '_ _ _', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '22px', color: '#86efac' }).setOrigin(0.5)
        const feedback = this.add.text(16, 212, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#fca5a5', wordWrap: { width: 448 },
        })
        const render = (): void => { display.setText(code.padEnd(3, '_').split('').join(' ')) }
        const close = (): void => {
            if (closing) return
            closing = true
            this.scene.get(data.returnScene).input.keyboard?.resetKeys()
            this.scene.resume(data.returnScene)
            this.scene.stop()
        }
        const digit = (value: string): void => {
            if (closing || this.time.now < readyAt || code.length >= 3) return
            code += value
            feedback.setText('')
            render()
        }
        const erase = (): void => { code = code.slice(0, -1); render() }
        const submit = (): void => {
            if (closing || this.time.now < readyAt) return
            const error = data.onSubmit(code)
            if (error) feedback.setText(error)
            else close()
        }
        const button = (x: number, y: number, label: string, action: () => void): void => {
            this.add.text(x, y, label, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '13px', color: '#86efac',
                backgroundColor: '#263444', padding: { x: 9, y: 5 },
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', action)
        }
        for (let index = 0; index < 9; index++) {
            button(314 + index % 3 * 48, 85 + Math.floor(index / 3) * 31, String(index + 1), () => digit(String(index + 1)))
        }
        button(314, 178, '←', erase)
        button(362, 178, '0', () => digit('0'))
        button(410, 178, 'OK', submit)
        button(398, 252, 'Đóng · Esc', close)
        this.add.text(16, 250, '0–9: Nhập · Backspace: Xóa · Enter: Thử mã', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#94a3b8',
        })
        const keydown = (event: KeyboardEvent): void => {
            if (event.repeat || closing) return
            if (/^[0-9]$/.test(event.key)) digit(event.key)
            else if (event.key === 'Backspace') { event.preventDefault(); erase() }
            else if (event.key === 'Enter') submit()
            else if (event.key === 'Escape') close()
        }
        this.input.keyboard?.on('keydown', keydown)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off('keydown', keydown))
    }
}
