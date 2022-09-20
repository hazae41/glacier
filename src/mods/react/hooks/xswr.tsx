import { useCore } from "mods/react/contexts/core"
import { Object } from "mods/types/object"
import { Schema } from "mods/types/schema"
import { useCallback } from "react"

export type Maker = <D = any, E = any, K = any, O extends Object<D, E, K> = Object<D, E, K>>(
  schema: Schema<D, E, K, O>
) => O

export function useXSWR() {
  const core = useCore()

  const make = useCallback<Maker>((schema) => {
    return schema.make(core)
  }, [core])

  return { core, make }
}