import React, { createContext, useContext, useEffect, useRef } from "react"
import { ChildrenProps } from "../libs/react.js"
import { Core, CoreParams } from "../mods/core.js"

export const CoreContext =
  createContext<Core | undefined>(undefined)

export function useCore() {
  return useContext(CoreContext)!
}

export function useCoreProvider(params?: CoreParams) {
  const core = useRef<Core>()

  if (!core.current)
    core.current = new Core(params)

  useEffect(() => () => {
    core.current.unmount()
  }, [])

  return core.current
}

export function CoreProvider(props: ChildrenProps & CoreParams) {
  const { children, ...params } = props

  const core = useCoreProvider(params)

  return <CoreContext.Provider value={core}>
    {children}
  </CoreContext.Provider>
}