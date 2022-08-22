"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScroll = void 0;
const comps_1 = require("../../comps");
const ortho_1 = require("../../libs/ortho");
const react_1 = require("react");
/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
function useScroll(scroller, fetcher, cooldown = 1000) {
    const core = (0, comps_1.useCore)();
    const key = (0, react_1.useMemo)(() => {
        return "scroll:" + scroller();
    }, [scroller]);
    const [state, setState] = (0, react_1.useState)(() => core.get(key));
    (0, react_1.useEffect)(() => {
        setState(core.get(key));
    }, [key]);
    (0, ortho_1.useOrtho)(core, key, setState);
    const mutate = (0, react_1.useCallback)((res) => {
        return core.mutate(key, res);
    }, [core, key]);
    const fetch = (0, react_1.useCallback)(async () => {
        return await core.first(key, scroller, fetcher, cooldown);
    }, [core, key, scroller, fetcher, cooldown]);
    const refetch = (0, react_1.useCallback)(async () => {
        return await core.first(key, scroller, fetcher);
    }, [core, key, scroller, fetcher]);
    const scroll = (0, react_1.useCallback)(async () => {
        return await core.scroll(key, scroller, fetcher);
    }, [core, key, scroller, fetcher]);
    const clear = (0, react_1.useCallback)(() => {
        core.delete(key);
    }, [core, key]);
    const { data, error, time, loading = false } = state ?? {};
    return { key, data, error, time, loading, mutate, fetch, refetch, scroll, clear };
}
exports.useScroll = useScroll;
