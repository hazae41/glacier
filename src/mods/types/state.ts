export interface MutateState<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  cooldown?: number
  expiration?: number
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