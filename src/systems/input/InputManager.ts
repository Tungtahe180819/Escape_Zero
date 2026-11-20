import Phaser from 'phaser'
import { TouchControls } from './TouchControls'

export class InputManager {
    private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin
    private readonly left: Phaser.Input.Keyboard.Key
    private readonly right: Phaser.Input.Keyboard.Key
    private readonly a: Phaser.Input.Keyboard.Key
    private readonly d: Phaser.Input.Keyboard.Key
    private readonly space: Phaser.Input.Keyboard.Key
    private readonly e: Phaser.Input.Keyboard.Key
    private readonly s: Phaser.Input.Keyboard.Key
    private readonly touch?: TouchControls

    constructor(scene: Phaser.Scene) {
        const keyboard = scene.input.keyboard

        if (!keyboard) {
            throw new Error('Keyboard input is required')
        }

        this.keyboard = keyboard
        this.left = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        this.right = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        this.a = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.d = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.space = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.e = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        this.s = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        if (window.matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0) {
            this.touch = new TouchControls(scene)
        }
    }

    getHorizontalAxis(): number {
        const movingLeft = this.left.isDown || this.a.isDown || this.touch?.isHeld('left')
        const movingRight = this.right.isDown || this.d.isDown || this.touch?.isHeld('right')

        return Number(Boolean(movingRight)) - Number(Boolean(movingLeft))
    }

    isJumpPressed(): boolean {
        const touch = this.touch?.consume('jump') ?? false
        return Phaser.Input.Keyboard.JustDown(this.space) || touch
    }

    isInteractPressed(): boolean {
        const touch = this.touch?.consume('interact') ?? false
        return Phaser.Input.Keyboard.JustDown(this.e) || touch
    }

    destroy(): void {
        this.touch?.destroy()
        for (const key of [this.left, this.right, this.a, this.d, this.space, this.e, this.s]) {
            this.keyboard.removeKey(key, true)
        }
    }

    isCrouchHeld(): boolean {
        return this.s.isDown || (this.touch?.isHeld('crouch') ?? false)
    }
}
