import { ScrollSchema } from "mods/scroll";
import { SingleSchema } from "mods/single";
import { Schema } from "mods/types/schema";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, K = any>(
  schema: SingleSchema<D, E, K>
): SingleHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  schema: ScrollSchema<D, E, K>
): ScrollHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  schema: Schema<D, E, K>
) {
  if (schema instanceof SingleSchema)
    return useSingle<D, E, K>(schema.key, schema.poster, schema.params)

  if (schema instanceof ScrollSchema)
    return useScroll<D, E, K>(schema.scroller, schema.fetcher, schema.params)

  throw new Error("Invalid resource schema")
}