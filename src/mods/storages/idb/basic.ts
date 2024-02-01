import { Nullable } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { Bicoder, Encoder, SyncIdentity } from "mods/coders/coder.js"
import { Storage } from "mods/storages/storage.js"
import { RawState } from "mods/types/state.js"
import { useEffect, useRef } from "react"

export function useIDBStorage(params?: IDBStorageParams) {
  const storage = useRef<Result<IDBStorage, Error>>()

  if (storage.current == null)
    storage.current = Result.runAndDoubleWrapSync(() => IDBStorage.createOrThrow(params)).ignore()

  useEffect(() => () => {
    if (!storage.current?.isOk())
      return
    storage.current.inner[Symbol.asyncDispose]()
  }, [])

  return storage.current
}

export interface IDBStorageParams {
  readonly name?: string,
  readonly version?: number,

  readonly keySerializer?: Encoder<string, string>,
  readonly valueSerializer?: Bicoder<RawState, string>

  readonly onCollect?: (e: { storageKey: string }) => Promise<void>
  readonly onUpgrade?: (e: IDBVersionChangeEvent) => Promise<void>
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

  private constructor(
    readonly name = "xswr",
    readonly version = 1,
    readonly keySerializer = SyncIdentity as Encoder<string, string>,
    readonly valueSerializer = SyncIdentity as Bicoder<RawState, unknown>,
    readonly onCollect?: (e: { storageKey: string }) => Promise<void>,
    readonly onUpgrade?: (e: IDBVersionChangeEvent) => Promise<void>,
  ) {
    this.database = Result.runAndWrap(() => {
      return this.#openOrThrow()
    }).then(r => r.mapErrSync(IDBError.from))

    this.loadKeysAndCollectOrThrow().catch(console.warn)
  }

  #openOrThrow() {
    return new Promise<IDBDatabase>((ok, err) => {
      const req = indexedDB.open(this.name, this.version)

      req.onupgradeneeded = (e) => {
        const db = req.result

        if (e.oldVersion === 0)
          db.createObjectStore("keyval")

        this.onUpgrade?.(e).catch(console.warn)
      }

      req.onblocked = () => err(new Error("Database is blocked"))
      req.onerror = () => err(req.error)
      req.onsuccess = () => ok(req.result)
    })
  }

  [Symbol.dispose]() {
    this[Symbol.asyncDispose]().catch(console.warn)
  }

  async [Symbol.asyncDispose]() {
    await this.collectOrThrow()
  }

  static createOrThrow(params: IDBStorageParams = {}): IDBStorage {
    const { name, version, keySerializer, valueSerializer, onCollect, onUpgrade } = params

    if (typeof indexedDB === "undefined")
      throw new Error(`indexedDB is undefined`)

    return new IDBStorage(name, version, keySerializer, valueSerializer, onCollect, onUpgrade)
  }

  /**
   * Load the keys and garbage collect them
   * @returns 
   */
  async loadKeysAndCollectOrThrow() {
    const keys = await this.#transactOrThrow(async store => {
      return await this.#getOrThrow<[string, number][]>(store, "__keys")
    }, "readwrite")

    if (keys == null)
      return

    this.#storageKeys = new Map(keys)

    await this.collectOrThrow()
  }

  async #saveKeysOrThrow(store: IDBObjectStore) {
    return await this.#setOrThrow(store, "__keys", [...this.#storageKeys])
  }

  /**
   * Save the keys to be garbage collected on load
   */
  async saveKeysOrThrow() {
    return await this.#transactOrThrow(async store => {
      return await this.#saveKeysOrThrow(store)
    }, "readwrite")
  }

  async collectOrThrow() {
    for (const [storageKey, expiration] of this.#storageKeys) {
      if (expiration > Date.now())
        continue
      this.onCollect?.({ storageKey }).catch(console.warn)
    }
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

  async getStoredOrThrow(storageKey: string): Promise<RawState> {
    const storageValue = await this.#transactOrThrow(async store => {
      return await this.#getOrThrow<unknown>(store, storageKey)
    }, "readonly")

    if (storageValue == null)
      return undefined

    return await Promise.resolve(this.valueSerializer.decodeOrThrow(storageValue))
  }

  async getOrThrow(cacheKey: string): Promise<RawState> {
    return await this.getStoredOrThrow(await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey)))
  }

  #setOrThrow<T>(store: IDBObjectStore, key: string, value: T) {
    return new Promise<void>((ok, err) => {
      const req = store.put(value, key)

      req.onerror = () => err(req.error)
      req.onsuccess = () => ok()
    })
  }

  async setStoredAndWaitOrThrow(storageKey: string, state: RawState): Promise<void> {
    if (state == null)
      return await this.deleteStoredOrThrow(storageKey)

    const storageValue = await Promise.resolve(this.valueSerializer.encodeOrThrow(state))

    return await this.#transactOrThrow(async store => {
      if (state.expiration != null) {
        this.#storageKeys.set(storageKey, state.expiration)
        await this.#saveKeysOrThrow(store)
      }

      await this.#setOrThrow(store, storageKey, storageValue)
    }, "readwrite")
  }

  async setAndWaitOrThrow(cacheKey: string, state: RawState): Promise<void> {
    return await this.setStoredAndWaitOrThrow(await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey)), state)
  }

  #sets = Promise.resolve()

  setStoredOrThrow(storageKey: string, state: RawState) {
    this.#sets = this.#sets
      .then(() => this.setStoredAndWaitOrThrow(storageKey, state))
      .catch(console.warn)
  }

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

  async deleteStoredOrThrow(storageKey: string): Promise<void> {
    return await this.#transactOrThrow(async store => {
      if (this.#storageKeys.delete(storageKey)) {
        await this.#saveKeysOrThrow(store)
      }

      await this.#deleteOrThrow(store, storageKey)
    }, "readwrite")
  }

  async deleteOrThrow(cacheKey: string): Promise<void> {
    const storageKey = await Promise.resolve(this.keySerializer.encodeOrThrow(cacheKey))

    return await this.deleteStoredOrThrow(storageKey)
  }

}