import { __assign, __read, __awaiter, __generator } from 'tslib';
import { useAutoRef } from '../../../../libs/react.js';
import { useCore } from '../../contexts/core.js';
import { getSingleStorageKey } from '../../../single/instance.js';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

/**
 * Single resource query factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single query
 */
function useSingleQuery(key, fetcher, params) {
    var _this = this;
    if (params === void 0) { params = {}; }
    var core = useCore();
    var mparams = __assign(__assign({}, core.params), params);
    var keyRef = useAutoRef(key);
    var fetcherRef = useAutoRef(fetcher);
    var mparamsRef = useAutoRef(mparams);
    var skey = useMemo(function () {
        return getSingleStorageKey(key, mparamsRef.current);
    }, [key]);
    var _a = __read(useState(0), 2), setCounter = _a[1];
    var stateRef = useRef();
    useMemo(function () {
        stateRef.current = core.getSync(skey, mparamsRef.current);
    }, [core, skey]);
    var setState = useCallback(function (state) {
        stateRef.current = state;
        setCounter(function (c) { return c + 1; });
    }, []);
    var initRef = useRef();
    useEffect(function () {
        if (stateRef.current !== null)
            return;
        initRef.current = core.get(skey, mparamsRef.current).then(setState);
    }, [core, skey]);
    useEffect(function () {
        if (!skey)
            return;
        core.on(skey, setState, mparamsRef.current);
        return function () { return void core.off(skey, setState, mparamsRef.current); };
    }, [core, skey]);
    var mutate = useCallback(function (mutator) { return __awaiter(_this, void 0, void 0, function () {
        var state, params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(stateRef.current === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, initRef.current];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (stateRef.current === null)
                        throw new Error("Null state after init");
                    state = stateRef.current;
                    params = mparamsRef.current;
                    return [4 /*yield*/, core.mutate(skey, state, mutator, params)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var clear = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(stateRef.current === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, initRef.current];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (stateRef.current === null)
                        throw new Error("Null state after init");
                    return [4 /*yield*/, core.delete(skey, mparamsRef.current)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [core, skey]);
    var fetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        var key, fetcher, params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === "undefined")
                        throw new Error("Fetch on SSR");
                    if (!(stateRef.current === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, initRef.current];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (stateRef.current === null)
                        throw new Error("Null state after init");
                    if (fetcherRef.current === undefined)
                        return [2 /*return*/, stateRef.current];
                    key = keyRef.current;
                    fetcher = fetcherRef.current;
                    params = mparamsRef.current;
                    return [4 /*yield*/, core.single.fetch(key, skey, fetcher, aborter, params)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var refetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        var key, fetcher, params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === "undefined")
                        throw new Error("Refetch on SSR");
                    if (!(stateRef.current === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, initRef.current];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (stateRef.current === null)
                        throw new Error("Null state after init");
                    if (fetcherRef.current === undefined)
                        return [2 /*return*/, stateRef.current];
                    key = keyRef.current;
                    fetcher = fetcherRef.current;
                    params = mparamsRef.current;
                    return [4 /*yield*/, core.single.fetch(key, skey, fetcher, aborter, params, true, true)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var update = useCallback(function (updater, uparams, aborter) {
        if (uparams === void 0) { uparams = {}; }
        return __awaiter(_this, void 0, void 0, function () {
            var key, fetcher, params, fparams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof window === "undefined")
                            throw new Error("Update on SSR");
                        if (!(stateRef.current === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, initRef.current];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (stateRef.current === null)
                            throw new Error("Null state after init");
                        key = keyRef.current;
                        fetcher = fetcherRef.current;
                        params = mparamsRef.current;
                        fparams = __assign(__assign({}, params), uparams);
                        return [4 /*yield*/, core.single.update(key, skey, fetcher, updater, aborter, fparams)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }, [core, skey]);
    var suspend = useCallback(function () {
        if (typeof window === "undefined")
            throw new Error("Suspend on SSR");
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var key, fetcher, params, background;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(stateRef.current === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, initRef.current];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (stateRef.current === null)
                            throw new Error("Null state after init");
                        if (fetcherRef.current === undefined)
                            throw new Error("No fetcher");
                        key = keyRef.current;
                        fetcher = fetcherRef.current;
                        params = mparamsRef.current;
                        background = new Promise(function (ok) { return core.once(skey, function () { return ok(); }, params); });
                        return [4 /*yield*/, core.single.fetch(key, skey, fetcher, undefined, params, false, true)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, background];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [core, skey]);
    var state = stateRef.current;
    var _b = state !== null && state !== void 0 ? state : {}, data = _b.data, error = _b.error, time = _b.time, cooldown = _b.cooldown, expiration = _b.expiration, aborter = _b.aborter, optimistic = _b.optimistic, realData = _b.realData;
    var ready = state !== null;
    var loading = Boolean(aborter);
    return { key: key, skey: skey, data: data, error: error, time: time, cooldown: cooldown, expiration: expiration, aborter: aborter, optimistic: optimistic, realData: realData, loading: loading, ready: ready, mutate: mutate, fetch: fetch, refetch: refetch, update: update, clear: clear, suspend: suspend };
}

export { useSingleQuery };
//# sourceMappingURL=single.js.map
