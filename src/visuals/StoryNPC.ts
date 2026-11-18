import type Phaser from 'phaser'
import { CHARACTER_SCALE } from '../config/characterConfig'

export const STORY_NPC_FRAMES = {
    lan: 0, tuan: 1, archivist: 2, technician: 3,
    cleaner: 4, food: 5, worker: 6, porter: 7,
} as const
export type StoryNPCId = keyof typeof STORY_NPC_FRAMES

/** A stable identity across levels; feet anchor at the visible sole, without tint swaps. */
export function createStoryNPC(scene: Phaser.Scene, id: StoryNPCId, x: number, feetY: number): Phaser.GameObjects.Sprite {
    return scene.add.sprite(x, feetY, 'story-npcs', STORY_NPC_FRAMES[id])
        .setScale(CHARACTER_SCALE).setOrigin(0.5, 46 / 48).setDepth(1)
}
