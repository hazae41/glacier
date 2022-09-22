import { Core } from "mods/core";
import { Fetcher } from "mods/index";
import { NormalizerMore } from "mods/types/normalizer";
import { Params } from "mods/types/params";
import { Schema } from "mods/types/schema";
import { SingleObject } from "./object";

export function single<D = any, E = any, K = any>(
  key: K | undefined,
  fetcher: Fetcher<D, E, K> | undefined,
  params: Params<D, E, K> = {},
) {
  return new SingleSchema(key, fetcher, params)
}

export class SingleSchema<D = any, E = any, K = any> implements Schema<D, E, K, SingleObject<D, E, K>>  {
  constructor(
    readonly key: K | undefined,
    readonly fetcher: Fetcher<D, E, K> | undefined,
    readonly params: Params<D, E, K> = {},
  ) { }

  make(core: Core) {
    const { key, fetcher, params } = this

    return new SingleObject<D, E, K>(core, key, fetcher, params)
  }

  async normalize(data: D, more: NormalizerMore<D, E, K>) {
    if (more.shallow) return
    const { time, cooldown, expiration, optimistic } = more.root
    const state = { data, time, cooldown, expiration, optimistic }
    await this.make(more.core).mutate(() => state)
  }
}