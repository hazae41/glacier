import { __awaiter, __generator, __values } from 'tslib';
import { useRef, useEffect } from 'react';

/**
 * Synchronous local storage
 *
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 *
 * Will display data on first render
 *
 * @see AsyncLocalStorage
 */
function useSyncLocalStorage(prefix, serializer) {
    var storage = useRef();
    if (!storage.current)
        storage.current = new SyncLocalStorage(prefix, serializer);
    useEffect(function () { return function () {
        var _a;
        (_a = storage.current) === null || _a === void 0 ? void 0 : _a.unmount();
    }; }, []);
    return storage.current;
}
/**
 * Synchronous local storage
 *
 * Do NOT use with SSR, it will create hydratation errors
 * Do NOT use for storing large objects, it will harm performances
 *
 * Will display data on first render
 *
 * @see AsyncLocalStorage
 */
var SyncLocalStorage = /** @class */ (function () {
    function SyncLocalStorage(prefix, serializer) {
        if (prefix === void 0) { prefix = "xswr:"; }
        if (serializer === void 0) { serializer = JSON; }
        var _this = this;
        this.prefix = prefix;
        this.serializer = serializer;
        this.async = false;
        this.keys = new Set();
        if (typeof Storage === "undefined")
            return;
        this.onunload = function () { return _this.collect(); };
        addEventListener("beforeunload", this.onunload);
    }
    SyncLocalStorage.prototype.unmount = function () {
        var _this = this;
        if (typeof Storage === "undefined")
            return;
        removeEventListener("beforeunload", this.onunload);
        (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.collect()];
        }); }); })().catch(console.error);
    };
    SyncLocalStorage.prototype.collect = function () {
        var e_1, _a;
        if (typeof Storage === "undefined")
            return;
        try {
            for (var _b = __values(this.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var state = this.get(key, true);
                if ((state === null || state === void 0 ? void 0 : state.expiration) === undefined)
                    continue;
                if (state.expiration > Date.now())
                    continue;
                this.delete(key, false);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    SyncLocalStorage.prototype.get = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        if (typeof Storage === "undefined")
            return;
        if (!ignore && !this.keys.has(key))
            this.keys.add(key);
        var item = localStorage.getItem(this.prefix + key);
        if (item)
            return this.serializer.parse(item);
    };
    SyncLocalStorage.prototype.set = function (key, value, ignore) {
        if (ignore === void 0) { ignore = false; }
        if (typeof Storage === "undefined")
            return;
        if (!ignore && !this.keys.has(key))
            this.keys.add(key);
        var item = this.serializer.stringify(value);
        localStorage.setItem(this.prefix + key, item);
    };
    SyncLocalStorage.prototype.delete = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        if (typeof Storage === "undefined")
            return;
        if (!ignore && this.keys.has(key))
            this.keys.delete(key);
        localStorage.removeItem(this.prefix + key);
    };
    return SyncLocalStorage;
}());

export { SyncLocalStorage, useSyncLocalStorage };
//# sourceMappingURL=sync.js.map
