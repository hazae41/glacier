import { ChildrenProps } from "../../../libs/react.js";
import { Core } from "../../core.js";
import { Params } from "../../types/params.js";
import React from "react";
export declare const CoreContext: React.Context<Core | undefined>;
export declare function useCore(): Core;
export declare function useCoreProvider(params: Params): Core;
export declare function CoreProvider(props: ChildrenProps & Params): JSX.Element;
