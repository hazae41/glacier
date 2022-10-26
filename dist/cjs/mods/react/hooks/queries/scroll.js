'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var react = require('../../../../libs/react.js');
var core = require('../../contexts/core.js');
var object = require('../../../scroll/object.js');
var React = require('react');

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
    var core$1 = core.useCore();
    var mparams = tslib.__assign(tslib.__assign({}, core$1.params), params);
    var scrollerRef = react.useAutoRef(scroller);
    var fetcherRef = react.useAutoRef(fetcher);
    var paramsRef = react.useAutoRef(mparams);
    var key = React.useMemo(function () {
        return scroller();
    }, [scroller]);
    var skey = React.useMemo(function () {
        return object.getScrollStorageKey(key, paramsRef.current);
    }, [key]);
    var _a = tslib.__read(React.useState(0), 2), setCounter = _a[1];
    var stateRef = React.useRef();
    React.useMemo(function () {
        stateRef.current = core$1.getSync(skey, paramsRef.current);
    }, [core$1, skey]);
    var setState = React.useCallback(function (state) {
        stateRef.current = state;
        setCounter(function (c) { return c + 1; });
    }, []);
    var initRef = React.useRef();
    React.useEffect(function () {
        if (stateRef.current !== null)
            return;
        initRef.current = core$1.get(skey, paramsRef.current).then(setState);
    }, [core$1, skey]);
    React.useEffect(function () {
        if (!skey)
            return;
        core$1.on(skey, setState, paramsRef.current);
        return function () { return void core$1.off(skey, setState, paramsRef.current); };
    }, [core$1, skey]);
    var mutate = React.useCallback(function (mutator) { return tslib.__awaiter(_this, void 0, void 0, function () {
        var state, params;
        return tslib.__generator(this, function (_a) {
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
                    return [4 /*yield*/, core$1.mutate(skey, state, mutator, params)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core$1, skey]);
    var clear = React.useCallback(function () { return tslib.__awaiter(_this, void 0, void 0, function () {
        return tslib.__generator(this, function (_a) {
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
                    return [4 /*yield*/, core$1.delete(skey, paramsRef.current)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [core$1, skey]);
    var fetch = React.useCallback(function (aborter) { return tslib.__awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
        return tslib.__generator(this, function (_a) {
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
                    return [4 /*yield*/, core$1.scroll.first(skey, scroller, fetcher, aborter, params)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core$1, skey]);
    var refetch = React.useCallback(function (aborter) { return tslib.__awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
        return tslib.__generator(this, function (_a) {
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
                    return [4 /*yield*/, core$1.scroll.first(skey, scroller, fetcher, aborter, params, true, true)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core$1, skey]);
    var scroll = React.useCallback(function (aborter) { return tslib.__awaiter(_this, void 0, void 0, function () {
        var scroller, fetcher, params;
        return tslib.__generator(this, function (_a) {
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
                    return [4 /*yield*/, core$1.scroll.scroll(skey, scroller, fetcher, aborter, params, true, true)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core$1, skey]);
    var suspend = React.useCallback(function () {
        if (typeof window === "undefined")
            throw new Error("Suspend on SSR");
        return (function () { return tslib.__awaiter(_this, void 0, void 0, function () {
            var scroller, fetcher, params, background;
            return tslib.__generator(this, function (_a) {
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
                        background = new Promise(function (ok) { return core$1.once(skey, function () { return ok(); }, params); });
                        return [4 /*yield*/, core$1.scroll.first(skey, scroller, fetcher, undefined, params, false, true)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, background];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [core$1, skey]);
    var state = stateRef.current;
    var _b = state !== null && state !== void 0 ? state : {}, data = _b.data, error = _b.error, time = _b.time, cooldown = _b.cooldown, expiration = _b.expiration, aborter = _b.aborter, optimistic = _b.optimistic, realData = _b.realData;
    var ready = state !== null;
    var loading = Boolean(aborter);
    return { key: key, skey: skey, data: data, error: error, time: time, cooldown: cooldown, expiration: expiration, aborter: aborter, optimistic: optimistic, realData: realData, loading: loading, ready: ready, mutate: mutate, fetch: fetch, refetch: refetch, scroll: scroll, clear: clear, suspend: suspend };
}

exports.useScrollQuery = useScrollQuery;
//# sourceMappingURL=scroll.js.map
