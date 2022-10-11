'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../node_modules/tslib/tslib.es6.cjs');
var ortho = require('../libs/ortho.cjs');
var helper$1 = require('./scroll/helper.cjs');
var helper = require('./single/helper.cjs');
var storage = require('./types/storage.cjs');
var defaults = require('./utils/defaults.cjs');
var equals = require('./utils/equals.cjs');
var lock = require('./utils/lock.cjs');

var Core = /** @class */ (function (_super) {
    tslib_es6.__extends(Core, _super);
    function Core(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.single = new helper.SingleHelper(_this);
        _this.scroll = new helper$1.ScrollHelper(_this);
        _this.cache = new Map();
        _this.locks = new Map();
        _this._mounted = true;
        _this.counts = new Map();
        _this.timeouts = new Map();
        return _this;
    }
    Object.defineProperty(Core.prototype, "mounted", {
        get: function () { return this._mounted; },
        enumerable: false,
        configurable: true
    });
    Core.prototype.unmount = function () {
        var e_1, _a;
        try {
            for (var _b = tslib_es6.__values(this.timeouts.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
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
        this._mounted = false;
    };
    Core.prototype.lock = function (skey, callback) {
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var lock$1, lock2;
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lock$1 = this.locks.get(skey);
                        if (!(lock$1 !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, lock$1.lock(callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        lock2 = new lock.Lock();
                        this.locks.set(skey, lock2);
                        return [4 /*yield*/, lock2.lock(callback)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Core.prototype.getSync = function (skey, params) {
        if (params === void 0) { params = {}; }
        if (skey === undefined)
            return;
        var cached = this.cache.get(skey);
        if (cached !== undefined)
            return cached;
        var storage$1 = params.storage;
        if (!storage$1)
            return;
        if (storage.isAsyncStorage(storage$1))
            return null;
        var state = storage$1.get(skey);
        this.cache.set(skey, state);
        return state;
    };
    Core.prototype.get = function (skey, params, ignore) {
        if (params === void 0) { params = {}; }
        if (ignore === void 0) { ignore = false; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var cached, storage, state;
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        cached = this.cache.get(skey);
                        if (cached !== undefined)
                            return [2 /*return*/, cached];
                        storage = params.storage;
                        if (!storage)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.get(skey, ignore)];
                    case 1:
                        state = _a.sent();
                        this.cache.set(skey, state);
                        return [2 /*return*/, state];
                }
            });
        });
    };
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param skey Key
     * @param state New state
     * @returns
     */
    Core.prototype.set = function (skey, state, params) {
        if (params === void 0) { params = {}; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var storage, data, time, cooldown, expiration;
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        this.cache.set(skey, state);
                        this.publish(skey, state);
                        storage = params.storage;
                        if (!storage)
                            return [2 /*return*/];
                        data = state.data, time = state.time, cooldown = state.cooldown, expiration = state.expiration;
                        return [4 /*yield*/, storage.set(skey, { data: data, time: time, cooldown: cooldown, expiration: expiration })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete key and publish undefined
     * @param skey
     * @returns
     */
    Core.prototype.delete = function (skey, params) {
        if (params === void 0) { params = {}; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var storage;
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!skey)
                            return [2 /*return*/];
                        this.cache.delete(skey);
                        this.locks.delete(skey);
                        this.publish(skey, undefined);
                        storage = params.storage;
                        if (!storage)
                            return [2 /*return*/];
                        return [4 /*yield*/, storage.delete(skey)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Core.prototype.mutate = function (skey, current, mutator, params) {
        var _a;
        if (params === void 0) { params = {}; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var state, _b, equals$1, next, _c;
            return tslib_es6.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        state = mutator(current);
                        if (!!state) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.delete(skey, params)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/];
                    case 2:
                        if (state.time !== undefined && state.time < ((_a = current === null || current === void 0 ? void 0 : current.time) !== null && _a !== void 0 ? _a : 0))
                            return [2 /*return*/, current];
                        if (state.optimistic === undefined && (current === null || current === void 0 ? void 0 : current.optimistic))
                            return [2 /*return*/, current];
                        _b = params.equals, equals$1 = _b === void 0 ? defaults.DEFAULT_EQUALS : _b;
                        next = tslib_es6.__assign(tslib_es6.__assign({}, current), state);
                        _c = next;
                        return [4 /*yield*/, this.normalize(false, next, params)];
                    case 3:
                        _c.data = _d.sent();
                        if (next.time === undefined)
                            next.time = Date.now();
                        if (equals$1(next.data, current === null || current === void 0 ? void 0 : current.data))
                            next.data = current === null || current === void 0 ? void 0 : current.data;
                        if (!next.optimistic)
                            next.realData = next.data;
                        if (equals.shallowEquals(next, current))
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.set(skey, next, params)];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, next];
                }
            });
        });
    };
    Core.prototype.normalize = function (shallow, root, params) {
        if (params === void 0) { params = {}; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (root.data === undefined)
                            return [2 /*return*/];
                        if (params.normalizer === undefined)
                            return [2 /*return*/, root.data];
                        return [4 /*yield*/, params.normalizer(root.data, { core: this, shallow: shallow, root: root })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * True if we should cooldown this resource
     */
    Core.prototype.shouldCooldown = function (current) {
        if ((current === null || current === void 0 ? void 0 : current.cooldown) === undefined)
            return false;
        return Date.now() < current.cooldown;
    };
    Core.prototype.once = function (key, listener, params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        if (!key)
            return;
        var f = function (x) {
            _this.off(key, f, params);
            listener(x);
        };
        this.on(key, f, params);
    };
    Core.prototype.on = function (key, listener, params) {
        var _a;
        if (!key)
            return;
        _super.prototype.on.call(this, key, listener);
        var count = (_a = this.counts.get(key)) !== null && _a !== void 0 ? _a : 0;
        this.counts.set(key, count + 1);
        var timeout = this.timeouts.get(key);
        if (timeout === undefined)
            return;
        clearTimeout(timeout);
        this.timeouts.delete(key);
    };
    Core.prototype.off = function (key, listener, params) {
        if (params === void 0) { params = {}; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var count, current, erase, delay, timeout;
            var _this = this;
            return tslib_es6.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        _super.prototype.off.call(this, key, listener);
                        count = this.counts.get(key);
                        if (count === undefined)
                            throw new Error("Undefined count");
                        if (count > 1) {
                            this.counts.set(key, count - 1);
                            return [2 /*return*/];
                        }
                        this.counts.delete(key);
                        return [4 /*yield*/, this.get(key, params, true)];
                    case 1:
                        current = _a.sent();
                        if ((current === null || current === void 0 ? void 0 : current.expiration) === undefined)
                            return [2 /*return*/];
                        if ((current === null || current === void 0 ? void 0 : current.expiration) === -1)
                            return [2 /*return*/];
                        erase = function () { return tslib_es6.__awaiter(_this, void 0, void 0, function () {
                            var count;
                            return tslib_es6.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this._mounted)
                                            return [2 /*return*/];
                                        count = this.counts.get(key);
                                        if (count !== undefined)
                                            return [2 /*return*/];
                                        this.timeouts.delete(key);
                                        return [4 /*yield*/, this.delete(key, params)];
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
    return Core;
}(ortho.Ortho));

exports.Core = Core;
