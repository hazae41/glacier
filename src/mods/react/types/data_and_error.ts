import { Option } from "@hazae41/option";
import { FetchedState } from "mods/types/state.js";
import { useMemo } from "react";

export interface DataAndError<D, F> {
  readonly data: Option<D>
  readonly error: Option<F>
}

export function useDataAndError<D, F>(state?: FetchedState<D, F>): DataAndError<D, F> {
  const data = useMemo(() => Option.from(state?.data).mapSync(x => x.inner), [state?.data])
  const error = useMemo(() => Option.from(state?.error).mapSync(x => x.inner), [state?.error])

  return { data, error }
}