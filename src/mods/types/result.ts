export interface Result<D = any, E = any, N = D, K = any> {
  data?: D,
  error?: E,
  time?: number,
  cooldown?: number
  expiration?: number
}