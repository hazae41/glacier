import { ScrollSchema } from "mods/scroll";
import { SingleSchema } from "mods/single";
import { Schema } from "mods/types/schema";
import { DependencyList, useMemo } from "react";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...params: L) => SingleSchema<D, E, K>,
  deps: L
): SingleHandle<D, E, K>

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...params: L) => ScrollSchema<D, E, K>,
  deps: L
): ScrollHandle<D, E, K>

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...params: L) => Schema<D, E, K>,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema)
    return useSingle<D, E, K>(schema.key, schema.poster, schema.params)

  if (schema instanceof ScrollSchema)
    return useScroll<D, E, K>(schema.scroller, schema.fetcher, schema.params)

  throw new Error("Invalid resource schema")
}