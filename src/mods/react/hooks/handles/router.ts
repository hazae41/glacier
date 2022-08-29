import { ScrollDescriptor } from "mods/descriptors/scroll";
import { SingleDescriptor } from "mods/descriptors/single";
import { ScrollHandle, useScroll } from "./scroll";
import { SingleHandle, useSingle } from "./single";

export function use<D = any, E = any, K = any>(
  descriptor: SingleDescriptor<D, E, K>
): SingleHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  descriptor: ScrollDescriptor<D, E, K>
): ScrollHandle<D, E, K>

export function use<D = any, E = any, K = any>(
  descriptor: SingleDescriptor<D, E, K> | ScrollDescriptor<D, E, K>
) {
  if (descriptor instanceof SingleDescriptor)
    return useSingle<D, E, K>(descriptor.key, descriptor.poster, descriptor.params)
  if (descriptor instanceof ScrollDescriptor)
    return useScroll<D, E, K>(descriptor.scroller, descriptor.fetcher, descriptor.current)
  throw new Error("Invalid resource descriptor")
}