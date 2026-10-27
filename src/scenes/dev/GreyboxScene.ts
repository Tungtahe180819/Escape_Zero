import Phaser from 'phaser'
import { Player } from '../../entities/Player'
import { InputManager } from '../../systems/input/InputManager'

export class GreyboxScene extends Phaser.Scene {
    private player?: Player
    private controls?: InputManager

    constructor() {
        super('GreyboxScene')
    }

    create(): void {
        const { width, height } = this.scale
        const worldWidth = 1440

        this.physics.world.setBounds(0, 0, worldWidth, height)

        this.add.text(12, 12, 'ESCAPE ZERO - TEST LEVEL', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e5e7eb',
        }).setScrollFactor(0).setDepth(10)

        this.add.text(12, 34, 'Move: A/D or Left/Right | Jump: Space', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#9ca3af',
        }).setScrollFactor(0).setDepth(10)

        const menuButton = this.add.text(width - 12, 12, '[ MENU ]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#86efac',
            backgroundColor: '#1f2937',
            padding: { x: 6, y: 4 },
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({ useHandCursor: true })

        this.add.text(width / 2, 65, 'Press Esc to return to menu', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#9ca3af',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10)

        // World markers make camera movement visible.
        for (const x of [24, 480, 960, worldWidth - 24]) {
            this.add.text(x, 160, `${x}`, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#94a3b8',
            }).setOrigin(0.5)

            this.add.rectangle(x, 208, 2, 60, 0x334155)
        }

        const floor = this.add.rectangle(
            worldWidth / 2, height - 16, worldWidth, 32, 0x374151,
        )
        this.physics.add.existing(floor, true)

        this.controls = new InputManager(this)
        this.player = new Player(this, width / 2, 140)
        this.physics.add.collider(this.player, floor)

        const platform = this.add.rectangle(160, 208, 64, 12, 0x64748b)
        this.physics.add.existing(platform, true)
        this.physics.add.collider(this.player, platform)

        const wall = this.add.rectangle(350, 218, 16, 40, 0x475569)
        this.physics.add.existing(wall, true)
        this.physics.add.collider(this.player, wall)

        const extraPlatforms = [
            { x: 820, y: 208, width: 64 },
            { x: 920, y: 176, width: 64 },
        ]

        for (const data of extraPlatforms) {
            const platform = this.add.rectangle(
                data.x, data.y, data.width, 12, 0x64748b,
            )
            this.physics.add.existing(platform, true)
            this.physics.add.collider(this.player, platform)
        }

        let restarting = false

        for (const x of [600, 1100]) {
            const hazard = this.add.rectangle(x, 234, 40, 8, 0xef4444)
            this.physics.add.existing(hazard, true)

            this.physics.add.overlap(this.player, hazard, () => {
                if (restarting) {
                    return
                }

                restarting = true
                this.scene.restart()
            })
        }

        this.add.text(600, 205, 'DANGER', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fca5a5',
        }).setOrigin(0.5)

        const fpsText = this.add.text(12, 50, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#86efac',
        }).setScrollFactor(0).setDepth(10)

        let updateCount = 0
        let sampleStart = performance.now()

        const measureUpdateRate = (): void => {
            updateCount++

            const now = performance.now()
            const elapsed = now - sampleStart

            if (elapsed >= 1000) {
                const rate = Math.round(updateCount * 1000 / elapsed)
                fpsText.setText(`Game updates/s: ${rate}`)

                updateCount = 0
                sampleStart = now
            }
        }

        this.events.on(Phaser.Scenes.Events.UPDATE, measureUpdateRate)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.UPDATE, measureUpdateRate)
        })

        const camera = this.cameras.main
        camera.setBounds(0, 0, worldWidth, height)
        camera.startFollow(this.player, true)

        const returnToMenu = (): void => {
            this.scene.start('MenuScene')
        }

        menuButton.on('pointerdown', returnToMenu)
        this.input.keyboard?.on('keydown-ESC', returnToMenu)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            this.controls?.destroy()
            this.controls = undefined
            this.player = undefined
        })
    }

    update(): void {
        if (!this.player || !this.controls) {
            return
        }

        this.player.move(this.controls.getHorizontalAxis())

        if (this.controls.isJumpPressed()) {
            this.player.jump()
        }
    }
}
