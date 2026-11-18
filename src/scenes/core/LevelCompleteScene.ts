import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { saveSystem } from '../../systems/progress/SaveSystem'

export class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super('LevelCompleteScene')
    }

    create(data: { levelId?: string } = {}): void {
        playSfx(this, 'complete')
        const centerX = this.scale.width / 2
        const isLevel02 = data.levelId === 'level-02'
        if (
            data.levelId === 'level-01' ||
            data.levelId === 'level-02'
        ) {
            saveSystem.completeLevel(isLevel02 ? 2 : 1)
        }

        const replayScene = isLevel02 ? 'Level02Scene' : 'Level01Scene'
        const nextScene = isLevel02 ? 'Level03Scene' : 'Level02Scene'

        this.add.text(
            centerX,
            40,
            isLevel02 ? 'CÁI GIÁ CỦA SỰ THẬT' : 'MỘT CÁNH CỬA ĐÃ MỞ',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#86efac',
            },
        ).setOrigin(0.5)

        this.add.text(
            centerX,
            78,
            isLevel02
                ? 'USB đã rời phòng máy. Lan và Tuấn còn ở lại.\nMinh phải qua hàng rào để mang chứng cứ tới người có thể giúp.\nLần này, đường thoát còn dành cho những người phía sau.'
                : 'Minh: “Còn hai người?”\nTuấn: “Em canh cửa. Anh xem đường trước.”\nLan: “Mở được cửa này đã. Chúng ta mới có đường đi tiếp.”',
            {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#e5e7eb',
                align: 'center',
                wordWrap: { width: 430 },
                lineSpacing: 4,
            },
        ).setOrigin(0.5)

        const addButton = (
            y: number,
            label: string,
            action: () => void,
        ): void => {
            this.add.text(centerX, y, label, {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#86efac',
                backgroundColor: '#1f2937',
                padding: { x: 8, y: 6 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', action)
        }

        const nextLevel = (): void => {
            this.scene.start(nextScene)
        }

        const replay = (): void => {
            this.scene.start(replayScene)
        }

        const returnToMenu = (): void => {
            this.scene.start('MenuScene')
        }

        addButton(157, isLevel02 ? '[ TỚI HÀNG RÀO - N ]' : '[ TÌM LAN VÀ TUẤN - N ]', nextLevel)
        addButton(196, '[ REPLAY - R ]', replay)
        addButton(235, '[ MENU - ENTER ]', returnToMenu)

        this.input.keyboard?.on('keydown-N', nextLevel)
        this.input.keyboard?.on('keydown-R', replay)
        this.input.keyboard?.on('keydown-ENTER', returnToMenu)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-N', nextLevel)
            this.input.keyboard?.off('keydown-R', replay)
            this.input.keyboard?.off('keydown-ENTER', returnToMenu)
        })
    }
}
