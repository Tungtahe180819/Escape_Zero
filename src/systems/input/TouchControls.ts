import type Phaser from 'phaser'

type Action = 'left' | 'right' | 'crouch' | 'jump' | 'interact'

export class TouchControls {
    private readonly panel = document.createElement('div')
    private readonly held = new Map<number, Action>()
    private readonly pressed = new Set<Action>()
    private readonly scene: Phaser.Scene

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.panel.className = 'game-touch-controls'
        for (const [actions, labels] of [
            [['left', 'right'], ['←', '→']],
            [['crouch', 'jump', 'interact'], ['Núp', 'Nhảy', 'Dùng']],
        ] as const) {
            const group = document.createElement('div')
            actions.forEach((action, index) => {
                const button = document.createElement('button')
                button.type = 'button'
                button.textContent = labels[index]
                button.setAttribute('aria-label', action === 'left' ? 'Đi trái' : action === 'right' ? 'Đi phải' : labels[index])
                button.onpointerdown = event => {
                    if (event.pointerType === 'mouse' && event.button !== 0) return
                    event.preventDefault()
                    button.setPointerCapture(event.pointerId)
                    this.held.set(event.pointerId, action)
                    if (action === 'jump' || action === 'interact') this.pressed.add(action)
                    button.setAttribute('aria-pressed', 'true')
                }
                const release = (event: PointerEvent): void => {
                    this.held.delete(event.pointerId)
                    button.setAttribute('aria-pressed', String(this.isHeld(action)))
                }
                button.onpointerup = button.onpointercancel = button.onlostpointercapture = release
                group.append(button)
            })
            this.panel.append(group)
        }
        scene.game.canvas.parentElement?.append(this.panel)
        scene.events.on('pause', this.suspend)
        scene.events.on('resume', this.resume)
        window.addEventListener('blur', this.clear)
    }

    isHeld(action: Action): boolean {
        for (const held of this.held.values()) if (held === action) return true
        return false
    }

    consume(action: Action): boolean {
        return this.pressed.delete(action)
    }

    private readonly clear = (): void => {
        this.held.clear()
        this.pressed.clear()
        this.panel.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'))
    }

    private readonly suspend = (): void => {
        this.clear()
        this.panel.hidden = true
    }

    private readonly resume = (): void => { this.panel.hidden = false }

    destroy(): void {
        this.suspend()
        this.scene.events.off('pause', this.suspend)
        this.scene.events.off('resume', this.resume)
        window.removeEventListener('blur', this.clear)
        this.panel.remove()
    }
}
