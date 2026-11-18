interface BodyBounds {
    x: number
    y: number
    width: number
    height: number
    enable: boolean
}

// World-space grab bounds, including 24 px overhead reach so the current
// 40 px-high player jump cannot vault a guard. Horizontal reach stays unchanged.
// Alert/concealment rules
// are applied by Guard before this geometry-only check.
export function guardTouchesTarget(
    guard: BodyBounds | null,
    target: BodyBounds | null,
): boolean {
    if (!guard?.enable || !target?.enable) return false
    return guard.x <= target.x + target.width
        && guard.x + guard.width >= target.x
        && guard.y - 24 <= target.y + target.height
        && guard.y + guard.height >= target.y
}
