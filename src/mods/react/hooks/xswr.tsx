import { Core } from "mods/core"
import { Params } from "mods/index"
import { useCallback } from "react"
import { useCore } from "../contexts/core"
import { useParams } from "../contexts/params"

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