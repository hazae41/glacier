import React from "react";
import { ChildrenProps } from "../libs/react.js";
import { Core } from "../mods/core.js";
import { Equals } from "../mods/equals.js";
import { State, Storage } from "../mods/storage.js";
export declare const CoreContext: React.Context<Core>;
export declare function useCore(): Core;
export declare function useCoreProvider(storage?: Storage<State>, equals?: Equals): Core;
export interface CoreProviderProps {
    storage?: Storage<State>;
    equals?: Equals;
}
export declare function CoreProvider(props: CoreProviderProps & ChildrenProps): JSX.Element;
