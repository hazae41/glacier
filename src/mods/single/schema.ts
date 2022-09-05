import { Core } from "mods/core";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { Schema } from "mods/types/schema";
import { SingleObject } from "./object";

export function single<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, E, K>,
  params: Params<D, E, K> = {},
) {
  return new SingleSchema(key, poster, params)
}

export class SingleSchema<D = any, E = any, K = any> implements Schema<D, E, K>  {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, E, K>,
    readonly params: Params<D, E, K> = {},
  ) { }

  make(core: Core, pparams: Params = {}, initialize?: boolean) {
    const { key, poster, params } = this

    return new SingleObject<D, E, K>(core, key, poster, params, pparams, initialize)
  }
}