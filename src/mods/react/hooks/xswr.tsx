import { useCore } from "mods/react/contexts/core"
import { useParams } from "mods/react/contexts/params"
import { Object, Schema } from "mods/types/schema"
import { useCallback } from "react"

export type Maker = <T>(schema: Schema<T>, init?: boolean) => Object<T>

export function useXSWR() {
  const core = useCore()
  const params = useParams()

  const make = useCallback<Maker>((schema, init) => {
    return schema.make(core, params, init)
  }, [core, params])

  return { core, params, make }
}