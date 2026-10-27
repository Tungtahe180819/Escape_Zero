import Phaser from 'phaser'

export function createOutdoorDecor(
    scene: Phaser.Scene,
    ground: Phaser.Tilemaps.TilemapLayer,
): void {
    const decor = scene.add.graphics().setDepth(-1)
    const tileWidth = ground.tilemap.tileWidth
    const tileHeight = ground.tilemap.tileHeight

    // Find the upper ground row instead of hardcoding its position.
    const surfaceRow = ground.layer.data.findIndex(
        (row) => row.some((tile) => tile.index !== -1),
    )

    if (surfaceRow < 0) {
        return
    }

    const row = ground.layer.data[surfaceRow]
    const groundY = surfaceRow * tileHeight

    // Stop the background fence above the ground surface.
    const bottomY = groundY + 2
    const topY = bottomY - 64
    const height = bottomY - topY

    const drawSection = (
        startColumn: number,
        endColumn: number,
    ): void => {
        const left = startColumn * tileWidth + 8
        const right = (endColumn + 1) * tileWidth - 8
        const width = right - left

        if (width <= 0) {
            return
        }

        // Thin, dim rails avoid resembling a walkable platform.
        decor.fillStyle(0x293b43)
        decor.fillRect(left, topY, width, 1)
        decor.fillRect(left, topY + 32, width, 1)

        // Background wire mesh.
        decor.lineStyle(1, 0x213039, 0.7)

        for (let x = left; x <= right; x += 12) {
            decor.lineBetween(x, topY, x, bottomY)
        }

        for (let y = topY + 8; y < bottomY; y += 8) {
            decor.lineBetween(left, y, right, y)
        }

        const drawPost = (x: number): void => {
            decor.fillStyle(0x354750)
            decor.fillRect(x - 1, topY - 3, 2, height + 3)

            decor.fillStyle(0x465860)
            decor.fillRect(x - 2, topY - 4, 4, 2)
        }

        drawPost(left)

        for (let x = left + 96; x < right; x += 96) {
            drawPost(x)
        }

        drawPost(right)
    }

    // Separate sections preserve clear visual gaps at every pit.
    let sectionStart = -1

    for (let column = 0; column <= row.length; column++) {
        const solid =
            column < row.length &&
            row[column].index !== -1

        if (solid && sectionStart === -1) {
            sectionStart = column
        }

        if (!solid && sectionStart !== -1) {
            drawSection(sectionStart, column - 1)
            sectionStart = -1
        }
    }
}