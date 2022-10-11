import { ChildrenProps } from '../../../libs/react.js';
import { Core } from '../../core.js';
import { Params } from '../../types/params.js';
import * as react from 'react';

declare const CoreContext: react.Context<Core | undefined>;
declare function useCore(): Core;
declare function useCoreProvider(params: Params): Core;
declare function CoreProvider(props: ChildrenProps & Params): JSX.Element;

export { CoreContext, CoreProvider, useCore, useCoreProvider };
