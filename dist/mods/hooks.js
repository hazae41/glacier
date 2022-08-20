"use strict";
exports.__esModule = true;
exports.useInit = exports.useFallback = exports.useRetry = exports.useDebug = exports.useError = exports.useVisible = exports.useOnline = exports.useInterval = exports.useMount = exports.useOnce = exports.useFetch = void 0;
var react_1 = require("react");
var core_1 = require("../comps/core");
/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useFetch(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        fetch();
    }, [fetch]);
}
exports.useFetch = useFetch;
/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle
 * @example You want to get some data once and share it in multiple components
 */
function useOnce(handle) {
    var data = handle.data, fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        if (!data)
            fetch();
    }, [data, fetch]);
}
exports.useOnce = useOnce;
/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle
 */
function useMount(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        fetch();
    }, []);
}
exports.useMount = useMount;
/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle
 * @param options
 */
function useInterval(handle, interval) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        if (!interval)
            return;
        var i = setInterval(fetch, interval);
        return function () { return clearInterval(i); };
    }, [fetch, interval]);
}
exports.useInterval = useInterval;
/**
 * Do a request when the browser is online
 * @param handle
 */
function useOnline(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        addEventListener("online", fetch);
        return function () { return removeEventListener("online", fetch); };
    }, [fetch]);
}
exports.useOnline = useOnline;
/**
 * Do a request when the tab is visible
 * @param handle
 */
function useVisible(handle) {
    var fetch = handle.fetch;
    (0, react_1.useEffect)(function () {
        var f = function () { return !document.hidden && fetch(); };
        document.addEventListener("visibilitychange", f);
        return function () { return document.removeEventListener("visibilitychange", f); };
    }, [fetch]);
}
exports.useVisible = useVisible;
/**
 * Call a function on error
 * @param handle
 * @param callback
 */
function useError(handle, callback) {
    var error = handle.error;
    (0, react_1.useEffect)(function () {
        if (error)
            callback(error);
    }, [error, callback]);
}
exports.useError = useError;
/**
 * Show handle in console when it changes
 * @param handle
 */
function useDebug(handle, label) {
    var time = handle.time;
    (0, react_1.useEffect)(function () {
        console.debug(label, handle);
    }, [time]);
}
exports.useDebug = useDebug;
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
    var count = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        count.current = 0;
    }, [refetch, init, base, max]);
    (0, react_1.useEffect)(function () {
        if (!error) {
            count.current = 0;
            return;
        }
        if (count.current >= max)
            return;
        var ratio = Math.pow(base, count.current);
        var f = function () { count.current++; refetch(); };
        var t = setTimeout(f, init * ratio);
        return function () { return clearTimeout(t); };
    }, [error, time]);
}
exports.useRetry = useRetry;
/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @see useInit For filling the global cache with the data/error
 * @param handle
 * @param state
 */
function useFallback(handle, state) {
    var data = handle.data, error = handle.error;
    if (data || error)
        return;
    Object.assign(handle, state);
}
exports.useFallback = useFallback;
/**
 * Fill the global cache with data/error if there is no data/error yet
 * @example You got some data/error and want to save it in the cache
 * @warning Not needed for Next.js SSR/ISR since the props are already saved
 * @warning Will fill the cache AFTER the first render
 * @see useFallback for showing data on first render
 * @param handle
 * @param state
 */
function useInit(handle, state) {
    var key = handle.key, mutate = handle.mutate;
    var core = (0, react_1.useContext)(core_1.CoreContext);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!key || !state)
            return;
        if (core.has(key))
            return;
        (_a = state.time) !== null && _a !== void 0 ? _a : (state.time = 1);
        mutate(state);
    }, [key]);
}
exports.useInit = useInit;
