export type Result<D = any, E = any, K = any> =
  | DataResult<D, E, K>
  | ErrorResult<D, E, K>

export interface DataResult<D = any, E = any, K = any> {
  data?: D,
  error?: undefined,
  time?: number,
  cooldown?: number
  expiration?: number
}

export interface ErrorResult<D = any, E = any, K = any> {
  data?: undefined,
  error?: E,
  time?: number,
  cooldown?: number
  expiration?: number
}