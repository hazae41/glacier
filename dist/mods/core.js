"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = exports.isAbortError = exports.DEFAULT_TIMEOUT = exports.DEFAULT_COOLDOWN = void 0;
const ortho_1 = require("../libs/ortho");
const equals_1 = require("./equals");
const scroll_1 = require("./scroll");
const single_1 = require("./single");
exports.DEFAULT_COOLDOWN = 1 * 1000;
exports.DEFAULT_TIMEOUT = 5 * 1000;
function isAbortError(e) {
    return e instanceof DOMException && e.name === "AbortError";
}
exports.isAbortError = isAbortError;
class Core extends ortho_1.Ortho {
    storage;
    equals;
    single = new single_1.Single(this);
    scroll = new scroll_1.Scroll(this);
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
        if (state.aborter === undefined)
            delete next.aborter;
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
    counts = new Map();
    timeouts = new Map();
    subscribe(key, listener) {
        if (!key)
            return;
        super.subscribe(key, listener);
        const count = this.counts.get(key) ?? 0;
        this.counts.set(key, count + 1);
        const timeout = this.timeouts.get(key);
        if (timeout === undefined)
            return;
        clearTimeout(timeout);
        this.timeouts.delete(key);
    }
    unsubscribe(key, listener) {
        if (!key)
            return;
        super.unsubscribe(key, listener);
        const count = this.counts.get(key);
        if (count > 1) {
            this.counts.set(key, count - 1);
            return;
        }
        this.counts.delete(key);
        const { expiration } = this.get(key) ?? {};
        if (expiration === undefined)
            return;
        const erase = () => {
            this.timeouts.delete(key);
            this.delete(key);
        };
        if (Date.now() > expiration) {
            erase();
            return;
        }
        const delay = expiration - Date.now();
        const timeout = setTimeout(erase, delay);
        this.timeouts.set(key, timeout);
    }
}
exports.Core = Core;
