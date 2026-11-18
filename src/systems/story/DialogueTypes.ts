export interface DialogueLine {
    speaker: string
    text: string
}

export interface DialogueData {
    returnScene: string
    lines: readonly DialogueLine[]
    onComplete?: () => void
}
