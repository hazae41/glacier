'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var generator = require('../../libs/generator.js');
var time = require('../../libs/time.js');
var abort = require('../errors/abort.js');
var defaults = require('../utils/defaults.js');

var SingleHelper = /** @class */ (function () {
    function SingleHelper(core) {
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
    SingleHelper.prototype.fetch = function (key, skey, fetcher, aborter, params, force, ignore) {
        if (aborter === void 0) { aborter = new AbortController(); }
        if (params === void 0) { params = {}; }
        if (force === void 0) { force = false; }
        if (ignore === void 0) { ignore = false; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _a, current, skip, _b, dcooldown, _c, dexpiration, _d, dtimeout, timeout, signal, _e, data, error, _f, time_1, _g, cooldown_1, _h, expiration_1, state_1, error_1;
            var _this = this;
            return tslib.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (key === undefined)
                            return [2 /*return*/];
                        if (skey === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.core.lock(skey, function () { return tslib.__awaiter(_this, void 0, void 0, function () {
                                var current;
                                return tslib.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.core.get(skey, params)];
                                        case 1:
                                            current = _a.sent();
                                            if (current === null || current === void 0 ? void 0 : current.optimistic)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            if ((current === null || current === void 0 ? void 0 : current.aborter) && !force)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            if ((current === null || current === void 0 ? void 0 : current.aborter) && force)
                                                current.aborter.abort("Replaced");
                                            if (this.core.shouldCooldown(current) && !ignore)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter }); }, params)];
                                        case 2:
                                            current = _a.sent();
                                            return [2 /*return*/, { current: current }];
                                    }
                                });
                            }); })];
                    case 1:
                        _a = _j.sent(), current = _a.current, skip = _a.skip;
                        if (skip)
                            return [2 /*return*/, current];
                        _b = params.cooldown, dcooldown = _b === void 0 ? defaults.DEFAULT_COOLDOWN : _b, _c = params.expiration, dexpiration = _c === void 0 ? defaults.DEFAULT_EXPIRATION : _c, _d = params.timeout, dtimeout = _d === void 0 ? defaults.DEFAULT_TIMEOUT : _d;
                        timeout = setTimeout(function () {
                            aborter.abort("Fetch timed out");
                        }, dtimeout);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 6, 9, 10]);
                        signal = aborter.signal;
                        return [4 /*yield*/, fetcher(key, { signal: signal })];
                    case 3:
                        _e = _j.sent(), data = _e.data, error = _e.error, _f = _e.time, time_1 = _f === void 0 ? Date.now() : _f, _g = _e.cooldown, cooldown_1 = _g === void 0 ? time.getTimeFromDelay(dcooldown) : _g, _h = _e.expiration, expiration_1 = _h === void 0 ? time.getTimeFromDelay(dexpiration) : _h;
                        if (signal.aborted)
                            throw new abort.AbortError(signal);
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 4:
                        current = _j.sent();
                        state_1 = {};
                        if (data !== undefined)
                            state_1.data = data;
                        state_1.error = error;
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return (tslib.__assign({ time: time_1, cooldown: cooldown_1, expiration: expiration_1, aborter: undefined }, state_1)); }, params)];
                    case 5: return [2 /*return*/, _j.sent()];
                    case 6:
                        error_1 = _j.sent();
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 7:
                        current = _j.sent();
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return ({ aborter: undefined, error: error_1 }); }, params)];
                    case 8: return [2 /*return*/, _j.sent()];
                    case 9:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Optimistic update
     * @param key Key (:K) (passed to poster)
     * @param skey Storage key
     * @param fetcher Resource poster
     * @param updater Mutation function
     * @param aborter AbortController
     * @param tparams Time parameters
     * @returns The new state
     * @throws Error
     */
    SingleHelper.prototype.update = function (key, skey, fetcher, updater, aborter, params) {
        var e_1, _a;
        if (aborter === void 0) { aborter = new AbortController(); }
        if (params === void 0) { params = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _b, current, skip, _c, dcooldown, _d, dexpiration, _e, dtimeout, timeout, signal, generator$1, _loop_1, this_1, generator_1, generator_1_1, e_1_1, result, data, error_3, _f, time_2, _g, cooldown_2, _h, expiration_2, state_2, error_2;
            var _this = this;
            return tslib.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (key === undefined)
                            return [2 /*return*/];
                        if (skey === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.core.lock(skey, function () { return tslib.__awaiter(_this, void 0, void 0, function () {
                                var current;
                                return tslib.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.core.get(skey, params)];
                                        case 1:
                                            current = _a.sent();
                                            if (current === null || current === void 0 ? void 0 : current.optimistic)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            if (current === null || current === void 0 ? void 0 : current.aborter)
                                                current.aborter.abort("Replaced");
                                            return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter, optimistic: true }); }, params)];
                                        case 2:
                                            current = _a.sent();
                                            return [2 /*return*/, { current: current }];
                                    }
                                });
                            }); })];
                    case 1:
                        _b = _j.sent(), current = _b.current, skip = _b.skip;
                        if (skip)
                            return [2 /*return*/, current];
                        _c = params.cooldown, dcooldown = _c === void 0 ? defaults.DEFAULT_COOLDOWN : _c, _d = params.expiration, dexpiration = _d === void 0 ? defaults.DEFAULT_EXPIRATION : _d, _e = params.timeout, dtimeout = _e === void 0 ? defaults.DEFAULT_TIMEOUT : _e;
                        timeout = setTimeout(function () {
                            aborter.abort("Update timed out");
                        }, dtimeout);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 23, 26, 27]);
                        signal = aborter.signal;
                        generator$1 = updater(current, { signal: signal });
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 9, 10, 15]);
                        _loop_1 = function () {
                            var _k, data_1, error_4, optimistic;
                            return tslib.__generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        _k = generator_1_1.value, data_1 = _k.data, error_4 = _k.error;
                                        if (signal.aborted)
                                            throw new abort.AbortError(signal);
                                        optimistic = {};
                                        if (data_1 !== undefined)
                                            optimistic.data = data_1;
                                        optimistic.error = error_4;
                                        return [4 /*yield*/, this_1.core.mutate(skey, current, function (c) { return (tslib.__assign({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter, optimistic: true }, optimistic)); }, params)];
                                    case 1:
                                        current = _l.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        generator_1 = tslib.__asyncValues(generator$1);
                        _j.label = 4;
                    case 4: return [4 /*yield*/, generator_1.next()];
                    case 5:
                        if (!(generator_1_1 = _j.sent(), !generator_1_1.done)) return [3 /*break*/, 8];
                        return [5 /*yield**/, _loop_1()];
                    case 6:
                        _j.sent();
                        _j.label = 7;
                    case 7: return [3 /*break*/, 4];
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        e_1_1 = _j.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 15];
                    case 10:
                        _j.trys.push([10, , 13, 14]);
                        if (!(generator_1_1 && !generator_1_1.done && (_a = generator_1.return))) return [3 /*break*/, 12];
                        return [4 /*yield*/, _a.call(generator_1)];
                    case 11:
                        _j.sent();
                        _j.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 14: return [7 /*endfinally*/];
                    case 15: return [4 /*yield*/, generator.returnOf(generator$1)];
                    case 16:
                        result = _j.sent();
                        if (!(result === undefined)) return [3 /*break*/, 18];
                        if (fetcher === undefined)
                            throw new Error("Updater returned nothing and undefined fetcher");
                        return [4 /*yield*/, fetcher(key, { signal: signal, cache: "reload" })];
                    case 17:
                        result = _j.sent();
                        _j.label = 18;
                    case 18:
                        data = result.data, error_3 = result.error, _f = result.time, time_2 = _f === void 0 ? Date.now() : _f, _g = result.cooldown, cooldown_2 = _g === void 0 ? time.getTimeFromDelay(dcooldown) : _g, _h = result.expiration, expiration_2 = _h === void 0 ? time.getTimeFromDelay(dexpiration) : _h;
                        if (signal.aborted)
                            throw new abort.AbortError(signal);
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 19:
                        current = _j.sent();
                        if (!(error_3 !== undefined)) return [3 /*break*/, 21];
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, cooldown: cooldown_2, expiration: expiration_2, aborter: undefined, optimistic: false, data: c === null || c === void 0 ? void 0 : c.data, error: error_3 }); }, params)];
                    case 20: return [2 /*return*/, _j.sent()];
                    case 21:
                        state_2 = {};
                        if (data !== undefined)
                            state_2.data = data;
                        state_2.error = error_3;
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return (tslib.__assign({ time: time_2, cooldown: cooldown_2, expiration: expiration_2, aborter: undefined, optimistic: false }, state_2)); }, params)];
                    case 22: return [2 /*return*/, _j.sent()];
                    case 23:
                        error_2 = _j.sent();
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 24:
                        current = _j.sent();
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: undefined, optimistic: false, data: c === null || c === void 0 ? void 0 : c.data, error: error_2 }); }, params)];
                    case 25: return [2 /*return*/, _j.sent()];
                    case 26:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 27: return [2 /*return*/];
                }
            });
        });
    };
    return SingleHelper;
}());

exports.SingleHelper = SingleHelper;
//# sourceMappingURL=helper.js.map
