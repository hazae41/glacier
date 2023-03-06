import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Params } from "mods/types/params.js";
import { Result } from "mods/types/result.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Single {

  export function getStorageKey<D, K>(key: K | undefined, params: Params<D, K>) {
    if (key === undefined)
      return undefined
    if (typeof key === "string")
      return key

    const {
      serializer = DEFAULT_SERIALIZER
    } = params

    return serializer.stringify(key)
  }

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
    if (key === undefined)
      return
    if (skey === undefined)
      return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

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

    const timeout = setTimeout(() => {
      aborter.abort("Fetch timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const result = await fetcher(key, { signal })

      const {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(skey, params)

      const state: State<D> = {
        time: time,
        cooldown: cooldown,
        expiration: expiration,
        aborter: undefined
      }

      if ("data" in result) {
        state.data = result.data
        state.error = undefined
      } else {
        state.error = result.error
      }

      return await core.mutate(skey, current, () => state, params)
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current

      const state: State<D> = {
        error: error,
        aborter: undefined
      }

      return await core.mutate(skey, current, () => state, params)
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
    if (key === undefined)
      return
    if (skey === undefined)
      return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params


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

        if (signal.aborted)
          throw new AbortError(signal)

        const state: State<D> = {
          time: current?.time,
          aborter: aborter,
          optimistic: true
        }

        if ("data" in value) {
          state.data = value.data
          state.error = undefined
        } else {
          state.error = value.error
        }

        current = await core.mutate(skey, current, () => state, params)
      }

      if (result === undefined) {
        if (fetcher === undefined)
          throw new Error("Updater returned undefined and fetcher is undefined")
        result = await fetcher(key, { signal, cache: "reload" })
      }

      const {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(skey, params)

      if ("error" in result) {
        if (current?.aborter !== aborter)
          return current

        const state: State<D> = {
          data: current.realData,
          error: result.error,
          time: current.realTime,
          cooldown: cooldown,
          expiration: expiration,
          aborter: undefined,
          optimistic: false
        }

        return await core.mutate(skey, current, () => state, params)
      } else {
        const state: State<D> = {
          data: result.data,
          error: undefined,
          time: time,
          cooldown: cooldown,
          expiration: expiration,
          aborter: undefined,
          optimistic: false
        }

        return await core.mutate(skey, current, () => state, params)
      }
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current

      const state: State<D> = {
        data: current.realData,
        error: error,
        time: current.realTime,
        aborter: undefined,
        optimistic: false
      }

      return await core.mutate(skey, current, () => state, params)
    } finally {
      clearTimeout(timeout)
    }
  }
}