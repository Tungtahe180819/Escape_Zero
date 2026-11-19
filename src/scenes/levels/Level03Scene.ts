import { createCoverLabels } from '../../visuals/CoverIndicators'
import Phaser from 'phaser'
import { settingsSystem } from '../../systems/settings/SettingsSystem'
import { playSfx } from '../../systems/audio/AudioSystem'
import { Player } from '../../entities/Player'
import { InputManager } from '../../systems/input/InputManager'
import { CheckpointSystem } from '../../systems/progress/CheckpointSystem'
import { Drawbridge } from '../../entities/Drawbridge'
import { LEVEL03_PURSUIT } from '../../config/level03Config'
import { ScriptedPursuit } from '../../entities/ScriptedPursuit'
import { saveSystem } from '../../systems/progress/SaveSystem'
import { createOutdoorDecor } from '../../visuals/OutdoorDecor'
import { createPursuitRoute } from '../../systems/pursuit/PursuitRoute'
import { FinalFenceGameplay } from '../../systems/story/FinalFenceGameplay'
import { Guard } from '../../entities/Guard'
import { LEVEL02_STEALTH } from '../../config/stealthConfig'
import { drawYardCrate, drawDrainPit, labelOutdoorAreas } from '../../visuals/FinalFenceDecor'
import { FenceExitEffects } from '../../visuals/FenceExitEffects'
import { level03X } from '../../config/level03Layout'
import { SurveillanceCamera } from '../../entities/SurveillanceCamera'
import { DetectionSystem } from '../../systems/stealth/DetectionSystem'
import { YardDogAI } from '../../systems/stealth/YardDogAI'

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
        const story = new FinalFenceGameplay(this, player)
        labelOutdoorAreas(this)
        const yardGuards = [new Guard(this, {
            ...LEVEL02_STEALTH.guard, spawnX: level03X(704), spawnY: 276, leftX: level03X(576), rightX: level03X(1056),
        })]
        for (const guard of yardGuards) {
            this.physics.add.collider(guard, ground)
            this.physics.add.collider(guard, walls)
        }
        const crateArt = [592, 816, 1080].map(x => drawYardCrate(this, level03X(x)))
        const covers = [592, 816, 1080].map(x => new Phaser.Geom.Rectangle(level03X(x) - 24, 240, 48, 48))
        const updateCoverLabels = createCoverLabels(this, covers, [
            'Kiện hàng đầu sân', 'Kiện hàng giữa sân', 'Kiện hàng cạnh lối mương',
        ], 9)
        const coverRim = this.add.graphics().setDepth(4)
        const yardDetection = new DetectionSystem([ground, walls])
        const yardCamera = new SurveillanceCamera(this, {
            ...LEVEL02_STEALTH.camera, x: level03X(832), y: 112, range: 280,
        }, yardDetection)
        const dogAI = new YardDogAI(level03X(960), level03X(544) + 16, level03X(1152) - 16)
        const dogLabel = this.add.text(0, 0, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '8px', color: '#d9c39b', stroke: '#0c141b', strokeThickness: 3,
        }).setOrigin(0.5, 1).setDepth(5)
        // A dog silhouette uses native shapes, pending final animal artwork.
        const dog = this.add.container(level03X(960), 288, [
            this.add.rectangle(0, -7, 18, 9, 0x9a7955),
            this.add.rectangle(10, -11, 8, 9, 0x9a7955),
            this.add.triangle(9, -18, 0, 6, 3, 0, 6, 6, 0x9a7955),
            this.add.rectangle(-6, -2, 3, 8, 0x9a7955),
            this.add.rectangle(6, -2, 3, 8, 0x9a7955),
            this.add.rectangle(-12, -12, 8, 3, 0x9a7955),
        ]).setDepth(2)

        this.physics.add.collider(player, ground)
        this.physics.add.collider(player, walls)

        const bridgeRoute = createPursuitRoute(ground.layer.data, map.tileWidth, map.tileHeight)
        const bridgeGap = bridgeRoute.gaps.reduce((widest, gap) =>
            gap.right - gap.left > widest.right - widest.left ? gap : widest,
        )
        const bridge = new Drawbridge(this, bridgeGap.left, bridgeGap.right, bridgeRoute.groundY)
        this.physics.add.collider(player, bridge.surface)

        const checkpoints = new CheckpointSystem({
            x: spawn.x,
            y: spawn.y,
        })

        let highestCheckpoint = -1
        let recovering = false
        let levelCompleted = false

        this.add.text(12, 12, 'LEVEL 03', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '12px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        this.add.text(12, 30, 'A/D: Move | Space: Jump | S: Crouch | E: Interact | Esc: Pause', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '9px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const objective = this.add.text(
            12, 46, 'Objective: Cross the yard and reach safety.',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '9px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
                wordWrap: { width: 300 },
            },
        ).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const status = this.add.text(332, 46, 'Checkpoint: START', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '9px',
            color: '#86efac',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const feedback = this.add.text(12, 80, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '9px',
            color: '#fca5a5',
            stroke: '#080d14',
            strokeThickness: 2,
            wordWrap: { width: 300 },
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

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
        const fenceEffects = new FenceExitEffects(this, chaseStart.left - 20, finishBounds)
        let wasFenceOff = false
        const exitDirection = this.add.text(12, 116, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#a5e0b5',
            stroke: '#080d14', strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        if (finishBounds.left < chaseEnd.right) {
            throw new Error('Finish must be after the chase end')
        }

        if (chaseEnd.left <= chaseStart.right) {
            throw new Error('Chase end must be after chase start')
        }

        const pursuitRoute = createPursuitRoute(
            ground.layer.data,
            map.tileWidth,
            map.tileHeight,
        )

        const pursuit = new ScriptedPursuit(this, {
            ...LEVEL03_PURSUIT,
            ...pursuitRoute,
        })

        const chaseStatus = this.add.text(332, 62, 'Pursuit: READY', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '9px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        // Chase triggers remain invisible; the alarm and pursuit provide feedback.

        const respawn = (): void => {
            if (levelCompleted || recovering || !player.body) {
                return
            }

            recovering = true

            const point = checkpoints.getSpawn()
            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            bridge.setProgress(story.mission.bridgeProgress)
            pursuit.resetPursuit()
            story.mission.retry()
            wasFenceOff = false
            fenceEffects.update(0, false, false)
            exitDirection.setText('')
            for (const guard of yardGuards) guard.resetGuard()
            yardCamera.resetCamera()
            dogAI.reset()
            dog.setPosition(dogAI.x, 288)
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

            const marker = this.add.rectangle(x, 285, 12, 4, 0x738482)
            this.add.text(x, 299, 'ĐIỂM LƯU', {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '9px',
                color: '#e5e7eb',
            }).setOrigin(0.5)

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
                marker.setFillStyle(0x86c5a1)
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
                0x111d24,
                0,
            ).setDepth(1)
            drawDrainPit(this, object.x, object.y, object.width, object.height)

            this.physics.add.existing(hazard, true)
            this.physics.add.overlap(player, hazard, respawn)
        }

        this.cameras.main.setBounds(
            0, 0, map.widthInPixels, map.heightInPixels,
        )
        this.cameras.main.startFollow(player, false)

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
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
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
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
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

            story.mission.tickBridge(delta)
            bridge.setProgress(story.mission.bridgeProgress)

            player.setCrouching(controls.isCrouchHeld())
            player.move(controls.getHorizontalAxis())

            const jumped = controls.isJumpPressed()
            if (jumped) {
                player.jump()
            }

            if (player.body && player.body.bottom >= map.heightInPixels - 1) {
                respawn()
                return
            }

            const bounds = player.getBounds()
            const body = player.body as Phaser.Physics.Arcade.Body
            const coverIndex = covers.findIndex(cover => body.left >= cover.left && body.right <= cover.right
                && body.top >= cover.top && body.bottom <= cover.bottom + 1)
            const hidden = player.isCrouching() && body.blocked.down && coverIndex >= 0
            const alerted = yardGuards.some(guard => guard.getDetectionLevel() > 0) || dogAI.state !== 'PATROL'
            player.setAlpha(hidden ? 0.45 : 1)
            coverRim.clear()
            crateArt.forEach((art, index) => art.setAlpha(hidden && index === coverIndex ? 0.65 : 1))
            updateCoverLabels({ zoneIndex: coverIndex, hidden }, alerted)
            if (coverIndex >= 0) {
                const cover = covers[coverIndex]
                const color = hidden ? alerted ? 0xe1b773 : 0x86c5a1 : 0xb8c4c5
                coverRim.lineStyle(1, color, 0.8).strokeRect(cover.x, 255, cover.width, 33)
            }
            yardCamera.updateScan(delta, player.x, player.y, hidden)
            dogAI.update(delta, {
                x: player.x, y: player.y, hidden,
                noisy: !player.isCrouching() && Math.abs(body.velocity.x) > 70,
                jumped: jumped && body.velocity.y < 0,
                clearLine: yardDetection.hasClearLine(dogAI.x, 276, player.x, player.y),
            })
            dog.setPosition(dogAI.x, 288).setScale(dogAI.facing, 1)
            dogLabel.setPosition(dogAI.x, 260).setText(dogAI.label())
            const reported = yardCamera.isTargetVisible() || dogAI.seesTarget
            for (const guard of yardGuards) {
                guard.updateAI(delta, player.x, player.y, player.isCrouching(), hidden, reported)
                // Keep yard patrols away from the pit edges.
                guard.x = Phaser.Math.Clamp(guard.x, level03X(560), level03X(1104))
                if (guard.hasCapturedTarget(player, hidden)) { respawn(); return }
            }
            if (!(hidden && dogAI.state === 'PATROL') && body.left <= dogAI.x + 14 && body.right >= dogAI.x - 14 && body.bottom > 274) {
                respawn()
                feedback.setText('Chó đã chạm tới Minh. Đi chậm bằng S để tránh gây tiếng động; khuất mắt rồi mới núp.')
                return
            }
            story.update(controls.isInteractPressed())
            if (!this.scene.isActive()) return
            if (story.mission.tick(delta)) {
                respawn()
                feedback.setText('Điện đã trở lại. Giữ kết quả giải đố; kéo cầu dao để thử lại.')
                return
            }
            const fenceOff = story.mission.running || story.mission.escaped
            fenceEffects.update(delta, fenceOff, pursuit.getState() === 'FINISHED')
            if (fenceOff && !wasFenceOff) {
                feedback.setText('ĐÃ NGẮT ĐIỆN HÀNG RÀO! Qua cổng mở, chạy tới khe rào cuối sân →')
            }
            wasFenceOff = fenceOff
            exitDirection.setText(fenceOff ? player.x < finishBounds.left - 120
                ? 'LỐI THOÁT → Khe rào cuối sân'
                : 'LỐI THOÁT NGAY PHÍA TRƯỚC → Đi vào khe rào' : '')
            // The powered fence cannot be crossed before the deliberate breaker action.
            if (!story.mission.running && !story.mission.escaped && player.x > chaseStart.left - 20) {
                player.body?.reset(chaseStart.left - 24, player.y)
                player.setVelocityX(0)
                feedback.setText('Hàng rào còn điện. Hoàn tất chuẩn bị rồi kéo cầu dao.')
            }

            if (
                pursuit.getState() === 'IDLE'
                && story.mission.running
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
                feedback.setText('Đã thoát lính! Đi tiếp qua khe rào có biển LỐI THOÁT →')
            }

            const pursuitState = pursuit.getState()
            chaseStatus.setText(
                pursuitState === 'ACTIVE'
                    ? 'Pursuit: RUN!'
                    : pursuitState === 'FINISHED'
                        ? 'Pursuit: ESCAPED'
                        : 'Pursuit: READY',
            )
            objective.setText(story.mission.objective())

            if (
                pursuit.getState() === 'FINISHED'
                && Phaser.Geom.Intersects.RectangleToRectangle(
                    player.getBounds(),
                    finishBounds,
                )
            ) {
                levelCompleted = true
                player.setVelocity(0, 0)
                story.mission.finish()
                this.scene.start('Level03EndingScene', { helpedPorter: story.mission.bagReturned })
                return
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
