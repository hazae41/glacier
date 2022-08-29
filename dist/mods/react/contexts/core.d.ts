import { ChildrenProps } from "libs/react";
import { Core, Params } from "mods/core";
import React from "react";
export declare const CoreContext: React.Context<Core>;
export declare function useCore(): Core;
export declare function useCoreProvider(): Core;
export declare function CoreProvider(props: ChildrenProps & Params): JSX.Element;
