import { Core } from "mods/core";
import { NormalizerMore } from "mods/types/normalizer";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { Schema } from "mods/types/schema";
import { SingleObject } from "./object";

export function single<D = any, E = any, N extends D = D, K = any>(
  key: K | undefined,
  poster: Poster<D, E, N, K> | undefined,
  params: Params<D, E, N, K> = {},
) {
  return new SingleSchema(key, poster, params)
}

export class SingleSchema<D = any, E = any, N extends D = D, K = any> implements Schema<D, E, N, K, SingleObject<D, E, N, K>>  {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, E, N, K> | undefined,
    readonly params: Params<D, E, N, K> = {},
  ) { }

  make(core: Core) {
    const { key, poster, params } = this

    return new SingleObject<D, E, N, K>(core, key, poster, params)
  }

  async normalize(data: D, more: NormalizerMore<D, E, N, K>) {
    if (more.shallow) return
    const { time, cooldown, expiration, optimistic } = more.root
    const state = { data, time, cooldown, expiration, optimistic }
    await this.make(more.core).mutate(() => state)
  }
}