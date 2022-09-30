/// <reference types="node" />
import { Ortho } from "../libs/ortho";
import { ScrollHelper } from "./scroll";
import { SingleHelper } from "./single";
import { Mutator } from "./types/mutator";
import { Params } from "./types/params";
import { State } from "./types/state";
import { Lock } from "./utils/lock";
export declare type Listener<D = any, E = any, K = any> = (x?: State<D, E, K>) => void;
export declare class Core extends Ortho<string, State | undefined> {
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
