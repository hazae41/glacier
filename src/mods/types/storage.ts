export type Storage =
  | SyncStorage
  | AsyncStorage

export interface SyncStorage {
  async?: false

  get<T = any>(key: string): T | undefined
  set<T = any>(key: string, value: T): void
  delete(key: string): void
}

export interface AsyncStorage {
  async: true

  get<T = any>(key: string): Promise<T | undefined>
  set<T = any>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}

export function isAsyncStorage(storage: Storage): storage is AsyncStorage {
  return Boolean(storage.async)
}