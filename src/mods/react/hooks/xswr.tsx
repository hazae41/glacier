import { Core } from "mods/core"
import { useCore } from "mods/react/contexts/core"
import { useParams } from "mods/react/contexts/params"
import { Params } from "mods/types/params"
import { useCallback } from "react"

export type Maker = <T>(x: {
  make(core: Core, params: Params): T
}) => T

export function useXSWR() {
  const core = useCore()
  const params = useParams()

  const make = useCallback<Maker>((desc) => {
    return desc.make(core, params)
  }, [core, params])

  return { core, params, make }
}