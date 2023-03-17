export interface StateInit<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  cooldown?: number
  expiration?: number,
  realData?: D
  realTime?: number
}

export interface State<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  cooldown?: number
  expiration?: number,
  realData?: D
  realTime?: number
  optimistic?: boolean,
  aborter?: AbortController
}