import { ScrollSchema } from "mods/scroll/schema.js";
import { SingleSchema } from "mods/single/schema.js";
import { Schema } from "mods/types/schema.js";
import { DependencyList, useMemo } from "react";
import { ScrollQuery, useScrollQuery } from "./scroll.js";
import { SingleQuery, useSingleQuery } from "./single.js";

export function useQuery<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => SingleSchema<D, K>,
  deps: L
): SingleQuery<D, K>

export function useQuery<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, K>,
  deps: L
): ScrollQuery<D, K>

export function useQuery<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => Schema<D, K>,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema instanceof SingleSchema<D, K>) {
    const { key, fetcher, params } = schema
    return useSingleQuery<D, K>(key, fetcher, params)
  }

  if (schema instanceof ScrollSchema<D, K>) {
    const { scroller, fetcher, params } = schema
    return useScrollQuery<D, K>(scroller, fetcher, params)
  }

  throw new Error("Invalid resource schema")
}