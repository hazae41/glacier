export interface State<D = any, E = any> {
  data?: D
  error?: E
  time?: number,
  aborter?: AbortController
  cooldown?: number
  expiration?: number
}

export type Storage<T> =
  | SyncStorage<T>
  | AsyncStorage<T>

export function isAsyncStorage<T>(storage: Storage<T>): storage is AsyncStorage<T> {
  return storage.async
}

export interface SyncStorage<T> {
  async?: false

  has(key: string): boolean
  get(key: string): T | undefined
  set(key: string, value: T): void
  delete(key: string): void
}

export interface AsyncStorage<T> {
  async: true

  has(key: string): Promise<boolean>
  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}
