import { Panic } from "@hazae41/result"
import { ChildrenProps } from "libs/react/props/children.js"
import { Core } from "mods/core/core.js"
import { GlobalSettings } from "mods/types/settings.js"
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

export function useCoreProvider(settings: GlobalSettings) {
  const coreRef = useRef<Core>()

  if (coreRef.current === undefined)
    coreRef.current = new Core(settings)

  useEffect(() => {
    coreRef.current?.mount()
    return () => coreRef.current?.unmount()
  }, [])

  return coreRef.current
}

export function CoreProvider(props: ChildrenProps & GlobalSettings) {
  const { children, ...settings } = props

  const core = useCoreProvider(settings)

  return <CoreContext.Provider value={core}>
    {children}
  </CoreContext.Provider>
}