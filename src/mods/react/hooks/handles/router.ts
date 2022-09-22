import { ScrollSchema } from "mods/scroll";
import { SingleSchema } from "mods/single";
import { Schema } from "mods/types/schema";
import { DependencyList, useMemo } from "react";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => SingleSchema<D, E, K>,
  deps: L
): SingleHandle<D, E, K>

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, E, K>,
  deps: L
): ScrollHandle<D, E, K>

export function use<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => Schema<D, E, K>,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema) {
    const { key, fetcher, params } = schema
    return useSingle(key, fetcher, params)
  }

  if (schema instanceof ScrollSchema) {
    const { scroller, fetcher, params } = schema
    return useScroll(scroller, fetcher, params)
  }

  throw new Error("Invalid resource schema")
}