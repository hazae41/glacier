import { Ortho } from '../libs/ortho.js';
import { ScrollHelper } from './scroll/helper.js';
import { SingleHelper } from './single/helper.js';
import { Mutator } from './types/mutator.js';
import { Params } from './types/params.js';
import { State } from './types/state.js';
import { Lock } from './utils/lock.js';

declare type Listener<D = any, E = any, K = any> = (x?: State<D, E, K>) => void;
declare class Core extends Ortho<string, State | undefined> {
    readonly params: Params;
    readonly single: SingleHelper;
    readonly scroll: ScrollHelper;
    readonly cache: Map<string, State<any, any, any>>;
    readonly locks: Map<string, Lock>;
    private _mounted;
    constructor(params: Params);
    get mounted(): boolean;
    unmount(): void;
    lock<T>(skey: string, callback: () => Promise<T>): Promise<T>;
    getSync<D = any, E = any, K = any>(skey: string | undefined, params?: Params<D, E, K>): State<D, E, K> | undefined | null;
    get<D = any, E = any, K = any>(skey: string | undefined, params?: Params<D, E, K>, ignore?: boolean): Promise<State<D, E, K> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any, K = any>(skey: string | undefined, state: State<D, E, K>, params?: Params<D, E, K>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    delete<D = any, E = any, K = any>(skey: string | undefined, params?: Params<D, E, K>): Promise<void>;
    mutate<D = any, E = any, K = any>(skey: string | undefined, current: State<D, E, K> | undefined, mutator: Mutator<D, E, K>, params?: Params<D, E, K>): Promise<State<D, E, K> | undefined>;
    normalize<D = any, E = any, K = any>(shallow: boolean, root: State<D, E, K>, params?: Params<D, E, K>): Promise<D | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any, K = any>(current?: State<D, E, K>): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    once<D = any, E = any, K = any>(key: string | undefined, listener: Listener<D, E, K>, params?: Params<D, E, K>): void;
    on<D = any, E = any, K = any>(key: string | undefined, listener: Listener<D, E, K>, params?: Params<D, E, K>): void;
    off<D = any, E = any, K = any>(key: string | undefined, listener: Listener<D, E, K>, params?: Params<D, E, K>): Promise<void>;
}

export { Core, Listener };
