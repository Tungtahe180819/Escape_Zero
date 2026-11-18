import Phaser from 'phaser'
import type { HidingState } from '../systems/stealth/HidingSystem'

export function createCoverIndicators(
    scene: Phaser.Scene,
    zones: readonly Phaser.Geom.Rectangle[],
): (state: HidingState, alerted: boolean) => void {
    const markers = zones.map((zone) => scene.add.rectangle(
        zone.centerX, zone.centerY, zone.width, zone.height,
    ).setFillStyle(0, 0).setStrokeStyle(1, 0x4b616a).setDepth(0))
    return (state, alerted) => {
        markers.forEach((marker, index) => {
            const active = state.zoneIndex === index
            const color = !active ? 0x4b616a : !state.hidden ? 0x93c5fd : alerted ? 0xfb923c : 0x22c55e
            marker.setStrokeStyle(active ? 2 : 1, color)
                .setFillStyle(color, active ? 0.08 : 0)
        })
    }
}
