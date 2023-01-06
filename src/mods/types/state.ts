export interface State<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  aborter?: AbortController,
  optimistic?: boolean,
  cooldown?: number
  expiration?: number,
  realData?: D
  realTime?: number
}