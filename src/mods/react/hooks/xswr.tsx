import { useCore } from "mods/react/contexts/core.js"
import { Instance } from "mods/types/instance.js"
import { QuerySchema } from "mods/types/schema.js"
import { useCallback } from "react"

export type Maker = <D, K, O extends Instance<D, K> = Instance<D, K>>(
  schema: QuerySchema<D, K, O>
) => Promise<O>

export function useXSWR() {
  const core = useCore()

  const make = useCallback<Maker>(async (schema) => {
    return await schema.make(core)
  }, [core])

  return { core, make }
}