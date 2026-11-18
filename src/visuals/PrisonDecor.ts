import Phaser from 'phaser'

export function createPrisonDecor(
    scene: Phaser.Scene,
    worldWidth: number,
    floorOffset = 0,
): void {
    const decor = scene.add.graphics().setDepth(-1).setPosition(0, floorOffset)

    // Background utility pipe.
    decor.fillStyle(0x101923)
    decor.fillRect(16, 60, worldWidth - 32, 6)

    decor.fillStyle(0x35434e)
    decor.fillRect(16, 61, worldWidth - 32, 2)

    // Pipe brackets.
    for (let x = 48; x < worldWidth - 16; x += 128) {
        decor.fillStyle(0x46515b)
        decor.fillRect(x, 58, 3, 9)

        decor.fillStyle(0x17212c)
        decor.fillRect(x + 1, 60, 1, 5)
    }

    // Recessed ventilation grilles: decorative, not hiding zones.
    for (let x = 144; x + 48 < worldWidth - 16; x += 288) {
        const y = 104

        decor.fillStyle(0x111923)
        decor.fillRect(x, y, 48, 24)

        decor.fillStyle(0x35424c)
        decor.fillRect(x, y, 48, 2)
        decor.fillRect(x, y, 2, 24)

        decor.fillStyle(0x26333e)
        decor.fillRect(x + 2, y + 22, 46, 2)
        decor.fillRect(x + 46, y + 2, 2, 20)

        for (let bar = 0; bar < 5; bar++) {
            decor.fillStyle(0x3c4852)
            decor.fillRect(x + 7 + bar * 8, y + 4, 2, 16)
        }
    }
}
