import type Phaser from 'phaser'
import { playSfx } from './AudioSystem'

const alerts = new WeakMap<Phaser.Scene, Phaser.GameObjects.Text>()
const pursuing = new WeakSet<Phaser.Scene>()

export function showGameplayCue(scene: Phaser.Scene, kind: 'caught' | 'chase' | 'item', label?: string): void {
    if (kind === 'caught') pursuing.delete(scene)
    playSfx(scene, kind)
    if (kind !== 'item') return
    const previous = alerts.get(scene)
    previous?.destroy()
    const banner = scene.add.text(scene.scale.width / 2, 187, label ?? 'TƯƠNG TÁC', {
        fontFamily: 'Segoe UI, Arial, sans-serif',
        resolution: 2,
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#bae6fd',
        backgroundColor: '#111827',
        padding: { x: 9, y: 5 },
    }).setName(kind).setOrigin(0.5).setScrollFactor(0).setDepth(30)
    alerts.set(scene, banner)
    scene.time.delayedCall(850, () => {
        if (alerts.get(scene) !== banner) return
        alerts.delete(scene)
        banner.destroy()
    })
}

export function updatePursuitCue(scene: Phaser.Scene, active: boolean): void {
    if (!active) pursuing.delete(scene)
    else if (!pursuing.has(scene)) {
        pursuing.add(scene)
        showGameplayCue(scene, 'chase')
    }
}
