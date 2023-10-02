import { Result } from "@hazae41/result";
import { useRenderRef } from "libs/react/ref.js";
import { Simple } from "mods/queries/simple/helper.js";
import { QuerySettings } from "mods/types/settings.js";
import { DependencyList, useCallback, useMemo } from "react";

export type Action<K, D, F, P> =
  (key: K, params: P) => Result<D, F>

export class ActionSchema<K, D, F, P> {

  constructor(
    readonly key: K,
    readonly action: Action<K, D, F, P>,
    readonly settings: QuerySettings<K, D, F>
  ) { }


}

export function useAnonymousAction<K, D, F, P extends []>(
  key: K,
  action: Action<K, D, F, P>,
  settings: QuerySettings<K, D, F>,
  deps: DependencyList
) {
  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(key)
  }, [key])

  return useCallback(async () => {
    // await core.lockOrError(cacheKey,)
  }, deps)
} 