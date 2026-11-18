import type { Player } from '../../entities/Player'
import type Phaser from 'phaser'

/** Body.reset uses the sprite's top-left; a padded/scaled sprite needs its offset reapplied. */
export function landCellPlayer(player: Player, x: number, floorY: number): void {
    const body = player.body as Phaser.Physics.Arcade.Body | null
    if (!body) return
    body.updateFromGameObject()
    const feetOffset = body.bottom - player.y
    body.reset(x, floorY - feetOffset)
    body.updateFromGameObject()
    // No stale delta from the previous floor may be applied in postUpdate.
    body.prev.copy(body.position)
    body.prevFrame.copy(body.position)
    player.setVelocity(0, 0)
    player.setCrouching(false)
}

/** Run after Arcade has applied its frame delta, keeping tiny resting corrections
 * from alternately lifting/dropping the sprite at fractional scale. */
export function stabilizeCellFloor(player: Player, ground: Phaser.Tilemaps.TilemapLayer): void {
    const body = player.body as Phaser.Physics.Arcade.Body | null
    if (!body || !body.enable || body.velocity.y < 0 || body.velocity.y > 20) return
    const tile = ground.getTileAtWorldXY(body.center.x, body.bottom + 0.75)
    if (!tile?.collideUp) return
    const correction = tile.pixelY - body.bottom
    if (Math.abs(correction) > 0.75) return
    player.y += correction
    body.position.y += correction
    body.prev.y = body.position.y
    body.prevFrame.y = body.position.y
    body.updateCenter()
    body.velocity.y = 0
    body.blocked.down = true
    body.blocked.none = false
}
