import { State } from "./state.js"

export type OptimisticYield<D = unknown> =
  (previous?: State<D>) => OptimisticDataInit<D>

// export type OptimisticResultInit<D = unknown> =
//   | OptimisticDataInit<D>
//   | OptimisticErrorInit

export interface OptimisticDataInit<D = unknown> {
  data: D
  time?: number
}

// export interface OptimisticErrorInit {
//   error: unknown,
//   time?: number
// }

export type OptimisticParams =
  | OptimisticSet
  | OptimisticUnset

export interface OptimisticSet {
  action: "set",
  uuid: string
}

export interface OptimisticUnset {
  action: "set" | "unset",
  uuid: string
}