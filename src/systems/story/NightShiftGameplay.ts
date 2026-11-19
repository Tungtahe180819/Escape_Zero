import Phaser from 'phaser'
import type { Player } from '../../entities/Player'
import type { Interactable } from '../interaction/Interactable'
import type { DialogueLine } from './DialogueTypes'
import { NightShiftMission, DATA_PARTS, DATA_NOTES } from './NightShiftMission'
import { NIGHT_FOOD, NIGHT_LAN, NIGHT_WORKER, NIGHT_MAINTENANCE, NIGHT_ACCOUNT, NIGHT_USB, NIGHT_ENDING, NIGHT_DATA_STORIES } from '../../config/nightShiftStory'
import { createStoryNPC, type StoryNPCId } from '../../visuals/StoryNPC'

export function createNightShiftGameplay(
    scene: Phaser.Scene, player: Player, mission: NightShiftMission,
    getPoint: (name: string) => { x: number; y: number },
    notify: (text: string) => void, changed: () => void, endingDone: () => void,
) {
    const overlayOpen = (): boolean => ['DialogueScene','DataOrderScene','PauseScene','SettingsScene'].some((key) => scene.scene.isActive(key))
    const speak = (lines: readonly DialogueLine[], done: () => void = () => {}): void => {
        if (overlayOpen()) return
        mission.interruptCopy(); player.setVelocity(0, 0); scene.input.keyboard?.resetKeys()
        scene.scene.launch('DialogueScene', { returnScene: 'Level02Scene', lines, onComplete: () => { done(); changed() } })
        scene.scene.pause()
    }
    const targets: Interactable[] = []
    const add = (id: string, prompt: string, interact: () => void, available: () => boolean = () => true): void => {
        targets.push({ id, ...getPoint(id), radius: 27, prompt, isAvailable: available, interact })
    }
    const title = (id: string, text: string): void => {
        const point = getPoint(id)
        scene.add.text(point.x, point.y - 40, text, { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '9px', color: '#c4b5fd', stroke: '#080d14', strokeThickness: 2 }).setOrigin(0.5).setDepth(1)
    }
    for (const npc of [
        { id: 'food', name: 'Người cấp suất ăn' },
        { id: 'worker', name: 'Người trực máy' },
        { id: 'lan', name: 'Lan' },
        { id: 'tuan', name: 'Tuấn' },
    ]) {
        const point = getPoint(npc.id)
        createStoryNPC(scene, npc.id as StoryNPCId, point.x, point.y + 16)
        title(npc.id, npc.name)
    }
    add('food', 'Hỏi đường · Nhận lời nhắn', () => speak(NIGHT_FOOD, () => mission.meetFood()))
    add('worker', 'Nói chuyện với người trực máy', () => {
        if (mission.workerMet && mission.maintenanceFound && !mission.accountReady) {
            speak(NIGHT_ACCOUNT, () => mission.enableAccount()); return
        }
        const message: DialogueLine[] = mission.foodMet && !mission.messageDelivered ? [
            { speaker: 'Minh', text: 'Em anh nhờ nhắn: mọi người vẫn chờ anh về.' },
            { speaker: 'Người trực máy', text: 'Cảm ơn cậu. Nếu có thể chép thêm, máy cuối hành lang còn danh sách một khu khác. Đừng mạo hiểm nếu không đủ thời gian.' },
        ] : []
        speak([...message, ...(mission.accountReady ? NIGHT_ACCOUNT : NIGHT_WORKER)], () => mission.meetWorker())
    })
    add('maintenance', 'Đọc ghi chú bảo dưỡng', () => speak(NIGHT_MAINTENANCE, () => mission.readMaintenance()))
    add('lan', 'Nói chuyện với Lan · Ghép dữ liệu', () => {
        if (!mission.lanMet) { speak(NIGHT_LAN, () => mission.meetLan()); return }
        if (mission.copied.size === 3 && !mission.usbReceived) {
            speak(mission.bonusCopied ? [...NIGHT_USB, {
                speaker: 'Lan', text: 'Cậu còn chép cả danh sách khu khác. Người trực máy đã nhờ đúng người. Những người chưa từng gặp cậu cũng có cơ hội được tìm thấy.',
            }] : NIGHT_USB, () => mission.receiveUsb()); return
        }
        if (mission.found.size === 3 && !mission.ordered) {
            if (overlayOpen()) return
            mission.interruptCopy(); player.setVelocity(0, 0); scene.input.keyboard?.resetKeys()
            scene.scene.launch('DataOrderScene', { notes: DATA_PARTS.map((part) => DATA_NOTES[part]), onSubmit: (order: string) => { const error = mission.arrange(order); changed(); return error } })
            scene.scene.pause(); return
        }
        const recap = mission.usbReceived
            ? 'Cậu đã cầm USB. Giữ nó bên mình khi qua cửa kỹ thuật ở cuối hành lang trên.'
            : 'Ba mảnh dữ liệu phải được xếp theo giờ từ đầu đến cuối ca. Sau khi ghép, chép từng phần tại máy trên hành lang.'
        speak([{ speaker: 'Lan', text: recap }, { speaker: 'Lan', text: mission.objective() }])
    })
    add('tuan', 'Nói chuyện với Tuấn', () => speak([
        { speaker: 'Tuấn', text: 'Anh còn nhớ em đã canh cửa cho anh ở buồng 07 không? Ở đây em phải dùng tên người khác để nhắn tin suốt đêm. Em sợ đến lúc ra được ngoài, chẳng ai tin tên thật của em nữa.' },
        { speaker: 'Minh', text: 'Anh đang gom bằng chứng. Anh sẽ tìm cách đưa mọi người ra.' },
    ]))
    for (const part of DATA_PARTS) {
        add(`fragment-${part}`, `Đọc phần dữ liệu ${part}`, () => {
            mission.discover(part); notify(`${DATA_NOTES[part]} · Đã ghi nhật ký J`); changed()
            speak(NIGHT_DATA_STORIES[part])
        }, () => !mission.found.has(part))
        add(`copy-${part}`, `Sao chép ${part} · Đứng tại máy`, () => {
            if (mission.activeCopy === part) { mission.interruptCopy(); notify('Đã dừng. Phần đang chép cần bắt đầu lại.'); return }
            const error = mission.startCopy(part); notify(error ?? `Đang chép ${part}. Có thể chạy khỏi máy để dừng và núp.`)
        }, () => !mission.copied.has(part))
    }
    add('copy-bonus', 'Chép danh sách bổ sung · Tùy chọn', () => {
        if (mission.activeCopy === 'bonus') { mission.interruptCopy(); notify('Đã dừng phần sao chép tùy chọn.'); return }
        const error = mission.startCopy('bonus'); notify(error ?? 'Đang chép danh sách bổ sung.')
    }, () => !mission.bonusCopied)
    const desk = scene.add.graphics().setDepth(0)
    for (const id of ['maintenance',...DATA_PARTS.map((part) => `fragment-${part}`)]) {
        const point = getPoint(id)
        desk.fillStyle(0xa9ac96); desk.fillRect(point.x - 8, point.y - 25, 16, 20)
        title(id, id === 'maintenance' ? 'BẢO DƯỠNG' : `DỮ LIỆU ${id.slice(-1)}`)
    }
    for (const id of [...DATA_PARTS.map((part) => `copy-${part}`),'copy-bonus']) {
        const point = getPoint(id)
        desk.fillStyle(0x344956); desk.fillRect(point.x - 10, point.y - 23, 20, 24)
        desk.fillStyle(0x7aada6); desk.fillRect(point.x - 7, point.y - 20, 14, 9)
        desk.fillStyle(0x52636b); desk.fillRect(point.x - 15, point.y + 1, 30, 4)
        title(id, id === 'copy-bonus' ? 'MÁY PHỤ' : `MÁY ${id.slice(-1)}`)
    }
    for (const link of [
        { from: 'serviceTop', to: 'serviceBottom', text: 'Lối phục vụ · Xuống', card: true },
        { from: 'serviceBottom', to: 'serviceTop', text: 'Lối phục vụ · Lên', card: true },
        { from: 'workTop', to: 'workBottom', text: 'Xuống khu làm việc', card: false },
        { from: 'workBottom', to: 'workTop', text: 'Lên hành lang máy', card: false },
    ]) {
        title(link.from, link.text)
        const point = getPoint(link.from)
        scene.add.rectangle(point.x, point.y - 8, 30, 40, 0x223c47).setStrokeStyle(1, 0x7ba3ae).setDepth(-1)
        add(link.from, link.text, () => {
            if (link.card && !mission.hasServiceCard) { notify('Cần mượn thẻ từ người cấp suất ăn. Đường hành lang vẫn đi được.'); return }
            mission.interruptCopy(); const point = getPoint(link.to)
            player.body?.reset(point.x, point.y); player.setVelocity(0, 0); player.setCrouching(false); scene.input.keyboard?.resetKeys(); notify(link.text)
        })
    }
    const openJournal = (event?: KeyboardEvent): void => { if (!event?.repeat) speak(mission.journal()) }
    scene.input.keyboard?.on('keydown-J', openJournal)
    scene.add.text(468, 260, '[ NHẬT KÝ · J ]', { fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif', resolution: 2, fontSize: '10px', color: '#93c5fd', stroke: '#080d14', strokeThickness: 2 }).setOrigin(1, 1).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true }).on('pointerdown', () => openJournal())
    return {
        targets, overlayOpen,
        finish: () => speak(NIGHT_ENDING, endingDone),
        tick: (delta: number): void => {
            if (!mission.activeCopy) return
            const point = getPoint(`copy-${mission.activeCopy}`)
            const grounded = Boolean(player.body && (player.body.blocked.down || player.body.touching.down))
            const inPosition = Math.abs(player.x - point.x) <= 22 && Math.abs(player.y - point.y) <= 24 && grounded && !player.isCrouching()
            const complete = mission.tickCopy(delta, inPosition)
            if (complete) { notify('Đã chép xong một phần. Các phần hoàn tất được giữ khi hồi sinh.'); changed() }
            else if (mission.activeCopy) notify(`Đang sao chép ${mission.activeCopy}: ${mission.copyPercent}% · Rời máy để núp khi cần`)
            else notify('Đã ngắt sao chép. Chỉ phần chưa hoàn tất cần làm lại.')
        },
        destroy: () => scene.input.keyboard?.off('keydown-J', openJournal),
    }
}
