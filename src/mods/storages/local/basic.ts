import { Result } from "@hazae41/result"
import { Bicoder, Encoder, SyncIdentity, SyncJson } from "mods/coders/coder.js"
import { RawState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { QueryStorage } from "../storage.js"

/**
 * Asynchronous local storage
 * 
 * Use for compatibility with SSR
 * Use for storing large objects
 * 
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 * 
 * @see SyncLocalStorage
 * @see useFallback
 */
export function useAsyncLocalStorage(params?: AsyncLocalStorageParams) {
  const storage = useRef<Result<AsyncLocalQueryStorage, Error>>()

  if (storage.current == null)
    storage.current = Result.runAndDoubleWrapSync(() => AsyncLocalQueryStorage.createOrThrow(params))

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current?.inner[Symbol.dispose]()
  }, [])

  return storage.current
}

export interface AsyncLocalStorageParams {
  readonly prefix?: string,
  readonly keySerializer?: Encoder<string, string>,
  readonly valueSerializer?: Bicoder<RawState, string>
}

/**
 * Asynchronous local storage
 * 
 * Use for compatibility with SSR
 * Use for storing large objects
 * 
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 * 
 * @see SyncLocalStorage
 * @see useFallback
 */
export class AsyncLocalQueryStorage implements QueryStorage {
  readonly async = true as const

  readonly beforeunload: () => void

  #storageKeys = new Map<string, number>()

  private constructor(
    readonly prefix = "xswr:",
    readonly keySerializer = SyncIdentity as Encoder<string, string>,
    readonly valueSerializer = SyncJson as Bicoder<RawState, string>
  ) {
    this.beforeunload = () => this.collect()
    addEventListener("beforeunload", this.beforeunload)
  }

  static createOrThrow(params: AsyncLocalStorageParams = {}): AsyncLocalQueryStorage {
    const { prefix, keySerializer, valueSerializer } = params

    if (typeof localStorage === "undefined")
      throw new Error(`localStorage is undefined`)

    return new AsyncLocalQueryStorage(prefix, keySerializer, valueSerializer)
  }

  [Symbol.dispose]() {
    removeEventListener("beforeunload", this.beforeunload)
    this.collect()
  }

  collect() {
    for (const [key, expiration] of this.#storageKeys) {
      if (expiration > Date.now())
        continue
      this.#delete(key)
    }
  }

  async getOrThrow(cacheKey: string): Promise<RawState> {
    const key = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))

    const item = localStorage.getItem(this.prefix + key)

    if (item == null)
      return undefined

    const state = await Promise.resolve(this.valueSerializer.decodeOrThrow(item))

    if (state?.expiration != null)
      this.#storageKeys.set(key, state.expiration)

    return state
  }

  async setOrThrow(cacheKey: string, state: RawState): Promise<void> {
    if (state == null)
      return await this.deleteOrThrow(cacheKey)

    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))
    const storageItem = await Promise.resolve(this.valueSerializer.encodeOrThrow(state))

    if (state.expiration != null)
      this.#storageKeys.set(storageKey, state.expiration)

    localStorage.setItem(this.prefix + storageKey, storageItem)
  }

  #delete(storageKey: string) {
    this.#storageKeys.delete(storageKey)
    localStorage.removeItem(this.prefix + storageKey)
  }

  async deleteOrThrow(cacheKey: string): Promise<void> {
    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))

    this.#delete(storageKey)
  }

}