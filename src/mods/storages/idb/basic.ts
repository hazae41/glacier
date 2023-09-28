import { Nullable } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Bicoder, Encoder, SyncIdentity } from "mods/serializers/serializer.js"
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
    storage.current?.inner[Symbol.asyncDispose]().catch(console.error)
  }, [])

  return storage.current
}

export interface IDBStorageParams {
  name?: string,
  keySerializer?: Encoder<string, string>,
  valueSerializer?: Bicoder<RawState, string>
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

  readonly beforeunload: () => void

  #storageKeys = new Map<string, number>()

  private constructor(
    readonly name = "xswr",
    readonly keySerializer = SyncIdentity as Encoder<string, string>,
    readonly valueSerializer = SyncIdentity as Bicoder<RawState, unknown>
  ) {
    this.database = new Promise<Result<IDBDatabase, IDBError>>(ok => {
      const req = indexedDB.open(this.name, 1)

      req.onupgradeneeded = () =>
        req.result.createObjectStore("keyval", {})

      req.onblocked = () => ok(new Err(IDBError.from("blocked")))
      req.onerror = () => ok(new Err(IDBError.from(req.error)))
      req.onsuccess = () => ok(new Ok(req.result))
    })

    this.tryLoadKeys().then(r => r.ignore())

    this.beforeunload = () => {
      this.trySaveKeys().then(r => r.ignore())
    }

    addEventListener("beforeunload", this.beforeunload)
  }

  async [Symbol.asyncDispose]() {
    removeEventListener("beforeunload", this.beforeunload)
    await this.tryCollect().then(r => r.ignore())
    await this.trySaveKeys().then(r => r.ignore())
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
  async tryLoadKeys() {
    return await this.#tryTransact(async store => {
      return await Result.unthrow<Result<void, IDBError>>(async t => {
        const keys = await this.#tryGet<[string, number][]>(store, "__keys").then(r => r.throw(t))

        if (keys == null)
          return Ok.void()

        this.#storageKeys = new Map(keys)

        await this.#tryDelete(store, "__keys").then(r => r.throw(t))
        await this.#tryCollect(store).then(r => r.throw(t))

        return Ok.void()
      })
    }, "readwrite").then(r => r.ignore())
  }

  /**
   * Save the keys to be garbage collected on load
   */
  async trySaveKeys() {
    return await this.#tryTransact(async store => {
      return await this.#trySet(store, "__keys", [...this.#storageKeys])
    }, "readwrite")
  }

  async #tryCollect(store: IDBObjectStore) {
    for (const [key, expiration] of this.#storageKeys) {
      if (expiration > Date.now())
        continue

      const result = await this.#tryDelete(store, key)

      if (result.isErr())
        continue
      this.#storageKeys.delete(key)
    }

    return Ok.void()
  }

  async tryCollect() {
    return await this.#tryTransact(async store => {
      return await this.#tryCollect(store)
    }, "readwrite")
  }

  async #tryTransact<T, E>(callback: (store: IDBObjectStore) => Promise<Result<T, E>>, mode: IDBTransactionMode) {
    const database = await this.database

    if (database.isErr())
      return database

    const transaction = database.get().transaction("keyval", mode)
    const store = transaction.objectStore("keyval")

    try {
      const result = await callback(store)

      if (result.isOk())
        transaction.commit()

      if (result.isErr())
        transaction.abort()

      return result
    } catch (e: unknown) {
      transaction.abort()
      throw e
    }
  }

  #tryGet<T>(store: IDBObjectStore, key: string) {
    return new Promise<Result<Nullable<T>, IDBError>>(ok => {
      const req = store.get(key)

      req.onerror = () => ok(new Err(IDBError.from(req.error)))
      req.onsuccess = () => ok(req.result)
    })
  }

  async tryGet(cacheKey: string): Promise<Result<Nullable<RawState>, IDBError>> {
    return await Result.unthrow(async t => {
      const key = await this.keySerializer.stringify(cacheKey)

      const value = await this.#tryTransact(async store => {
        return await this.#tryGet<unknown>(store, key)
      }, "readonly").then(r => r.throw(t))

      if (value == null)
        return new Ok(undefined)

      const state = await this.valueSerializer.parse(value)

      if (state.expiration != null)
        this.#storageKeys.set(key, state.expiration)

      return new Ok(state)
    })
  }

  #trySet<T>(store: IDBObjectStore, key: string, value: T) {
    return new Promise<Result<void, IDBError>>(ok => {
      const req = store.put(value, key)

      req.onerror = () => ok(new Err(IDBError.from(req.error)))
      req.onsuccess = () => ok(Ok.void())
    })
  }

  async trySetAndWait(cacheKey: string, state: Nullable<RawState>) {
    if (state == null)
      return await this.tryDelete(cacheKey)

    const storageKey = await this.keySerializer.stringify(cacheKey)
    const storageValue = await this.valueSerializer.stringify(state)

    if (state.expiration != null)
      this.#storageKeys.set(storageKey, state.expiration)

    return await this.#tryTransact(async store => {
      return await this.#trySet(store, storageKey, storageValue)
    }, "readwrite")
  }

  #sets = Promise.resolve()

  /**
   * Background queued set
   * @param cacheKey 
   * @param state 
   * @returns 
   */
  trySet(cacheKey: string, state: Nullable<RawState>) {
    this.#sets = this.#sets.then(async () => {
      return await this.trySetAndWait(cacheKey, state).then(r => r.unwrap())
    }).catch(console.error)

    return Ok.void()
  }

  #tryDelete(store: IDBObjectStore, storageKey: string) {
    return new Promise<Result<void, IDBError>>(ok => {
      const req = store.delete(storageKey)

      req.onerror = () => ok(new Err(IDBError.from(req.error)))
      req.onsuccess = () => ok(Ok.void())
    })
  }

  async tryDelete(cacheKey: string) {
    const storageKey = await this.keySerializer.stringify(cacheKey)

    this.#storageKeys.delete(storageKey)

    return await this.#tryTransact(async store => {
      return await this.#tryDelete(store, storageKey)
    }, "readwrite")
  }

}