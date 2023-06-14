import { Core } from "mods/core/core.js"
import { useCore } from "mods/react/contexts/core.js"
import { useCallback } from "react"

export interface Makeable<T> {
  make(core: Core): Promise<T>
}

export type Maker =
  <T>(makeable: Makeable<T>) => Promise<T>

export function useXSWR() {
  const core = useCore().unwrap()

  const make = useCallback<Maker>(async (makeable) => {
    return await makeable.make(core)
  }, [core])

  return { core, make }
}