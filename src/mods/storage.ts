export interface State<D = any, E = any> {
  data?: D
  error?: E
  time?: number,
  aborter?: AbortController
  cooldown?: number
  expiration?: number
}

export interface Storage<T> {
  has(key: string): boolean
  get(key: string): T | undefined
  set(key: string, value: T): void
  delete(key: string): void
}

export interface AsyncStorage<T> {
  has(key: string): Promise<boolean>
  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}