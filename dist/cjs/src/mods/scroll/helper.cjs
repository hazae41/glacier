'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../node_modules/tslib/tslib.es6.cjs');
var arrays = require('../../libs/arrays.cjs');
var time = require('../../libs/time.cjs');
var abort = require('../errors/abort.cjs');
var defaults = require('../utils/defaults.cjs');

var ScrollHelper = /** @class */ (function () {
    function ScrollHelper(core) {
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
    ScrollHelper.prototype.first = function (skey, scroller, fetcher, aborter, params, force, ignore) {
        var _a;
        if (aborter === void 0) { aborter = new AbortController(); }
        if (params === void 0) { params = {}; }
        if (force === void 0) { force = false; }
        if (ignore === void 0) { ignore = false; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var _b, current, skip, first, _c, equals, _d, dcooldown, _e, dexpiration, _f, dtimeout, timeout, signal, _g, data, error, _h, time_1, _j, cooldown_1, _k, expiration_1, state_1, norm, error_1;
            var _this = this;
            return tslib_es6.__generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.core.lock(skey, function () { return tslib_es6.__awaiter(_this, void 0, void 0, function () {
                                var current, first;
                                return tslib_es6.__generator(this, function (_a) {
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
                                            first = scroller(undefined);
                                            if (first === undefined)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter }); }, params)];
                                        case 2:
                                            current = _a.sent();
                                            return [2 /*return*/, { current: current, first: first }];
                                    }
                                });
                            }); })];
                    case 1:
                        _b = _l.sent(), current = _b.current, skip = _b.skip, first = _b.first;
                        if (skip)
                            return [2 /*return*/, current];
                        if (first === undefined)
                            throw new Error("Undefined first");
                        _c = params.equals, equals = _c === void 0 ? defaults.DEFAULT_EQUALS : _c, _d = params.cooldown, dcooldown = _d === void 0 ? defaults.DEFAULT_COOLDOWN : _d, _e = params.expiration, dexpiration = _e === void 0 ? defaults.DEFAULT_EXPIRATION : _e, _f = params.timeout, dtimeout = _f === void 0 ? defaults.DEFAULT_TIMEOUT : _f;
                        timeout = setTimeout(function () {
                            aborter.abort("First timed out");
                        }, dtimeout);
                        _l.label = 2;
                    case 2:
                        _l.trys.push([2, 8, 11, 12]);
                        signal = aborter.signal;
                        return [4 /*yield*/, fetcher(first, { signal: signal })];
                    case 3:
                        _g = _l.sent(), data = _g.data, error = _g.error, _h = _g.time, time_1 = _h === void 0 ? Date.now() : _h, _j = _g.cooldown, cooldown_1 = _j === void 0 ? time.getTimeFromDelay(dcooldown) : _j, _k = _g.expiration, expiration_1 = _k === void 0 ? time.getTimeFromDelay(dexpiration) : _k;
                        if (signal.aborted)
                            throw new abort.AbortError(signal);
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 4:
                        current = _l.sent();
                        state_1 = {};
                        if (data !== undefined)
                            state_1.data = [data];
                        state_1.error = error;
                        if (!(data !== undefined)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.core.normalize(true, { data: [data] }, params)];
                    case 5:
                        norm = _l.sent();
                        if (equals(norm === null || norm === void 0 ? void 0 : norm[0], (_a = current === null || current === void 0 ? void 0 : current.data) === null || _a === void 0 ? void 0 : _a[0]))
                            delete state_1.data;
                        _l.label = 6;
                    case 6: return [4 /*yield*/, this.core.mutate(skey, current, function () { return (tslib_es6.__assign({ time: time_1, cooldown: cooldown_1, expiration: expiration_1, aborter: undefined }, state_1)); }, params)];
                    case 7: return [2 /*return*/, _l.sent()];
                    case 8:
                        error_1 = _l.sent();
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 9:
                        current = _l.sent();
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return ({ aborter: undefined, error: error_1 }); }, params)];
                    case 10: return [2 /*return*/, _l.sent()];
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
    ScrollHelper.prototype.scroll = function (skey, scroller, fetcher, aborter, params, force, ignore) {
        var _a;
        if (aborter === void 0) { aborter = new AbortController(); }
        if (params === void 0) { params = {}; }
        if (force === void 0) { force = false; }
        if (ignore === void 0) { ignore = false; }
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var _b, current, skip, last, _c, dcooldown, _d, dexpiration, _e, dtimeout, timeout, signal, _f, data, error, _g, time_2, _h, cooldown_2, _j, expiration_2, state_2, error_2;
            var _this = this;
            return tslib_es6.__generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (skey === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.core.lock(skey, function () { return tslib_es6.__awaiter(_this, void 0, void 0, function () {
                                var current, pages, last;
                                var _a;
                                return tslib_es6.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.core.get(skey, params)];
                                        case 1:
                                            current = _b.sent();
                                            if (current === null || current === void 0 ? void 0 : current.optimistic)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            if ((current === null || current === void 0 ? void 0 : current.aborter) && !force)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            if ((current === null || current === void 0 ? void 0 : current.aborter) && force)
                                                current.aborter.abort("Replaced");
                                            if (this.core.shouldCooldown(current) && !ignore)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            pages = (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [];
                                            last = scroller(arrays.lastOf(pages));
                                            if (last === undefined)
                                                return [2 /*return*/, { current: current, skip: true }];
                                            return [4 /*yield*/, this.core.mutate(skey, current, function (c) { return ({ time: c === null || c === void 0 ? void 0 : c.time, aborter: aborter }); }, params)];
                                        case 2:
                                            current = _b.sent();
                                            return [2 /*return*/, { current: current, last: last }];
                                    }
                                });
                            }); })];
                    case 1:
                        _b = _k.sent(), current = _b.current, skip = _b.skip, last = _b.last;
                        if (skip)
                            return [2 /*return*/, current];
                        if (last === undefined)
                            throw new Error("Undefined last");
                        _c = params.cooldown, dcooldown = _c === void 0 ? defaults.DEFAULT_COOLDOWN : _c, _d = params.expiration, dexpiration = _d === void 0 ? defaults.DEFAULT_EXPIRATION : _d, _e = params.timeout, dtimeout = _e === void 0 ? defaults.DEFAULT_TIMEOUT : _e;
                        timeout = setTimeout(function () {
                            aborter.abort("Scroll timed out");
                        }, dtimeout);
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 6, 9, 10]);
                        signal = aborter.signal;
                        return [4 /*yield*/, fetcher(last, { signal: signal })];
                    case 3:
                        _f = _k.sent(), data = _f.data, error = _f.error, _g = _f.time, time_2 = _g === void 0 ? Date.now() : _g, _h = _f.cooldown, cooldown_2 = _h === void 0 ? time.getTimeFromDelay(dcooldown) : _h, _j = _f.expiration, expiration_2 = _j === void 0 ? time.getTimeFromDelay(dexpiration) : _j;
                        if (signal.aborted)
                            throw new abort.AbortError(signal);
                        if (expiration_2 !== undefined && (current === null || current === void 0 ? void 0 : current.expiration) !== undefined)
                            expiration_2 = Math.min(expiration_2, current === null || current === void 0 ? void 0 : current.expiration);
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 4:
                        current = _k.sent();
                        state_2 = {};
                        if (data !== undefined)
                            state_2.data = tslib_es6.__spreadArray(tslib_es6.__spreadArray([], tslib_es6.__read(((_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [])), false), [data], false);
                        state_2.error = error;
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return (tslib_es6.__assign({ time: time_2, cooldown: cooldown_2, expiration: expiration_2, aborter: undefined }, state_2)); }, params)];
                    case 5: return [2 /*return*/, _k.sent()];
                    case 6:
                        error_2 = _k.sent();
                        return [4 /*yield*/, this.core.get(skey, params)];
                    case 7:
                        current = _k.sent();
                        if ((current === null || current === void 0 ? void 0 : current.aborter) !== aborter)
                            return [2 /*return*/, current];
                        return [4 /*yield*/, this.core.mutate(skey, current, function () { return ({ aborter: undefined, error: error_2 }); }, params)];
                    case 8: return [2 /*return*/, _k.sent()];
                    case 9:
                        clearTimeout(timeout);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return ScrollHelper;
}());

exports.ScrollHelper = ScrollHelper;
