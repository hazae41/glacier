"use strict";
exports.__esModule = true;
exports.useOrtho = exports.Ortho = exports.MapOfArrays = void 0;
var react_1 = require("react");
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
            this.map["delete"](key);
    };
    return MapOfArrays;
}());
exports.MapOfArrays = MapOfArrays;
/**
 * Orthogonal state publisher
 */
var Ortho = /** @class */ (function () {
    function Ortho() {
        this.listeners = new MapOfArrays();
    }
    Ortho.prototype.publish = function (key, value) {
        var listeners = this.listeners.get(key);
        if (!listeners)
            return;
        for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
            var listener = listeners_1[_i];
            listener(value);
        }
    };
    Ortho.prototype.subscribe = function (key, listener) {
        this.listeners.push(key, listener);
    };
    Ortho.prototype.unsubscribe = function (key, listener) {
        this.listeners.erase(key, listener);
    };
    return Ortho;
}());
exports.Ortho = Ortho;
/**
 * Orthogonal state listener
 */
function useOrtho(ortho, key, callback) {
    (0, react_1.useEffect)(function () {
        if (!key)
            return;
        ortho.subscribe(key, callback);
        return function () { return ortho.unsubscribe(key, callback); };
    }, [ortho, key, callback]);
}
exports.useOrtho = useOrtho;
