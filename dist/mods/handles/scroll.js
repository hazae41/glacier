"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScroll = void 0;
const react_1 = require("react");
const comps_1 = require("../../comps");
const ortho_1 = require("../../libs/ortho");
/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
function useScroll(scroller, fetcher, cooldown, timeout) {
    const core = (0, comps_1.useCore)();
    const key = (0, react_1.useMemo)(() => {
        return scroller();
    }, [scroller]);
    const skey = (0, react_1.useMemo)(() => {
        if (key === undefined)
            return;
        return "scroll:" + JSON.stringify(key);
    }, [key]);
    const [state, setState] = (0, react_1.useState)(() => core.get(skey));
    (0, react_1.useEffect)(() => {
        setState(core.get(skey));
    }, [core, skey]);
    (0, ortho_1.useOrtho)(core, skey, setState);
    const mutate = (0, react_1.useCallback)((res) => {
        return core.mutate(skey, res);
    }, [core, skey]);
    const fetch = (0, react_1.useCallback)(async (aborter) => {
        return await core.scroll.first(skey, scroller, fetcher, cooldown, timeout, aborter);
    }, [core, skey, scroller, fetcher, cooldown]);
    const refetch = (0, react_1.useCallback)(async (aborter) => {
        return await core.scroll.first(skey, scroller, fetcher, 0, timeout, aborter);
    }, [core, skey, scroller, fetcher]);
    const scroll = (0, react_1.useCallback)(async (aborter) => {
        return await core.scroll.scroll(skey, scroller, fetcher, 0, timeout, aborter);
    }, [core, skey, scroller, fetcher]);
    const clear = (0, react_1.useCallback)(() => {
        core.delete(skey);
    }, [core, skey]);
    const { data, error, time, aborter, expiration } = state ?? {};
    const loading = Boolean(aborter);
    return { key, skey, data, error, time, aborter, loading, expiration, mutate, fetch, refetch, scroll, clear };
}
exports.useScroll = useScroll;
