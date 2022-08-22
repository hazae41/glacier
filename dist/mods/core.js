"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = void 0;
const arrays_1 = require("../libs/arrays");
const ortho_1 = require("../libs/ortho");
const equals_1 = require("./equals");
class Core extends ortho_1.Ortho {
    storage;
    equals;
    constructor(storage = new Map(), equals = equals_1.jsoneq) {
        super();
        this.storage = storage;
        this.equals = equals;
    }
    /**
     * Check if key exists from storage
     * @param key Key
     * @returns boolean
     */
    has(key) {
        if (!key)
            return false;
        return this.storage.has(key);
    }
    /**
     * Grab current state from storage
     * @param key Key
     * @returns Current state
     */
    get(key) {
        if (!key)
            return;
        return this.storage.get(key);
    }
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    set(key, state) {
        if (!key)
            return;
        this.storage.set(key, state);
        this.publish(key, state);
    }
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    delete(key) {
        if (!key)
            return;
        this.storage.delete(key);
        this.publish(key, undefined);
    }
    /**
     * Merge a new state with the old state
     * - Will check if the new time is after the old time
     * - Will check if it changed using this.equals
     * @param key
     * @param state
     * @returns
     */
    mutate(key, state) {
        if (!key)
            return;
        const current = this.get(key);
        if (state.time === undefined)
            state.time = Date.now();
        if (current?.time !== undefined && state.time < current.time)
            return current;
        const next = { ...current, ...state };
        if (this.equals(state.data, current?.data))
            next.data = current?.data;
        if (this.equals(state.error, current?.error))
            next.error = current?.error;
        if (state.data !== undefined)
            delete next.error;
        if (!state.loading)
            delete next.loading;
        if (this.equals(current, next))
            return current;
        this.set(key, next);
        return next;
    }
    /**
     * True if we should cooldown this resource
     */
    cooldown(current, cooldown) {
        if (cooldown === undefined)
            return false;
        if (current?.time === undefined)
            return false;
        if (Date.now() - current.time < cooldown)
            return true;
        return false;
    }
    /**
     * Simple fetch
     * @param key
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    async fetch(key, fetcher, cooldown) {
        if (!key)
            return;
        const current = this.get(key);
        if (current?.loading)
            return current;
        if (this.cooldown(current, cooldown))
            return current;
        try {
            this.mutate(key, { loading: true });
            const data = await fetcher(key);
            return this.mutate(key, { data });
        }
        catch (error) {
            return this.mutate(key, { error });
        }
    }
    /**
     *
     * @param key Key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    async first(key, scroller, fetcher, cooldown) {
        if (!key)
            return;
        const current = this.get(key);
        if (current?.loading)
            return current;
        if (this.cooldown(current, cooldown))
            return current;
        const pages = current?.data ?? [];
        const first = scroller(undefined);
        if (!first)
            return current;
        try {
            this.mutate(key, { loading: true });
            const page = await fetcher(first);
            if (this.equals(page, pages[0]))
                return this.mutate(key, { data: pages });
            else
                return this.mutate(key, { data: [page] });
        }
        catch (error) {
            return this.mutate(key, { error });
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
    async scroll(key, scroller, fetcher, cooldown) {
        if (!key)
            return;
        const current = this.get(key);
        if (current?.loading)
            return current;
        if (this.cooldown(current, cooldown))
            return current;
        const pages = current?.data ?? [];
        const last = scroller((0, arrays_1.lastOf)(pages));
        if (!last)
            return current;
        try {
            this.mutate(key, { loading: true });
            const data = [...pages, await fetcher(last)];
            return this.mutate(key, { data });
        }
        catch (error) {
            return this.mutate(key, { error });
        }
    }
}
exports.Core = Core;
