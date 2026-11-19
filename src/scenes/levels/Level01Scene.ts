import Phaser from 'phaser'
import { showGameplayCue, updatePursuitCue } from '../../systems/audio/GameplayCue'
import { settingsSystem } from '../../systems/settings/SettingsSystem'
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
import { createCellStoryDecor } from '../../visuals/CellStoryDecor'
import { LEVEL01_LAN_INTRO } from '../../config/level01Story'
import { createCellStairs } from '../../systems/story/CellStairs'
import { landCellPlayer, stabilizeCellFloor } from '../../systems/story/CellLanding'
import { createCellRoomDoors } from '../../systems/story/CellRoomDoors'
import { CellEscapePuzzle } from '../../systems/story/CellEscapePuzzle'
import { createCellPuzzleInteractions } from '../../systems/story/CellPuzzleInteractions'
import { createCellPuzzleDecor } from '../../visuals/CellPuzzleDecor'
import type { DialogueLine } from '../../systems/story/DialogueTypes'
import { evaluateHiding, hidingLabel } from '../../systems/stealth/HidingSystem'
import { createCoverIndicators, createCoverLabels } from '../../visuals/CoverIndicators'
import type { HidingState } from '../../systems/stealth/HidingSystem'

export class Level01Scene extends Phaser.Scene {
    private player?: Player
    private controls?: InputManager
    private guards: Guard[] = []
    private interactions?: InteractionSystem
    private hideZones: Phaser.Geom.Rectangle[] = []
    private updateCover?: (state: HidingState, alerted: boolean) => void
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
        this.load.image('cell-key', 'assets/props/cell-key.png')
        this.load.image('cell-door-closed', 'assets/props/cell-door-closed.png')
        this.load.image('cell-door-open', 'assets/props/cell-door-open.png')
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

        for (const offset of [0, 272, 544]) {
            createPrisonDecor(this, map.widthInPixels, offset)
        }
        for (const [index, name] of ['TẦNG 3 · CHỐT GÁC', 'TẦNG 2 · KHU TRỰC', 'TẦNG 1 · BUỒNG GIAM'].entries()) {
            this.add.text(720, 160 + index * 272, name, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '12px', color: '#94a3b8',
            }).setOrigin(0.5).setDepth(-1)
        }

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

        const getMapPoint = (name: string): { x: number; y: number } => {
            const object = objects.objects.find((item) => item.name === name)

            if (
                !object
                || object.x === undefined
                || object.y === undefined
            ) {
                throw new Error(`Map point "${name}" is missing`)
            }

            return { x: object.x, y: object.y }
        }

        this.guards = ['guard', 'guard02', 'guard03', 'guard04'].map((prefix) => {
            const spawn = getMapPoint(`${prefix}Spawn`)
            const left = getMapPoint(`${prefix}PatrolLeft`)
            const right = getMapPoint(`${prefix}PatrolRight`)
            if (left.x >= right.x || spawn.y !== left.y || left.y !== right.y) {
                throw new Error(`Invalid patrol route: ${prefix}`)
            }
            const guard = new Guard(this, {
                ...LEVEL01_STEALTH.guard,
                spawnX: spawn.x, spawnY: spawn.y,
                leftX: left.x, rightX: right.x,
            })
            this.physics.add.collider(guard, ground)
            this.physics.add.collider(guard, walls)
            return guard
        })

        const keyObject = objects.objects.find(
            (object) => object.name === 'key',
        )
        const doorObject = objects.objects.find(
            (object) => object.name === 'door',
        )
        const lanPoint = getMapPoint('lan')
        const bedObject = objects.objects.find((object) => object.name === 'bed')

        if (
            !bedObject || bedObject.x === undefined || bedObject.y === undefined ||
            !bedObject.width || !bedObject.height || bedObject.height < 12
        ) {
            throw new Error('Object "bed" is missing or invalid')
        }

        createCellStoryDecor(this, lanPoint, {
            x: bedObject.x, y: bedObject.y,
            width: bedObject.width, height: bedObject.height,
        })

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

        // A full level restart recreates the story; checkpoint respawn does not.
        const mission = new MissionSystem()
        const puzzle = new CellEscapePuzzle()
        let escapeGate: Phaser.GameObjects.Image | undefined

        const statusText = this.add.text(12, 50, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '10px',
            color: '#86efac',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const refreshStatus = (): void => {
            statusText.setText(
                `Chìa khóa: ${mission.hasKey ? 'CÓ' : 'CHƯA'} | Cửa: ${
                    mission.doorOpened ? 'MỞ' : 'KHÓA'
                }\nMục tiêu: ${mission.doorOpened ? puzzle.getObjective() : mission.getObjective()}`,
            )
        }

        refreshStatus()

        const feedbackText = this.add.text(12, 82, '', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '10px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const keyX = keyObject.x
        const keyY = keyObject.y

        const keyHook = this.add.graphics().setDepth(1)
        keyHook.lineStyle(1, 0x9aa7b2)
        keyHook.lineBetween(doorObject.x + doorObject.width, keyY - 7, keyX, keyY - 7)
        keyHook.lineBetween(keyX, keyY - 7, keyX, keyY - 3)

        const keyVisual = this.add.image(keyX, keyY, 'cell-key')
            .setDisplaySize(16, 8)
            .setDepth(1)
            .setVisible(false)

        // A gentle pulse makes the tiny collectible easier to notice.
        const keyPulse = this.tweens.add({
            targets: keyVisual,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            paused: true,
        })

        const doorX = doorObject.x + doorObject.width / 2
        const doorY = doorObject.y + doorObject.height / 2

        const doorVisual = this.add.image(
            doorX,
            doorY,
            'cell-door-closed',
        )
            .setDisplaySize(doorObject.width, doorObject.height)
            .setDepth(1)

        // Create the static body AFTER sizing the image: preserve map bounds.
        this.physics.add.existing(doorVisual, true)

        const doorCollider = this.physics.add.collider(
            this.player, doorVisual,
        )

        for (const guard of this.guards) this.physics.add.collider(guard, doorVisual)

        const syncMissionVisuals = (): void => {
            const showKey = !mission.hasKey
            keyVisual.setVisible(showKey).setAlpha(1)
            if (showKey) {
                keyPulse.restart()
            } else {
                keyPulse.pause()
            }

            doorVisual.setTexture(
                mission.doorOpened ? 'cell-door-open' : 'cell-door-closed',
            ).setVisible(true)
            const doorBody = doorVisual.body as Phaser.Physics.Arcade.StaticBody
            doorBody.enable = !mission.doorOpened
            doorCollider.active = !mission.doorOpened
        }

        syncMissionVisuals()

        const detection = new DetectionSystem([ground, walls])

        for (const guard of this.guards) {
        guard.setLineOfSightTest((startX, startY, endX, endY) => {
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
        }

        const targets: Interactable[] = [
            {
                id: 'lan', x: lanPoint.x, y: lanPoint.y, radius: 30,
                prompt: 'Nói chuyện với Lan',
                isAvailable: () => true,
                interact: () => {
                    if (this.scene.isActive('DialogueScene')) {
                        return
                    }

                    this.player?.setVelocityX(0)
                    this.input.keyboard?.resetKeys()
                    this.scene.launch('DialogueScene', {
                        returnScene: this.scene.key,
                        lines: LEVEL01_LAN_INTRO,
                        onComplete: () => {
                            if (mission.hasHairpin) return
                            mission.receiveHairpin()
                            refreshStatus()
                            feedbackText.setText('Đã nhận kẹp tóc. Đến song cửa, nhấn E để móc chìa.')
                        },
                    })
                    this.scene.pause()
                },
            },
            {
                id: 'key',
                // Interaction is inside the locked cell; artwork is outside.
                x: doorObject.x - 16,
                y: doorY,
                radius: 32,
                prompt: 'Dùng kẹp tóc móc chìa',
                isAvailable: () => mission.hasHairpin && !mission.hasKey,
                interact: () => {
                    if (!mission.collectKey()) {
                        return
                    }

                    playSfx(this, 'key')
                    syncMissionVisuals()
                    feedbackText.setText('Đã móc được chìa khóa. Nhấn E tại cửa để mở khóa.')
                    refreshStatus()
                },
            },
            {
                id: 'door',
                x: doorX,
                y: doorY,
                radius: 32,
                get prompt(): string {
                    return mission.hasKey ? 'Mở khóa cửa' : 'Kiểm tra cửa khóa'
                },
                isAvailable: () => !mission.doorOpened,
                interact: () => {
                    if (mission.doorOpened) {
                        return
                    }

                    if (!mission.hasKey) {
                        feedbackText.setText('Cửa bị khóa. Cần tìm chìa khóa trước.')
                        return
                    }

                    mission.unlockDoor()
                    playSfx(this, 'interact')
                    syncMissionVisuals()
                    feedbackText.setText('Cửa đã mở. Ra hành lang và tìm chỗ núp.')
                    refreshStatus()
                },
            },
        ]

        const travel = (point: { x: number; y: number }, label: string): void => {
                if (!this.player) return
                const floor = ground.getTileAtWorldXY(point.x, point.y + map.tileHeight)
                landCellPlayer(this.player, point.x, floor?.pixelY ?? point.y + map.tileHeight)
                this.cameras.main.centerOn(this.player.x, this.player.y)
                this.input.keyboard?.resetKeys()
                feedbackText.setText(label)
        }
        const overlayOpen = (): boolean => ['DialogueScene', 'CodeLockScene', 'StoryChoiceScene', 'PauseScene', 'SettingsScene']
            .some((key) => this.scene.isActive(key))
        const speak = (lines: readonly DialogueLine[], onComplete: () => void = () => {}): void => {
            if (overlayOpen()) return
            this.player?.setVelocity(0, 0)
            this.input.keyboard?.resetKeys()
            this.scene.launch('DialogueScene', { returnScene: this.scene.key, lines, onComplete })
            this.scene.pause()
        }
        let refreshCircuit: () => void = () => {}
        const puzzleChanged = (): void => {
            refreshStatus()
            refreshCircuit()
            if (escapeGate) {
                escapeGate.setTexture(puzzle.gateUnlocked ? 'cell-door-open' : 'cell-door-closed')
                const body = escapeGate.body as Phaser.Physics.Arcade.StaticBody
                body.enable = !puzzle.gateUnlocked
            }
        }
        targets.push(...createCellPuzzleInteractions(puzzle, getMapPoint, () => mission.doorOpened,
            speak, puzzleChanged, () => {
                if (overlayOpen()) return
                if (this.guards.some((guard) => guard.getAlertState() !== 'PATROL')) {
                    feedbackText.setText('Lính đang cảnh giác. Cắt đuôi và chờ chúng đi tuần rồi mới giải khóa.')
                    return
                }
                this.player?.setVelocity(0, 0)
                this.input.keyboard?.resetKeys()
                this.scene.launch('CodeLockScene', {
                    returnScene: this.scene.key,
                    notes: puzzle.getLockNotes(),
                    onSubmit: (code: string): string | null => {
                        const error = puzzle.submit(code)
                        if (!error) {
                            playSfx(this, 'interact')
                            puzzleChanged()
                            feedbackText.setText('Cổng đã mở. Đến cửa bên phải để sang khu giám sát.')
                        }
                        return error
                    },
                })
                this.scene.pause()
            },
            () => {
                if (overlayOpen()) return
                this.player?.setVelocity(0, 0)
                this.input.keyboard?.resetKeys()
                this.scene.launch('StoryChoiceScene', {
                    returnScene: this.scene.key,
                    onSelect: (id: string) => puzzle.confrontArchivist(id),
                    onSuccess: () => {
                        puzzleChanged()
                        feedbackText.setText('Đã chỉ ra mâu thuẫn. Nhấn E với người ghi sổ để nghe lời giải thích và nhận trang gốc.')
                    },
                })
                this.scene.pause()
            },
            (message) => feedbackText.setText(message),
        ))
        refreshCircuit = createCellPuzzleDecor(this, getMapPoint,
            () => puzzle.circuitProgress)
        const openJournal = (event?: KeyboardEvent): void => {
            if (!event?.repeat) speak(puzzle.getJournal())
        }
        this.add.text(this.scale.width - 12, this.scale.height - 10, '[ NHẬT KÝ · J ]', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#93c5fd',
            stroke: '#080d14', strokeThickness: 2,
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(20)
            .setInteractive({ useHandCursor: true }).on('pointerdown', () => openJournal())
        this.input.keyboard?.on('keydown-J', openJournal)
        targets.push(...createCellStairs(this, getMapPoint, () => mission.doorOpened, travel))
        targets.push(...createCellRoomDoors(getMapPoint, () => mission.doorOpened, travel))
        const storyDoor = getMapPoint('roomDoorStory')
        const guardDoor = getMapPoint('roomDoorStealth')
        this.add.image((storyDoor.x + guardDoor.x) / 2, storyDoor.y - 12, 'cell-door-closed')
            .setDisplaySize(16, 48).setDepth(1)
        this.add.text(808, 438, 'CỬA · NHẤN E', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#93c5fd',
            stroke: '#080d14', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(1)
        for (const room of [{ x: 1120, name: 'PHÒNG HỒ SƠ · AN TOÀN' }, { x: 400, name: 'PHÒNG GÁC · 1 LÍNH' }]) {
            this.add.text(room.x, 400, room.name, {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#cbd5e1',
            }).setOrigin(0.5).setDepth(1)
        }
        const desk = this.add.graphics().setDepth(-1)
        desk.fillStyle(0x55534a)
        desk.fillRect(1088, 492, 64, 5)
        desk.fillRect(1092, 497, 4, 15)
        desk.fillRect(1144, 497, 4, 15)
        desk.fillStyle(0xc4bd9b)
        desk.fillRect(1110, 489, 18, 3)
        this.interactions = new InteractionSystem(this, targets)

        // Hiding recesses and short spatial hints form the corridor route.
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

        const updateCover = createCoverIndicators(this, this.hideZones)
        const updateLabels = createCoverLabels(this, this.hideZones, [
            'Tủ đầu hành lang', 'Tủ giữa khu giam', 'Tủ gần cầu thang',
            'Tủ trái phòng gác', 'Tủ giữa phòng gác', 'Tủ phải phòng gác',
            'Tủ đầu tầng 3', 'Tủ chốt gác trái', 'Tủ trước phòng điều khiển',
            'Tủ sau phòng điều khiển', 'Tủ chốt gác phải', 'Tủ gần cổng ra',
        ])
        this.updateCover = (state, alerted) => {
            updateCover(state, alerted)
            updateLabels(state, alerted)
        }
        this.stealthText = this.add.text(12, 116, 'NGOÀI CHỖ NÚP', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '10px',
            color: '#93c5fd',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        this.detectionText = this.add.text(12, 132, 'Lính: PATROL', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '10px',
            color: '#fef08a',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        this.add.rectangle(332, 98, 136, 6, 0x334155)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        this.detectionFill = this.add.rectangle(
            332, 98, 136, 6, 0xfacc15,
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(11)
            .setScale(0, 1).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const checkpoints = new CheckpointSystem({
            x: spawn.x,
            y: spawn.y,
        })

        const checkpointText = this.add.text(
            12, 100, 'Checkpoint: START',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '10px',
                color: '#86efac',
                stroke: '#080d14',
                strokeThickness: 2,
            },
        ).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const checkpointObjects = triggers.objects.filter(
            (object) => object.name.startsWith('cp-'),
        )

        if (!checkpointObjects.length) throw new Error('Level-01 needs a checkpoint')
        const checkpointMarkers = new Map<string, Phaser.GameObjects.Rectangle>()
        let highestCheckpoint = 0
        for (const [index, checkpointObject] of checkpointObjects.entries()) {

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

        if (checkpointObject.name === 'cp-01' && checkpointObject.x < doorObject.x + doorObject.width) {
            throw new Error('Level-01 checkpoint must be after the cell door')
        }

        const checkpointZone = this.add.zone(
            checkpointX,
            checkpointY,
            checkpointObject.width,
            checkpointObject.height,
        )

        this.physics.add.existing(checkpointZone, true)

        this.physics.add.overlap(this.player, checkpointZone, () => {
            if (!mission.doorOpened || index < highestCheckpoint) {
                return
            }
            const activated = checkpoints.activate(checkpointObject.name, {
                x: checkpointX,
                y: checkpointY,
            })

            if (activated) {
                highestCheckpoint = index
                for (const [name, marker] of checkpointMarkers) {
                    marker.setFillStyle(name === checkpointObject.name ? 0x22c55e : 0x64748b)
                }
                playSfx(this, 'checkpoint')
                checkpointText.setText(`Checkpoint: ${checkpoints.getLabel()}`)
                feedbackText.setText('Đã lưu checkpoint. Nếu bị bắt, cửa vẫn mở.')
            }
        })
        }

        const respawn = (): void => {
            const player = this.player

            if (!player?.body) {
                return
            }

            mission.restoreAtCheckpoint(checkpoints.getLabel() !== 'START')
            syncMissionVisuals()

            const point = checkpoints.getSpawn()
            player.body.reset(point.x, point.y)
            player.setVelocity(0, 0)
            player.setCrouching(false)
            player.setAlpha(1)
            for (const guard of this.guards) guard.resetGuard()
            this.detectionText?.setText('Lính: PATROL')
            this.detectionFill?.setScale(0, 1)

            refreshStatus()
            feedbackText.setText(
                mission.doorOpened
                    ? 'Đã trở lại checkpoint. Cửa vẫn mở.'
                    : 'Đã trở lại phòng giam. Lời nhắc của Lan vẫn được giữ.',
            )
        }

        this.onCaptured = (): void => {
            showGameplayCue(this, 'caught')
            respawn()
            feedbackText.setText('Bị phát hiện! Đã trở lại checkpoint.')
        }

        const hazards = triggers.objects.filter(
            (object) => object.name.startsWith('hazard-'),
        )

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
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
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

            if (object.name.startsWith('hint-')) {
                const message = object.properties?.find(
                    (property: { name: string; value: unknown }) => property.name === 'message',
                )?.value
                if (typeof message !== 'string' || !object.width || !object.height) {
                    throw new Error(`Story hint "${object.name}" is invalid`)
                }
                const zone = this.add.zone(
                    (object.x ?? 0) + object.width / 2,
                    (object.y ?? 0) + object.height / 2,
                    object.width, object.height,
                )
                this.physics.add.existing(zone, true)
                let shown = false
                this.physics.add.overlap(this.player, zone, () => {
                    if (shown || !mission.doorOpened) return
                    shown = true
                    feedbackText.setText(message)
                })
                continue
            }

            const x = object.x ?? 0
            const y = object.y ?? 0
            const width = object.width ?? 0
            const height = object.height ?? 0

            if (object.name.startsWith('hide-')) {
                // A recessed locker bank, behind the player: no solid body.
                // Concealment still requires crouching fully inside the zone.
                const recess = this.add.graphics().setDepth(-1)
                recess.fillStyle(0x101c26)
                recess.fillRect(x, y, width, height)
                recess.lineStyle(2, 0x4b616a)
                recess.strokeRect(x, y, width, height)
                for (let offset = 16; offset < width; offset += 16) {
                    recess.lineBetween(x + offset, y + 2, x + offset, y + height - 2)
                }
                continue
            }

            if (object.name.startsWith('cp-')) {
                // Small floor beacon; the existing overlap zone stays invisible.
                const marker = this.add.rectangle(x + width / 2, y + height - 6, 8, 12, 0x64748b)
                    .setStrokeStyle(1, 0x86efac).setDepth(1)
                checkpointMarkers.set(object.name, marker)
                this.add.rectangle(x + width / 2, y + height - 1, width, 2, 0x22c55e, 0.5)
                this.add.text(x + width / 2, y + height - 28, 'ĐIỂM LƯU', {
                    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#86efac',
                    stroke: '#080d14', strokeThickness: 2,
                }).setOrigin(0.5).setDepth(1)
                continue
            }

            this.add.rectangle(
                x + width / 2,
                y + height / 2,
                width,
                height,
                0x22c55e,
                0.2,
            ).setStrokeStyle(1, 0x22c55e)

            this.add.text(x, y - 14, object.name === 'exit' ? '→ KHU GIÁM SÁT' : 'ĐIỂM LƯU', {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
                fontSize: '9px',
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
        escapeGate = this.add.image(exitObject.x + 8, exitObject.y + exitObject.height / 2, 'cell-door-closed')
            .setDisplaySize(16, exitObject.height).setDepth(1)
        this.physics.add.existing(escapeGate, true)
        this.physics.add.collider(this.player, escapeGate)
        for (const guard of this.guards) this.physics.add.collider(guard, escapeGate)
        puzzleChanged()

        this.physics.add.overlap(this.player, exitZone, () => {
            if (!mission.hasKey || !mission.doorOpened) {
                feedbackText.setText('Cần tìm chìa khóa và mở cửa trước.')
                return
            }
            if (!puzzle.gateUnlocked) {
                feedbackText.setText('Cổng khóa. Ghép lời Tuấn với sổ đổi ca, rồi nhập mã tại bảng khóa.')
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
        camera.startFollow(this.player, false)
        // Ignore sub-pixel resting-body corrections instead of moving the whole room.
        camera.setDeadzone(4, 8)

        this.add.text(12, 12, 'PHÒNG GIAM 07', {
            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '12px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10)

        this.add.text(12, 30, 'A/D: Move | Space: Jump | S: Crouch | E: Interact | Esc: Pause', {            fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
            fontSize: '9px',
            color: '#e5e7eb',
            stroke: '#080d14',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(10).setName('level-hud').setVisible(settingsSystem.isHudVisible())

        const menuButton = this.add.text(
            this.scale.width - 12, 12, '[ PAUSE ]',
            {
                fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2,
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
            if (
                event?.repeat || this.scene.isActive('PauseScene') ||
                this.scene.isActive('DialogueScene') || this.scene.isActive('CodeLockScene') || this.scene.isActive('StoryChoiceScene')
            ) {
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

        const settleFloor = (): void => {
            if (this.player) stabilizeCellFloor(this.player, ground)
        }
        this.events.on(Phaser.Scenes.Events.POST_UPDATE, settleFloor)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off(Phaser.Scenes.Events.POST_UPDATE, settleFloor)
            this.input.keyboard?.off('keydown-ESC', returnToMenu)
            this.input.keyboard?.off('keydown-J', openJournal)
            this.controls?.destroy()
            this.controls = undefined
            this.player = undefined
            this.interactions?.destroy()
            this.interactions = undefined
            this.hideZones = []
            this.updateCover = undefined
            this.stealthText = undefined
            this.guards = []
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

        const grounded = Boolean(
            player.body
            && (player.body.blocked.down || player.body.touching.down),
        )

        const cover = evaluateHiding(player.body, this.hideZones, player.isCrouching(), grounded)
        const hidden = cover.hidden

        player.setAlpha(hidden ? 0.5 : 1)

        for (const guard of this.guards) {
        guard.updateAI(
            delta,
            player.x,
            player.y,
            player.isCrouching(),
            hidden,
        )
        }

        const detection = Math.max(0, ...this.guards.map((guard) => guard.getDetectionLevel()))
        updatePursuitCue(this, detection === 1)
        this.updateCover?.(cover, detection > 0)
        this.stealthText?.setText(hidingLabel(cover, detection > 0))
        const alertState = detection === 1 ? 'CHASE' : detection > 0 ? 'SEARCH' : 'PATROL'

        this.detectionText?.setText(
            `Lính: ${alertState}`,
        )

        this.detectionFill
            ?.setScale(detection, 1)
            .setFillStyle(detection >= 0.6 ? 0xef4444 : 0xfacc15)

        if (this.guards.some((guard) => guard.hasCapturedTarget(player, hidden))) {
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
