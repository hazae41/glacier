"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Single = void 0;
const core_1 = require("./core");
class Single {
    core;
    constructor(core) {
        this.core = core;
    }
    /**
     * Simple fetch
     * @param key
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns state
     */
    async fetch(key, skey, fetcher, cooldown = core_1.DEFAULT_COOLDOWN, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (key === undefined)
            return;
        if (skey === undefined)
            return;
        const current = this.core.get(skey);
        if (current?.aborter)
            return current;
        if (this.core.cooldown(current, cooldown))
            return current;
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(skey, { aborter });
            const { data, expiration } = await fetcher(key, { signal });
            return this.core.mutate(skey, { data, expiration });
        }
        catch (error) {
            return this.core.mutate(skey, { error });
        }
        finally {
            clearTimeout(t);
        }
    }
    /**
     * Optimistic update
     * @param key
     * @param fetcher
     * @param data optimistic data, also passed to poster
     * @throws error
     * @returns updated state
     */
    async update(key, skey, poster, updater, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (key === undefined)
            return;
        if (skey === undefined)
            return;
        const current = this.core.get(skey);
        const updated = updater(current.data);
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(skey, { data: updated, time: current.time });
            const { data, expiration } = await poster(key, { data: updated, signal });
            return this.core.mutate(skey, { data, expiration });
        }
        catch (error) {
            this.core.mutate(skey, current);
            throw error;
        }
        finally {
            clearTimeout(t);
        }
    }
}
exports.Single = Single;
