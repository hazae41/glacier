// export interface StateInit<D = unknown> {
//   data?: D
//   error?: unknown
//   time?: number,
//   cooldown?: number
//   expiration?: number,
// }

export interface State<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  cooldown?: number
  expiration?: number,
  aborter?: AbortController,
  optimistic?: number,
  realData?: D
  realTime?: number
}