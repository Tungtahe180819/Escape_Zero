import Phaser from 'phaser'

export class InputManager {
    private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin
    private readonly left: Phaser.Input.Keyboard.Key
    private readonly right: Phaser.Input.Keyboard.Key
    private readonly a: Phaser.Input.Keyboard.Key
    private readonly d: Phaser.Input.Keyboard.Key
    private readonly space: Phaser.Input.Keyboard.Key
    private readonly e: Phaser.Input.Keyboard.Key
    private readonly s: Phaser.Input.Keyboard.Key

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
    }

    getHorizontalAxis(): number {
        const movingLeft = this.left.isDown || this.a.isDown
        const movingRight = this.right.isDown || this.d.isDown

        return Number(movingRight) - Number(movingLeft)
    }

    isJumpPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.space)
    }

    isInteractPressed(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.e)
    }

    destroy(): void {
        for (const key of [this.left, this.right, this.a, this.d, this.space, this.e, this.s]) {
            this.keyboard.removeKey(key, true)
        }
    }

    isCrouchHeld(): boolean {
        return this.s.isDown
    }
}
