import Phaser from 'phaser'
import { saveSystem } from '../../systems/progress/SaveSystem'

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create(): void {
        const centerX = this.scale.width / 2
        const currentLevel = saveSystem.getCurrentLevel()
        let confirmingRestart = false
        let transitioning = false

        this.add.text(centerX, 55, 'ESCAPE ZERO', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '24px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        const addButton = (
            y: number,
            label: string,
            action: () => void,
        ): Phaser.GameObjects.Text => {
            return this.add.text(centerX, y, label, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '14px',
                color: '#86efac',
                backgroundColor: '#1f2937',
                padding: { x: 12, y: 8 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', action)
        }

        const openLevel = (level: 1 | 2 | 3): void => {
            if (transitioning) {
                return
            }

            transitioning = true

            const sceneKey =
                level === 1
                    ? 'Level01Scene'
                    : level === 2
                        ? 'Level02Scene'
                        : 'Level03Scene'

            this.scene.start(sceneKey)
        }

        const startOrContinue = (): void => {
            if (confirmingRestart || transitioning) {
                return
            }

            openLevel(currentLevel ?? 1)
        }

        const mainLabel = currentLevel === null
            ? '[ START ]'
            : `[ CONTINUE - LEVEL 0${currentLevel} ]`

        const mainButton = addButton(
            115,
            mainLabel,
            startOrContinue,
        )

        const hint = this.add.text(
            centerX,
            155,
            'Click or press Enter',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '11px',
                color: '#9ca3af',
            },
        ).setOrigin(0.5)

        // Confirmation controls are hidden until Restart is clicked.
        const question = this.add.text(
            centerX,
            110,
            'Restart from Level 01?\nSaved progress will be reset.',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '12px',
                color: '#fca5a5',
                align: 'center',
            },
        ).setOrigin(0.5).setVisible(false)

        const cancelRestart = (): void => {
            if (!confirmingRestart || transitioning) {
                return
            }

            confirmingRestart = false
            question.setVisible(false)
            confirmButton.setVisible(false).disableInteractive()
            cancelButton.setVisible(false).disableInteractive()

            mainButton
                .setVisible(true)
                .setInteractive({ useHandCursor: true })

            restartButton
                .setVisible(true)
                .setInteractive({ useHandCursor: true })

            hint.setVisible(true)
        }

        const confirmRestart = (): void => {
            if (!confirmingRestart || transitioning) {
                return
            }

            saveSystem.reset()
            openLevel(1)
        }

        const confirmButton = addButton(
            160,
            '[ YES - RESTART ]',
            confirmRestart,
        ).setVisible(false).disableInteractive()

        const cancelButton = addButton(
            205,
            '[ CANCEL - ESC ]',
            cancelRestart,
        ).setVisible(false).disableInteractive()

        const requestRestart = (): void => {
            if (confirmingRestart || transitioning) {
                return
            }

            confirmingRestart = true
            mainButton.setVisible(false).disableInteractive()
            restartButton.setVisible(false).disableInteractive()
            hint.setVisible(false)

            question.setVisible(true)

            confirmButton
                .setVisible(true)
                .setInteractive({ useHandCursor: true })

            cancelButton
                .setVisible(true)
                .setInteractive({ useHandCursor: true })
        }

        const restartButton = addButton(
            205,
            '[ RESTART FROM LEVEL 01 ]',
            requestRestart,
        )

        // No saved playthrough means there is nothing to restart.
        if (currentLevel === null) {
            restartButton.setVisible(false).disableInteractive()
        }

        this.input.keyboard?.on(
            'keydown-ENTER',
            startOrContinue,
            addButton(250, '[ SETTINGS ]', () => {
                if (
                    confirmingRestart ||
                    transitioning ||
                    this.scene.isActive('SettingsScene')
                ) {
                    return
                }

                this.input.keyboard?.resetKeys()

                this.scene.launch('SettingsScene', {
                    returnScene: this.scene.key,
                })
                this.scene.pause()
            })
        )
        this.input.keyboard?.on(
            'keydown-ESC',
            cancelRestart,
        )

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off(
                'keydown-ENTER',
                startOrContinue,
            )
            this.input.keyboard?.off(
                'keydown-ESC',
                cancelRestart,
            )
        })
    }
}