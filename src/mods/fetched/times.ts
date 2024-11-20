import { Nullable } from "@hazae41/option"

export interface TimesInit {
  readonly time?: Nullable<number>,
  readonly cooldown?: Nullable<number>,
  readonly expiration?: Nullable<number>
}

export interface Times {
  readonly time: number,
  readonly cooldown?: Nullable<number>,
  readonly expiration?: Nullable<number>
}

export namespace TimesInit {

  export function merge(a: TimesInit, b?: TimesInit): TimesInit {
    const time = a.time !== undefined
      ? a.time
      : b?.time

    const cooldown = a.cooldown !== undefined
      ? a.cooldown
      : b?.cooldown

    const expiration = a.expiration !== undefined
      ? a.expiration
      : b?.expiration

    return { time, expiration, cooldown }
  }
}