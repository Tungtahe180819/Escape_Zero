import Phaser from 'phaser'

export class DetectionSystem {
    private readonly layers: Phaser.Tilemaps.TilemapLayer[]

    constructor(layers: Phaser.Tilemaps.TilemapLayer[]) {
        this.layers = [...layers]
    }

    hasClearLine(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        extraBlockers: Phaser.Geom.Rectangle[] = [],
    ): boolean {
        const line = new Phaser.Geom.Line(
            startX, startY, endX, endY,
        )

        for (const blocker of extraBlockers) {
            if (Phaser.Geom.Intersects.LineToRectangle(line, blocker)) {
                return false
            }
        }

        const left = Math.min(startX, endX) - 1
        const top = Math.min(startY, endY) - 1
        const width = Math.abs(endX - startX) + 2
        const height = Math.abs(endY - startY) + 2

        for (const layer of this.layers) {
            const tiles = layer.getTilesWithinWorldXY(
                left, top, width, height,
            )

            for (const tile of tiles) {
                if (tile.index < 0 || !tile.collides) {
                    continue
                }

                const bounds = new Phaser.Geom.Rectangle(
                    tile.getLeft(),
                    tile.getTop(),
                    tile.width,
                    tile.height,
                )

                if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
                    return false
                }
            }
        }

        return true
    }
}
