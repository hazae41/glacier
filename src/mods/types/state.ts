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
  optimistic?: boolean,
  realData?: D
  realTime?: number
}