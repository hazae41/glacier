import { ScrollDescriptor, SingleDescriptor } from "mods/descriptors"
import { ScrollInstance, SingleInstance } from "mods/instances"
import { useCallback } from "react"
import { useCore } from "./core"
import { useParams } from "./params"

export type Creator =
  <D = any, E = any, K = any>(
    d: SingleDescriptor<D, E, K> | ScrollDescriptor<D, E, K>
  ) => SingleInstance<D, E, K> | ScrollInstance<D, E, K>

export function useXSWR() {
  const core = useCore()
  const params = useParams()

  const create = useCallback<Creator>((descriptor) => {
    return descriptor.create(core, params)
  }, [core, params])

  return { core, params, create }
}