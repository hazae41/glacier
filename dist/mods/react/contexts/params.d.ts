import { ChildrenProps } from "libs/react";
import { Params } from "mods/core";
import React from "react";
export declare const ParamsContext: React.Context<Params<any, any, any>>;
export declare function useParams(): Params<any, any, any>;
export declare function useParamsProvider(current: Params): Params<any, any, any>;
export declare function ParamsProvider(props: ChildrenProps & Params): JSX.Element;
