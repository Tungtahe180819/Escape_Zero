import Phaser from 'phaser'
import { settingsSystem } from '../../systems/settings/SettingsSystem'
import { preloadAudio, startAudio } from '../../systems/audio/AudioSystem'

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene')
    }

    preload(): void {
        preloadAudio(this)
        this.load.spritesheet(
            'minh',
            '/assets/characters/minh-sheet.png',
            {
                frameWidth: 32,
                frameHeight: 48,
            },
        )
        this.load.spritesheet(
            'guard',
            '/assets/characters/guard-sheet.png',
            {
                frameWidth: 32,
                frameHeight: 48,
            },
        )
    }

    create(): void {
        settingsSystem.apply(this)
        startAudio(this)

        const addAnimation = (
            key: string,
            start: number,
            end: number,
            frameRate: number,
            repeat: number,
        ): void => {
            if (this.anims.exists(key)) {
                return
            }

            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(
                    'minh',
                    { start, end },
                ),
                frameRate,
                repeat,
            })
        }

        addAnimation('minh-idle', 0, 5, 6, -1)
        addAnimation('minh-walk', 6, 11, 8, -1)
        addAnimation('minh-jump', 12, 13, 8, 0)
        addAnimation('minh-fall', 14, 15, 8, 0)
        addAnimation('minh-crouch', 16, 17, 4, -1)
        addAnimation('minh-interact', 18, 21, 8, 0)
        addAnimation('minh-hurt', 22, 23, 8, 0)

        const guardAnimations = [
            { key: 'guard-idle', start: 0, end: 5, frameRate: 6 },
            { key: 'guard-walk', start: 6, end: 11, frameRate: 8 },
            { key: 'guard-run', start: 12, end: 17, frameRate: 10 },
        ]

        for (const animation of guardAnimations) {
            if (!this.anims.exists(animation.key)) {
                this.anims.create({
                    key: animation.key,
                    frames: this.anims.generateFrameNumbers(
                        'guard',
                        {
                            start: animation.start,
                            end: animation.end,
                        },
                    ),
                    frameRate: animation.frameRate,
                    repeat: -1,
                })
            }
        }

        this.scene.start('MenuScene')
    }
}
