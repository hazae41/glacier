import { Core } from "mods/core";
import { SingleInstance } from "mods/instances/single";
import { Poster } from "mods/types/poster";
import { Params } from "../types/params";

export function getSingle<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, K>,
  params: Params<D, E, K> = {},
) {
  return new SingleDescriptor(key, poster, params)
}

export class SingleDescriptor<D = any, E = any, K = any> {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, K>,
    readonly params: Params<D, E, K> = {},
  ) { }

  create(core: Core, pparams: Params = {}) {
    const { key, poster, params } = this

    return new SingleInstance<D, E, K>(core, key, poster, params, pparams)
  }
}