import Phaser from 'phaser'
import { createStoryNPC, type StoryNPCId } from './StoryNPC'

export function createCellPuzzleDecor(
    scene: Phaser.Scene,
    getPoint: (name: string) => { x: number; y: number },
    circuit: () => { progress: number; powered: boolean },
): () => void {
    const tuan = getPoint('tuan')
    createStoryNPC(scene, 'tuan', tuan.x, tuan.y + 16)
    const label = (x: number, y: number, text: string): void => {
        scene.add.text(x, y, text, {
            fontFamily: 'monospace', fontSize: '8px', color: '#c4b5fd',
            stroke: '#080d14', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(1)
    }
    label(tuan.x, tuan.y - 28, 'Tuấn · 19 tuổi')
    for (const npc of [
        { point: 'archivist', name: 'Người ghi sổ' },
        { point: 'technician', name: 'Người thợ điện' },
        { point: 'cleaner', name: 'Người lau dọn' },
    ]) {
        const point = getPoint(npc.point)
        createStoryNPC(scene, npc.point as StoryNPCId, point.x, point.y + 16)
        label(point.x, point.y - 36, npc.name)
    }
    const roster = getPoint('roster')
    label(roster.x, roster.y - 32, 'SỔ ĐỔI CA')
    const evidence = getPoint('chatEvidence')
    const decor = scene.add.graphics().setDepth(1)
    decor.fillStyle(0xbab194)
    decor.fillRect(evidence.x - 8, evidence.y - 44, 16, 24)
    decor.lineStyle(1, 0x554f43)
    for (let y = evidence.y - 40; y < evidence.y - 22; y += 4) decor.lineBetween(evidence.x - 5, y, evidence.x + 5, y)
    label(evidence.x, evidence.y - 54, 'KỊCH BẢN CHAT')
    for (const document of [
        { point: getPoint('tornLedger'), title: 'SỔ BỊ SỬA', color: 0xb5a78b },
        { point: getPoint('transferOrder'), title: 'LỆNH CHUYỂN', color: 0x9fadb8 },
    ]) {
        decor.fillStyle(0x34404a)
        decor.fillRect(document.point.x - 12, document.point.y - 24, 24, 40)
        decor.fillStyle(document.color)
        decor.fillRect(document.point.x - 8, document.point.y - 42, 16, 23)
        decor.lineStyle(1, 0x4b5050)
        for (let row = 0; row < 4; row++) {
            decor.lineBetween(document.point.x - 5, document.point.y - 37 + row * 4,
                document.point.x + 5, document.point.y - 37 + row * 4)
        }
        label(document.point.x, document.point.y - 54, document.title)
    }
    const panel = getPoint('exitPanel')
    decor.fillStyle(0x354754)
    decor.fillRect(panel.x - 10, panel.y - 18, 20, 30)
    decor.fillStyle(0x86efac)
    decor.fillRect(panel.x - 6, panel.y - 14, 12, 6)
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
        decor.fillRect(panel.x - 6 + col * 5, panel.y - 3 + row * 4, 2, 2)
    }
    label(panel.x, panel.y - 30, 'KHÓA 3 SỐ')
    const switches = [
        { point: getPoint('circuitAlarm'), text: 'BÁO ĐỘNG' },
        { point: getPoint('circuitLamp'), text: 'ĐÈN THỬ' },
        { point: getPoint('circuitLock'), text: 'NGUỒN KHÓA' },
    ]
    for (const item of switches) label(item.point.x, item.point.y - 36, item.text)
    const switchDecor = scene.add.graphics().setDepth(1)
    const refresh = (): void => {
        const state = circuit()
        switchDecor.clear()
        switchDecor.lineStyle(1, 0x526674)
        switchDecor.lineBetween(switches[0].point.x, switches[0].point.y - 26,
            switches[2].point.x, switches[2].point.y - 26)
        switches.forEach((item, index) => {
            switchDecor.fillStyle(0x354754)
            switchDecor.fillRect(item.point.x - 9, item.point.y - 20, 18, 28)
            switchDecor.fillStyle(state.powered || index < state.progress ? 0x22c55e : 0x64748b)
            switchDecor.fillRect(item.point.x - 5, item.point.y - 14, 10, 12)
        })
    }
    refresh()
    return refresh
}
