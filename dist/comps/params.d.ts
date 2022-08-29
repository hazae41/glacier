import React from "react";
import { ChildrenProps } from "../libs/react.js";
import { Params } from "../mods/core.js";
export declare const ParamsContext: React.Context<Params<any, any, any>>;
export declare function useParams(): Params<any, any, any>;
export declare function useParamsProvider(current: Params): Params<any, any, any>;
export declare function ParamsProvider(props: ChildrenProps & Params): JSX.Element;
