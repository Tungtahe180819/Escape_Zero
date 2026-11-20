import './styles/game.css'
import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig'
import { installSharpText } from './visuals/SharpText'
import { installMobileOrientation } from './systems/input/MobileOrientation'

const game = new Phaser.Game(gameConfig)
installSharpText(game)
installMobileOrientation(game)
