/**
 * Map of arrays data structure
 */
export declare class MapOfArrays<K = any, V = any> {
    private map;
    get(key: K): V[];
    push(key: K, value: V): void;
    erase(key: K, value: V): void;
}
/**
 * Orthogonal state publisher
 */
export declare class Ortho<K = any, S = any> {
    private listeners;
    publish(key: K, value: S): void;
    subscribe(key: K, listener: (x: S) => void): void;
    unsubscribe(key: K, listener: (x: S) => void): void;
}
/**
 * Orthogonal state listener
 */
export declare function useOrtho<K, S>(ortho: Ortho<K, S>, key: K | undefined, callback: (s: S) => void): void;
