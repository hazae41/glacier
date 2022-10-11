import { __awaiter, __generator, __assign } from 'tslib';
import { DEFAULT_SERIALIZER } from '../utils/defaults.mjs';

function getScrollStorageKey(key, params) {
    if (key === undefined)
        return undefined;
    if (typeof key === "string")
        return key;
    var _a = params.serializer, serializer = _a === void 0 ? DEFAULT_SERIALIZER : _a;
    return "scroll:".concat(serializer.stringify(key));
}
/**
 * Non-React version of ScrollHandle
 */
var ScrollObject = /** @class */ (function () {
    function ScrollObject(core, scroller, fetcher, params) {
        if (params === void 0) { params = {}; }
        this.core = core;
        this.scroller = scroller;
        this.fetcher = fetcher;
        this.params = params;
        this.mparams = __assign(__assign({}, core.params), params);
        this.key = scroller();
        this.skey = getScrollStorageKey(this.key, this.mparams);
        this.loadSync();
        this.subscribe();
    }
    Object.defineProperty(ScrollObject.prototype, "init", {
        get: function () { return this._init; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScrollObject.prototype, "state", {
        get: function () { return this._state; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScrollObject.prototype, "ready", {
        get: function () { return this._state !== null; },
        enumerable: false,
        configurable: true
    });
    ScrollObject.prototype.loadSync = function () {
        var _a = this, core = _a.core, skey = _a.skey, mparams = _a.mparams;
        this._state = core.getSync(skey, mparams);
    };
    ScrollObject.prototype.loadAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, core, skey, mparams, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.ready)
                            return [2 /*return*/];
                        _a = this, core = _a.core, skey = _a.skey, mparams = _a.mparams;
                        _b = this;
                        return [4 /*yield*/, core.get(skey, mparams)];
                    case 1:
                        _b._state = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ScrollObject.prototype.subscribe = function () {
        var _this = this;
        var _a = this, core = _a.core, skey = _a.skey;
        var setter = function (state) {
            return _this._state = state;
        };
        core.on(skey, setter);
        new FinalizationRegistry(function () {
            core.off(skey, setter);
        }).register(this, undefined);
    };
    ScrollObject.prototype.mutate = function (mutator) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, core, skey, mparams, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, core = _b.core, skey = _b.skey, mparams = _b.mparams;
                        if (!(this._state === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this._init) !== null && _a !== void 0 ? _a : (this._init = this.loadAsync()))];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this._state === null)
                            throw new Error("Null state after init");
                        _c = this;
                        return [4 /*yield*/, core.mutate(skey, this._state, mutator, mparams)];
                    case 3: return [2 /*return*/, _c._state = _d.sent()];
                }
            });
        });
    };
    ScrollObject.prototype.fetch = function (aborter) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, core, scroller, skey, fetcher, mparams, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, core = _b.core, scroller = _b.scroller, skey = _b.skey, fetcher = _b.fetcher, mparams = _b.mparams;
                        if (!(this._state === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this._init) !== null && _a !== void 0 ? _a : (this._init = this.loadAsync()))];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this._state === null)
                            throw new Error("Null state after init");
                        if (fetcher === undefined)
                            return [2 /*return*/, this._state];
                        _c = this;
                        return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, mparams)];
                    case 3: return [2 /*return*/, _c._state = _d.sent()];
                }
            });
        });
    };
    ScrollObject.prototype.refetch = function (aborter) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, core, scroller, skey, fetcher, mparams, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, core = _b.core, scroller = _b.scroller, skey = _b.skey, fetcher = _b.fetcher, mparams = _b.mparams;
                        if (!(this._state === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this._init) !== null && _a !== void 0 ? _a : (this._init = this.loadAsync()))];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this._state === null)
                            throw new Error("Null state after init");
                        if (fetcher === undefined)
                            return [2 /*return*/, this._state];
                        _c = this;
                        return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, mparams, true, true)];
                    case 3: return [2 /*return*/, _c._state = _d.sent()];
                }
            });
        });
    };
    ScrollObject.prototype.scroll = function (aborter) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, core, scroller, skey, fetcher, mparams, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, core = _b.core, scroller = _b.scroller, skey = _b.skey, fetcher = _b.fetcher, mparams = _b.mparams;
                        if (!(this._state === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this._init) !== null && _a !== void 0 ? _a : (this._init = this.loadAsync()))];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this._state === null)
                            throw new Error("Null state after init");
                        if (fetcher === undefined)
                            return [2 /*return*/, this._state];
                        _c = this;
                        return [4 /*yield*/, core.scroll.scroll(skey, scroller, fetcher, aborter, mparams, true, true)];
                    case 3: return [2 /*return*/, _c._state = _d.sent()];
                }
            });
        });
    };
    ScrollObject.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, core, skey, mparams;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, core = _a.core, skey = _a.skey, mparams = _a.mparams;
                        return [4 /*yield*/, core.delete(skey, mparams)];
                    case 1:
                        _b.sent();
                        delete this._state;
                        return [2 /*return*/];
                }
            });
        });
    };
    return ScrollObject;
}());

export { ScrollObject, getScrollStorageKey };
