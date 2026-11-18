import type { Interactable } from '../interaction/Interactable'

// The solid divider remains closed to guards. E changes rooms through its door.
export function createCellRoomDoors(
    getPoint: (name: string) => { x: number; y: number },
    available: () => boolean,
    travel: (point: { x: number; y: number }, label: string) => void,
): Interactable[] {
    return [
        { from: 'roomDoorStory', to: 'roomDoorStealth', label: 'Vào phòng gác' },
        { from: 'roomDoorStealth', to: 'roomDoorStory', label: 'Vào phòng hồ sơ · An toàn' },
    ].map((link) => ({
        id: link.from, ...getPoint(link.from), radius: 28,
        prompt: link.label, isAvailable: available,
        interact: () => {
            if (available()) travel(getPoint(link.to), link.label)
        },
    }))
}
