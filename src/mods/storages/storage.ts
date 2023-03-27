export type Storage =
  | SyncStorage
  | AsyncStorage

export interface SyncStorage {
  async: false

  /**
   * No longer use this storage and garbage collect now
   */
  unmount(): void

  /**
   * Performs garbage collection on current keys
   */
  collect(): Promise<void>

  /**
   * Get the data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<T>(key: string, shallow?: boolean): T | undefined

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<T>(key: string, value: T, shallow?: boolean): void

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete(key: string, shallow?: boolean): void
}

export interface AsyncStorage {
  async: true

  /**
   * No longer use this storage and garbage collect now
   */
  unmount(): void

  /**
   * Performs garbage collection on current keys
   */
  collect(): Promise<void>

  /**
   * Get the data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  get<T>(key: string, shallow?: boolean): Promise<T | undefined>

  /**
   * Set the given data to the given key
   * @param key the given key
   * @param value the given data
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  set<T>(key: string, value: T, shallow?: boolean): Promise<void>

  /**
   * Delete the given data from the given key
   * @param key the given key
   * @param shallow true = won't add this key to the garbage collector
   * @returns 
   */
  delete(key: string, shallow?: boolean): Promise<void>
}