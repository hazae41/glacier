/// <reference types="node" />
import { Ortho } from "../libs/ortho";
import { ScrollHelper } from "./scroll";
import { SingleHelper } from "./single";
import { Mutator } from "./types/mutator";
import { Params } from "./types/params";
import { State } from "./types/state";
export declare type Listener<D = any, E = any, N extends D = D, K = any> = (x?: State<D, E, N, K>) => void;
export declare class Core extends Ortho<string, State | undefined> {
    readonly params: Params;
    readonly single: SingleHelper;
    readonly scroll: ScrollHelper;
    readonly cache: Map<string, State<any, any, any, any>>;
    private _mounted;
    constructor(params: Params);
    get mounted(): boolean;
    unmount(): void;
    getSync<D = any, E = any, N extends D = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): State<D, E, N, K> | undefined | null;
    get<D = any, E = any, N extends D = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>, ignore?: boolean): Promise<State<D, E, N, K> | undefined>;
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    set<D = any, E = any, N extends D = D, K = any>(skey: string | undefined, state: State<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    delete<D = any, E = any, N extends D = D, K = any>(skey: string | undefined, params?: Params<D, E, N, K>): Promise<void>;
    mutate<D = any, E = any, N extends D = D, K = any>(skey: string | undefined, current: State<D, E, N, K> | undefined, mutator: Mutator<D, E, N, K>, params?: Params<D, E, N, K>): Promise<State<D, E, N, K> | undefined>;
    normalize<D = any, E = any, N extends D = D, K = any>(shallow: boolean, root: State<D, E, N, K>, params?: Params<D, E, N, K>): Promise<D | undefined>;
    /**
     * True if we should cooldown this resource
     */
    shouldCooldown<D = any, E = any, N extends D = D, K = any>(current?: State<D, E, N, K>): boolean;
    counts: Map<string, number>;
    timeouts: Map<string, NodeJS.Timeout>;
    once<D = any, E = any, N extends D = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): void;
    on<D = any, E = any, N extends D = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): void;
    off<D = any, E = any, N extends D = D, K = any>(key: string | undefined, listener: Listener<D, E, N, K>, params?: Params<D, E, N, K>): Promise<void>;
}
