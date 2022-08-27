import React from "react";
import { ChildrenProps } from "../libs/react.js";
import { Core, CoreParams } from "../mods/core.js";
export declare const CoreContext: React.Context<Core>;
export declare function useCore(): Core;
export declare function useCoreProvider(params?: CoreParams): Core;
export declare function CoreProvider(props: ChildrenProps & CoreParams): JSX.Element;
