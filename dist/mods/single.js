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
    async fetch(key, fetcher, cooldown = core_1.DEFAULT_COOLDOWN, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (!key)
            return;
        const current = this.core.get(key);
        if (current?.aborter)
            return current;
        if (this.core.cooldown(current, cooldown))
            return current;
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(key, { aborter });
            const data = await fetcher(key, { signal });
            return this.core.mutate(key, { data });
        }
        catch (error) {
            return this.core.mutate(key, { error });
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
    async update(key, poster, updater, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (!key)
            return;
        const current = this.core.get(key);
        const data = updater(current.data);
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(key, { data, time: current.time });
            const updated = await poster(key, { data, signal });
            return this.core.mutate(key, { data: updated });
        }
        catch (error) {
            this.core.mutate(key, current);
            throw error;
        }
        finally {
            clearTimeout(t);
        }
    }
}
exports.Single = Single;
