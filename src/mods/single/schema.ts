import { Core } from "mods/core";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { Schema } from "mods/types/schema";
import { SingleObject } from "./object";

export function single<D extends N = any, E = any, N = D, K = any>(
  key: K | undefined,
  poster: Poster<D, E, N, K> | undefined,
  params: Params<D, E, N, K> = {},
) {
  return new SingleSchema(key, poster, params)
}

export class SingleSchema<D extends N = any, E = any, N = D, K = any> implements Schema<D, E, N, K, SingleObject<D, E, N, K>>  {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, E, N, K> | undefined,
    readonly params: Params<D, E, N, K> = {},
  ) { }

  make(core: Core, pparams: Params = {}) {
    const { key, poster, params } = this

    return new SingleObject<D, E, N, K>(core, key, poster, params, pparams)
  }
}