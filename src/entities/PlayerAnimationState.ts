interface AnimationBody {
    blocked: { down: boolean }
    touching: { down: boolean }
    velocity: { x: number; y: number }
    bottom: number
}

/** Contact flags can drop for a fixed physics step on a tile boundary.
 * Stabilize the pose only; never grant extra ground collision or jump permission. */
export class PlayerAnimationState {
    private supportedAt = -Infinity
    private supportedFeet = 0

    select(body: AnimationBody, crouching: boolean, time: number): string {
        const rising = body.velocity.y < -20
        const contact = !rising && (body.blocked.down || body.touching.down)
        if (contact) {
            this.supportedAt = time
            this.supportedFeet = body.bottom
        }
        const restingBetweenSteps = !rising && body.velocity.y >= -1 && body.velocity.y <= 20
            && time >= this.supportedAt && time - this.supportedAt <= 60
            && Math.abs(body.bottom - this.supportedFeet) <= 1
        if (!contact && !restingBetweenSteps) return rising ? 'minh-jump' : 'minh-fall'
        if (crouching) return 'minh-crouch'
        return Math.abs(body.velocity.x) > 1 ? 'minh-walk' : 'minh-idle'
    }
}
