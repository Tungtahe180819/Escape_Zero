import Phaser from 'phaser'
import { BootScene } from '../scenes/core/BootScene'
import { MenuScene } from '../scenes/core/MenuScene'
import { Level01Scene } from '../scenes/levels/Level01Scene'
import { LevelCompleteScene } from '../scenes/core/LevelCompleteScene'
import { GuardTestScene } from '../scenes/dev/GuardTestScene'
import { Level02Scene } from '../scenes/levels/Level02Scene'
import { Level03Scene } from '../scenes/levels/Level03Scene'
import { DemoCompleteScene } from '../scenes/core/DemoCompleteScene'
import { PauseScene } from '../scenes/core/PauseScene'
import { SettingsScene } from '../scenes/core/SettingsScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 480,
    height: 270,
    backgroundColor: '#111827',
    pixelArt: true,
    fps: {
        limit: 300,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 600},
            debug: false,
        },
    },
    scene: [
        BootScene,
        MenuScene,
        Level01Scene,
        LevelCompleteScene,
        GuardTestScene,
        Level02Scene,
        Level03Scene,
        DemoCompleteScene,
        PauseScene,
        SettingsScene
    ],
}
