import { useContext } from "react"
import { CoreContext } from "./mod"

export * as XSWR from "./mod"

export function useXSWR() {
  return useContext(CoreContext)!
}