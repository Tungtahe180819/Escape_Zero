export interface Interactable {
    readonly id: string
    readonly x: number
    readonly y: number
    readonly radius: number
    readonly prompt: string

    isAvailable(): boolean
    interact(): void
}
