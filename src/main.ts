import './styles/game.css'
import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig'
import { installSharpText } from './visuals/SharpText'

installSharpText(new Phaser.Game(gameConfig))
