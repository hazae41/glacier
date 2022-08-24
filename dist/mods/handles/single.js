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
function useSingle(key, poster, cooldown = 1000) {
    const core = (0, comps_1.useCore)();
    const [state, setState] = (0, react_1.useState)(() => core.get(key));
    (0, react_1.useEffect)(() => {
        setState(core.get(key));
    }, [core, key]);
    (0, ortho_1.useOrtho)(core, key, setState);
    const mutate = (0, react_1.useCallback)((res) => {
        return core.mutate(key, res);
    }, [core, key]);
    const fetch = (0, react_1.useCallback)(async () => {
        return await core.single.fetch(key, poster, cooldown);
    }, [core, key, poster, cooldown]);
    const refetch = (0, react_1.useCallback)(async () => {
        return await core.single.fetch(key, poster);
    }, [core, key, poster]);
    const update = (0, react_1.useCallback)((data) => {
        return core.single.update(key, poster, data);
    }, [core, key, poster]);
    const clear = (0, react_1.useCallback)(() => {
        core.delete(key);
    }, [core, key]);
    const { data, error, time, loading = false } = state ?? {};
    return { key, data, error, time, loading, mutate, fetch, refetch, update, clear };
}
exports.useSingle = useSingle;
