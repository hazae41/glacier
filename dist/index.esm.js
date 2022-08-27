import React, { useEffect, createContext, useContext, useRef, useMemo, useState, useCallback } from 'react';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || from);
}

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
/**
 * Orthogonal state listener
 */
function useOrtho(ortho, key, callback) {
    useEffect(function () {
        if (!key)
            return;
        ortho.subscribe(key, callback);
        return function () { return ortho.unsubscribe(key, callback); };
    }, [ortho, key, callback]);
}

function jseq(a, b) {
    return a === b;
}
function jsoneq(a, b) {
    if (a === b)
        return true;
    return JSON.stringify(a) === JSON.stringify(b);
}

var DEFAULT_EQUALS = jsoneq;
var DEFAULT_COOLDOWN = 1 * 1000;
var DEFAULT_EXPIRATION = -1;
var DEFAULT_TIMEOUT = 5 * 1000;

function lastOf(array) {
    if (array.length)
        return array[array.length - 1];
}

function getTimeFromDelay(delay) {
    if (delay === -1)
        return -1;
    return Date.now() + delay;
}

var Scroll = /** @class */ (function () {
    function Scroll(core) {
        this.core = core;
    }
    /**
     * Fetch first page
     * @param skey Storage key
     * @param scroller Key scroller
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    Scroll.prototype.first = function (skey, scroller, fetcher, aborter, tparams, force) {
        var _a;
        if (aborter === void 0) { aborter = new AbortController(); }
        if (tparams === void 0) { tparams = {}; }
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _b, dcooldown, _c, dexpiration, _d, dtimeout, current, pages, first, timeout, signal, _e, data, _f, cooldown, _g, expiration, error_1, cooldown, expiration;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        _b = tparams.cooldown, dcooldown = _b === void 0 ? this.core.cooldown : _b, _c = tparams.expiration, dexpiration = _c === void 0 ? this.core.expiration : _c, _d = tparams.timeout, dtimeout = _d === void 0 ? this.core.timeout : _d;
                        current = this.core.get(skey);
                        if (current === null || current === void 0 ? void 0 : current.aborter)
                            return [2 /*return*/, current];
                        if (this.core.shouldCooldown(current, force))
                            return [2 /*return*/, current];
                        pages = (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [];
                        first = scroller(undefined);
                        if (!first)
                            return [2 /*return*/, current];
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, 4, 5]);
                        signal = aborter.signal;
                        this.core.mutate(skey, { aborter: aborter });
                        return [4 /*yield*/, fetcher(first, { signal: signal })];
                    case 2:
                        _e = _h.sent(), data = _e.data, _f = _e.cooldown, cooldown = _f === void 0 ? getTimeFromDelay(dcooldown) : _f, _g = _e.expiration, expiration = _g === void 0 ? getTimeFromDelay(dexpiration) : _g;
                        return [2 /*return*/, this.core.equals(data, pages[0])
                                ? this.core.mutate(skey, { cooldown: cooldown, expiration: expiration })
                                : this.core.mutate(skey, { data: [data], cooldown: cooldown, expiration: expiration })];
                    case 3:
                        error_1 = _h.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [2 /*return*/, this.core.mutate(skey, { error: error_1, cooldown: cooldown, expiration: expiration })];
                    case 4:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scroll to the next page
     * @param skey Storage key
     * @param scroller Key scroller
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    Scroll.prototype.scroll = function (skey, scroller, fetcher, aborter, tparams, force) {
        var _a;
        if (aborter === void 0) { aborter = new AbortController(); }
        if (tparams === void 0) { tparams = {}; }
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _b, dcooldown, _c, dexpiration, _d, dtimeout, current, pages, last, timeout, signal, _e, data, _f, cooldown, _g, expiration, error_2, cooldown, expiration;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        _b = tparams.cooldown, dcooldown = _b === void 0 ? this.core.cooldown : _b, _c = tparams.expiration, dexpiration = _c === void 0 ? this.core.expiration : _c, _d = tparams.timeout, dtimeout = _d === void 0 ? this.core.timeout : _d;
                        current = this.core.get(skey);
                        if (current === null || current === void 0 ? void 0 : current.aborter)
                            return [2 /*return*/, current];
                        if (this.core.shouldCooldown(current, force))
                            return [2 /*return*/, current];
                        pages = (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [];
                        last = scroller(lastOf(pages));
                        if (!last)
                            return [2 /*return*/, current];
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, 4, 5]);
                        signal = aborter.signal;
                        this.core.mutate(skey, { aborter: aborter });
                        return [4 /*yield*/, fetcher(last, { signal: signal })];
                    case 2:
                        _e = _h.sent(), data = _e.data, _f = _e.cooldown, cooldown = _f === void 0 ? getTimeFromDelay(dcooldown) : _f, _g = _e.expiration, expiration = _g === void 0 ? getTimeFromDelay(dexpiration) : _g;
                        expiration = Math.min(expiration, current.expiration);
                        return [2 /*return*/, this.core.mutate(skey, { data: __spreadArray(__spreadArray([], pages, true), [data], false), cooldown: cooldown, expiration: expiration })];
                    case 3:
                        error_2 = _h.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [2 /*return*/, this.core.mutate(skey, { error: error_2, cooldown: cooldown, expiration: expiration })];
                    case 4:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return Scroll;
}());

var Single = /** @class */ (function () {
    function Single(core) {
        this.core = core;
    }
    /**
     * Fetch
     * @param key Key (passed to fetcher)
     * @param skey Storage key
     * @param fetcher Resource fetcher
     * @param aborter AbortController
     * @param tparams Time parameters
     * @param force Should ignore cooldown
     * @returns The new state
     */
    Single.prototype.fetch = function (key, skey, fetcher, aborter, tparams, force) {
        if (aborter === void 0) { aborter = new AbortController(); }
        if (tparams === void 0) { tparams = {}; }
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, dcooldown, _b, dexpiration, _c, dtimeout, current, timeout, signal, _d, data, _e, cooldown, _f, expiration, error_1, cooldown, expiration;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (key === undefined)
                            return [2 /*return*/];
                        if (skey === undefined)
                            return [2 /*return*/];
                        _a = tparams.cooldown, dcooldown = _a === void 0 ? this.core.cooldown : _a, _b = tparams.expiration, dexpiration = _b === void 0 ? this.core.expiration : _b, _c = tparams.timeout, dtimeout = _c === void 0 ? this.core.timeout : _c;
                        current = this.core.get(skey);
                        if (current === null || current === void 0 ? void 0 : current.aborter)
                            return [2 /*return*/, current];
                        if (this.core.shouldCooldown(current, force))
                            return [2 /*return*/, current];
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 3, 4, 5]);
                        signal = aborter.signal;
                        this.core.mutate(skey, { aborter: aborter });
                        return [4 /*yield*/, fetcher(key, { signal: signal })];
                    case 2:
                        _d = _g.sent(), data = _d.data, _e = _d.cooldown, cooldown = _e === void 0 ? getTimeFromDelay(dcooldown) : _e, _f = _d.expiration, expiration = _f === void 0 ? getTimeFromDelay(dexpiration) : _f;
                        return [2 /*return*/, this.core.mutate(skey, { data: data, cooldown: cooldown, expiration: expiration })];
                    case 3:
                        error_1 = _g.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [2 /*return*/, this.core.mutate(skey, { error: error_1, cooldown: cooldown, expiration: expiration })];
                    case 4:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimistic update
     * @param key Key (:K) (passed to poster)
     * @param skey Storage key
     * @param poster Resource poster
     * @param updater Mutation function
     * @param aborter AbortController
     * @param tparams Time parameters
     * @returns The new state
     * @throws Error
     */
    Single.prototype.update = function (key, skey, poster, updater, aborter, tparams) {
        if (aborter === void 0) { aborter = new AbortController(); }
        if (tparams === void 0) { tparams = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, dcooldown, _b, dexpiration, _c, dtimeout, current, updated, timeout, signal, _d, data, _e, cooldown, _f, expiration, error_2;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (key === undefined)
                            return [2 /*return*/];
                        if (skey === undefined)
                            return [2 /*return*/];
                        _a = tparams.cooldown, dcooldown = _a === void 0 ? this.core.cooldown : _a, _b = tparams.expiration, dexpiration = _b === void 0 ? this.core.expiration : _b, _c = tparams.timeout, dtimeout = _c === void 0 ? this.core.timeout : _c;
                        current = this.core.get(skey);
                        updated = updater(current.data);
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 3, 4, 5]);
                        signal = aborter.signal;
                        this.core.mutate(skey, { data: updated, time: current.time });
                        return [4 /*yield*/, poster(key, { data: updated, signal: signal })];
                    case 2:
                        _d = _g.sent(), data = _d.data, _e = _d.cooldown, cooldown = _e === void 0 ? getTimeFromDelay(dcooldown) : _e, _f = _d.expiration, expiration = _f === void 0 ? getTimeFromDelay(dexpiration) : _f;
                        return [2 /*return*/, this.core.mutate(skey, { data: data, cooldown: cooldown, expiration: expiration })];
                    case 3:
                        error_2 = _g.sent();
                        this.core.mutate(skey, current);
                        throw error_2;
                    case 4:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return Single;
}());

var Core = /** @class */ (function (_super) {
    __extends(Core, _super);
    function Core(params) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        _this = _super.call(this) || this;
        _this.single = new Single(_this);
        _this.scroll = new Scroll(_this);
        _this.counts = new Map();
        _this.timeouts = new Map();
        Object.assign(_this, params);
        (_a = _this.storage) !== null && _a !== void 0 ? _a : (_this.storage = new Map());
        (_b = _this.equals) !== null && _b !== void 0 ? _b : (_this.equals = DEFAULT_EQUALS);
        (_c = _this.cooldown) !== null && _c !== void 0 ? _c : (_this.cooldown = DEFAULT_COOLDOWN);
        (_d = _this.expiration) !== null && _d !== void 0 ? _d : (_this.expiration = DEFAULT_EXPIRATION);
        (_e = _this.timeout) !== null && _e !== void 0 ? _e : (_this.timeout = DEFAULT_TIMEOUT);
        return _this;
    }
    /**
     * Check if key exists from storage
     * @param key Key
     * @returns boolean
     */
    Core.prototype.has = function (key) {
        if (!key)
            return false;
        return this.storage.has(key);
    };
    /**
     * Grab current state from storage
     * @param key Key
     * @returns Current state
     */
    Core.prototype.get = function (key) {
        if (!key)
            return;
        return this.storage.get(key);
    };
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    Core.prototype.set = function (key, state) {
        if (!key)
            return;
        this.storage.set(key, state);
        this.publish(key, state);
    };
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    Core.prototype.delete = function (key) {
        if (!key)
            return;
        this.storage.delete(key);
        this.publish(key, undefined);
    };
    /**
     * Merge a new state with the old state
     * - Will check if the new time is after the old time
     * - Will check if it changed using this.equals
     * @param key
     * @param state
     * @returns
     */
    Core.prototype.mutate = function (key, state) {
        if (!key)
            return;
        var current = this.get(key);
        if (state.time === undefined)
            state.time = Date.now();
        if ((current === null || current === void 0 ? void 0 : current.time) !== undefined && state.time < current.time)
            return current;
        if (this.equals(state.data, current === null || current === void 0 ? void 0 : current.data))
            state.data = current === null || current === void 0 ? void 0 : current.data;
        if (this.equals(state.error, current === null || current === void 0 ? void 0 : current.error))
            state.error = current === null || current === void 0 ? void 0 : current.error;
        var next = __assign(__assign({}, current), state);
        if (state.data !== undefined)
            delete next.error;
        if (state.aborter === undefined)
            delete next.aborter;
        if (state.expiration === -1)
            delete next.expiration;
        if (state.cooldown === -1)
            delete next.cooldown;
        if (this.equals(current, next))
            return current;
        this.set(key, next);
        return next;
    };
    /**
     * True if we should cooldown this resource
     */
    Core.prototype.shouldCooldown = function (current, force) {
        if (force)
            return false;
        if ((current === null || current === void 0 ? void 0 : current.cooldown) === undefined)
            return false;
        if (Date.now() < current.cooldown)
            return true;
        return false;
    };
    Core.prototype.subscribe = function (key, listener) {
        var _a;
        if (!key)
            return;
        _super.prototype.subscribe.call(this, key, listener);
        var count = (_a = this.counts.get(key)) !== null && _a !== void 0 ? _a : 0;
        this.counts.set(key, count + 1);
        var timeout = this.timeouts.get(key);
        if (timeout === undefined)
            return;
        clearTimeout(timeout);
        this.timeouts.delete(key);
    };
    Core.prototype.unsubscribe = function (key, listener) {
        var _this = this;
        var _a;
        if (!key)
            return;
        _super.prototype.unsubscribe.call(this, key, listener);
        var count = this.counts.get(key);
        if (count > 1) {
            this.counts.set(key, count - 1);
            return;
        }
        this.counts.delete(key);
        var expiration = ((_a = this.get(key)) !== null && _a !== void 0 ? _a : {}).expiration;
        if (expiration === undefined)
            return;
        var erase = function () {
            _this.timeouts.delete(key);
            _this.delete(key);
        };
        if (Date.now() > expiration) {
            erase();
            return;
        }
        var delay = expiration - Date.now();
        var timeout = setTimeout(erase, delay);
        this.timeouts.set(key, timeout);
    };
    return Core;
}(Ortho));

var CoreContext = createContext(undefined);
function useCore() {
    return useContext(CoreContext);
}
function useCoreProvider(params) {
    var core = useRef();
    if (!core.current)
        core.current = new Core(params);
    return core.current;
}
function CoreProvider(props) {
    var children = props.children, params = __rest(props, ["children"]);
    var core = useCoreProvider(params);
    return React.createElement(CoreContext.Provider, { value: core }, children);
}

function isAbortError(e) {
    return e instanceof DOMException && e.name === "AbortError";
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (memoized)
 * @param tparams Time parameters (constant)
 * @returns Scrolling handle
 */
function useScroll(scroller, fetcher, tparams) {
    var _this = this;
    if (tparams === void 0) { tparams = {}; }
    var core = useCore();
    var key = useMemo(function () {
        return scroller();
    }, [scroller]);
    var skey = useMemo(function () {
        if (key === undefined)
            return;
        return "scroll:" + JSON.stringify(key);
    }, [key]);
    var _a = useState(function () { return core.get(skey); }), state = _a[0], setState = _a[1];
    useEffect(function () {
        setState(core.get(skey));
    }, [core, skey]);
    useOrtho(core, skey, setState);
    var mutate = useCallback(function (res) {
        return core.mutate(skey, res);
    }, [core, skey]);
    var fetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var refetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var scroll = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.scroll(skey, scroller, fetcher, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var clear = useCallback(function () {
        core.delete(skey);
    }, [core, skey]);
    var loading = Boolean(state === null || state === void 0 ? void 0 : state.aborter);
    return __assign(__assign({ key: key, skey: skey }, state), { loading: loading, mutate: mutate, fetch: fetch, refetch: refetch, scroll: scroll, clear: clear });
}

/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param poster Resource poster or fetcher (memoized)
 * @param tparams Time parameters (constant)
 * @returns Single handle
 */
function useSingle(key, poster, tparams) {
    var _this = this;
    if (tparams === void 0) { tparams = {}; }
    var core = useCore();
    var skey = useMemo(function () {
        if (key === undefined)
            return;
        return JSON.stringify(key);
    }, [key]);
    var _a = useState(function () { return core.get(skey); }), state = _a[0], setState = _a[1];
    useEffect(function () {
        setState(core.get(skey));
    }, [core, skey]);
    useOrtho(core, skey, setState);
    var mutate = useCallback(function (res) {
        return core.mutate(skey, res);
    }, [core, skey]);
    var fetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.fetch(key, skey, poster, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var refetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.fetch(key, skey, poster, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var update = useCallback(function (updater, aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.update(key, skey, poster, updater, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var clear = useCallback(function () {
        core.delete(skey);
    }, [core, skey]);
    var loading = Boolean(state === null || state === void 0 ? void 0 : state.aborter);
    return __assign(__assign({ key: key, skey: skey }, state), { loading: loading, mutate: mutate, fetch: fetch, refetch: refetch, update: update, clear: clear });
}

/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var time = handle.time;
    useEffect(function () {
        console.debug(label, handle);
    }, [time]);
}

/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var error = handle.error;
    useEffect(function () {
        if (error !== undefined)
            callback(error);
    }, [error, callback]);
}

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param handle
 * @param state
 */
function useFallback(handle, state) {
    var data = handle.data, error = handle.error;
    if (data !== undefined)
        return;
    if (error !== undefined)
        return;
    Object.assign(handle, state);
}

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useFetch(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        fetch();
    }, [fetch]);
}

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
function useInterval(handle, interval) {
    var fetch = handle.fetch;
    useEffect(function () {
        if (!interval)
            return;
        var i = setInterval(fetch, interval);
        return function () { return clearInterval(i); };
    }, [fetch, interval]);
}

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useMount(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        fetch();
    }, []);
}

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(handle) {
    var data = handle.data, fetch = handle.fetch;
    useEffect(function () {
        if (data === undefined)
            fetch();
    }, [data, fetch]);
}

/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        var f = function () { return fetch(); };
        addEventListener("online", f);
        return function () { return removeEventListener("online", f); };
    }, [fetch]);
}

/**
 * Retry request on error using exponential backoff
 * @see useInterval for interval based requests
 * @param handle
 * @param options
 * @param options.init Initial timeout to be multiplied (in milliseconds)
 * @param options.base Exponent base (2 means the next timeout will be 2 times longer)
 * @param options.max Maximum count (3 means do not retry after 3 retries)
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 * @see https://en.wikipedia.org/wiki/Geometric_progression
 */
function useRetry(handle, options) {
    if (options === void 0) { options = {}; }
    var refetch = handle.refetch, error = handle.error, time = handle.time;
    var _a = options.init, init = _a === void 0 ? 1000 : _a, _b = options.base, base = _b === void 0 ? 2 : _b, _c = options.max, max = _c === void 0 ? 3 : _c;
    var count = useRef(0);
    useEffect(function () {
        count.current = 0;
    }, [refetch]);
    useEffect(function () {
        if (error === undefined) {
            count.current = 0;
            return;
        }
        if (count.current >= max)
            return;
        var ratio = Math.pow(base, count.current);
        var f = function () { count.current++; refetch(); };
        var t = setTimeout(f, init * ratio);
        return function () { return clearTimeout(t); };
    }, [error, time, refetch]);
}

/**
 * Do a request when the tab is visible
 * @param handle
 */
function useVisible(handle) {
    var fetch = handle.fetch;
    useEffect(function () {
        var f = function () { return !document.hidden && fetch(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [fetch]);
}

var mod = {
    __proto__: null,
    CoreContext: CoreContext,
    useCore: useCore,
    useCoreProvider: useCoreProvider,
    CoreProvider: CoreProvider,
    Core: Core,
    jseq: jseq,
    jsoneq: jsoneq,
    isAbortError: isAbortError,
    useScroll: useScroll,
    useSingle: useSingle,
    useDebug: useDebug,
    useError: useError,
    useFallback: useFallback,
    useFetch: useFetch,
    useInterval: useInterval,
    useMount: useMount,
    useOnce: useOnce,
    useOnline: useOnline,
    useRetry: useRetry,
    useVisible: useVisible,
    Scroll: Scroll,
    Single: Single,
    getTimeFromDelay: getTimeFromDelay
};

export { mod as XSWR };
