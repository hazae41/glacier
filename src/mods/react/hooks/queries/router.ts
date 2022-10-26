import { ScrollSchema } from "mods/scroll/schema.js";
import { SingleSchema } from "mods/single/schema.js";
import { Schema } from "mods/types/schema.js";
import { DependencyList, useMemo } from "react";
import { ScrollQuery, useScrollQuery } from "./scroll.js";
import { SingleQuery, useSingleQuery } from "./single.js";

export function useQuery<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => SingleSchema<D, E, K>,
  deps: L
): SingleQuery<D, E, K>

export function useQuery<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, E, K>,
  deps: L
): ScrollQuery<D, E, K>

export function useQuery<D = any, E = any, K = any, L extends DependencyList = []>(
  factory: (...deps: L) => Schema<D, E, K>,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema) {
    const { key, fetcher, params } = schema
    return useSingleQuery(key, fetcher, params)
  }

  if (schema instanceof ScrollSchema) {
    const { scroller, fetcher, params } = schema
    return useScrollQuery(scroller, fetcher, params)
  }

  throw new Error("Invalid resource schema")
}