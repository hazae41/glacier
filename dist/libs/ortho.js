"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOrtho = exports.Ortho = exports.MapOfArrays = void 0;
const react_1 = require("react");
/**
 * Map of arrays data structure
 */
class MapOfArrays {
    map = new Map();
    get(key) {
        return this.map.get(key);
    }
    push(key, value) {
        const values = this.map.get(key);
        if (!values)
            this.map.set(key, [value]);
        else
            values.push(value);
    }
    erase(key, value) {
        const values = this.map.get(key);
        if (!values)
            return;
        const values2 = values
            .filter(it => it !== value);
        if (values2.length)
            this.map.set(key, values2);
        else
            this.map.delete(key);
    }
}
exports.MapOfArrays = MapOfArrays;
/**
 * Orthogonal state publisher
 */
class Ortho {
    listeners = new MapOfArrays();
    publish(key, value) {
        const listeners = this.listeners.get(key);
        if (!listeners)
            return;
        for (const listener of listeners)
            listener(value);
    }
    subscribe(key, listener) {
        this.listeners.push(key, listener);
    }
    unsubscribe(key, listener) {
        this.listeners.erase(key, listener);
    }
}
exports.Ortho = Ortho;
/**
 * Orthogonal state listener
 */
function useOrtho(ortho, key, callback) {
    (0, react_1.useEffect)(() => {
        if (!key)
            return;
        ortho.subscribe(key, callback);
        return () => ortho.unsubscribe(key, callback);
    }, [ortho, key, callback]);
}
exports.useOrtho = useOrtho;
