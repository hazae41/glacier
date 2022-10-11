import { __awaiter, __generator, __values } from 'tslib';
import { useRef, useEffect } from 'react';

/**
 * Asynchronous local storage
 *
 * Use for compatibility with SSR
 * Use for storing large objects
 *
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 *
 * @see SyncLocalStorage
 * @see useFallback
 */
function useAsyncLocalStorage(prefix, serializer) {
    var storage = useRef();
    if (storage.current === undefined)
        storage.current = new AsyncLocalStorage(prefix, serializer);
    useEffect(function () { return function () {
        var _a;
        (_a = storage.current) === null || _a === void 0 ? void 0 : _a.unmount();
    }; }, []);
    return storage.current;
}
/**
 * Asynchronous local storage
 *
 * Use for compatibility with SSR
 * Use for storing large objects
 *
 * Won't display data on first render or hydratation, you can either:
 * - use SyncLocalStorage
 * - use useFallback
 *
 * @see SyncLocalStorage
 * @see useFallback
 */
var AsyncLocalStorage = /** @class */ (function () {
    function AsyncLocalStorage(prefix, serializer) {
        if (prefix === void 0) { prefix = "xswr:"; }
        if (serializer === void 0) { serializer = JSON; }
        var _this = this;
        this.prefix = prefix;
        this.serializer = serializer;
        this.async = true;
        this.keys = new Set();
        if (typeof Storage === "undefined")
            return;
        this.onunload = function () { return _this.collect(); };
        addEventListener("beforeunload", this.onunload);
    }
    AsyncLocalStorage.prototype.unmount = function () {
        var _this = this;
        if (typeof Storage === "undefined")
            return;
        if (this.onunload)
            removeEventListener("beforeunload", this.onunload);
        (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.collect()];
        }); }); })().catch(console.error);
    };
    AsyncLocalStorage.prototype.collect = function () {
        var e_1, _a;
        if (typeof Storage === "undefined")
            return;
        try {
            for (var _b = __values(this.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var state = this.getSync(key, true);
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
    AsyncLocalStorage.prototype.getSync = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        if (typeof Storage === "undefined")
            return;
        if (!ignore && !this.keys.has(key))
            this.keys.add(key);
        var item = localStorage.getItem(this.prefix + key);
        if (item)
            return this.serializer.parse(item);
    };
    AsyncLocalStorage.prototype.get = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                if (!ignore && !this.keys.has(key))
                    this.keys.add(key);
                item = localStorage.getItem(this.prefix + key);
                if (item)
                    return [2 /*return*/, this.serializer.parse(item)];
                return [2 /*return*/];
            });
        });
    };
    AsyncLocalStorage.prototype.set = function (key, value, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                if (!ignore && !this.keys.has(key))
                    this.keys.add(key);
                item = this.serializer.stringify(value);
                localStorage.setItem(this.prefix + key, item);
                return [2 /*return*/];
            });
        });
    };
    AsyncLocalStorage.prototype.delete = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof Storage === "undefined")
                    return [2 /*return*/];
                if (!ignore && this.keys.has(key))
                    this.keys.delete(key);
                localStorage.removeItem(this.prefix + key);
                return [2 /*return*/];
            });
        });
    };
    return AsyncLocalStorage;
}());

export { AsyncLocalStorage, useAsyncLocalStorage };
//# sourceMappingURL=async.mjs.map
