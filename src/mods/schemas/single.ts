import { Core } from "mods/core";
import { SingleObject } from "mods/objects/single";
import { Poster } from "mods/types/poster";
import { Params } from "../types/params";
import { Schema } from "./schema";

export function single<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, K>,
  params: Params<D, E, K> = {},
) {
  return new SingleSchema(key, poster, params)
}

export class SingleSchema<D = any, E = any, K = any> extends Schema<D, E, K>  {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, K>,
    readonly params: Params<D, E, K> = {},
  ) { super() }

  make(core: Core, pparams: Params = {}) {
    const { key, poster, params } = this

    return new SingleObject<D, E, K>(core, key, poster, params, pparams)
  }
}