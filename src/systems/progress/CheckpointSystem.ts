export interface RespawnPoint {
    readonly x: number
    readonly y: number
}

export class CheckpointSystem {
    private readonly initialSpawn: RespawnPoint
    private activeSpawn?: RespawnPoint
    private activeId?: string

    constructor(initialSpawn: RespawnPoint) {
        this.initialSpawn = { ...initialSpawn }
    }

    activate(id: string, point: RespawnPoint): boolean {
        if (this.activeId === id) {
            return false
        }

        this.activeId = id
        this.activeSpawn = { ...point }
        return true
    }

    getSpawn(): RespawnPoint {
        return { ...(this.activeSpawn ?? this.initialSpawn) }
    }

    getLabel(): string {
        return this.activeId ?? 'START'
    }
}
