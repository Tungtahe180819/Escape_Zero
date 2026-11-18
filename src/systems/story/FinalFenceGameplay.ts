import Phaser from 'phaser'
import { Player } from '../../entities/Player'
import { FinalFenceMission } from './FinalFenceMission'
import type { DialogueLine } from './DialogueTypes'
import { drawFenceClue } from '../../visuals/FinalFenceDecor'
import { level03X } from '../../config/level03Layout'
import { createStoryNPC } from '../../visuals/StoryNPC'

/** Story interactions stay on the banks, before the drawbridge and final sprint. */
export class FinalFenceGameplay {
    readonly mission = new FinalFenceMission()
    private result = ''
    private resultUntil = 0
    private readonly scene: Phaser.Scene
    private readonly player: Player
    private readonly points = [
        { x: 112, name: 'Bản đồ Lan', id: 'map' },
        { x: 240, name: 'Người khuân hàng', id: 'porter' },
        { x: 400, name: 'Túi vải cũ', id: 'bag' },
        { x: 608, name: 'Cột B / vạch sơn', id: 'pole' },
        { x: 768, name: 'Biển hướng mương', id: 'drain' },
        { x: 912, name: 'Đối chiếu khe rào', id: 'fence' },
        { x: 1040, name: 'Sơ đồ bảo trì', id: 'diagram' },
        { x: 992, name: 'Nguồn mô-tơ cầu nâng', id: 'motor' },
        { x: 1136, name: 'Cần hạ cầu', id: 'bridgeLever' },
        { x: 560, name: 'Nắp mương', id: 'drainEntry' },
        { x: 1104, name: 'Cửa kiểm tra mương', id: 'drainExit' },
        { x: 1376, name: 'Tủ nhánh điện', id: 'power' },
        { x: 1536, name: 'Cầu dao — E khi sẵn sàng', id: 'breaker' },
    ].map(point => ({ ...point, x: level03X(point.x) }))
    private readonly prompt: Phaser.GameObjects.Text
    private readonly labels = new Map<string, Phaser.GameObjects.Text>()

    constructor(scene: Phaser.Scene, player: Player) {
        this.scene = scene
        this.player = player
        for (const point of this.points) {
            drawFenceClue(scene, point.x, point.id)
            this.labels.set(point.id, scene.add.text(point.x, point.id === 'pole' ? 190 : 224, point.name, {
                fontFamily: 'monospace', fontSize: '9px', color: '#eee4c4',
                stroke: '#0c141b', strokeThickness: 3,
            }).setOrigin(0.5).setDepth(4).setVisible(false))
        }
        createStoryNPC(scene, 'porter', 240, 288).setDepth(2)
        this.prompt = scene.add.text(240, 224, '', {
            fontFamily: 'monospace', fontSize: '10px', color: '#fef08a',
            stroke: '#080d14', strokeThickness: 2, wordWrap: { width: 450 }, align: 'center',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20)
        const journal = (event: KeyboardEvent): void => {
            if (event.repeat || this.mission.running || this.mission.escaped) return
            const m = this.mission
            this.talk([{ speaker: 'Sổ tay — Hàng rào cuối cùng', text: [
                m.clues.has('map') ? 'Lan: cột hai vạch, phía mương chảy ra, sơn đỏ.' : 'Chưa đọc bản đồ Lan.',
                m.clues.has('pole') ? 'Cột B hai vạch; A một, C ba.' : 'Chưa kiểm tra cột.',
                m.clues.has('drain') ? 'Mương chảy tây → đông.' : 'Chưa đọc biển mương.',
                m.clues.has('diagram') ? 'Nhánh 1 đèn/A; nhánh 2 rào/B/đông; nhánh 3 còi/C. Điện ngắt 30 giây.' : 'Chưa đọc sơ đồ điện.',
                `Mô-tơ cầu: ${m.motorPowered ? 'CÓ ĐIỆN' : 'MẤT ĐIỆN'} | Cầu: ${m.bridgeLowered ? 'ĐÃ HẠ' : m.bridgeLowering ? 'ĐANG HẠ' : 'ĐANG NÂNG'}`,
                m.objective(),
            ].join('\n') }])
        }
        scene.input.keyboard?.on('keydown-J', journal)
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.input.keyboard?.off('keydown-J', journal))
    }

    private talk(lines: readonly DialogueLine[], onComplete?: () => void): void {
        this.player.setVelocity(0, 0)
        this.scene.input.keyboard?.resetKeys()
        this.scene.scene.launch('DialogueScene', { returnScene: 'Level03Scene', lines, onComplete })
        this.scene.scene.pause()
    }

    private choose(title: string, options: string[], onSelect: (answer: number) => void): void {
        this.player.setVelocity(0, 0)
        this.scene.input.keyboard?.resetKeys()
        this.scene.scene.launch('FenceChoiceScene', { title, options, onSelect })
        this.scene.scene.pause()
    }

    update(interact: boolean): void {
        const point = [...this.points].sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))
            .find(p => Math.abs(p.x - this.player.x) < 24 && Math.abs(this.player.y - 276) < 28)
        for (const [id, label] of this.labels) label.setVisible(point?.id === id && !this.mission.running)
        const bridgeState = this.mission.bridgeLowered ? 'ĐÃ HẠ' : this.mission.bridgeLowering ? 'ĐANG HẠ' : 'ĐANG NÂNG'
        const pointName = point?.id === 'motor' ? `Nguồn mô-tơ: ${this.mission.motorPowered ? 'ĐÃ BẬT' : 'ĐANG TẮT'}`
            : point?.id === 'bridgeLever' ? `Cầu: ${bridgeState} — Cần điều khiển` : point?.name
        this.prompt.setText(this.scene.time.now < this.resultUntil ? this.result
            : point && !this.mission.running ? `[E] ${pointName} | J: Sổ tay` : '')
        if (!interact || !point || this.mission.running || this.mission.escaped) return
        const m = this.mission
        const text = (speaker: string, body: string): void => this.talk([{ speaker, text: body }])
        switch (point.id) {
            case 'motor':
                if (m.motorPowered) text('Minh', 'Mô-tơ đã có điện. Chỉ còn kéo cần hạ cầu bên bờ mương.')
                else if (!m.clues.has('diagram')) text('Minh', 'Tủ cấp điện ghi “MÔ-TƠ CẦU”. Cần đọc sơ đồ bảo trì cạnh đây trước khi đóng nguồn.')
                else this.talk([{ speaker: 'Minh', text: 'Theo sơ đồ, nguồn mô-tơ độc lập với điện hàng rào. Đóng nguồn cầu nâng — chưa kích hoạt rơ-le 30 giây.' }], () => m.powerMotor())
                break
            case 'bridgeLever':
                if (!m.motorPowered) text('Minh', 'Kéo cần nhưng mô-tơ không chạy. Phải mở nguồn ở tủ cấp điện cầu nâng trước.')
                else if (m.bridgeLowered) text('Minh', 'Cầu đã hạ và chốt giữ đã khóa. Có thể đi qua mương.')
                else if (m.bridgeLowering) text('Minh', 'Mô-tơ đang nhả xích. Chờ cầu chạm bờ bên kia.')
                else this.talk([{ speaker: 'Minh', text: 'Mô-tơ đã có điện. Kéo cần để nhả xích, hạ cầu qua mương.' }], () => m.lowerBridge())
                break
            case 'drainEntry':
                if (!m.bagReturned) text('Minh', 'Nắp bị kẹt. Người khuân hàng có thể biết cách mở.')
                else this.talk([{ speaker: 'Minh', text: 'Lách qua đường mương tối, vòng dưới sân tuần tra. Đoạn mương rộng phía trước có cầu nâng; cần cấp điện mô-tơ rồi hạ cầu.' }], () => {
                    this.player.body?.reset(level03X(1104), 276)
                    this.player.setVelocity(0, 0)
                })
                break
            case 'drainExit':
                if (m.bagReturned) this.talk([{ speaker: 'Minh', text: 'Quay theo mương về kho để đối chiếu manh mối.' }], () => {
                    this.player.body?.reset(560, 276)
                    this.player.setVelocity(0, 0)
                })
                else text('Minh', 'Lối kiểm tra mương. Có người ở kho biết cách mở nắp bên kia.')
                break
            case 'map':
                this.talk([
                    { speaker: 'Lan — ghi trên bản đồ', text: 'Khe rào mục nằm ở phía mương chảy ra, dưới cột mang hai vạch. Đừng nhầm vết sơn đỏ với vết gỉ. Tôi sẽ ra hiệu ba nhịp ngắn, một nhịp dài.' },
                    { speaker: 'Minh', text: 'Nhịp gõ đã giúp mình nhận ra Lan sau song cửa. Bây giờ phải nhìn thấy tín hiệu ấy từ ngoài hàng rào. USB không thể rơi lại vào tay họ.' },
                ], () => m.clues.add('map'))
                break
            case 'pole':
                this.talk([{ speaker: 'Minh', text: 'Cột B có hai vạch trắng. Một mũi sơn đỏ chỉ về phía đông. Cột A một vạch, cột C ba vạch.' }], () => m.clues.add('pole'))
                break
            case 'drain':
                this.talk([{ speaker: 'Biển thoát nước', text: 'Dòng chảy: tây → đông. Qua mương rộng bằng cầu nâng: đóng nguồn mô-tơ, kéo cần hạ cầu. Cầu phải hạ trước khi ngắt điện hàng rào.' }], () => m.clues.add('drain'))
                break
            case 'diagram':
                this.talk([
                    { speaker: 'Sơ đồ bảo trì — cầu nâng', text: 'Cầu bị dựng lên để chặn lối vận chuyển. Nguồn mô-tơ ở tủ bên trái sơ đồ, độc lập với điện hàng rào. Đóng nguồn trước, rồi kéo cần bên bờ mương. Chốt cơ khí giữ cầu khi đã hạ.' },
                    { speaker: 'Sơ đồ bảo trì — hàng rào', text: 'Nhánh 1: đèn sân / cột A. Nhánh 2: hàng rào cột B, phía đông mương. Nhánh 3: còi báo động / cột C. Rơ-le tự đóng sau 30 giây; chỉ kéo cầu dao hàng rào khi đường đi đã sẵn sàng.' },
                ], () => m.clues.add('diagram'))
                break
            case 'bag':
                this.talk([{ speaker: 'Minh', text: 'Một túi vải giấu sau kiện hàng. Có thể đây là thứ người khuân hàng đang tìm.' }], () => m.clues.add('bag'))
                break
            case 'porter':
                if (m.clues.has('bag')) {
                    this.talk([
                        { speaker: 'Người khuân hàng', text: 'Cậu quay lại thật... Trong túi là mảnh giấy ghi số nhà. Tôi cứ sợ có ngày mình quên mất đường về.' },
                        { speaker: 'Người khuân hàng', text: 'Đi thấp qua mương. Cầu đang dựng; đọc sơ đồ, cấp điện mô-tơ rồi kéo cần hạ cầu. Sang bờ kia mới ngắt hàng rào. Người tôi giúp lần trước đã không quay lại.' },
                        { speaker: 'Minh', text: 'Tôi chưa biết sẽ nhờ được ai, nhưng tôi đang mang danh sách những người ở đây. Tôi sẽ đưa nó tới người có thể giúp. Không phải chỉ tìm đường về cho riêng mình nữa.' },
                    ], () => { m.bagReturned = true })
                } else text('Người khuân hàng', 'Cậu cũng nói sẽ quay lại sao? Tôi từng chỉ đường cho một người rồi chẳng còn tin tức. Túi vải gần kho có mảnh giấy ghi địa chỉ nhà tôi. Nếu cậu giúp lấy lại, tôi sẽ chỉ lối mương. Không muốn giúp thì bản đồ và biển bảo trì vẫn đủ để tự tìm đường.')
                break
            case 'fence':
                if (!['map', 'pole', 'drain'].every(key => m.clues.has(key))) {
                    text('Minh', 'Cần đọc bản đồ Lan, dấu trên cột và hướng mương trước khi kết luận.')
                    break
                }
                this.choose('Khe rào nào khớp đủ ba dấu?', ['Cột A — phía đông — sơn đỏ', 'Cột B — phía tây — vết gỉ', 'Cột B — phía đông — sơn đỏ'], answer => {
                    this.result = m.identifyFence(answer) ? 'Đã xác định khe rào.' : 'Không khớp các dấu. Đọc lại manh mối rồi thử tiếp.'
                    this.resultUntil = this.scene.time.now + 3500
                })
                break
            case 'power':
                if (!m.fenceSolved || !m.clues.has('diagram')) {
                    text('Minh', 'Chưa đủ căn cứ. Phải xác định khe rào và đọc sơ đồ bảo trì.')
                    break
                }
                this.choose('Cô lập nhánh nào để tắt đúng đoạn rào?', ['Nhánh 1 — đèn sân', 'Nhánh 2 — rào cột B / đông mương', 'Nhánh 3 — còi báo động'], answer => {
                    this.result = m.isolatePower(answer) ? 'Đã chọn nhánh. Cầu dao vẫn chưa kéo.' : 'Sai nhánh; chưa cấp lệnh. Có thể thử lại.'
                    this.resultUntil = this.scene.time.now + 3500
                })
                break
            case 'breaker':
                if (!m.bridgeLowered) text('Minh', 'Cầu chưa hạ xong. Phải chuẩn bị đường đi trước khi ngắt điện hàng rào.')
                else if (!m.powerSolved) text('Minh', 'Chưa chọn đúng nhánh điện. Không thể kéo cầu dao bừa.')
                else this.talk([
                    { speaker: 'Minh', text: 'Qua mương rồi. Kéo cầu dao chỉ có 30 giây tới khe rào. Lan và Tuấn đang chờ tín hiệu; mình không thể để họ chờ một lời hứa suông.' },
                    { speaker: 'Minh', text: 'USB còn trong tay. Giờ phải đưa những cái tên này ra ngoài.' },
                ], () => m.start())
                break
        }
    }

}
