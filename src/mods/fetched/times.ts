export interface Timed {
  readonly time: number
}

export interface TimedInit {
  readonly time?: number
}

export interface Cached {
  readonly cooldown?: number
  readonly expiration?: number
}

export interface CachedInit {
  readonly cooldown?: number
  readonly expiration?: number
}