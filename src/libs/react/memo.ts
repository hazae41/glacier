import { Optional } from "@hazae41/option";
import { DependencyList, Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";


export type Setter<T> = Dispatch<SetStateAction<T>>

export function throwSync<T>(setter: Setter<T>) {
  return (error: unknown) => setter(() => { throw error })
}

export function useAsyncMemo<T>(factory: () => Promise<T>, deps: DependencyList): [Optional<T>, Promise<T>] {
  const [state, setState] = useState<T>()

  const promise = useMemo(() => {
    return factory()
  }, deps)

  useEffect(() => {
    promise.then(setState).catch(throwSync(setState))
  }, [promise])

  return [state, promise]
}