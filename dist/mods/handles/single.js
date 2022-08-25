"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSingle = void 0;
const react_1 = require("react");
const comps_1 = require("../../comps");
const ortho_1 = require("../../libs/ortho");
/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
function useSingle(key, poster, cooldown, timeout) {
    const core = (0, comps_1.useCore)();
    const skey = (0, react_1.useMemo)(() => {
        if (key === undefined)
            return;
        return JSON.stringify(key);
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
        return await core.single.fetch(key, skey, poster, cooldown, timeout, aborter);
    }, [core, skey, poster, cooldown]);
    const refetch = (0, react_1.useCallback)(async (aborter) => {
        return await core.single.fetch(key, skey, poster, 0, timeout, aborter);
    }, [core, skey, poster]);
    const update = (0, react_1.useCallback)((updater, aborter) => {
        return core.single.update(key, skey, poster, updater, timeout, aborter);
    }, [core, skey, poster]);
    const clear = (0, react_1.useCallback)(() => {
        core.delete(skey);
    }, [core, skey]);
    const { data, error, time, aborter, expiration } = state ?? {};
    const loading = Boolean(aborter);
    return { key, skey, data, error, time, aborter, loading, expiration, mutate, fetch, refetch, update, clear };
}
exports.useSingle = useSingle;
