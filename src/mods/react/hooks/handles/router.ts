import { ScrollSchema } from "mods/scroll";
import { SingleSchema } from "mods/single";
import { Schema } from "mods/types/schema";
import { DependencyList, useMemo } from "react";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, N = D, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => SingleSchema<D, E, N, K>,
  deps: L
): SingleHandle<D, E, N, K>

export function use<D = any, E = any, N = D, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, E, N, K>,
  deps: L
): ScrollHandle<D, E, N, K>

export function use<D = any, E = any, N = D, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => Schema<D, E, N, K>,
  deps: L
): SingleHandle<D, E, N, K> | ScrollHandle<D, E, N, K> {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema)
    return useSingle<D, E, N, K>(schema.key, schema.poster, schema.params)

  if (schema instanceof ScrollSchema)
    return useScroll<D, E, N, K>(schema.scroller, schema.fetcher, schema.params)

  throw new Error("Invalid resource schema")
}