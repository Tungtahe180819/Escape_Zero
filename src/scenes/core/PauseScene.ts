import Phaser from 'phaser'
import { settingsSystem } from '../../systems/settings/SettingsSystem'

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene')
    }

    create(data: { levelScene?: string } = {}): void {
        const levelScene = data.levelScene
        const allowedScenes = [
            'Level01Scene',
            'Level02Scene',
            'Level03Scene',
        ]

        if (!levelScene || !allowedScenes.includes(levelScene)) {
            this.scene.stop()
            return
        }

        let closing = false
        const { width, height } = this.scale

        // Block pointer input from passing through the overlay.
        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.75,
        ).setInteractive()

        this.add.text(width / 2, 45, 'PAUSED', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '22px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        const addButton = (
            y: number,
            label: string,
            action: () => void,
        ): Phaser.GameObjects.Text => {
            return this.add.text(width / 2, y, label, {
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

        const resume = (): void => {
            if (closing) {
                return
            }

            closing = true

            const level = this.scene.get(levelScene)
            level.input.keyboard?.resetKeys()

            this.scene.resume(levelScene)
            this.scene.stop()
        }

        const restartLevel = (): void => {
            if (closing) {
                return
            }

            closing = true
            this.scene.stop(levelScene)
            this.scene.start(levelScene)
        }

        const mainMenu = (): void => {
            if (closing) {
                return
            }

            closing = true
            this.scene.stop(levelScene)
            this.scene.start('MenuScene')
        }

        const openSettings = (): void => {
            if (closing || this.scene.isActive('SettingsScene')) {
                return
            }

            this.input.keyboard?.resetKeys()

            this.scene.launch('SettingsScene', {
                returnScene: this.scene.key,
            })
            this.scene.pause()
        }

        const hudLabel = (): string => settingsSystem.isHudVisible() ? '[ HUD: BẬT ]' : '[ HUD: TẮT ]'
        const toggleHud = (): void => {
            if (closing) return
            const visible = !settingsSystem.isHudVisible()
            settingsSystem.setHudVisible(visible)
            for (const item of this.scene.get(levelScene).children.getChildren()) {
                if (item.name === 'level-hud' && (item instanceof Phaser.GameObjects.Text || item instanceof Phaser.GameObjects.Rectangle)) {
                    item.setVisible(visible)
                }
            }
            hudButton.setText(hudLabel())
        }
        addButton(80, '[ RESUME - ENTER ]', resume)
        const hudButton = addButton(114, hudLabel(), toggleHud)
        addButton(148, '[ SETTINGS ]', openSettings)
        addButton(182, '[ RESTART LEVEL ]', restartLevel)
        addButton(216, '[ MAIN MENU ]', mainMenu)

        this.add.text(
            width / 2,
            250,
            'Restart Level resets the current checkpoint.',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '9px',
                color: '#9ca3af',
            },
        ).setOrigin(0.5)

        this.input.keyboard?.on('keydown-ENTER', resume)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-ENTER', resume)
        })
    }
}
