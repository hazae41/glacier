export interface State<D = unknown> {
  data?: D
  error?: unknown
  time?: number,
  cooldown?: number
  expiration?: number
}

export interface FullState<D = unknown> extends State<D> {
  realData?: D
  realTime?: number
  optimistic?: boolean,
  aborter?: AbortController
}