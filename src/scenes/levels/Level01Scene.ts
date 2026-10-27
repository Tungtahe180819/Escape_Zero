import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { LEVEL01_STEALTH } from '../../config/stealthConfig'
import { Player } from '../../entities/Player'
import { InputManager } from '../../systems/input/InputManager'
import { InteractionSystem } from '../../systems/interaction/InteractionSystem'
import type { Interactable } from '../../systems/interaction/Interactable'
import { MissionSystem } from '../../systems/progress/MissionSystem'
import { CheckpointSystem } from '../../systems/progress/CheckpointSystem'
import { Guard } from '../../entities/Guard'
import { DetectionSystem } from '../../systems/stealth/DetectionSystem'
import { saveSystem } from '../../systems/progress/SaveSystem'
import { createPrisonDecor } from '../../visuals/PrisonDecor'

export class Level01Scene extends Phaser.Scene {
    private player?: Player
    private controls?: InputManager
    private guard?: Guard
    private interactions?: InteractionSystem
    private hideZones: Phaser.Geom.Rectangle[] = []
    private stealthText?: Phaser.GameObjects.Text
    private detectionText?: Phaser.GameObjects.Text
    private detectionFill?: Phaser.GameObjects.Rectangle
    private onCaptured?: () => void

    constructor() {
        super('Level01Scene')
    }

    preload(): void {
        this.load.tilemapTiledJSON(
            'level-01',
            'assets/maps/level-01.json',
        )
        this.load.image(
            'prison-tiles',
            'assets/tilesets/prison-tiles.png',
        )
    }

    create(): void {
        saveSystem.enterLevel(1)
        const map = this.make.tilemap({ key: 'level-01' })
        const tileset = map.addTilesetImage('greybox', 'prison-tiles')
        if (!tileset) {
               throw new Error('Tileset "greybox" could not be loaded')
        }

        const background = map.createLayer('Background', tileset, 0, 0)
        const ground = map.createLayer('Ground', tileset, 0, 0)
        const walls = map.createLayer('Walls', tileset, 0, 0)

        if (!background || !ground || !walls) {
            throw new Error('Required tile layers are missing')
        }

        // Darken only the background, preserving foreground readability.
        background.setTint(0x87939f)
        background.setDepth(-2)

        createPrisonDecor(this, map.widthInPixels)

        ground.setCollisionByExclusion([-1])
        walls.setCollisionByExclusion([-1])

        const spawn = map.getObjectLayer('Objects')?.objects.find(
            (object) => object.name === 'playerSpawn',
        )

        if (!spawn || spawn.x === undefined || spawn.y === undefined) {
            throw new Error('Object "playerSpawn" is missing or invalid')
        }

        this.physics.world.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )

        this.controls = new InputManager(this)
        this.player = new Player(this, spawn.x, spawn.y)

        this.physics.add.collider(this.player, ground)
        this.physics.add.collider(this.player, walls)

        const objects = map.getObjectLayer('Objects')

        if (!objects) {
            throw new Error('Object layer "Objects" is missing')
        }

        const getGuardPoint = (name: string): { x: number; y: number } => {
            const object = objects.objects.find((item) => item.name === name)

            if (
                !object
                || object.x === undefined
                || object.y === undefined
            ) {
                throw new Error(`Guard point "${name}" is missing`)
            }

            return { x: object.x, y: object.y }
        }

        const guardSpawn = getGuardPoint('guardSpawn')
        const patrolLeft = getGuardPoint('guardPatrolLeft')
        const patrolRight = getGuardPoint('guardPatrolRight')

        if (patrolLeft.x >= patrolRight.x) {
            throw new Error('Guard patrol left point must precede right point')
        }

        this.guard = new Guard(this, {
            ...LEVEL01_STEALTH.guard,
            spawnX: guardSpawn.x,
            spawnY: guardSpawn.y,
            leftX: patrolLeft.x,
            rightX: patrolRight.x,
        })

        this.physics.add.collider(this.guard, ground)
        this.physics.add.collider(this.guard, walls)

        const keyObject = objects.objects.find(
            (object) => object.name === 'key',
        )
        const doorObject = objects.objects.find(
            (object) => object.name === 'door',
        )

        if (
            !keyObject
            || keyObject.x === undefined
            || keyObject.y === undefined
        ) {
            throw new Error('Object "key" is missing or invalid')
        }

        if (
            !doorObject
            || doorObject.x === undefined
            || doorObject.y === undefined
            || !doorObject.width
            || !doorObject.height
        ) {
            throw new Error('Object "door" is missing or invalid')
        }

// State is recreated whenever this level starts.
        const mission = new MissionSystem()

        const statusText = this.add.text(12, 50, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#86efac',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const refreshStatus = (): void => {
            statusText.setText(
                `Key: ${mission.hasKey ? 'YES' : 'NO'} | Door: ${
                    mission.doorOpened ? 'OPEN' : 'LOCKED'
                }\nObjective: ${mission.getObjective()}`,
            )
        }

        refreshStatus()

        const feedbackText = this.add.text(12, 82, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const keyX = keyObject.x
        const keyY = keyObject.y

        const keyVisual = this.add.rectangle(
            keyX, keyY, 10, 6, 0xfde047,
        ).setDepth(1)

        const doorX = doorObject.x + doorObject.width / 2
        const doorY = doorObject.y + doorObject.height / 2

        const doorVisual = this.add.rectangle(
            doorX,
            doorY,
            doorObject.width,
            doorObject.height,
            0x92400e,
        ).setDepth(1)

        this.physics.add.existing(doorVisual, true)

        const doorCollider = this.physics.add.collider(
            this.player, doorVisual,
        )

        this.physics.add.collider(this.guard, doorVisual)

        const detection = new DetectionSystem([ground, walls])

        this.guard.setLineOfSightTest((startX, startY, endX, endY) => {
            const blockers: Phaser.Geom.Rectangle[] = []

            if (!mission.doorOpened) {
                blockers.push(doorVisual.getBounds())
            }

            return detection.hasClearLine(
                startX,
                startY,
                endX,
                endY,
                blockers,
            )
        })

        const targets: Interactable[] = [
            {
                id: 'key',
                x: keyX,
                y: keyY,
                radius: 32,
                prompt: 'Pick up key',
                isAvailable: () => !mission.hasKey,
                interact: () => {
                    if (mission.hasKey) {
                        return
                    }

                    mission.collectKey()
                    playSfx(this, 'key')
                    keyVisual.setVisible(false)
                    feedbackText.setText('Key collected.')
                    refreshStatus()
                },
            },
            {
                id: 'door',
                x: doorX,
                y: doorY,
                radius: 32,
                get prompt(): string {
                    return mission.hasKey ? 'Unlock door' : 'Check locked door'
                },
                isAvailable: () => !mission.doorOpened,
                interact: () => {
                    if (mission.doorOpened) {
                        return
                    }

                    if (!mission.hasKey) {
                        feedbackText.setText('Locked. Find the key first.')
                        return
                    }

                    mission.unlockDoor()
                    playSfx(this, 'interact')
                    doorCollider.active = false
                    doorVisual.setVisible(false)

                    const doorBody = doorVisual.body as Phaser.Physics.Arcade.StaticBody
                    doorBody.enable = false
                    feedbackText.setText('Door unlocked.')
                    refreshStatus()
                },
            },
        ]

        this.interactions = new InteractionSystem(this, targets)

// Checkpoint and exit remain preview markers for now.
        const triggers = map.getObjectLayer('Triggers')

        if (!triggers) {
            throw new Error('Object layer "Triggers" is missing')
        }

        this.hideZones = triggers.objects
            .filter((object) => object.name.startsWith('hide-'))
            .map((object) => {
                if (
                    object.x === undefined
                    || object.y === undefined
                    || !object.width
                    || !object.height
                ) {
                    throw new Error(`Hide zone "${object.name}" is invalid`)
                }

                return new Phaser.Geom.Rectangle(
                    object.x,
                    object.y,
                    object.width,
                    object.height,
                )
            })

        this.stealthText = this.add.text(12, 116, 'Stance: STANDING', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#93c5fd',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.detectionText = this.add.text(12, 132, 'Detection: 0%', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.rectangle(332, 98, 136, 6, 0x334155)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10)

        this.detectionFill = this.add.rectangle(
            332, 98, 136, 6, 0xfacc15,
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(11)
            .setScale(0, 1)

        const checkpoints = new CheckpointSystem({
            x: spawn.x,
            y: spawn.y,
        })

        const checkpointText = this.add.text(
            12, 100, 'Checkpoint: START',
            {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
            },
        ).setScrollFactor(0).setDepth(10)

        const checkpointObject = triggers.objects.find(
            (object) => object.name === 'cp-01',
        )

        if (
            !checkpointObject
            || checkpointObject.x === undefined
            || checkpointObject.y === undefined
            || !checkpointObject.width
            || !checkpointObject.height
        ) {
            throw new Error('Checkpoint "cp-01" is missing or invalid')
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

        this.physics.add.overlap(this.player, checkpointZone, () => {
            const activated = checkpoints.activate('cp-01', {
                x: checkpointX,
                y: checkpointY,
            })

            if (activated) {
                playSfx(this, 'checkpoint')
                checkpointText.setText(`Checkpoint: ${checkpoints.getLabel()}`)
                feedbackText.setText('Checkpoint activated.')
            }
        })

        const respawn = (): void => {
            const player = this.player

            if (!player?.body) {
                return
            }

            mission.reset()

            keyVisual.setVisible(true)
            doorVisual.setVisible(true)

            const doorBody = doorVisual.body as Phaser.Physics.Arcade.StaticBody
            doorBody.enable = true
            doorCollider.active = true

            const point = checkpoints.getSpawn()
            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            player.setCrouching(false)
            player.setAlpha(1)
            this.guard?.resetGuard()
            this.detectionText?.setText('Detection: 0%')
            this.detectionFill?.setScale(0, 1)

            refreshStatus()
            feedbackText.setText('Respawned. Key and door reset.')
        }

        this.onCaptured = (): void => {
            playSfx(this, 'caught')
            respawn()
            feedbackText.setText('Captured! Returned to checkpoint.')
        }

        const hazards = triggers.objects.filter(
            (object) => object.name.startsWith('hazard-'),
        )

        if (hazards.length === 0) {
            throw new Error('At least one hazard is required for this test')
        }

        for (const object of hazards) {
            if (
                object.x === undefined
                || object.y === undefined
                || !object.width
                || !object.height
            ) {
                throw new Error(`Hazard "${object.name}" is invalid`)
            }

            const hazard = this.add.rectangle(
                object.x + object.width / 2,
                object.y + object.height / 2,
                object.width,
                object.height,
                0xef4444,
            ).setDepth(1)

            this.physics.add.existing(hazard, true)
            this.physics.add.overlap(this.player, hazard, respawn)
        }

        this.add.text(12, this.scale.height - 10, '[ RESTART CHECKPOINT ]', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fca5a5',
            stroke: '#080d14',
            strokeThickness: 2,
            padding: { x: 3, y: 3 },
        })
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(20)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', respawn)

        for (const object of triggers.objects) {
            if (object.name.startsWith('hazard-')) {
                continue
            }

            const x = object.x ?? 0
            const y = object.y ?? 0
            const width = object.width ?? 0
            const height = object.height ?? 0

            this.add.rectangle(
                x + width / 2,
                y + height / 2,
                width,
                height,
                0x22c55e,
                0.2,
            ).setStrokeStyle(1, 0x22c55e)

            this.add.text(x, y - 14, object.name, {
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#e5e7eb',
            })
        }

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
            throw new Error('Trigger "exit" is missing or invalid')
        }

        const exitZone = this.add.zone(
            exitObject.x + exitObject.width / 2,
            exitObject.y + exitObject.height / 2,
            exitObject.width,
            exitObject.height,
        )

        this.physics.add.existing(exitZone, true)

        this.physics.add.overlap(this.player, exitZone, () => {
            if (!mission.hasKey || !mission.doorOpened) {
                feedbackText.setText('Collect the key and unlock the door first.')
                return
            }

            if (mission.tryComplete()) {
                this.player?.setVelocity(0, 0)
                this.scene.start('LevelCompleteScene', {
                    levelId: 'level-01',
                })
            }
        })

        this.player.setDepth(2)

        const camera = this.cameras.main
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        camera.startFollow(this.player, true)

        this.add.text(12, 12, 'LEVEL 01', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.text(12, 30, 'A/D: Move | Space: Jump | S: Crouch | E: Interact | Esc: Pause', {            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const menuButton = this.add.text(
            this.scale.width - 12, 12, '[ PAUSE ]',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
            },
        )
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(10)
            .setInteractive({ useHandCursor: true })

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

        menuButton.on('pointerdown', returnToMenu)
        this.input.keyboard?.on('keydown-ESC', returnToMenu)

        // Left column: mission and temporary feedback.
        statusText
            .setPosition(12, 46)
            .setFontSize(9)
            .setWordWrapWidth(300)

        feedbackText
            .setPosition(12, 76)
            .setFontSize(9)
            .setWordWrapWidth(300)

// Right column: checkpoint and stealth status.
        checkpointText
            .setPosition(332, 46)
            .setFontSize(9)

        this.stealthText
            ?.setPosition(332, 62)
            .setFontSize(9)

        this.detectionText
            ?.setPosition(332, 78)
            .setFontSize(9)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            this.controls?.destroy()
            this.controls = undefined
            this.player = undefined
            this.interactions?.destroy()
            this.interactions = undefined
            this.hideZones = []
            this.stealthText = undefined
            this.guard = undefined
            this.detectionText = undefined
            this.detectionFill = undefined
            this.onCaptured = undefined
        })
    }

    update(_time: number, delta: number): void {
        if (!this.player || !this.controls) {
            return
        }

        const player = this.player

        player.setCrouching(this.controls.isCrouchHeld())
        player.move(this.controls.getHorizontalAxis())

        if (this.controls.isJumpPressed()) {
            player.jump()
        }

        const bounds = player.getBounds()
        const grounded = Boolean(
            player.body
            && (player.body.blocked.down || player.body.touching.down),
        )

        const insideHideZone = this.hideZones.some((zone) => {
            return zone.contains(bounds.left, bounds.top)
                && zone.contains(bounds.right, bounds.bottom)
        })

        const hidden = player.isCrouching() && grounded && insideHideZone

        player.setAlpha(hidden ? 0.5 : 1)

        this.stealthText?.setText(
            `Stance: ${
                hidden
                    ? 'HIDDEN'
                    : player.isCrouching()
                        ? 'CROUCHING'
                        : 'STANDING'
            }`,
        )

        this.guard?.updateAI(
            delta,
            player.x,
            player.y,
            player.isCrouching(),
            hidden,
        )

        const detection = this.guard?.getDetectionLevel() ?? 0

        this.detectionText?.setText(
            `Detection: ${Math.round(detection * 100)}%`,
        )

        this.detectionFill
            ?.setScale(detection, 1)
            .setFillStyle(detection >= 0.6 ? 0xef4444 : 0xfacc15)

        if (this.guard?.hasCapturedTarget()) {
            this.cameras.main.flash(180, 200, 30, 30)
            this.onCaptured?.()
            return
        }

        this.interactions?.update(
            player.x,
            player.y,
            this.controls.isInteractPressed(),
        )
    }
}
