import Phaser from 'phaser'
import { saveSystem } from '../../systems/progress/SaveSystem'

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    create(): void {
        const currentLevel = saveSystem.getCurrentLevel()
        let transitioning = false
        const menu = document.createElement('main')
        menu.className = 'game-main-menu'
        menu.innerHTML = `
            <h1>ESCAPE ZERO</h1>
            <button type="button" data-action="play"></button>
            <p class="game-menu-hint">Click or press Enter</p>
            <button type="button" data-action="restart">Restart from Level 01</button>
            <button type="button" data-action="settings">Settings</button>
            <p class="game-menu-question" hidden>Restart from Level 01?<br>Saved progress will be reset.</p>
            <button type="button" data-action="confirm" hidden>Yes, restart</button>
            <button type="button" data-action="cancel" hidden>Cancel</button>
        `
        this.game.canvas.parentElement?.append(menu)

        const play = menu.querySelector<HTMLButtonElement>('[data-action="play"]')!
        const restart = menu.querySelector<HTMLButtonElement>('[data-action="restart"]')!
        const settings = menu.querySelector<HTMLButtonElement>('[data-action="settings"]')!
        const confirm = menu.querySelector<HTMLButtonElement>('[data-action="confirm"]')!
        const cancel = menu.querySelector<HTMLButtonElement>('[data-action="cancel"]')!
        const question = menu.querySelector<HTMLElement>('.game-menu-question')!
        const hint = menu.querySelector<HTMLElement>('.game-menu-hint')!
        play.textContent = currentLevel ? 'Continue · Level 0' + currentLevel : 'Start'

        const showConfirmation = (visible: boolean): void => {
            question.hidden = confirm.hidden = cancel.hidden = !visible
            play.hidden = hint.hidden = settings.hidden = visible
            restart.hidden = visible || currentLevel === null
        }
        showConfirmation(false)

        const openLevel = (level: number): void => {
            if (transitioning) return
            transitioning = true
            this.scene.start('Level0' + level + 'Scene')
        }

        play.onclick = () => openLevel(currentLevel ?? 1)
        restart.onclick = () => { showConfirmation(true); cancel.focus() }
        cancel.onclick = () => { showConfirmation(false); restart.focus() }
        confirm.onclick = () => {
            if (transitioning) return
            saveSystem.reset()
            openLevel(1)
        }
        settings.onclick = () => {
            if (transitioning || this.scene.isActive('SettingsScene')) return
            this.input.keyboard?.resetKeys()
            this.scene.launch('SettingsScene', { returnScene: this.scene.key })
            this.scene.pause()
        }

        const onKey = (event: KeyboardEvent): void => {
            if (event.repeat) return
            if (event.key === 'Escape' && !question.hidden) cancel.click()
            if (event.key === 'Enter' && question.hidden && !menu.contains(document.activeElement)) play.click()
        }
        const onPause = (): void => {
            menu.hidden = true
            window.removeEventListener('keydown', onKey)
        }
        const onResume = (): void => {
            menu.hidden = false
            window.addEventListener('keydown', onKey)
        }
        onResume()
        this.events.on(Phaser.Scenes.Events.PAUSE, onPause)
        this.events.on(Phaser.Scenes.Events.RESUME, onResume)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            onPause()
            this.events.off(Phaser.Scenes.Events.PAUSE, onPause)
            this.events.off(Phaser.Scenes.Events.RESUME, onResume)
            menu.remove()
        })
    }
}
