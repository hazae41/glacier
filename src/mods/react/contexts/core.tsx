import { Option, Optional } from "@hazae41/option"
import { ChildrenProps } from "libs/react/props/children.js"
import { Core } from "mods/core/core.js"
import { GlobalSettings } from "mods/types/settings.js"
import * as React from "react"
import { createContext, useContext, useEffect, useRef } from "react"

export const CoreContext =
  createContext<Optional<Core>>(undefined)

export function useCore() {
  return Option.from(useContext(CoreContext))
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