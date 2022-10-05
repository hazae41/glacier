import { ChildrenProps } from "../../../libs/react";
import { Core } from "../../core";
import { Params } from "../../types/params";
import * as React from "react";
export declare const CoreContext: React.Context<Core | undefined>;
export declare function useCore(): Core;
export declare function useCoreProvider(params: Params): Core;
export declare function CoreProvider(props: ChildrenProps & Params): JSX.Element;
