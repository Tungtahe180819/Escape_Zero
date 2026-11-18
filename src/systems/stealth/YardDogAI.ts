type DogState = 'PATROL' | 'INVESTIGATE' | 'CHASE' | 'SEARCH'
interface DogTarget { x: number; y: number; hidden: boolean; noisy: boolean; jumped: boolean; clearLine: boolean }

/** Noise gives a location to inspect, never wall-penetrating knowledge of a hidden player. */
export class YardDogAI {
    x: number
    facing = 1
    state: DogState = 'PATROL'
    seesTarget = false
    private goal: number
    private elapsed = 0
    private patrolDirection = 1
    private readonly home: number
    private readonly left: number
    private readonly right: number
    constructor(home: number, left: number, right: number) {
        this.home = home; this.left = left; this.right = right
        this.x = home
        this.goal = home
    }
    reset(): void { this.x = this.home; this.goal = this.home; this.state = 'PATROL'; this.elapsed = 0; this.seesTarget = false }
    update(delta: number, target: DogTarget): void {
        const step = Number.isFinite(delta) ? Math.min(100, Math.max(0, delta)) : 0
        this.elapsed += step
        const distance = Math.abs(target.x - this.x)
        this.seesTarget = !target.hidden && target.clearLine && distance < 70 && Math.abs(target.y - 276) < 40
        const heard = !target.hidden && (target.noisy || target.jumped) && distance < (target.jumped ? 260 : 180)
            && Math.abs(target.y - 276) < 70
        if (this.seesTarget) {
            this.state = 'CHASE'; this.elapsed = 0; this.goal = target.x
        } else if (heard && this.state !== 'CHASE') {
            this.state = 'INVESTIGATE'; this.elapsed = 0; this.goal = target.x
        }
        if (this.state === 'CHASE' && !this.seesTarget && (this.elapsed > 1800 || Math.abs(this.goal - this.x) < 3)) {
            this.state = 'SEARCH'; this.elapsed = 0
        }
        if (this.state === 'INVESTIGATE' && (Math.abs(this.goal - this.x) < 3 || this.elapsed > 3500)) {
            this.state = 'SEARCH'; this.elapsed = 0
        }
        if (this.state === 'SEARCH' && this.elapsed > 1600) { this.state = 'PATROL'; this.elapsed = 0 }
        if (this.state === 'PATROL') {
            if (this.x >= Math.min(this.right, this.home + 120)) this.patrolDirection = -1
            if (this.x <= Math.max(this.left, this.home - 120)) this.patrolDirection = 1
            this.goal = this.patrolDirection > 0 ? Math.min(this.right, this.home + 120) : Math.max(this.left, this.home - 120)
        }
        const speed = this.state === 'CHASE' ? 100 : this.state === 'INVESTIGATE' ? 65 : this.state === 'PATROL' ? 28 : 0
        const difference = this.goal - this.x
        if (Math.abs(difference) > 1 && speed > 0) this.facing = Math.sign(difference)
        this.x = Math.max(this.left, Math.min(this.right, this.x + Math.sign(difference) * Math.min(Math.abs(difference), speed * step / 1000)))
    }
    label(): string {
        return this.state === 'PATROL' ? 'CHÓ TUẦN TRA · ĐI CHẬM [S]'
            : this.state === 'INVESTIGATE' ? 'NGHE TIẾNG ĐỘNG · ĐANG TỚI KIỂM TRA'
            : this.state === 'CHASE' ? 'ĐÃ THẤY MINH · SỦA BÁO LÍNH!' : 'ĐANG ĐÁNH HƠI VỊ TRÍ CŨ'
    }
}
