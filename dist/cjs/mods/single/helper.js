'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
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
        if (aborter === void 0) { aborter = new AbortController(); }
        if (params === void 0) { params = {}; }
        return tslib.__awaiter(this, void 0, void 0, function () {
            var _a, current, skip, _b, dcooldown, _c, dexpiration, _d, dtimeout, timeout, signal, generator, result, _loop_1, this_1, state_2, data, error_3, _e, time_2, _f, cooldown_2, _g, expiration_2, state_3, error_2;
            var _this = this;
            return tslib.__generator(this, function (_h) {
                switch (_h.label) {
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
                        _a = _h.sent(), current = _a.current, skip = _a.skip;
                        if (skip)
                            return [2 /*return*/, current];
                        _b = params.cooldown, dcooldown = _b === void 0 ? defaults.DEFAULT_COOLDOWN : _b, _c = params.expiration, dexpiration = _c === void 0 ? defaults.DEFAULT_EXPIRATION : _c, _d = params.timeout, dtimeout = _d === void 0 ? defaults.DEFAULT_TIMEOUT : _d;
                        timeout = setTimeout(function () {
                            aborter.abort("Update timed out");
                        }, dtimeout);
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 12, 15, 16]);
                        signal = aborter.signal;
                        generator = updater(current, { signal: signal });
                        result = undefined;
                        _loop_1 = function () {
                            var _j, done, value, data_1, error_4, optimistic;
                            return tslib.__generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0: return [4 /*yield*/, generator.next()];
                                    case 1:
                                        _j = _k.sent(), done = _j.done, value = _j.value;
                                        if (done) {
                                            result = value;
                                            return [2 /*return*/, "break"];
                                        }
                                        data_1 = value.data, error_4 = value.error;
                                        if (signal.aborted)
                                            throw new abort.AbortError(signal);
                                        optimistic = {};
                                        if (data_1 !== undefined)
                                            optimistic.data = data_1;
                                        optimistic.error = error_4;
                                        return [4 /*yield*/, this_1.core.mutate(skey, current, function (c) { return (tslib.__assign({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter, optimistic: true }, optimistic)); }, params)];
                                    case 2:
                                        current = _k.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _h.label = 3;
                    case 3:
                        return [5 /*yield**/, _loop_1()];
                    case 4:
                        state_2 = _h.sent();
                        if (state_2 === "break")
                            return [3 /*break*/, 5];
                        return [3 /*break*/, 3];
                    case 5:
                        if (!(result === undefined)) return [3 /*break*/, 7];
                        if (fetcher === undefined)
                            throw new Error("Updater returned nothing and undefined fetcher");
                        return [4 /*yield*/, fetcher(key, { signal: signal, cache: "reload" })];
                    case 6:
                        result = _h.sent();
                        _h.label = 7;
                    case 7:
                        data = result.data, error_3 = result.error, _e = result.time, time_2 = _e === void 0 ? Date.now() : _e, _f = result.cooldown, cooldown_2 = _f === void 0 ? time.getTimeFromDelay(dcooldown) : _f, _g = result.expiration, expiration_2 = _g === void 0 ? time.getTimeFromDelay(dexpiration) : _g;
                        if (signal.aborted)
                            throw new abort.AbortError(signal);
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 8:
                        current = _h.sent();
                        if (!(error_3 !== undefined)) return [3 /*break*/, 10];
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, cooldown: cooldown_2, expiration: expiration_2, aborter: undefined, optimistic: false, data: c === null || c === void 0 ? void 0 : c.data, error: error_3 }); }, params)];
                    case 9: return [2 /*return*/, _h.sent()];
                    case 10:
                        state_3 = {};
                        if (data !== undefined)
                            state_3.data = data;
                        state_3.error = error_3;
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return (tslib.__assign({ time: time_2, cooldown: cooldown_2, expiration: expiration_2, aborter: undefined, optimistic: false }, state_3)); }, params)];
                    case 11: return [2 /*return*/, _h.sent()];
                    case 12:
                        error_2 = _h.sent();
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 13:
                        current = _h.sent();
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: undefined, optimistic: false, data: c === null || c === void 0 ? void 0 : c.data, error: error_2 }); }, params)];
                    case 14: return [2 /*return*/, _h.sent()];
                    case 15:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return SingleHelper;
}());

exports.SingleHelper = SingleHelper;
//# sourceMappingURL=helper.js.map
