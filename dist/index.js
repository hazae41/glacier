Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

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

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
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
    React.useEffect(function () {
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
            var _b, dcooldown, _c, dexpiration, _d, dtimeout, current, pages, first, timeout, signal, _e, data, _f, cooldown, _g, expiration, _h, error_1, cooldown, expiration;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        _b = tparams.cooldown, dcooldown = _b === void 0 ? this.core.cooldown : _b, _c = tparams.expiration, dexpiration = _c === void 0 ? this.core.expiration : _c, _d = tparams.timeout, dtimeout = _d === void 0 ? this.core.timeout : _d;
                        return [4 /*yield*/, this.core.get(skey)];
                    case 1:
                        current = _j.sent();
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
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 9, 11, 12]);
                        signal = aborter.signal;
                        return [4 /*yield*/, this.core.apply(skey, current, { aborter: aborter })];
                    case 3:
                        current = _j.sent();
                        return [4 /*yield*/, fetcher(first, { signal: signal })];
                    case 4:
                        _e = _j.sent(), data = _e.data, _f = _e.cooldown, cooldown = _f === void 0 ? getTimeFromDelay(dcooldown) : _f, _g = _e.expiration, expiration = _g === void 0 ? getTimeFromDelay(dexpiration) : _g;
                        if (!this.core.equals(data, pages[0])) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.core.apply(skey, current, { cooldown: cooldown, expiration: expiration })];
                    case 5:
                        _h = _j.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.core.apply(skey, current, { data: [data], cooldown: cooldown, expiration: expiration })];
                    case 7:
                        _h = _j.sent();
                        _j.label = 8;
                    case 8: return [2 /*return*/, _h];
                    case 9:
                        error_1 = _j.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [4 /*yield*/, this.core.apply(skey, current, { error: error_1, cooldown: cooldown, expiration: expiration })];
                    case 10: return [2 /*return*/, _j.sent()];
                    case 11:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
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
                        return [4 /*yield*/, this.core.get(skey)];
                    case 1:
                        current = _h.sent();
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
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 6, 8, 9]);
                        signal = aborter.signal;
                        return [4 /*yield*/, this.core.apply(skey, current, { aborter: aborter })];
                    case 3:
                        current = _h.sent();
                        return [4 /*yield*/, fetcher(last, { signal: signal })];
                    case 4:
                        _e = _h.sent(), data = _e.data, _f = _e.cooldown, cooldown = _f === void 0 ? getTimeFromDelay(dcooldown) : _f, _g = _e.expiration, expiration = _g === void 0 ? getTimeFromDelay(dexpiration) : _g;
                        expiration = Math.min(expiration, current.expiration);
                        return [4 /*yield*/, this.core.apply(skey, current, { data: __spreadArray(__spreadArray([], __read(pages), false), [data], false), cooldown: cooldown, expiration: expiration })];
                    case 5: return [2 /*return*/, _h.sent()];
                    case 6:
                        error_2 = _h.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [4 /*yield*/, this.core.apply(skey, current, { error: error_2, cooldown: cooldown, expiration: expiration })];
                    case 7: return [2 /*return*/, _h.sent()];
                    case 8:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
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
                        return [4 /*yield*/, this.core.get(skey)];
                    case 1:
                        current = _g.sent();
                        if (current === null || current === void 0 ? void 0 : current.aborter)
                            return [2 /*return*/, current];
                        if (this.core.shouldCooldown(current, force))
                            return [2 /*return*/, current];
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 6, 8, 9]);
                        signal = aborter.signal;
                        return [4 /*yield*/, this.core.apply(skey, current, { aborter: aborter })];
                    case 3:
                        current = _g.sent();
                        return [4 /*yield*/, fetcher(key, { signal: signal })];
                    case 4:
                        _d = _g.sent(), data = _d.data, _e = _d.cooldown, cooldown = _e === void 0 ? getTimeFromDelay(dcooldown) : _e, _f = _d.expiration, expiration = _f === void 0 ? getTimeFromDelay(dexpiration) : _f;
                        return [4 /*yield*/, this.core.apply(skey, current, { data: data, cooldown: cooldown, expiration: expiration })];
                    case 5: return [2 /*return*/, _g.sent()];
                    case 6:
                        error_1 = _g.sent();
                        cooldown = getTimeFromDelay(dcooldown);
                        expiration = getTimeFromDelay(dexpiration);
                        return [4 /*yield*/, this.core.apply(skey, current, { error: error_1, cooldown: cooldown, expiration: expiration })];
                    case 7: return [2 /*return*/, _g.sent()];
                    case 8:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
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
                        return [4 /*yield*/, this.core.get(skey)];
                    case 1:
                        current = _g.sent();
                        updated = updater(current === null || current === void 0 ? void 0 : current.data);
                        timeout = setTimeout(function () {
                            aborter.abort("Timed out");
                        }, dtimeout);
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 6, 7, 8]);
                        signal = aborter.signal;
                        return [4 /*yield*/, this.core.mutate(skey, { data: updated, time: current === null || current === void 0 ? void 0 : current.time })];
                    case 3:
                        _g.sent();
                        return [4 /*yield*/, poster(key, { data: updated, signal: signal })];
                    case 4:
                        _d = _g.sent(), data = _d.data, _e = _d.cooldown, cooldown = _e === void 0 ? getTimeFromDelay(dcooldown) : _e, _f = _d.expiration, expiration = _f === void 0 ? getTimeFromDelay(dexpiration) : _f;
                        return [4 /*yield*/, this.core.mutate(skey, { data: data, cooldown: cooldown, expiration: expiration })];
                    case 5: return [2 /*return*/, _g.sent()];
                    case 6:
                        error_2 = _g.sent();
                        this.core.mutate(skey, current);
                        throw error_2;
                    case 7:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return Single;
}());

function isAsyncStorage(storage) {
    return storage.async;
}

var Core = /** @class */ (function (_super) {
    __extends(Core, _super);
    function Core(params) {
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this) || this;
        _this.single = new Single(_this);
        _this.scroll = new Scroll(_this);
        _this.cache = new Map();
        _this.mounted = true;
        _this.counts = new Map();
        _this.timeouts = new Map();
        Object.assign(_this, params);
        (_a = _this.equals) !== null && _a !== void 0 ? _a : (_this.equals = DEFAULT_EQUALS);
        (_b = _this.cooldown) !== null && _b !== void 0 ? _b : (_this.cooldown = DEFAULT_COOLDOWN);
        (_c = _this.expiration) !== null && _c !== void 0 ? _c : (_this.expiration = DEFAULT_EXPIRATION);
        (_d = _this.timeout) !== null && _d !== void 0 ? _d : (_this.timeout = DEFAULT_TIMEOUT);
        return _this;
    }
    Object.defineProperty(Core.prototype, "async", {
        get: function () {
            if (!this.storage)
                return false;
            return isAsyncStorage(this.storage);
        },
        enumerable: false,
        configurable: true
    });
    Core.prototype.hasSync = function (key) {
        if (!key)
            return;
        if (this.cache.has(key))
            return true;
        if (!this.storage)
            return false;
        if (isAsyncStorage(this.storage))
            return false;
        return this.storage.has(key);
    };
    Core.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/, false];
                        if (this.cache.has(key))
                            return [2 /*return*/, true];
                        if (!this.storage)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.storage.has(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Core.prototype.getSync = function (key) {
        if (!key)
            return;
        if (this.cache.has(key))
            return this.cache.get(key);
        if (!this.storage)
            return;
        if (isAsyncStorage(this.storage))
            return;
        var state = this.storage.get(key);
        this.cache.set(key, state);
        return state;
    };
    Core.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        if (this.cache.has(key))
                            return [2 /*return*/, this.cache.get(key)];
                        if (!this.storage)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.storage.get(key)];
                    case 1:
                        state = _a.sent();
                        this.cache.set(key, state);
                        return [2 /*return*/, state];
                }
            });
        });
    };
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    Core.prototype.set = function (key, state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        this.cache.set(key, state);
                        this.publish(key, state);
                        if (!this.storage)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.storage.set(key, state)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    Core.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        this.cache.delete(key);
                        this.publish(key, undefined);
                        if (!this.storage)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.storage.delete(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Core.prototype.apply = function (key, current, state) {
        return __awaiter(this, void 0, void 0, function () {
            var next;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        if (!!state) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.delete(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (state.time === undefined)
                            state.time = Date.now();
                        if ((current === null || current === void 0 ? void 0 : current.time) !== undefined && state.time < current.time)
                            return [2 /*return*/, current];
                        if (this.equals(state.data, current === null || current === void 0 ? void 0 : current.data))
                            state.data = current === null || current === void 0 ? void 0 : current.data;
                        if (this.equals(state.error, current === null || current === void 0 ? void 0 : current.error))
                            state.error = current === null || current === void 0 ? void 0 : current.error;
                        next = __assign(__assign({}, current), state);
                        if (state.data !== undefined)
                            delete next.error;
                        if (state.aborter === undefined)
                            delete next.aborter;
                        if (state.expiration === -1)
                            delete next.expiration;
                        if (state.cooldown === -1)
                            delete next.cooldown;
                        if (this.equals(current, next))
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.set(key, next)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, next];
                }
            });
        });
    };
    Core.prototype.mutate = function (key, state) {
        return __awaiter(this, void 0, void 0, function () {
            var current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        current = _a.sent();
                        return [4 /*yield*/, this.apply(key, current, state)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
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
        return __awaiter(this, void 0, void 0, function () {
            var count, current, erase, delay, timeout;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        _super.prototype.unsubscribe.call(this, key, listener);
                        count = this.counts.get(key);
                        if (count > 1) {
                            this.counts.set(key, count - 1);
                            return [2 /*return*/];
                        }
                        this.counts.delete(key);
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        current = _a.sent();
                        if ((current === null || current === void 0 ? void 0 : current.expiration) === undefined)
                            return [2 /*return*/];
                        if ((current === null || current === void 0 ? void 0 : current.expiration) === -1)
                            return [2 /*return*/];
                        erase = function () { return __awaiter(_this, void 0, void 0, function () {
                            var count;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this.mounted)
                                            return [2 /*return*/];
                                        count = this.counts.get(key);
                                        if (count !== undefined)
                                            return [2 /*return*/];
                                        this.timeouts.delete(key);
                                        return [4 /*yield*/, this.delete(key)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        if (!(Date.now() > current.expiration)) return [3 /*break*/, 3];
                        return [4 /*yield*/, erase()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        delay = current.expiration - Date.now();
                        timeout = setTimeout(erase, delay);
                        this.timeouts.set(key, timeout);
                        return [2 /*return*/];
                }
            });
        });
    };
    Core.prototype.unmount = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.timeouts.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var timeout = _c.value;
                clearTimeout(timeout);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.mounted = false;
    };
    return Core;
}(Ortho));

var CoreContext = React.createContext(undefined);
function useCore() {
    return React.useContext(CoreContext);
}
function useCoreProvider(params) {
    var core = React.useRef();
    if (!core.current)
        core.current = new Core(params);
    React.useEffect(function () { return function () {
        core.current.unmount();
    }; }, []);
    return core.current;
}
function CoreProvider(props) {
    var children = props.children, params = __rest(props, ["children"]);
    var core = useCoreProvider(params);
    return React__default["default"].createElement(CoreContext.Provider, { value: core }, children);
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
    var key = React.useMemo(function () {
        return scroller();
    }, [scroller]);
    var skey = React.useMemo(function () {
        if (key === undefined)
            return;
        return "scroll:" + JSON.stringify(key);
    }, [key]);
    var _a = __read(React.useState(!core.async), 2), ready = _a[0], setReady = _a[1];
    var _b = __read(React.useState(function () { return core.getSync(skey); }), 2), state = _b[0], setState = _b[1];
    React.useEffect(function () {
        core.get(skey)
            .then(setState)
            .finally(function () { return setReady(true); });
    }, [core, skey]);
    useOrtho(core, skey, setState);
    var mutate = React.useCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.mutate(skey, res)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var fetch = React.useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var refetch = React.useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var scroll = React.useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.scroll.scroll(skey, scroller, fetcher, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, scroller, fetcher]);
    var clear = React.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.delete(skey)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [core, skey]);
    var loading = Boolean(state === null || state === void 0 ? void 0 : state.aborter);
    return __assign(__assign({ key: key, skey: skey }, state), { loading: loading, ready: ready, mutate: mutate, fetch: fetch, refetch: refetch, scroll: scroll, clear: clear });
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
    var skey = React.useMemo(function () {
        if (key === undefined)
            return;
        return JSON.stringify(key);
    }, [key]);
    var _a = __read(React.useState(function () { return core.hasSync(skey); }), 2), ready = _a[0], setReady = _a[1];
    var _b = __read(React.useState(function () { return core.getSync(skey); }), 2), state = _b[0], setState = _b[1];
    React.useEffect(function () {
        core.get(skey)
            .then(setState)
            .finally(function () { return setReady(true); });
    }, [core, skey]);
    useOrtho(core, skey, setState);
    var mutate = React.useCallback(function (res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.mutate(skey, res)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var fetch = React.useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.fetch(key, skey, poster, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var refetch = React.useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.fetch(key, skey, poster, aborter, tparams, true)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var update = React.useCallback(function (updater, aborter) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.single.update(key, skey, poster, updater, aborter, tparams)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey, poster]);
    var clear = React.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.delete(skey)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [core, skey]);
    var loading = Boolean(state === null || state === void 0 ? void 0 : state.aborter);
    return __assign(__assign({ key: key, skey: skey }, state), { loading: loading, ready: ready, mutate: mutate, fetch: fetch, refetch: refetch, update: update, clear: clear });
}

/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var time = handle.time;
    React.useEffect(function () {
        console.debug(label, handle);
    }, [time]);
}

/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var ready = handle.ready, error = handle.error;
    React.useEffect(function () {
        if (!ready)
            return;
        if (error !== undefined)
            callback(error);
    }, [ready, error, callback]);
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
    React.useEffect(function () {
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
    React.useEffect(function () {
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
    React.useEffect(function () {
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
    var ready = handle.ready, data = handle.data, fetch = handle.fetch;
    React.useEffect(function () {
        if (!ready)
            return;
        if (data === undefined)
            fetch();
    }, [ready, data, fetch]);
}

/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var fetch = handle.fetch;
    React.useEffect(function () {
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
    var ready = handle.ready, refetch = handle.refetch, error = handle.error, time = handle.time;
    var _a = options.init, init = _a === void 0 ? 1000 : _a, _b = options.base, base = _b === void 0 ? 2 : _b, _c = options.max, max = _c === void 0 ? 3 : _c;
    var count = React.useRef(0);
    React.useEffect(function () {
        count.current = 0;
    }, [refetch]);
    React.useEffect(function () {
        if (!ready)
            return;
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
    }, [ready, error, time, refetch]);
}

/**
 * Do a request when the tab is visible
 * @param handle
 */
function useVisible(handle) {
    var fetch = handle.fetch;
    React.useEffect(function () {
        var f = function () { return !document.hidden && fetch(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [fetch]);
}

function useAsyncLocalStorage() {
    var storage = React.useRef();
    if (!storage.current)
        storage.current = new AsyncLocalStorage();
    return storage.current;
}
var AsyncLocalStorage = /** @class */ (function () {
    function AsyncLocalStorage() {
        this.async = true;
    }
    AsyncLocalStorage.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                return [2 /*return*/, Boolean(localStorage.getItem(key))];
            });
        });
    };
    AsyncLocalStorage.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                item = localStorage.getItem(key);
                if (item)
                    return [2 /*return*/, JSON.parse(item)];
                return [2 /*return*/];
            });
        });
    };
    AsyncLocalStorage.prototype.set = function (key, state) {
        return __awaiter(this, void 0, void 0, function () {
            var data, time, expiration, item;
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                data = state.data, time = state.time, expiration = state.expiration;
                item = JSON.stringify({ data: data, time: time, expiration: expiration });
                localStorage.setItem(key, item);
                return [2 /*return*/];
            });
        });
    };
    AsyncLocalStorage.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                localStorage.removeItem(key);
                return [2 /*return*/];
            });
        });
    };
    return AsyncLocalStorage;
}());

function useSyncLocalStorage() {
    var storage = React.useRef();
    if (!storage.current)
        storage.current = new SyncLocalStorage();
    return storage.current;
}
var SyncLocalStorage = /** @class */ (function () {
    function SyncLocalStorage() {
        this.async = false;
    }
    SyncLocalStorage.prototype.has = function (key) {
        if (typeof Storage === "undefined")
            return;
        return Boolean(localStorage.getItem(key));
    };
    SyncLocalStorage.prototype.get = function (key) {
        if (typeof Storage === "undefined")
            return;
        var item = localStorage.getItem(key);
        if (item)
            return JSON.parse(item);
    };
    SyncLocalStorage.prototype.set = function (key, state) {
        if (typeof Storage === "undefined")
            return;
        var data = state.data, time = state.time, expiration = state.expiration;
        var item = JSON.stringify({ data: data, time: time, expiration: expiration });
        localStorage.setItem(key, item);
    };
    SyncLocalStorage.prototype.delete = function (key) {
        if (typeof Storage === "undefined")
            return;
        localStorage.removeItem(key);
    };
    return SyncLocalStorage;
}());

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
    useAsyncLocalStorage: useAsyncLocalStorage,
    AsyncLocalStorage: AsyncLocalStorage,
    useSyncLocalStorage: useSyncLocalStorage,
    SyncLocalStorage: SyncLocalStorage,
    isAsyncStorage: isAsyncStorage,
    getTimeFromDelay: getTimeFromDelay
};

exports.XSWR = mod;
