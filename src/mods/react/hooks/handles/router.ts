import { ScrollSchema } from "mods/scroll";
import { SingleSchema } from "mods/single";
import { Schema } from "mods/types/schema";
import { DependencyList, useMemo } from "react";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, K = any>(
  schema: SingleSchema<D, E, K>,
  deps: DependencyList
): SingleHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  schema: ScrollSchema<D, E, K>,
  deps: DependencyList
): ScrollHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  schema: Schema<D, E, K>,
  deps: DependencyList = [schema]
) {
  const rschema = useMemo(() => {
    return schema
  }, deps)

  if (rschema instanceof SingleSchema)
    return useSingle<D, E, K>(rschema.key, rschema.poster, rschema.params)

  if (rschema instanceof ScrollSchema)
    return useScroll<D, E, K>(rschema.scroller, rschema.fetcher, rschema.params)

  throw new Error("Invalid resource schema")
}