import { Ortho } from "libs/ortho"
import { ScrollHelper } from "mods/scroll"
import { SingleHelper } from "mods/single"
import { Mutator } from "mods/types/mutator"
import { Params } from "mods/types/params"
import { State } from "mods/types/state"
import { isAsyncStorage } from "mods/types/storage"
import { DEFAULT_EQUALS } from "mods/utils/defaults"
import { shallowEquals } from "mods/utils/equals"

export type Listener<D = any, E = any, K = any> =
  (x?: State<D, E, K>) => void

export class Core extends Ortho<string, State | undefined> {
  readonly single = new SingleHelper(this)
  readonly scroll = new ScrollHelper(this)

  readonly cache = new Map<string, State>()

  private _mounted = true

  constructor(
    readonly params: Params
  ) { super() }

  get mounted() { return this._mounted }

  unmount() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this._mounted = false
  }

  getSync<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {}
  ): State<D, E, K> | undefined | null {
    if (skey === undefined) return

    if (this.cache.has(skey))
      return this.cache.get(skey)

    const { storage } = params
    if (!storage) return

    if (isAsyncStorage(storage))
      return null
    const state = storage.get(skey)
    this.cache.set(skey, state)
    return state
  }

  async get<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {},
    ignore = false
  ): Promise<State<D, E, K> | undefined> {
    if (skey === undefined) return

    if (this.cache.has(skey))
      return this.cache.get(skey)

    const { storage } = params
    if (!storage) return

    const state = await storage.get(skey, ignore)
    this.cache.set(skey, state)
    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param skey Key
   * @param state New state
   * @returns 
   */
  async set<D = any, E = any, K = any>(
    skey: string | undefined,
    state: State<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (skey === undefined) return

    this.cache.set(skey, state)
    this.publish(skey, state)

    const { storage } = params
    if (!storage) return
    const { data, time, cooldown, expiration } = state
    await storage.set(skey, { data, time, cooldown, expiration })
  }

  /**
   * Delete key and publish undefined
   * @param skey 
   * @returns 
   */
  async delete<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {}
  ) {
    if (!skey) return

    this.cache.delete(skey)
    this.publish(skey, undefined)

    const { storage } = params
    if (!storage) return
    await storage.delete(skey)
  }

  async mutate<D = any, E = any, K = any>(
    skey: string | undefined,
    current: State<D, E, K> | undefined,
    mutator: Mutator<D, E, K>,
    params: Params<D, E, K> = {}
  ): Promise<State<D, E, K> | undefined> {
    if (skey === undefined) return
    const state = mutator(current)

    if (!state) {
      await this.delete(skey, params)
      return
    }

    if (state.time !== undefined && state.time < (current?.time ?? 0))
      return current

    if (state.optimistic === undefined && current?.optimistic)
      return current

    const next: State<D, E, K> = {
      ...current,
      ...state
    }

    if (next.time === undefined)
      next.time = Date.now()
    next.data = await this.normalize(false, next, params)

    const {
      equals = DEFAULT_EQUALS
    } = params

    if (equals(next.data, current?.data)) // Prevent some renders if the data is the same
      next.data = current?.data
    if (shallowEquals(next, current)) // Shallow comparison because aborter is not serializable
      return current

    await this.set(skey, next, params)
    return next as State<D, E, K>
  }

  async normalize<D = any, E = any, K = any>(
    shallow: boolean,
    root: State<D, E, K>,
    params: Params<D, E, K> = {},
  ) {
    if (root.data === undefined) return
    if (params.normalizer === undefined) return root.data
    return await params.normalizer(root.data, { core: this, shallow, root })
  }

  /**
   * True if we should cooldown this resource
   */
  shouldCooldown<D = any, E = any, K = any>(
    current?: State<D, E, K>
  ) {
    if (current?.cooldown === undefined)
      return false
    return Date.now() < current.cooldown
  }

  counts = new Map<string, number>()
  timeouts = new Map<string, NodeJS.Timeout>()

  once<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    const f: Listener<D, E, K> = (x) => {
      this.off(key, f, params)
      listener(x)
    }

    this.on(key, f, params)
  }

  on<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    super.on(key, listener)

    const count = this.counts.get(key) ?? 0
    this.counts.set(key, count + 1)

    const timeout = this.timeouts.get(key)
    if (timeout === undefined) return

    clearTimeout(timeout)
    this.timeouts.delete(key)
  }

  async off<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    super.off(key, listener)

    const count = this.counts.get(key)!

    if (count > 1) {
      this.counts.set(key, count - 1)
      return
    }

    this.counts.delete(key)

    const current = await this.get(key, params, true)
    if (current?.expiration === undefined) return
    if (current?.expiration === -1) return

    const erase = async () => {
      if (!this._mounted) return

      const count = this.counts.get(key)
      if (count !== undefined) return

      this.timeouts.delete(key)
      await this.delete(key, params)
    }

    if (Date.now() > current.expiration) {
      await erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.timeouts.set(key, timeout)
  }
}