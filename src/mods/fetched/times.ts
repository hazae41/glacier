import { Nullable } from "@hazae41/option"
import { Time } from "libs/time/time.js"

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

export interface CooldownAndExpiration {
  readonly cooldown?: Nullable<number>,
  readonly expiration?: Nullable<number>
}

export namespace TimesInit {

  export function merge(times: TimesInit, delays?: CooldownAndExpiration): TimesInit {
    const {
      time,
      cooldown = Time.fromDelay(delays?.cooldown),
      expiration = Time.fromDelay(delays?.expiration)
    } = times

    return { time, expiration, cooldown }
  }
}