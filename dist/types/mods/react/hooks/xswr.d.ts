import { Core } from '../../core.js';
import { Instance } from '../../types/instance.js';
import { Schema } from '../../types/schema.js';

declare type Maker = <D = any, E = any, K = any, O extends Instance<D, E, K> = Instance<D, E, K>>(schema: Schema<D, E, K, O>) => O;
declare function useXSWR(): {
    core: Core;
    make: Maker;
};

export { Maker, useXSWR };
