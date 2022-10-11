import { Core } from '../../core.js';
import { Object as Object$1 } from '../../types/object.js';
import { Schema } from '../../types/schema.js';

declare type Maker = <D = any, E = any, K = any, O extends Object$1<D, E, K> = Object$1<D, E, K>>(schema: Schema<D, E, K, O>) => O;
declare function useXSWR(): {
    core: Core;
    make: Maker;
};

export { Maker, useXSWR };
