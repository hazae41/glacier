"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Single = void 0;
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
    async fetch(key, fetcher, cooldown) {
        if (!key)
            return;
        const current = this.core.get(key);
        if (current?.loading)
            return current;
        if (this.core.cooldown(current, cooldown))
            return current;
        try {
            this.core.mutate(key, { loading: true });
            const data = await fetcher(key);
            return this.core.mutate(key, { data });
        }
        catch (error) {
            return this.core.mutate(key, { error });
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
    async update(key, poster, data) {
        if (!key)
            return;
        const current = this.core.get(key);
        try {
            this.core.mutate(key, { data, time: current.time });
            const updated = await poster(key, data);
            return this.core.mutate(key, { data: updated });
        }
        catch (error) {
            this.core.mutate(key, current);
            throw error;
        }
    }
}
exports.Single = Single;
