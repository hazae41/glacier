"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scroll = void 0;
const arrays_1 = require("../libs/arrays");
const core_1 = require("./core");
class Scroll {
    core;
    constructor(core) {
        this.core = core;
    }
    /**
     *
     * @param key Key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    async first(skey, scroller, fetcher, cooldown = core_1.DEFAULT_COOLDOWN, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (skey === undefined)
            return;
        const current = this.core.get(skey);
        if (current?.aborter)
            return current;
        if (this.core.cooldown(current, cooldown))
            return current;
        const pages = current?.data ?? [];
        const first = scroller(undefined);
        if (!first)
            return current;
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(skey, { aborter });
            const { data, expiration } = await fetcher(first, { signal });
            return this.core.equals(data, pages[0])
                ? this.core.mutate(skey, { expiration })
                : this.core.mutate(skey, { data: [data], expiration });
        }
        catch (error) {
            return this.core.mutate(skey, { error });
        }
        finally {
            clearTimeout(t);
        }
    }
    /**
     *
     * @param key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    async scroll(skey, scroller, fetcher, cooldown = core_1.DEFAULT_COOLDOWN, timeout = core_1.DEFAULT_TIMEOUT, aborter = new AbortController()) {
        if (skey === undefined)
            return;
        const current = this.core.get(skey);
        if (current?.aborter)
            return current;
        if (this.core.cooldown(current, cooldown))
            return current;
        const pages = current?.data ?? [];
        const last = scroller((0, arrays_1.lastOf)(pages));
        if (!last)
            return current;
        const t = setTimeout(() => {
            aborter.abort("Timed out");
        }, timeout);
        try {
            const { signal } = aborter;
            this.core.mutate(skey, { aborter });
            const { data } = await fetcher(last, { signal });
            return this.core.mutate(skey, { data: [...pages, data] });
        }
        catch (error) {
            return this.core.mutate(skey, { error });
        }
        finally {
            clearTimeout(t);
        }
    }
}
exports.Scroll = Scroll;
