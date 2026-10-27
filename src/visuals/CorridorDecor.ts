import Phaser from 'phaser'

export function createCorridorDecor(
    scene: Phaser.Scene,
    worldWidth: number,
): void {
    const decor = scene.add.graphics().setDepth(-1)

    // Cable tray running along the background wall.
    decor.fillStyle(0x101c23)
    decor.fillRect(16, 54, worldWidth - 32, 8)

    decor.fillStyle(0x354a55)
    decor.fillRect(16, 54, worldWidth - 32, 2)

    decor.fillStyle(0x263943)
    decor.fillRect(16, 61, worldWidth - 32, 1)

    // Mounting brackets.
    for (let x = 64; x < worldWidth - 16; x += 128) {
        decor.fillStyle(0x40535c)
        decor.fillRect(x, 52, 3, 12)

        decor.fillStyle(0x182831)
        decor.fillRect(x + 1, 55, 1, 6)
    }

    // Decorative ceiling lights, separate from surveillance cameras.
    for (let x = 160; x + 48 < worldWidth - 16; x += 320) {
        decor.fillStyle(0x15252e)
        decor.fillRect(x - 2, 77, 52, 10)

        decor.fillStyle(0x50616a)
        decor.fillRect(x, 78, 48, 6)

        decor.fillStyle(0xa5bdb9)
        decor.fillRect(x + 4, 80, 40, 2)

        // Dim reflected light on the wall only.
        decor.fillStyle(0x91b4ac, 0.04)
        decor.fillRect(x - 8, 88, 64, 24)
    }
}