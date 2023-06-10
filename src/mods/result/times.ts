export interface TimesInit {
  readonly time?: number,
  readonly cooldown?: number,
  readonly expiration?: number
}

export interface Times {
  readonly time: number,
  readonly cooldown?: number,
  readonly expiration?: number
}

export namespace TimesInit {

  export function merge(a: TimesInit, b: TimesInit): TimesInit {
    const time = "time" in a
      ? a.time
      : b.time

    const cooldown = "cooldown" in a
      ? a.cooldown
      : b.cooldown

    const expiration = "expiration" in a
      ? a.expiration
      : b.expiration

    return { time, expiration, cooldown }
  }
}