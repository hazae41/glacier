/// <reference types="node" />
import { Ortho } from "../libs/ortho";
import { ScrollHelper } from "./scroll";
import { SingleHelper } from "./single";
import { Mutator } from "./types/mutator";
import { Params } from "./types/params";
import { State } from "./types/state";
export declare type Listener<D extends N = any, E = any, N = D, K = any> = (x?: State<D, E, N, K>) => void;
export declare class Core extends Ortho<string, State | undefined> {
    readonly single: SingleHelper;
    readonly scroll: ScrollHelper;
    readonly cache: Map<string, State<any, any, any, any>>;
    private _mounted;
    constructor();
    get mounted(): boolean;
    unmount(): void;
    getSync<D extends N = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): State<D, E, N, K> | undefined | null;
    get<D extends N = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>, ignore?: boolean): Promise<State<D, E, N, K> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    set<D extends N = any, E = any, N = D, K = any>(skey: string | undefined, state: State<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    delete<D extends N = any, E = any, N = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): Promise<void>;
    mutate<D extends N = any, E = any, N = D, K = any>(skey: string | undefined, current: State<D, E, N, K> | undefined, mutator: Mutator<D, E, N, K>, params?: Params<D, E, N, K>): Promise<State<D, E, N, K> | undefined>;
    normalize<T = any, R = any>(transformed: T, state: State): Promise<T | R>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D extends N = any, E = any, N = D, K = any>(current?: State<D, E, N, K>): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    once<D extends N = any, E = any, N = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): void;
    on<D extends N = any, E = any, N = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): void;
    off<D extends N = any, E = any, N = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
}
