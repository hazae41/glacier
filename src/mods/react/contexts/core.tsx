import { ChildrenProps } from "libs/react"
import { Core } from "mods/core"
import { Params } from "mods/types/params"
import React, { createContext, useContext, useEffect, useRef } from "react"

export const CoreContext =
  createContext<Core | undefined>(undefined)

export function useCore() {
  const core = useContext(CoreContext)
  if (core === undefined)
    throw new Error("Undefined core")
  return core
}

export function useCoreProvider(params: Params) {
  const coreRef = useRef<Core>()

  if (coreRef.current === undefined)
    coreRef.current = new Core(params)

  useEffect(() => () => {
    coreRef.current?.unmount()
  }, [])

  return coreRef.current
}

export function CoreProvider(props: ChildrenProps & Params) {
  const { children, ...params } = props

  const core = useCoreProvider(params)

  return <CoreContext.Provider value={core}>
    {children}
  </CoreContext.Provider>
}