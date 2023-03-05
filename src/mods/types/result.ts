export type Result<D> =
  | DataResult<D>
  | ErrorResult

export interface DataResult<D> {
  data: D,
  time?: number,
  cooldown?: number
  expiration?: number
}

export interface ErrorResult {
  error: unknown,
  time?: number,
  cooldown?: number
  expiration?: number
}