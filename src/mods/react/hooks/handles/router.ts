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

export function use<D = any, E = any, N extends D = D, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, E, N, K>,
  deps: L
): ScrollHandle<D, E, N, K>

export function use<D = any, E = any, N = D, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => Schema<D, E, N, K>,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema)
    return useSingle(schema.key, schema.poster, schema.params) as SingleHandle<D, E, N, K>

  if (schema instanceof ScrollSchema)
    return useScroll(schema.scroller, schema.fetcher, schema.params) as ScrollHandle<D, E, N, K>

  throw new Error("Invalid resource schema")
}