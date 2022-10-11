/**
 * Orthogonal state publisher
 */
declare class Ortho<K = any, S = any> {
    private listeners;
    publish(key: K, value: S): void;
    on(key: K, listener: (x: S) => void): void;
    off(key: K, listener: (x: S) => void): void;
}

export { Ortho };
