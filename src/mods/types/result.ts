export type Result<D> =
  | DataResult<D>
  | ErrorResult

export interface DataResult<D> {
  data: D,
  error?: undefined,
  time?: number,
  cooldown?: number
  expiration?: number
}

export interface ErrorResult {
  data?: undefined,
  error: unknown,
  time?: number,
  cooldown?: number
  expiration?: number
}