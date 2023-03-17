import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { NormalizerMore } from "mods/types/normalizer.js";
import { QueryParams } from "mods/types/params.js";
import { Schema } from "mods/types/schema.js";
import { SingleInstance } from "./instance.js";

export function getSchema<D = unknown, K = string>(
  key: K | undefined,
  fetcher: Fetcher<D, K> | undefined,
  params: QueryParams<D, K> = {},
) {
  return new SingleSchema<D, K>(key, fetcher, params)
}

export class SingleSchema<D = unknown, K = unknown> implements Schema<D, K, SingleInstance<D, K>>  {

  constructor(
    readonly key: K | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: QueryParams<D, K> = {},
  ) { }

  make(core: Core) {
    const { key, fetcher, params } = this

    return new SingleInstance<D, K>(core, key, fetcher, params)
  }

  async normalize(data: D, more: NormalizerMore) {
    const { core, shallow, root, optimistic } = more

    if (shallow)
      return

    const { storageKey, mparams } = this.make(core)
    const { time, cooldown, expiration } = root

    await more.core.apply(storageKey, () => ({
      data: data,
      error: undefined,
      time: time,
      cooldown: cooldown,
      expiration: expiration
    }), mparams, optimistic)
  }
}