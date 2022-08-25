import React from "react";
import { ChildrenProps } from "../libs/react";
import { Core, Equals, State, Storage } from "../mod";
export declare const CoreContext: React.Context<Core>;
export declare function useCore(): Core;
export declare function useCoreProvider(storage?: Storage<State>, equals?: Equals): Core;
export interface CoreProviderProps {
    storage?: Storage<State>;
    equals?: Equals;
}
export declare function CoreProvider(props: CoreProviderProps & ChildrenProps): JSX.Element;
