import { useCore } from "mods/react/contexts/core.js"
import { Instance } from "mods/types/instance.js"
import { Schema } from "mods/types/schema.js"
import { useCallback } from "react"

export type Maker = <D = any, E = any, K = any, O extends Instance<D, E, K> = Instance<D, E, K>>(
  schema: Schema<D, E, K, O>
) => O

export function useXSWR() {
  const core = useCore()

  const make = useCallback<Maker>((schema) => {
    return schema.make(core)
  }, [core])

  return { core, make }
}