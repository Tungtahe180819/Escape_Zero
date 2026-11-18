export interface PursuitGap {
    left: number
    right: number
}

export interface PursuitRoute {
    groundY: number
    gaps: PursuitGap[]
}

/** Read the flat surface used by the current Level 03, without editing tiles. */
export function createPursuitRoute(
    rows: readonly (readonly { index: number }[])[],
    tileWidth: number,
    tileHeight: number,
): PursuitRoute {
    if (
        !Number.isFinite(tileWidth) || tileWidth <= 0 ||
        !Number.isFinite(tileHeight) || tileHeight <= 0
    ) {
        throw new Error('Pursuit route tile dimensions must be positive')
    }

    const surfaceRow = rows.findIndex(
        (row) => row.some((tile) => tile.index !== -1),
    )

    if (surfaceRow < 0) {
        throw new Error('Pursuit route requires a ground surface')
    }

    const row = rows[surfaceRow]
    const gaps: PursuitGap[] = []
    let gapStart = -1

    for (let column = 0; column <= row.length; column++) {
        const empty = column < row.length && row[column].index === -1

        if (empty && gapStart === -1) {
            gapStart = column
        } else if (!empty && gapStart !== -1) {
            gaps.push({ left: gapStart * tileWidth, right: column * tileWidth })
            gapStart = -1
        }
    }

    return { groundY: surfaceRow * tileHeight, gaps }
}

/** Visual jump arc only: does not change pursuit speed or capture rules. */
export function pursuitJumpHeight(
    x: number,
    gaps: readonly PursuitGap[],
    height: number,
): number {
    for (const gap of gaps) {
        const takeoff = gap.left - 12
        const landing = gap.right + 12

        if (x > takeoff && x < landing) {
            const progress = (x - takeoff) / (landing - takeoff)
            return 4 * height * progress * (1 - progress)
        }
    }

    return 0
}
