import { __values } from 'tslib';

/**
 * Map of arrays data structure
 */
var MapOfArrays = /** @class */ (function () {
    function MapOfArrays() {
        this.map = new Map();
    }
    MapOfArrays.prototype.get = function (key) {
        return this.map.get(key);
    };
    MapOfArrays.prototype.push = function (key, value) {
        var values = this.map.get(key);
        if (!values)
            this.map.set(key, [value]);
        else
            values.push(value);
    };
    MapOfArrays.prototype.erase = function (key, value) {
        var values = this.map.get(key);
        if (!values)
            return;
        var values2 = values
            .filter(function (it) { return it !== value; });
        if (values2.length)
            this.map.set(key, values2);
        else
            this.map.delete(key);
    };
    return MapOfArrays;
}());
/**
 * Orthogonal state publisher
 */
var Ortho = /** @class */ (function () {
    function Ortho() {
        this.listeners = new MapOfArrays();
    }
    Ortho.prototype.publish = function (key, value) {
        var e_1, _a;
        var listeners = this.listeners.get(key);
        if (!listeners)
            return;
        try {
            for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                var listener = listeners_1_1.value;
                listener(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Ortho.prototype.on = function (key, listener) {
        this.listeners.push(key, listener);
    };
    Ortho.prototype.off = function (key, listener) {
        this.listeners.erase(key, listener);
    };
    return Ortho;
}());

export { MapOfArrays, Ortho };
//# sourceMappingURL=ortho.mjs.map
