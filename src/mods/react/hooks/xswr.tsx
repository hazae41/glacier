import { useCore } from "mods/react/contexts/core.js"
import { Instance, QuerySchema } from "mods/types/schema.js"
import { useCallback } from "react"

export type Maker = <K, D, F, O extends Instance<K, D, F>>(
  schema: QuerySchema<K, D, F, O>
) => Promise<O>

export function useXSWR() {
  const core = useCore().unwrap()

  const make = useCallback<Maker>(async (schema) => {
    return await schema.make(core)
  }, [core])

  return { core, make }
}