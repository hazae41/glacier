import { useCore } from "mods/react/contexts/core"
import { Object } from "mods/types/object"
import { Schema } from "mods/types/schema"
import { useCallback } from "react"

export type Maker = <D = any, E = any, N extends D = D, K = any, O extends Object<D, E, N, K> = Object<D, E, N, K>>(
  schema: Schema<D, E, N, K, O>
) => O

export function useXSWR() {
  const core = useCore()

  const make = useCallback<Maker>((schema) => {
    return schema.make(core)
  }, [core])

  return { core, make }
}