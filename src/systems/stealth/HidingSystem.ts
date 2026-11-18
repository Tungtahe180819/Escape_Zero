interface Bounds { x: number; y: number; width: number; height: number }
interface ActorBody extends Bounds { enable: boolean }

export interface HidingState { zoneIndex: number; hidden: boolean }

export function evaluateHiding(
    body: ActorBody | null,
    zones: readonly Bounds[],
    crouching: boolean,
    grounded: boolean,
): HidingState {
    if (!body?.enable) return { zoneIndex: -1, hidden: false }
    // Numerical tolerance only. Decorative sprite padding does not affect cover.
    const epsilon = 0.001
    const zoneIndex = zones.findIndex((zone) => body.x >= zone.x - epsilon
        && body.y >= zone.y - epsilon
        && body.x + body.width <= zone.x + zone.width + epsilon
        && body.y + body.height <= zone.y + zone.height + epsilon)
    return { zoneIndex, hidden: zoneIndex >= 0 && crouching && grounded }
}

export function hidingLabel(state: HidingState, alerted: boolean): string {
    if (state.hidden) return alerted ? 'ẨN · CHƯA CẮT ĐUÔI' : 'ĐANG ẨN NẤP'
    if (state.zoneIndex >= 0) return 'TRONG HỐC · GIỮ S'
    return 'NGOÀI CHỖ NÚP'
}
