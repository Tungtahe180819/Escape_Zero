import Phaser from 'phaser'
interface DataOrderData { onSubmit: (order: string) => string | null; notes: string[] }
export class DataOrderScene extends Phaser.Scene {
    constructor() { super('DataOrderScene') }
    create(data: DataOrderData): void {
        if (!data || typeof data.onSubmit !== 'function') { this.scene.stop(); return }
        let order = '', closing = false
        const readyAt = this.time.now + 180
        this.add.rectangle(240, 135, 480, 270, 0x0b1220, 0.98).setInteractive()
        this.add.text(20, 16, 'LAN · GHÉP DỮ LIỆU THEO GIỜ', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '14px', color: '#e5e7eb' })
        this.add.text(20, 48, data.notes.join('\n\n'), { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '11px', color: '#cbd5e1', wordWrap: { width: 440 } })
        const display = this.add.text(240, 142, '_ _ _', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '22px', color: '#86efac' }).setOrigin(0.5)
        const feedback = this.add.text(20, 215, '', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#fca5a5', wordWrap: { width: 440 } })
        const render = (): void => { display.setText(order.padEnd(3, '_').split('').join(' ')) }
        const close = (): void => { if (closing) return; closing = true; this.scene.get('Level02Scene').input.keyboard?.resetKeys(); this.scene.resume('Level02Scene'); this.scene.stop() }
        const add = (part: string): void => { if (!closing && this.time.now >= readyAt && !order.includes(part)) { order += part; render() } }
        const erase = (): void => { order = order.slice(0, -1); render() }
        const submit = (): void => { if (closing || this.time.now < readyAt) return; const error = data.onSubmit(order); if (error) feedback.setText(error); else close() }
        const button = (x: number, label: string, action: () => void): void => { this.add.text(x, 181, label, { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '13px', color: '#86efac', backgroundColor: '#263444', padding: { x: 12, y: 7 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', action) }
        for (const [i, part] of ['A','B','C'].entries()) button(90 + i * 66, part, () => add(part))
        button(304, 'Xóa', erase); button(398, 'Ghép', submit)
        this.add.text(20, 250, 'A/B/C · Backspace: Xóa · Enter: Ghép · Esc: Đóng', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#94a3b8' })
        const key = (event: KeyboardEvent): void => { if (event.repeat) return; const part = event.key.toUpperCase(); if (/^[ABC]$/.test(part)) add(part); else if (event.key === 'Backspace') { event.preventDefault(); erase() } else if (event.key === 'Enter') submit(); else if (event.key === 'Escape') close() }
        this.input.keyboard?.on('keydown', key)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off('keydown', key))
    }
}
