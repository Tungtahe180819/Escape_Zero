/** Two 12-tile extensions inside the preparation yard; the final sprint is translated intact. */
export function level03X(originalX: number): number {
    return originalX + (originalX >= 704 ? 192 : 0) + (originalX >= 960 ? 192 : 0)
}
