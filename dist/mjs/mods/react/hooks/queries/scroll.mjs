import { __assign, __read, __awaiter, __generator } from 'tslib';
import { useAutoRef } from '../../../../libs/react.mjs';
import { useCore } from '../../contexts/core.mjs';
import { getScrollStorageKey } from '../../../scroll/object.mjs';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling handle
 */
function useScrollQuery(scroller, fetcher, params) {
    var _this = this;
    if (params === void 0) { params = {}; }
    var core = useCore();
    var mparams = __assign(__assign({}, core.params), params);
    var scrollerRef = useAutoRef(scroller);
    var fetcherRef = useAutoRef(fetcher);
    var paramsRef = useAutoRef(mparams);
    var key = useMemo(function () {
        return scroller();
    }, [scroller]);
    var skey = useMemo(function () {
        return getScrollStorageKey(key, paramsRef.current);
    }, [key]);
    var _a = __read(useState(0), 2), setCounter = _a[1];
    var stateRef = useRef();
    useMemo(function () {
        stateRef.current = core.getSync(skey, paramsRef.current);
    }, [core, skey]);
    var setState = useCallback(function (state) {
        stateRef.current = state;
        setCounter(function (c) { return c + 1; });
    }, []);
    var initRef = useRef();
    useEffect(function () {
        if (stateRef.current !== null)
            return;
        initRef.current = core.get(skey, paramsRef.current).then(setState);
    }, [core, skey]);
    useEffect(function () {
        if (!skey)
            return;
        core.on(skey, setState, paramsRef.current);
        return function () { return void core.off(skey, setState, paramsRef.current); };
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
                    params = paramsRef.current;
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
                    return [4 /*yield*/, core.delete(skey, paramsRef.current)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [core, skey]);
    var fetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
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
                    scroller = scrollerRef.current;
                    fetcher = fetcherRef.current;
                    params = paramsRef.current;
                    return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, params)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var refetch = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
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
                    scroller = scrollerRef.current;
                    fetcher = fetcherRef.current;
                    params = paramsRef.current;
                    return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, aborter, params, true, true)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var scroll = useCallback(function (aborter) { return __awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === "undefined")
                        throw new Error("Scroll on SSR");
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
                    scroller = scrollerRef.current;
                    fetcher = fetcherRef.current;
                    params = paramsRef.current;
                    return [4 /*yield*/, core.scroll.scroll(skey, scroller, fetcher, aborter, params, true, true)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, skey]);
    var suspend = useCallback(function () {
        if (typeof window === "undefined")
            throw new Error("Suspend on SSR");
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var scroller, fetcher, params, background;
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
                        scroller = scrollerRef.current;
                        fetcher = fetcherRef.current;
                        params = paramsRef.current;
                        background = new Promise(function (ok) { return core.once(skey, function () { return ok(); }, params); });
                        return [4 /*yield*/, core.scroll.first(skey, scroller, fetcher, undefined, params, false, true)];
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
    return { key: key, skey: skey, data: data, error: error, time: time, cooldown: cooldown, expiration: expiration, aborter: aborter, optimistic: optimistic, realData: realData, loading: loading, ready: ready, mutate: mutate, fetch: fetch, refetch: refetch, scroll: scroll, clear: clear, suspend: suspend };
}

export { useScrollQuery };
//# sourceMappingURL=scroll.mjs.map
