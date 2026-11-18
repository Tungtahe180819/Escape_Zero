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
import { createCorridorDecor, createCorridorHidingPlaces } from '../../visuals/CorridorDecor'
import { evaluateHiding, hidingLabel } from '../../systems/stealth/HidingSystem'
import { createCoverIndicators } from '../../visuals/CoverIndicators'
import { NightShiftMission } from '../../systems/story/NightShiftMission'
import { createNightShiftGameplay } from '../../systems/story/NightShiftGameplay'

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
        createCorridorDecor(this, map.widthInPixels, 272)

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
        const workSpawn = getPoint('guardWorkSpawn')
        const workGuard = new Guard(this, {
            ...LEVEL02_STEALTH.guard, spawnX: workSpawn.x, spawnY: workSpawn.y,
            leftX: getPoint('guardWorkLeft').x, rightX: getPoint('guardWorkRight').x,
        })
        const guards = [guard, workGuard]

        for (const actor of [player, ...guards]) {
            this.physics.add.collider(actor, ground)
            this.physics.add.collider(actor, walls)
        }

        const detection = new DetectionSystem([ground, walls])

        for (const guard of guards) guard.setLineOfSightTest((x1, y1, x2, y2) => {
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
                continue
            }

            this.add.rectangle(
                bounds.centerX,
                bounds.centerY,
                bounds.width,
                bounds.height,
                object.name.startsWith('hide-') ? 0x172b34 : 0x22c55e,
                0.15,
            ).setStrokeStyle(1, object.name.startsWith('hide-') ? 0x4b616a : 0x22c55e)

            this.add.text(bounds.x, bounds.y - 12, object.name.startsWith('hide-') ? 'NÚP' : object.name === 'exit' ? 'KỸ THUẬT · CẤM VÀO' : 'ĐIỂM LƯU', {
                fontFamily: 'monospace',
                fontSize: '8px',
                color: '#e5e7eb',
            })
        }

        const cameraPoint = getPoint('cameraSpawn')
        const updateCover = createCoverIndicators(this, hideZones)
        const updateCoverLabels = createCorridorHidingPlaces(this, hideZones)

        const surveillance = new SurveillanceCamera(this, {
            ...LEVEL02_STEALTH.camera,
            x: cameraPoint.x,
            y: cameraPoint.y,
        }, detection)

        let levelCompleted = false
        let bridgeReady = false
        const mission = new NightShiftMission()

        const objective = this.add.text(
            12, 46, '',
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
                `Mục tiêu: ${mission.objective()}\nDữ liệu: ${mission.found.size}/3 · Đã chép: ${mission.copied.size}/3 · USB: ${mission.usbReceived ? 'CÓ' : 'CHƯA'}`,
            )
        }

        refreshObjective()

        let interactions: InteractionSystem

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
        this.cameras.main.startFollow(player, false)

        this.add.text(12, 12, 'LEVEL 02 · CA TRỰC', {
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

        const status = this.add.text(332, 62, 'NGOÀI CHỖ NÚP', {
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

        const guardStatus = this.add.text(332, 110, 'Guard: PATROL', {
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
        const story = createNightShiftGameplay(this, player, mission, getPoint,
            (text) => feedback.setText(text), refreshObjective, () => { bridgeReady = true })
        interactions = new InteractionSystem(this, story.targets)

        this.physics.add.overlap(player, checkpointZone, () => {
            if (checkpoints.getLabel() === 'cp-work') return
            if (checkpoints.activate('cp-02', {
                x: checkpointX,
                y: checkpointY,
            })) {
                checkpointStatus.setText(`Checkpoint: ${checkpoints.getLabel()}`)
                playSfx(this, 'checkpoint')
                feedback.setText('Checkpoint activated.')
            }
        })
        const workCheckpoint = getPoint('workCheckpoint')
        const workZone = this.add.zone(workCheckpoint.x, workCheckpoint.y, 48, 32)
        this.physics.add.existing(workZone, true)
        this.add.text(workCheckpoint.x, workCheckpoint.y - 30, 'ĐIỂM LƯU · KHU LÀM VIỆC', { fontFamily: 'monospace', fontSize: '8px', color: '#86efac' }).setOrigin(0.5)
        this.physics.add.overlap(player, workZone, () => {
            if (checkpoints.activate('cp-work', workCheckpoint)) {
                checkpointStatus.setText('Checkpoint: cp-work'); playSfx(this, 'checkpoint')
                feedback.setText('Đã lưu ở khu làm việc. Manh mối và các phần chép xong được giữ khi hồi sinh.')
            }
        })

        const respawn = (message: string): void => {
            if (!player.body) {
                return
            }

            if (levelCompleted) {
                return
            }

            mission.interruptCopy()
            refreshObjective()

            const point = checkpoints.getSpawn()

            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            player.setCrouching(false)
            player.setAlpha(1)

            for (const guard of guards) guard.resetGuard()
            surveillance.resetCamera()

            cameraStatus.setText('Camera: 0%')
            cameraFill.setScale(0, 1)
            guardStatus.setText('Guard: PATROL')
            guardFill.setScale(0, 1)

            status.setText('NGOÀI CHỖ NÚP')
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
            if (event?.repeat || story.overlayOpen()) {
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
            if (bridgeReady) {
                this.scene.start('LevelCompleteScene', { levelId: 'level-02' })
                return
            }
            if (levelCompleted) {
                return
            }

            player.setCrouching(controls.isCrouchHeld())
            player.move(controls.getHorizontalAxis())

            if (controls.isJumpPressed()) {
                player.jump()
            }

            const grounded = Boolean(
                player.body
                && (player.body.blocked.down || player.body.touching.down),
            )

            const cover = evaluateHiding(player.body, hideZones, player.isCrouching(), grounded)
            const hidden = cover.hidden

            player.setAlpha(hidden ? 0.5 : 1)

            surveillance.updateScan(
                delta,
                player.x,
                player.y,
                hidden,
            )
            const cameraSeesMinh = surveillance.isTargetVisible()
            for (const guard of guards) guard.updateAI(delta, player.x, player.y, player.isCrouching(), hidden, cameraSeesMinh)

            const cameraLevel = surveillance.getDetectionLevel()

            cameraStatus.setText(
                `Camera: ${Math.round(cameraLevel * 100)}%${
                    cameraSeesMinh ? ' | BÁO TOÀN BỘ LÍNH' : ''
                }`,
            )

            cameraFill
                .setScale(cameraLevel, 1)
                .setFillStyle(cameraLevel >= 0.6 ? 0xef4444 : 0x38bdf8)
            const guardLevel = Math.max(...guards.map((guard) => guard.getDetectionLevel()))
            updateCover(cover, guardLevel > 0)
            updateCoverLabels(cover, guardLevel > 0)
            status.setText(hidingLabel(cover, guardLevel > 0))

            guardStatus.setText(`Guard: ${guardLevel === 1 ? 'CHASE' : guardLevel > 0 ? 'SEARCH' : 'PATROL'}`)

            guardFill
                .setScale(guardLevel, 1)
                .setFillStyle(guardLevel >= 0.6 ? 0xef4444 : 0xfacc15)

            if (guards.some((guard) => guard.hasCapturedTarget(player, hidden))) {
                const source = 'guard'
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
            story.tick(delta)

            const insideExit = Phaser.Geom.Intersects.RectangleToRectangle(
                player.getBounds(),
                exitBounds,
            )

            if (insideExit && !levelCompleted) {
                if (!mission.usbReceived) {
                    feedback.setText(`Chưa thể rời khu làm việc. ${mission.objective()}`)
                } else {
                    levelCompleted = true
                    player.setVelocity(0, 0)

                    mission.interruptCopy()
                    story.finish()
                }
            }
        }

        this.events.on(Phaser.Scenes.Events.UPDATE, updatePreview)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.UPDATE, updatePreview)
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            controls.destroy()
            interactions.destroy()
            story.destroy()
        })
    }
}
