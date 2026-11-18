import Phaser from 'phaser'

/** Standalone ending: never leaves a completed Level03Scene paused behind dialogue. */
export class Level03EndingScene extends Phaser.Scene {
    constructor() { super('Level03EndingScene') }

    create(data: { helpedPorter?: boolean } = {}): void {
        const pages = [
            { speaker: 'Lan — từ ô cửa', text: 'Ba nhịp ngắn. Một nhịp dài. Minh nhìn lại: Lan giơ cổ tay buộc sợi chỉ đỏ. Tuấn kéo cô lùi vào bóng tối. Họ đã giữ lời, mở đường cho anh tới đây.' },
            { speaker: 'Minh', text: data.helpedPorter
                ? 'USB còn đây. Tôi còn nhớ người khuân hàng và mảnh giấy ghi đường về trong túi anh ấy. Phải sống để về với mẹ — và để có người quay lại tìm mọi người.'
                : 'USB còn đây. Tên Tuấn, tên những người trong phòng máy cũng còn đây. Tôi phải sống để về với mẹ — và để có người quay lại tìm mọi người.' },
            { speaker: 'Cửa 09 — Hàng rào cuối cùng', text: 'Minh luồn qua khe rào, siết USB rồi bước vào rừng đêm.\n“Ra được ngoài chưa phải là thoát. Tôi còn phải đưa họ về.”\nCÒN TIẾP.' },
        ]
        let page = 0
        let leaving = false
        const readyAt = this.time.now + 200
        this.cameras.main.setBackgroundColor('#101c22')
        this.input.keyboard?.resetKeys()
        this.add.text(240, 30, 'ĐÃ VƯỢT QUA HÀNG RÀO', {
            fontFamily: 'monospace', fontSize: '16px', color: '#a5e0b5',
        }).setOrigin(0.5)
        const speaker = this.add.text(28, 70, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#c4b5fd',
        })
        const body = this.add.text(28, 98, '', {
            fontFamily: 'monospace', fontSize: '12px', color: '#e5e7eb',
            wordWrap: { width: 424 }, lineSpacing: 5,
        })
        const hint = this.add.text(28, 212, '', {
            fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af',
        })
        const render = (): void => {
            speaker.setText(pages[page].speaker)
            body.setText(pages[page].text)
            hint.setText(`${page + 1}/${pages.length} | E / Space / Enter hoặc bấm TIẾP`)
        }
        const finish = (): void => {
            if (leaving || this.time.now < readyAt) return
            leaving = true
            this.input.keyboard?.resetKeys()
            this.scene.start('DemoCompleteScene')
        }
        const advance = (): void => {
            if (leaving || this.time.now < readyAt) return
            if (page === pages.length - 1) finish()
            else { page++; render() }
        }
        this.add.text(28, 240, '[ BỎ QUA ]', {
            fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af',
        }).setInteractive({ useHandCursor: true }).on('pointerdown', finish)
        this.add.text(452, 240, '[ TIẾP → ]', {
            fontFamily: 'monospace', fontSize: '12px', color: '#86efac',
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).on('pointerdown', advance)
        const keydown = (event: KeyboardEvent): void => {
            if (event.repeat) return
            if (event.key === 'Escape') finish()
            else if (['e', 'E', ' ', 'Enter'].includes(event.key)) advance()
        }
        this.input.keyboard?.on('keydown', keydown)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard?.off('keydown', keydown))
        render()
    }
}
