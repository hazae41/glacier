export type Storage<T = any> =
  | SyncStorage<T>
  | AsyncStorage<T>

export interface SyncStorage<T = any> {
  async?: false

  get(key: string): T | undefined
  set(key: string, value: T): void
  delete(key: string): void
}

export interface AsyncStorage<T = any> {
  async: true

  get(key: string): Promise<T | undefined>
  set(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}

export function isAsyncStorage<T = any>(storage: Storage<T>): storage is AsyncStorage<T> {
  return storage.async
}