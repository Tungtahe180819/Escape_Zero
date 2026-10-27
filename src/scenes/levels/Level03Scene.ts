import Phaser from 'phaser'
import { playSfx } from '../../systems/audio/AudioSystem'
import { Player } from '../../entities/Player'
import { InputManager } from '../../systems/input/InputManager'
import { CheckpointSystem } from '../../systems/progress/CheckpointSystem'
import { MovingPlatform } from '../../entities/MovingPlatform'
import { LEVEL03_PLATFORM, LEVEL03_PURSUIT, } from '../../config/level03Config'
import { ScriptedPursuit } from '../../entities/ScriptedPursuit'
import { saveSystem } from '../../systems/progress/SaveSystem'
import { createOutdoorDecor } from '../../visuals/OutdoorDecor'

export class Level03Scene extends Phaser.Scene {
    constructor() {
        super('Level03Scene')
    }

    preload(): void {
        this.load.tilemapTiledJSON(
            'level-03',
            'assets/maps/level-03.json',
        )
        this.load.image(
            'outdoor-tiles',
            'assets/tilesets/outdoor-tiles.png',
        )
    }

    create(): void {
        saveSystem.enterLevel(3)
        const map = this.make.tilemap({ key: 'level-03' })
        const tileset = map.addTilesetImage('greybox', 'outdoor-tiles')
        if (!tileset) {
            throw new Error('Level-03 tileset is missing')
        }

        const background = map.createLayer('Background', tileset, 0, 0)
        const ground = map.createLayer('Ground', tileset, 0, 0)
        const walls = map.createLayer('Walls', tileset, 0, 0)

        if (!background || !ground || !walls) {
            throw new Error('Level-03 tile layers are missing')
        }

        background.setDepth(-2)
        createOutdoorDecor(this, ground)

        ground.setCollisionByExclusion([-1])
        walls.setCollisionByExclusion([-1])

        const objects = map.getObjectLayer('Objects')
        const triggers = map.getObjectLayer('Triggers')

        if (!objects || !triggers) {
            throw new Error('Level-03 object layers are missing')
        }

        const spawn = objects.objects.find(
            (object) => object.name === 'playerSpawn',
        )

        if (!spawn || spawn.x === undefined || spawn.y === undefined) {
            throw new Error('Level-03 playerSpawn is missing')
        }

        this.physics.world.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )

        const controls = new InputManager(this)
        const player = new Player(this, spawn.x, spawn.y)
        player.setDepth(2)

        this.physics.add.collider(player, ground)
        this.physics.add.collider(player, walls)

        const platformObject = objects.objects.find(
            (object) => object.name === 'moving-platform',
        )

        const platformEnd = objects.objects.find(
            (object) => object.name === 'platformEnd',
        )

        if (
            !platformObject
            || platformObject.x === undefined
            || platformObject.y === undefined
            || !platformObject.width
            || !platformObject.height
            || !platformEnd
            || platformEnd.x === undefined
            || platformEnd.y === undefined
        ) {
            throw new Error('Moving platform map objects are missing or invalid')
        }

        const platformX = platformObject.x + platformObject.width / 2
        const platformY = platformObject.y + platformObject.height / 2

        if (Math.abs(platformEnd.y - platformY) > 0.01) {
            throw new Error('Moving platform route must be horizontal')
        }

        const movingPlatform = new MovingPlatform(this, {
            x: platformX,
            y: platformY,
            width: platformObject.width,
            height: platformObject.height,
            endX: platformEnd.x,
            speed: LEVEL03_PLATFORM.speed,
        })

        this.physics.add.collider(player, movingPlatform)

        const checkpoints = new CheckpointSystem({
            x: spawn.x,
            y: spawn.y,
        })

        let highestCheckpoint = -1
        let recovering = false
        let levelCompleted = false

        this.add.text(12, 12, 'LEVEL 03', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.text(12, 30, 'A/D: Move | Space: Jump | Esc: Pause', {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const objective = this.add.text(
            12, 46, 'Objective: Cross the yard and reach safety.',
            {
                fontFamily: 'monospace',
                fontSize: '9px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
                wordWrap: { width: 300 },
            },
        ).setScrollFactor(0).setDepth(10)

        const status = this.add.text(332, 46, 'Checkpoint: START', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#86efac',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        const feedback = this.add.text(12, 80, '', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#fca5a5',
            stroke: '#080d14',
            strokeThickness: 2,
            wordWrap: { width: 300 },
        }).setScrollFactor(0).setDepth(10)

        const getChaseBounds = (name: string): Phaser.Geom.Rectangle => {
            const object = triggers.objects.find((item) => item.name === name)

            if (
                !object
                || object.x === undefined
                || object.y === undefined
                || !object.width
                || !object.height
            ) {
                throw new Error(`Invalid chase trigger "${name}"`)
            }

            return new Phaser.Geom.Rectangle(
                object.x, object.y, object.width, object.height,
            )
        }

        const chaseStart = getChaseBounds('chase-start')
        const chaseEnd = getChaseBounds('chase-end')
        const finishBounds = getChaseBounds('finish')

        if (finishBounds.left < chaseEnd.right) {
            throw new Error('Finish must be after the chase end')
        }

        if (chaseEnd.left <= chaseStart.right) {
            throw new Error('Chase end must be after chase start')
        }

        const pursuit = new ScriptedPursuit(this, {
            ...LEVEL03_PURSUIT,
            worldHeight: map.heightInPixels,
        })

        const chaseStatus = this.add.text(332, 62, 'Pursuit: READY', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        for (const [name, bounds] of [
            ['CHASE START', chaseStart],
            ['CHASE END', chaseEnd],
        ] as const) {
            this.add.rectangle(
                bounds.centerX,
                bounds.centerY,
                bounds.width,
                bounds.height,
                0xf97316,
                0.15,
            ).setStrokeStyle(1, 0xf97316)

            this.add.text(bounds.x, bounds.y - 12, name, {
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#e5e7eb',
            })
        }

        const respawn = (): void => {
            if (levelCompleted || recovering || !player.body) {
                return
            }

            recovering = true

            const point = checkpoints.getSpawn()
            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            movingPlatform.resetPlatform()
            pursuit.resetPursuit()
            chaseStatus.setText('Pursuit: READY')
            objective.setText('Objective: Cross the yard and reach safety.')
            player.setCrouching(false)
            player.setAlpha(1)

            feedback.setText(`Respawned at ${checkpoints.getLabel()}`)

            this.time.delayedCall(100, () => {
                recovering = false
            })
        }

        const checkpointObjects = triggers.objects
            .filter((object) => object.name.startsWith('cp-03-'))
            .sort((a, b) => a.name.localeCompare(b.name))

        if (checkpointObjects.length !== 2) {
            throw new Error('Level-03 requires two checkpoints')
        }

        checkpointObjects.forEach((object, index) => {
            if (
                object.x === undefined
                || object.y === undefined
                || !object.width
                || !object.height
            ) {
                throw new Error(`Invalid checkpoint "${object.name}"`)
            }

            const x = object.x + object.width / 2
            const y = object.y + object.height / 2

            const marker = this.add.rectangle(
                x, y, object.width, object.height, 0x22c55e, 0.2,
            ).setStrokeStyle(1, 0x22c55e)

            this.add.text(object.x, object.y - 12, object.name, {
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#e5e7eb',
            })

            const zone = this.add.zone(x, y, object.width, object.height)
            this.physics.add.existing(zone, true)

            this.physics.add.overlap(player, zone, () => {
                // Backtracking must not replace a later checkpoint.
                if (index <= highestCheckpoint) {
                    return
                }

                highestCheckpoint = index
                checkpoints.activate(object.name, { x, y })
                playSfx(this, 'checkpoint')
                marker.setFillStyle(0x22c55e, 0.5)
                status.setText(`Checkpoint: ${checkpoints.getLabel()}`)
                feedback.setText('Checkpoint activated.')
            })
        })

        const hazards = triggers.objects.filter(
            (object) => object.name.startsWith('hazard-'),
        )

        if (hazards.length !== 3) {
            throw new Error('Level-03 requires three hazards')
        }

        for (const object of hazards) {
            if (
                object.x === undefined
                || object.y === undefined
                || !object.width
                || !object.height
            ) {
                throw new Error(`Invalid hazard "${object.name}"`)
            }

            const hazard = this.add.rectangle(
                object.x + object.width / 2,
                object.y + object.height / 2,
                object.width,
                object.height,
                0xef4444,
            ).setDepth(1)

            this.physics.add.existing(hazard, true)
            this.physics.add.overlap(player, hazard, respawn)
        }

        this.cameras.main.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )
        this.cameras.main.startFollow(player, true)

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
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', returnToMenu)

        this.add.text(12, this.scale.height - 10, '[ RESTART CHECKPOINT ]', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#fca5a5',
            backgroundColor: '#111827',
            padding: { x: 3, y: 3 },
        })
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(20)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', respawn)

        this.input.keyboard?.on('keydown-ESC', returnToMenu)

        const updateLevel = (_time: number, delta: number): void => {
            if (levelCompleted) {
                return
            }

            if (recovering) {
                player.setVelocityX(0)
                return
            }

            player.move(controls.getHorizontalAxis())

            if (controls.isJumpPressed()) {
                player.jump()
            }

            if (player.body && player.body.bottom >= map.heightInPixels - 1) {
                respawn()
                return
            }

            const bounds = player.getBounds()

            if (
                pursuit.getState() === 'IDLE'
                && Phaser.Geom.Intersects.RectangleToRectangle(bounds, chaseStart)
            ) {
                pursuit.start(chaseStart.left)
                playSfx(this, 'chase')
                feedback.setText('Run! Escape the pursuit.')
            }

            pursuit.updatePursuit(delta)

            if (pursuit.hasCaught(bounds.left)) {
                playSfx(this, 'caught')
                respawn()
                feedback.setText('Caught! Pursuit reset at checkpoint.')
                return
            }

            if (
                pursuit.getState() === 'ACTIVE'
                && Phaser.Geom.Intersects.RectangleToRectangle(bounds, chaseEnd)
            ) {
                pursuit.finish()
                feedback.setText('Pursuit escaped.')
            }

            const pursuitState = pursuit.getState()
            chaseStatus.setText(
                pursuitState === 'ACTIVE'
                    ? 'Pursuit: RUN!'
                    : pursuitState === 'FINISHED'
                        ? 'Pursuit: ESCAPED'
                        : 'Pursuit: READY',
            )
            objective.setText(
                pursuitState === 'ACTIVE'
                    ? 'Objective: Run right and escape the pursuit!'
                    : pursuitState === 'FINISHED'
                        ? 'Objective: Reach the safe zone.'
                        : 'Objective: Cross the yard and reach safety.',
            )

            if (
                pursuit.getState() === 'FINISHED'
                && Phaser.Geom.Intersects.RectangleToRectangle(
                    player.getBounds(),
                    finishBounds,
                )
            ) {
                levelCompleted = true
                player.setVelocity(0, 0)
                this.scene.start('DemoCompleteScene')
            }
        }

        this.events.on(Phaser.Scenes.Events.UPDATE, updateLevel)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.UPDATE, updateLevel)
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            controls.destroy()
        })
    }
}
