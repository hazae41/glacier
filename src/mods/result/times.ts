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