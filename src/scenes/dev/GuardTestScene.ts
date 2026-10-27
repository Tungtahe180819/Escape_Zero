import Phaser from 'phaser'
import { GUARD_TIMING } from '../../config/stealthConfig'
import { GuardStateMachine } from '../../systems/stealth/GuardStateMachine'
import type { GuardState } from '../../systems/stealth/GuardStateMachine'

export class GuardTestScene extends Phaser.Scene {
    constructor() {
        super('GuardTestScene')
    }

    create(): void {
        const brain = new GuardStateMachine(GUARD_TIMING)

        const colors: Record<GuardState, number> = {
            PATROL: 0x60a5fa,
            SUSPICIOUS: 0xfacc15,
            CHASE: 0xef4444,
            SEARCH: 0xc084fc,
        }

        this.add.text(240, 25, 'GUARD AI TEST', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        const guard = this.add.rectangle(240, 80, 20, 32, colors.PATROL)

        const stateText = this.add.text(240, 115, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#e5e7eb',
        }).setOrigin(0.5)

        this.add.text(240, 143, `Suspicion: ${GUARD_TIMING.suspicionMs / 1000}s | Search: ${GUARD_TIMING.searchMs / 1000}s`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#9ca3af',
        }).setOrigin(0.5)

        const addButton = (
            x: number,
            y: number,
            label: string,
            action: () => void,
        ): void => {
            this.add.text(x, y, label, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#86efac',
                backgroundColor: '#1f2937',
                padding: { x: 8, y: 8 },
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', action)
        }

        addButton(95, 185, '[ DETECT ]', () => {
            brain.setTargetVisible(true)
        })

        addButton(240, 185, '[ LOST ]', () => {
            brain.setTargetVisible(false)
        })

        addButton(385, 185, '[ RESET ]', () => {
            brain.reset()
        })

        addButton(240, 235, '[ MENU ]', () => {
            this.scene.start('MenuScene')
        })

        const updateBrain = (_time: number, delta: number): void => {
            brain.update(delta)
            stateText.setText(brain.state)
            guard.setFillStyle(colors[brain.state])
        }

        this.events.on(Phaser.Scenes.Events.UPDATE, updateBrain)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.UPDATE, updateBrain)
        })
    }
}
