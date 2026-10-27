import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { LEVEL02_STEALTH } from '../../config/stealthConfig'
import { Player } from '../../entities/Player'
import { Guard } from '../../entities/Guard'
import { InputManager } from '../../systems/input/InputManager'
import { DetectionSystem } from '../../systems/stealth/DetectionSystem'
import { SurveillanceCamera } from '../../entities/SurveillanceCamera'
import { CheckpointSystem } from '../../systems/progress/CheckpointSystem'
import { InteractionSystem } from '../../systems/interaction/InteractionSystem'
import { saveSystem } from '../../systems/progress/SaveSystem'
import { createCorridorDecor } from '../../visuals/CorridorDecor'

export class Level02Scene extends Phaser.Scene {
    constructor() {
        super('Level02Scene')
    }

    preload(): void {
        this.load.tilemapTiledJSON(
            'level-02',
            'assets/maps/level-02.json',
        )
        this.load.image(
            'corridor-tiles',
            'assets/tilesets/corridor-tiles.png',
        )
    }

    create(): void {
        saveSystem.enterLevel(2)
        const map = this.make.tilemap({key: 'level-02'})
        const tileset = map.addTilesetImage('greybox', 'corridor-tiles')
        if (!tileset) {
            throw new Error('Level-02 tileset is missing')
        }

        const background = map.createLayer('Background', tileset, 0, 0)
        const ground = map.createLayer('Ground', tileset, 0, 0)
        const walls = map.createLayer('Walls', tileset, 0, 0)

        if (!background || !ground || !walls) {
            throw new Error('Level-02 tile layers are missing')
        }

        background.setTint(0x87939f)
        background.setDepth(-2)
        createCorridorDecor(this, map.widthInPixels)

        ground.setCollisionByExclusion([-1])
        walls.setCollisionByExclusion([-1])

        const objects = map.getObjectLayer('Objects')
        const triggers = map.getObjectLayer('Triggers')

        if (!objects || !triggers) {
            throw new Error('Level-02 object layers are missing')
        }

        const getPoint = (name: string): { x: number; y: number } => {
            const object = objects.objects.find((item) => item.name === name)

            if (
                !object
                || object.x === undefined
                || object.y === undefined
            ) {
                throw new Error(`Level-02 point "${name}" is missing`)
            }

            return {x: object.x, y: object.y}
        }

        const spawn = getPoint('playerSpawn')
        const guardSpawn = getPoint('guardSpawn')
        const left = getPoint('guardPatrolLeft')
        const right = getPoint('guardPatrolRight')

        if (left.x >= right.x) {
            throw new Error('Invalid Level-02 patrol route')
        }

        this.physics.world.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )

        const controls = new InputManager(this)
        const player = new Player(this, spawn.x, spawn.y)
        player.setDepth(2)

        const guard = new Guard(this, {
            ...LEVEL02_STEALTH.guard,
            spawnX: guardSpawn.x,
            spawnY: guardSpawn.y,
            leftX: left.x,
            rightX: right.x,
        })

        for (const actor of [player, guard]) {
            this.physics.add.collider(actor, ground)
            this.physics.add.collider(actor, walls)
        }

        const detection = new DetectionSystem([ground, walls])

        guard.setLineOfSightTest((x1, y1, x2, y2) => {
            return detection.hasClearLine(x1, y1, x2, y2)
        })

        const hideZones: Phaser.Geom.Rectangle[] = []

        for (const object of triggers.objects) {
            if (
                object.x === undefined
                || object.y === undefined
                || !object.width
                || !object.height
            ) {
                throw new Error(`Invalid trigger "${object.name}"`)
            }

            const bounds = new Phaser.Geom.Rectangle(
                object.x, object.y, object.width, object.height,
            )

            if (object.name.startsWith('hide-')) {
                hideZones.push(bounds)
            }

            this.add.rectangle(
                bounds.centerX,
                bounds.centerY,
                bounds.width,
                bounds.height,
                0x22c55e,
                0.15,
            ).setStrokeStyle(1, 0x22c55e)

            this.add.text(bounds.x, bounds.y - 12, object.name, {
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#e5e7eb',
            })
        }

        const cameraPoint = getPoint('cameraSpawn')

        const surveillance = new SurveillanceCamera(this, {
            ...LEVEL02_STEALTH.camera,
            x: cameraPoint.x,
            y: cameraPoint.y,
        }, detection)

        let switchActivated = false
        let levelCompleted = false

        const switchPoint = getPoint('switch')

        const switchVisual = this.add.rectangle(
            switchPoint.x, switchPoint.y, 12, 16, 0xef4444,
        ).setDepth(1)

        const objective = this.add.text(
            12, 46, 'Objective: Activate the switch',
            {
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
                wordWrap: { width: 300 },
            },
        ).setScrollFactor(0).setDepth(10)

        const refreshObjective = (): void => {
            objective.setText(
                switchActivated
                    ? 'Switch: ON\nObjective: Reach the exit'
                    : 'Switch: OFF\nObjective: Activate the switch',
            )
        }

        refreshObjective()

        const interactions = new InteractionSystem(this, [
            {
                id: 'switch',
                x: switchPoint.x,
                y: switchPoint.y,
                radius: 32,
                prompt: 'Activate switch',
                isAvailable: () => !switchActivated && !levelCompleted,
                interact: () => {
                    if (switchActivated || levelCompleted) {
                        return
                    }

                    switchActivated = true
                    playSfx(this, 'interact')
                    switchVisual.setFillStyle(0x22c55e)
                    refreshObjective()
                },
            },
        ])

        const exitObject = triggers.objects.find(
            (object) => object.name === 'exit',
        )

        if (
            !exitObject
            || exitObject.x === undefined
            || exitObject.y === undefined
            || !exitObject.width
            || !exitObject.height
        ) {
            throw new Error('Level-02 exit is missing or invalid')
        }

        const exitBounds = new Phaser.Geom.Rectangle(
            exitObject.x,
            exitObject.y,
            exitObject.width,
            exitObject.height,
        )


        this.cameras.main.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )
        this.cameras.main.startFollow(player, true)

        this.add.text(12, 12, 'LEVEL 02', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.text(12, 30, 'A/D: Move | Space: Jump | S: Crouch | E: Interact | Esc: Pause', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const status = this.add.text(332, 62, 'Stance: STANDING', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#93c5fd',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const cameraStatus = this.add.text(332, 78, 'Camera: 0%', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#93c5fd',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.rectangle(332, 98, 136, 6, 0x334155)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10)

        const cameraFill = this.add.rectangle(
            332, 98, 136, 6, 0x38bdf8,
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(11)
            .setScale(0, 1)

        const checkpoints = new CheckpointSystem(spawn)

        const checkpointObject = triggers.objects.find(
            (object) => object.name === 'cp-02',
        )

        if (
            !checkpointObject
            || checkpointObject.x === undefined
            || checkpointObject.y === undefined
            || !checkpointObject.width
            || !checkpointObject.height
        ) {
            throw new Error('Checkpoint "cp-02" is missing or invalid')
        }

        const checkpointX = checkpointObject.x + checkpointObject.width / 2
        const checkpointY = checkpointObject.y + checkpointObject.height / 2

        const checkpointZone = this.add.zone(
            checkpointX,
            checkpointY,
            checkpointObject.width,
            checkpointObject.height,
        )

        this.physics.add.existing(checkpointZone, true)

        const guardStatus = this.add.text(332, 110, 'Guard: 0%', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.rectangle(332, 130, 136, 6, 0x334155)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10)

        const guardFill = this.add.rectangle(
            332, 130, 136, 6, 0xfacc15,
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(11)
            .setScale(0, 1)

        const checkpointStatus = this.add.text(
            332, 46, 'Checkpoint: START',
            {
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
            },
        ).setScrollFactor(0).setDepth(10)

        const feedback = this.add.text(12, 80, '', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#fca5a5',
            stroke: '#080d14',
            strokeThickness: 2,
            wordWrap: { width: 300 },
        }).setScrollFactor(0).setDepth(10)

        this.physics.add.overlap(player, checkpointZone, () => {
            if (checkpoints.activate('cp-02', {
                x: checkpointX,
                y: checkpointY,
            })) {
                checkpointStatus.setText(`Checkpoint: ${checkpoints.getLabel()}`)
                playSfx(this, 'checkpoint')
                feedback.setText('Checkpoint activated.')
            }
        })

        const respawn = (message: string): void => {
            if (!player.body) {
                return
            }

            if (levelCompleted) {
                return
            }

            switchActivated = false
            switchVisual.setFillStyle(0xef4444)
            refreshObjective()

            const point = checkpoints.getSpawn()

            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            player.setCrouching(false)
            player.setAlpha(1)

            guard.resetGuard()
            surveillance.resetCamera()

            cameraStatus.setText('Camera: 0%')
            cameraFill.setScale(0, 1)
            guardStatus.setText('Guard: 0%')
            guardFill.setScale(0, 1)

            status.setText('Stance: STANDING')
            feedback.setText(message)
        }

        this.add.text(12, this.scale.height - 10, '[ RESTART CHECKPOINT ]', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fca5a5',
            backgroundColor: '#111827',
            padding: {x: 3, y: 3},
        })
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(20)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                respawn('Restarted from checkpoint.')
            })

        const returnToMenu = (event?: KeyboardEvent): void => {
            if (event?.repeat || this.scene.isActive('PauseScene')) {
                return
            }

            this.input.keyboard?.resetKeys()

            this.scene.launch('PauseScene', {
                levelScene: this.scene.key,
            })
            this.scene.pause()
        }

        this.add.text(this.scale.width - 12, 12, '[ PAUSE ]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#86efac',
            backgroundColor: '#111827',
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', returnToMenu)

        this.input.keyboard?.on('keydown-ESC', returnToMenu)

        const updatePreview = (_time: number, delta: number): void => {
            if (levelCompleted) {
                return
            }

            player.setCrouching(controls.isCrouchHeld())
            player.move(controls.getHorizontalAxis())

            if (controls.isJumpPressed()) {
                player.jump()
            }

            const bounds = player.getBounds()
            const grounded = Boolean(
                player.body
                && (player.body.blocked.down || player.body.touching.down),
            )

            const insideHideZone = hideZones.some((zone) => {
                return zone.contains(bounds.left, bounds.top)
                    && zone.contains(bounds.right, bounds.bottom)
            })

            const hidden = player.isCrouching() && grounded && insideHideZone

            player.setAlpha(hidden ? 0.5 : 1)
            status.setText(
                `Stance: ${
                    hidden ? 'HIDDEN' : player.isCrouching() ? 'CROUCHING' : 'STANDING'
                }`,
            )

            guard.updateAI(
                delta,
                player.x,
                player.y,
                player.isCrouching(),
                hidden,
            )

            surveillance.updateScan(
                delta,
                player.x,
                player.y,
                hidden,
            )

            const cameraLevel = surveillance.getDetectionLevel()

            cameraStatus.setText(
                `Camera: ${Math.round(cameraLevel * 100)}%${
                    surveillance.hasCapturedTarget() ? ' | ALARM' : ''
                }`,
            )

            cameraFill
                .setScale(cameraLevel, 1)
                .setFillStyle(cameraLevel >= 0.6 ? 0xef4444 : 0x38bdf8)
            const guardLevel = guard.getDetectionLevel()

            guardStatus.setText(`Guard: ${Math.round(guardLevel * 100)}%`)

            guardFill
                .setScale(guardLevel, 1)
                .setFillStyle(guardLevel >= 0.6 ? 0xef4444 : 0xfacc15)

            if (guard.hasCapturedTarget() || surveillance.hasCapturedTarget()) {
                const source = guard.hasCapturedTarget() ? 'guard' : 'camera'
                playSfx(this, 'caught')

                this.cameras.main.flash(180, 200, 30, 30)
                respawn(`Captured by ${source}! Returned to checkpoint.`)
                return
            }
            interactions.update(
                player.x,
                player.y,
                controls.isInteractPressed(),
            )

            const insideExit = Phaser.Geom.Intersects.RectangleToRectangle(
                player.getBounds(),
                exitBounds,
            )

            if (insideExit) {
                if (!switchActivated) {
                    feedback.setText('Exit locked. Activate the switch first.')
                } else {
                    levelCompleted = true
                    player.setVelocity(0, 0)

                    this.scene.start('LevelCompleteScene', {
                        levelId: 'level-02',
                    })
                }
            }
        }

        this.events.on(Phaser.Scenes.Events.UPDATE, updatePreview)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.UPDATE, updatePreview)
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            controls.destroy()
            interactions.destroy()
        })
    }
}
