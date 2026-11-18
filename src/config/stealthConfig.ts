import type { GuardConfig } from '../entities/Guard'
import type { SurveillanceCameraConfig } from '../entities/SurveillanceCamera'
import type { GuardTiming } from '../systems/stealth/GuardStateMachine'

// Durations use milliseconds; movement uses pixels/second; angles use degrees.
export const GUARD_TIMING = Object.freeze({
  suspicionMs: 0,
  searchMs: 3000,
} satisfies GuardTiming)

type GuardTuning = Omit<GuardConfig, 'spawnX' | 'spawnY' | 'leftX' | 'rightX'>
type CameraTuning = Omit<SurveillanceCameraConfig, 'x' | 'y'>

const DEFAULT_GUARD = Object.freeze({
  ...GUARD_TIMING,
  patrolSpeed: 40,
  chaseSpeed: 110,
  visionRange: 140,
  visionHalfAngle: 35,
  crouchRangeMultiplier: 0.55,
  closeAwarenessRange: 20,
} satisfies GuardTuning)

export const LEVEL01_STEALTH = Object.freeze({
  guard: Object.freeze({ ...DEFAULT_GUARD }),
})

// Separate profiles allow Level-02 tuning without changing Level-01.
export const LEVEL02_STEALTH = Object.freeze({
  guard: Object.freeze({ ...DEFAULT_GUARD }),
  camera: Object.freeze({
    minAngle: 35,
    maxAngle: 145,
    cycleMs: 8000,
    range: 220,
    halfAngle: 25,
    detectionGain: 1,
    detectionDecay: 0.3,
  } satisfies CameraTuning),
})
