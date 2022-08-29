import { Core } from "mods/core";
import { SingleInstance } from "mods/instances/single";
import { Poster } from "mods/types/poster";
import { Params } from "../types/params";

export class SingleDescriptor<D = any, E = any, K = any> {
  constructor(
    readonly key: K | undefined,
    readonly poster: Poster<D, K>,
    readonly params: Params<D, E, K> = {},
  ) { }

  create(core: Core, pparams: Params = {}) {
    const { key, poster, params } = this

    const mparams = { ...pparams, ...params }
    return new SingleInstance(core, key, poster, mparams)
  }
}