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

export namespace Times {

  export function min(...times: (Timed & Cached)[]): Timed & Cached {
    const time = Math.min(...times.map(t => t.time))

    const cooldownOrInfinity = Math.min(...times.map(t => t.cooldown || Infinity))
    const expirationOrInfinity = Math.min(...times.map(t => t.expiration || Infinity))

    const cooldown = cooldownOrInfinity === Infinity ? undefined : cooldownOrInfinity
    const expiration = expirationOrInfinity === Infinity ? undefined : expirationOrInfinity

    return { time, cooldown, expiration }
  }

}