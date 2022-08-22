import { ChildrenProps } from "../libs/react";
import { Core, Storage, State, Equals } from "../mod";
import React from "react";
export declare const CoreContext: React.Context<Core>;
export declare function useCore(): Core;
export declare function useCoreProvider(storage?: Storage<State>, equals?: Equals): Core;
export interface CoreProviderProps {
    storage?: Storage<State>;
    equals?: Equals;
}
export declare function CoreProvider(props: CoreProviderProps & ChildrenProps): JSX.Element;
