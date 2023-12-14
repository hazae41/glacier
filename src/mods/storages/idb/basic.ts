import { Nullable } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Bicoder, Encoder, SyncIdentity } from "mods/coders/coder.js"
import { Storage } from "mods/storages/storage.js"
import { RawState } from "mods/types/state.js"
import { useEffect, useRef } from "react"
import { StorageCreationError } from "../errors.js"

export function useIDBStorage(params?: IDBStorageParams) {
  const storage = useRef<Result<IDBStorage, StorageCreationError>>()

  if (storage.current == null)
    storage.current = IDBStorage.tryCreate(params).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current.inner[Symbol.asyncDispose]()
  }, [])

  return storage.current
}

export interface IDBStorageParams {
  readonly name?: string,
  readonly keySerializer?: Encoder<string, string>,
  readonly valueSerializer?: Bicoder<RawState, string>
}

export class IDBError extends Error {
  readonly #class = IDBError
  readonly name = this.#class.name

  constructor(options: ErrorOptions) {
    super(`Could not use IndexedDB`, options)
  }

  static from(cause: unknown) {
    return new IDBError({ cause })
  }

}

export class IDBStorage implements Storage {
  readonly async = true as const

  readonly database: Promise<Result<IDBDatabase, IDBError>>

  #storageKeys = new Map<string, number>()

  #onBeforeUnload: () => void

  private constructor(
    readonly name = "xswr",
    readonly keySerializer = SyncIdentity as Encoder<string, string>,
    readonly valueSerializer = SyncIdentity as Bicoder<RawState, unknown>
  ) {
    this.database = Result.runAndDoubleWrap(() => {
      return IDBStorage.#openOrThrow(name)
    }).then(r => r.mapErrSync(IDBError.from))

    this.loadKeysAndCollectOrThrow().catch(console.warn)

    this.#onBeforeUnload = () => {
      this.saveKeysOrThrow().catch(console.warn)
      this.#onBeforeUnload = () => { }
    }

    addEventListener("beforeunload", this.#onBeforeUnload)
  }

  static #openOrThrow(name: string) {
    return new Promise<IDBDatabase>((ok, err) => {
      const req = indexedDB.open(name, 1)

      req.onupgradeneeded = () =>
        req.result.createObjectStore("keyval", {})

      req.onblocked = () => err(new Error("Database is blocked"))
      req.onerror = () => err(req.error)
      req.onsuccess = () => ok(req.result)
    })
  }

  [Symbol.dispose]() {
    this[Symbol.asyncDispose]().catch(console.warn)
  }

  async [Symbol.asyncDispose]() {
    removeEventListener("beforeunload", this.#onBeforeUnload)
    await this.collectOrThrow()
  }

  static tryCreate(params: IDBStorageParams = {}): Result<IDBStorage, StorageCreationError> {
    const { name, keySerializer, valueSerializer } = params

    if (typeof indexedDB === "undefined")
      return new Err(new StorageCreationError())

    return new Ok(new IDBStorage(name, keySerializer, valueSerializer))
  }

  /**
   * Load the keys and garbage collect them
   * @returns 
   */
  async loadKeysAndCollectOrThrow() {
    return await this.#transactOrThrow(async store => {
      const keys = await this.#getOrThrow<[string, number][]>(store, "__keys")

      if (keys == null)
        return

      this.#storageKeys = new Map(keys)

      await this.#deleteOrThrow(store, "__keys")
      await this.#collectOrThrow(store)
    }, "readwrite")
  }

  /**
   * Save the keys to be garbage collected on load
   */
  async saveKeysOrThrow() {
    return await this.#transactOrThrow(async store => {
      return await this.#setOrThrow(store, "__keys", [...this.#storageKeys])
    }, "readwrite")
  }

  async #collectOrThrow(store: IDBObjectStore) {
    for (const [key, expiration] of this.#storageKeys) {
      try {
        if (expiration > Date.now())
          continue

        await this.#deleteOrThrow(store, key)
        this.#storageKeys.delete(key)

      } catch (e: unknown) { }
    }
  }

  async collectOrThrow() {
    return await this.#transactOrThrow(async store => {
      return await this.#collectOrThrow(store)
    }, "readwrite")
  }

  async #transactOrThrow<T>(callback: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode) {
    const database = await this.database.then(r => r.unwrap())
    const transaction = database.transaction("keyval", mode)

    try {
      const store = transaction.objectStore("keyval")
      const result = await callback(store)
      transaction.commit()
      return result
    } catch (e: unknown) {
      transaction.abort()
      throw e
    }
  }

  #getOrThrow<T>(store: IDBObjectStore, key: string) {
    return new Promise<Nullable<T>>((ok, err) => {
      const req = store.get(key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok(req.result as T)
    })
  }

  async getOrThrow(cacheKey: string): Promise<RawState> {
    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))

    const storageValue = await this.#transactOrThrow(async store => {
      return await this.#getOrThrow<unknown>(store, storageKey)
    }, "readonly")

    if (storageValue == null)
      return undefined

    const state = await Promise.resolve(this.valueSerializer.decodeOrThrow(storageValue))

    if (state?.expiration != null)
      this.#storageKeys.set(storageKey, state.expiration)

    return state
  }

  #setOrThrow<T>(store: IDBObjectStore, key: string, value: T) {
    return new Promise<void>((ok, err) => {
      const req = store.put(value, key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async setAndWaitOrThrow(cacheKey: string, state: RawState): Promise<void> {
    if (state == null)
      return await this.deleteOrThrow(cacheKey)

    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))
    const storageValue = await Promise.resolve(this.valueSerializer.encodeOrThrow(state))

    if (state.expiration != null)
      this.#storageKeys.set(storageKey, state.expiration)

    return await this.#transactOrThrow(async store => {
      return await this.#setOrThrow(store, storageKey, storageValue)
    }, "readwrite")
  }

  #sets = Promise.resolve()

  /**
   * Background queued set
   * @param cacheKey 
   * @param state 
   * @returns 
   */
  setOrThrow(cacheKey: string, state: RawState) {
    this.#sets = this.#sets
      .then(() => this.setAndWaitOrThrow(cacheKey, state))
      .catch(console.warn)
  }

  #deleteOrThrow(store: IDBObjectStore, storageKey: string) {
    return new Promise<void>((ok, err) => {
      const req = store.delete(storageKey)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async deleteOrThrow(cacheKey: string): Promise<void> {
    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))

    this.#storageKeys.delete(storageKey)

    return await this.#transactOrThrow(async store => {
      return await this.#deleteOrThrow(store, storageKey)
    }, "readwrite")
  }

}