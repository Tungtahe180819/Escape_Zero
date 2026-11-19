import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { saveSystem } from '../../systems/progress/SaveSystem'

export class DemoCompleteScene extends Phaser.Scene {
    constructor() {
        super('DemoCompleteScene')
    }

    create(): void {
        playSfx(this, 'complete')
        saveSystem.completeLevel(3)
        const centerX = this.scale.width / 2

        this.add.text(centerX, 35, 'ESCAPE ZERO — LỜI HỨA CÒN LẠI', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '16px',
            color: '#86efac',
        }).setOrigin(0.5)

        this.add.text(centerX, 70, 'CỬA 09 — CÒN TIẾP', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '12px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        this.add.text(
            centerX,
            100,
            '“Ra được ngoài chưa phải là thoát.\nTôi còn phải đưa họ về.”\nLan và Tuấn vẫn chờ phía sau hàng rào.',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '10px',
                color: '#9ca3af',
                align: 'center',
            },
        ).setOrigin(0.5)

        const addButton = (
            y: number,
            label: string,
            action: () => void,
        ): void => {
            this.add.text(centerX, y, label, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '12px',
                color: '#86efac',
                backgroundColor: '#1f2937',
                padding: { x: 8, y: 6 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', action)
        }

        const restartDemo = (): void => {
            this.scene.start('Level01Scene')
        }

        const replayLevel03 = (): void => {
            this.scene.start('Level03Scene')
        }

        const returnToMenu = (): void => {
            this.scene.start('MenuScene')
        }

        addButton(150, '[ PLAY AGAIN - N ]', restartDemo)
        addButton(190, '[ REPLAY LEVEL 03 - R ]', replayLevel03)
        addButton(235, '[ MENU - ENTER ]', returnToMenu)

        this.input.keyboard?.on('keydown-N', restartDemo)
        this.input.keyboard?.on('keydown-R', replayLevel03)
        this.input.keyboard?.on('keydown-ENTER', returnToMenu)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-N', restartDemo)
            this.input.keyboard?.off('keydown-R', replayLevel03)
            this.input.keyboard?.off('keydown-ENTER', returnToMenu)
        })
    }
}
