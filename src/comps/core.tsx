import { ChildrenProps } from "../libs/react"
import { createContext, useContext, useRef } from "react"
import { Core, Storage, State, Equals } from "../mod"
import React from "react"

export const CoreContext =
	createContext<Core | undefined>(undefined)

export function useCore() {
	return useContext(CoreContext)!
}

export function useCoreProvider(storage?: Storage<State>, equals?: Equals) {
	const core = useRef<Core>()
	if (!core.current)
		core.current = new Core(storage, equals)
	return core.current
}

export interface CoreProviderProps {
	storage?: Storage<State>
	equals?: Equals
}

export function CoreProvider(props: CoreProviderProps & ChildrenProps) {
	const { storage, equals, children } = props

	const core = useCoreProvider(storage, equals)

	return <CoreContext.Provider value={core}>
		{children}
	</CoreContext.Provider>
}