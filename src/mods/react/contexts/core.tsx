import { Panic } from "@hazae41/result"
import { ChildrenProps } from "libs/react/props/children.js"
import { Core } from "mods/core/core.js"
import { GlobalParams } from "mods/types/params.js"
import * as React from "react"
import { createContext, useContext, useEffect, useRef } from "react"

export const CoreContext =
  createContext<Core | undefined>(undefined)

export function useCore() {
  const core = useContext(CoreContext)

  if (core === undefined)
    throw new Panic(`Core is undefined`)

  return core
}

export function useCoreProvider(params: GlobalParams) {
  const coreRef = useRef<Core>()

  if (coreRef.current === undefined)
    coreRef.current = new Core(params)

  useEffect(() => {
    coreRef.current?.mount()
    return () => coreRef.current?.unmount()
  }, [])

  return coreRef.current
}

export function CoreProvider(props: ChildrenProps & GlobalParams) {
  const { children, ...params } = props

  const core = useCoreProvider(params)

  return <CoreContext.Provider value={core}>
    {children}
  </CoreContext.Provider>
}