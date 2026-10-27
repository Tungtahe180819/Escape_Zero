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
            65,
            isLevel02 ? 'LEVEL 02 COMPLETE' : 'LEVEL 01 COMPLETE',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#86efac',
            },
        ).setOrigin(0.5)

        this.add.text(
            centerX,
            105,
            isLevel02 ? 'Continue to Level 03.' : 'Continue to Level 02.',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#e5e7eb',
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

        addButton(140, '[ NEXT LEVEL - N ]', nextLevel)
        addButton(185, '[ REPLAY - R ]', replay)
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
