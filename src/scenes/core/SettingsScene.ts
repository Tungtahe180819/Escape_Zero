import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { settingsSystem } from '../../systems/settings/SettingsSystem'

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene')
    }

    create(data: { returnScene?: string } = {}): void {
        const returnScene = data.returnScene

        if (
            returnScene !== 'MenuScene' &&
            returnScene !== 'PauseScene'
        ) {
            this.scene.stop()
            return
        }

        let closing = false
        const { width, height } = this.scale
        const centerX = width / 2

        this.add.rectangle(
            centerX,
            height / 2,
            width,
            height,
            0x111827,
        ).setInteractive()

        this.add.text(centerX, 35, 'SETTINGS', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '22px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        const addButton = (
            x: number,
            y: number,
            label: string,
            action: () => void,
        ): Phaser.GameObjects.Text => {
            return this.add.text(x, y, label, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '14px',
                color: '#86efac',
                backgroundColor: '#1f2937',
                padding: { x: 10, y: 8 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', action)
        }

        const volumeText = this.add.text(centerX, 90, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '14px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        const statusText = this.add.text(centerX, 185, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '10px',
            color: '#9ca3af',
        }).setOrigin(0.5)

        const refresh = (): void => {
            volumeText.setText(
                `VOLUME: ${Math.round(
                    settingsSystem.getVolume() * 100,
                )}%`,
            )

            muteButton.setText(
                settingsSystem.isMuted()
                    ? '[ MUTE: ON - M ]'
                    : '[ MUTE: OFF - M ]',
            )
        }

        const applyChange = (saved: boolean): void => {
            settingsSystem.apply(this)
            playSfx(this, 'ui')
            refresh()

            statusText.setText(
                saved
                    ? 'Saved automatically.'
                    : 'Storage unavailable: session only.',
            )
        }

        const decrease = (): void => {
            applyChange(settingsSystem.setVolume(
                settingsSystem.getVolume() - 0.1,
            ))
        }

        const increase = (): void => {
            applyChange(settingsSystem.setVolume(
                settingsSystem.getVolume() + 0.1,
            ))
        }

        const toggleMute = (): void => {
            applyChange(settingsSystem.setMuted(
                !settingsSystem.isMuted(),
            ))
        }

        const back = (): void => {
            if (closing) {
                return
            }

            closing = true

            const parent = this.scene.get(returnScene)
            parent.input.keyboard?.resetKeys()

            this.scene.resume(returnScene)
            this.scene.stop()
        }

        addButton(centerX - 130, 90, '[ - ]', decrease)
        addButton(centerX + 130, 90, '[ + ]', increase)

        const muteButton = addButton(
            centerX,
            140,
            '',
            toggleMute,
        )

        addButton(centerX, 220, '[ BACK - ESC ]', back)

        this.add.text(
            centerX,
            255,
            'Left/Right: Volume | M: Mute | FPS limit: 300',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '9px',
                color: '#9ca3af',
            },
        ).setOrigin(0.5)

        settingsSystem.apply(this)
        refresh()

        this.input.keyboard?.on('keydown-LEFT', decrease)
        this.input.keyboard?.on('keydown-RIGHT', increase)
        this.input.keyboard?.on('keydown-M', toggleMute)
        this.input.keyboard?.on('keydown-ESC', back)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-LEFT', decrease)
            this.input.keyboard?.off('keydown-RIGHT', increase)
            this.input.keyboard?.off('keydown-M', toggleMute)
            this.input.keyboard?.off('keydown-ESC', back)
        })
    }
}
