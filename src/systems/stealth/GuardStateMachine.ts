export type GuardState =
    | 'PATROL'
    | 'SUSPICIOUS'
    | 'CHASE'
    | 'SEARCH'

export interface GuardTiming {
    suspicionMs: number
    searchMs: number
}

export class GuardStateMachine {
    private currentState: GuardState = 'PATROL'
    private elapsedMs = 0

    private readonly timing: GuardTiming

    constructor(timing: GuardTiming) {
        if (
            !Number.isFinite(timing.suspicionMs)
            || !Number.isFinite(timing.searchMs)
            || timing.suspicionMs < 0
            || timing.searchMs <= 0
        ) {
            throw new Error('Guard suspicion must be nonnegative and search positive (finite milliseconds)')
        }

        this.timing = { ...timing }
    }

    get state(): GuardState {
        return this.currentState
    }

    setTargetVisible(visible: boolean): void {
        if (visible) {
            if (this.currentState === 'PATROL') {
                this.transition(this.timing.suspicionMs === 0 ? 'CHASE' : 'SUSPICIOUS')
            } else if (this.currentState === 'SEARCH') {
                this.transition('CHASE')
            }
        } else {
            if (this.currentState === 'SUSPICIOUS') {
                this.transition('PATROL')
            } else if (this.currentState === 'CHASE') {
                this.transition('SEARCH')
            }
        }
    }

    update(deltaMs: number): void {
        if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
            return
        }

        this.elapsedMs += deltaMs

        if (
            this.currentState === 'SUSPICIOUS'
            && this.elapsedMs >= this.timing.suspicionMs
        ) {
            this.transition('CHASE')
        } else if (
            this.currentState === 'SEARCH'
            && this.elapsedMs >= this.timing.searchMs
        ) {
            this.transition('PATROL')
        }
    }

    reset(): void {
        this.transition('PATROL')
    }

    private transition(nextState: GuardState): void {
        this.currentState = nextState
        this.elapsedMs = 0
    }
}
