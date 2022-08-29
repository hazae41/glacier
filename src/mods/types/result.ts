export interface Result<D = any> {
  data: D,
  cooldown?: number
  expiration?: number
}