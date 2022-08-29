import { SingleDescriptor } from "mods/descriptors"
import { SingleInstance } from "mods/index"
import { useCallback } from "react"
import { useCore } from "./core"
import { useParams } from "./params"

export type Creator =
  <D = any, E = any, K = any>(
    d: SingleDescriptor<D, E, K>
  ) => SingleInstance<D, E, K>

export function useXSWR() {
  const core = useCore()
  const params = useParams()

  const create = useCallback<Creator>((descriptor) => {
    return descriptor.create(core, params)
  }, [core, params])

  return { core, params, create }
}