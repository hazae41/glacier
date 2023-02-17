import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Params } from "mods/types/params.js";
import { Result } from "mods/types/result.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace SingleHelper {

  /**
   * Fetch
   * @param key Key (passed to fetcher)
   * @param skey Storage key
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param force Should ignore cooldown
   * @returns The new state
   */
  export async function fetch<D, K>(
    core: Core,
    key: K | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D, K> = {},
    force = false,
    ignore = false
  ): Promise<State<D> | undefined> {
    if (key === undefined) return
    if (skey === undefined) return

    let { current, skip } = await core.lock(skey, async () => {
      let current = await core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter && !force)
        return { current, skip: true }
      if (current?.aborter && force)
        current.aborter.abort("Replaced")

      if (core.shouldCooldown(current) && !ignore)
        return { current, skip: true }

      current = await core.mutate(skey, current,
        c => ({ time: c?.time, aborter }),
        params)
      return { current }
    })

    if (skip)
      return current

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const timeout = setTimeout(() => {
      aborter.abort("Fetch timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const {
        data,
        error,
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = await fetcher(key, { signal })

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(skey, params)

      const state: State<D> = {}

      if (data !== undefined)
        state.data = data
      state.error = error

      return await core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await core.mutate(skey, current,
        () => ({ aborter: undefined, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Optimistic update
   * @param key Key (:K) (passed to poster)
   * @param skey Storage key
   * @param fetcher Resource poster
   * @param updater Mutation function
   * @param aborter AbortController
   * @param tparams Time parameters
   * @returns The new state
   * @throws Error
   */
  export async function update<D, K>(
    core: Core,
    key: K | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    updater: Updater<D>,
    aborter = new AbortController(),
    params: Params<D, K> = {},
  ): Promise<State<D> | undefined> {
    if (key === undefined) return
    if (skey === undefined) return

    let { current, skip } = await core.lock(skey, async () => {
      let current = await core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter)
        current.aborter.abort("Replaced")

      current = await core.mutate(skey, current,
        c => ({ time: c?.time, aborter, optimistic: true }),
        params)
      return { current }
    })

    if (skip)
      return current

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const timeout = setTimeout(() => {
      aborter.abort("Update timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const generator = updater(current, { signal })

      let result: Result<D> | void = undefined

      while (true) {
        const { done, value } = await generator.next()

        if (done) {
          result = value
          break
        }

        const {
          data,
          error
        } = value

        if (signal.aborted)
          throw new AbortError(signal)

        const optimistic: State<D> = {}

        if (data !== undefined)
          optimistic.data = data
        optimistic.error = error

        current = await core.mutate(skey, current,
          c => ({ time: c?.time, aborter, optimistic: true, ...optimistic }),
          params)
      }

      if (result === undefined) {
        if (fetcher === undefined)
          throw new Error("Updater returned nothing and undefined fetcher")
        result = await fetcher(key, { signal, cache: "reload" })
      }

      const {
        data,
        error,
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(skey, params)

      if (error !== undefined) {
        if (current?.aborter !== aborter)
          return current
        return await core.mutate(skey, current,
          c => ({ time: c?.realTime, cooldown, expiration, aborter: undefined, optimistic: false, data: c?.realData, error }),
          params)
      }

      const state: State<D> = {}

      if (data !== undefined)
        state.data = data
      state.error = error

      return await core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, optimistic: false, ...state }),
        params)
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await core.mutate(skey, current,
        c => ({ time: c?.realTime, aborter: undefined, optimistic: false, data: c?.realData, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
  }
}