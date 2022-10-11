import { __awaiter, __generator, __spreadArray, __read, __values } from 'tslib';
import { useRef, useEffect } from 'react';

function useIDBStorage(name) {
    var storage = useRef();
    if (storage.current === undefined)
        storage.current = new IDBStorage(name);
    useEffect(function () { return function () {
        var _a;
        (_a = storage.current) === null || _a === void 0 ? void 0 : _a.unmount();
    }; }, []);
    return storage.current;
}
var IDBStorage = /** @class */ (function () {
    function IDBStorage(name) {
        var _this = this;
        this.name = name;
        this.async = true;
        this.keys = new Set();
        if (typeof indexedDB === "undefined")
            return;
        this.initialization = this.load();
        this.onunload = function () { return _this.unload(); };
        addEventListener("beforeunload", this.onunload);
    }
    Object.defineProperty(IDBStorage.prototype, "database", {
        get: function () { return this._database; },
        enumerable: false,
        configurable: true
    });
    IDBStorage.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, item, keys;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        _a = this;
                        return [4 /*yield*/, new Promise(function (ok, err) {
                                var req = indexedDB.open(_this.name, 1);
                                req.onupgradeneeded = function () {
                                    return req.result.createObjectStore("keyval", {});
                                };
                                req.onblocked = function () { return err("blocked"); };
                                req.onsuccess = function () { return ok(req.result); };
                                req.onerror = function () { return err(req.error); };
                            })];
                    case 1:
                        _a._database = _b.sent();
                        if (typeof Storage === "undefined")
                            return [2 /*return*/];
                        item = localStorage.getItem("idb.".concat(this.name, ".keys"));
                        if (!item)
                            return [2 /*return*/];
                        keys = JSON.parse(item);
                        keys.forEach(function (key) { return _this.keys.add(key); });
                        localStorage.removeItem("idb.".concat(this.name, ".keys"));
                        return [4 /*yield*/, this.collect().catch(console.error)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IDBStorage.prototype.unmount = function () {
        if (typeof indexedDB === "undefined")
            return;
        if (this.onunload !== undefined)
            removeEventListener("beforeunload", this.onunload);
        this.collect().catch(console.error);
    };
    IDBStorage.prototype.unload = function () {
        if (typeof Storage === "undefined")
            return;
        var item = JSON.stringify(__spreadArray([], __read(this.keys), false));
        localStorage.setItem("idb.".concat(this.name, ".keys"), item);
    };
    IDBStorage.prototype.collect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, key, state, e_1_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = __values(this.keys), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        key = _b.value;
                        return [4 /*yield*/, this.get(key, true)];
                    case 3:
                        state = _d.sent();
                        if ((state === null || state === void 0 ? void 0 : state.expiration) === undefined)
                            return [3 /*break*/, 4];
                        if (state.expiration > Date.now())
                            return [3 /*break*/, 4];
                        this.delete(key, false);
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    IDBStorage.prototype.transact = function (callback, mode) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        if (!(this.database === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialization];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, new Promise(function (ok, err) {
                            if (_this.database === undefined)
                                throw new Error("Undefined database");
                            var tx = _this.database.transaction("keyval", mode);
                            tx.onerror = function () { return err(tx.error); };
                            tx.oncomplete = function () { return ok(result); };
                            var result;
                            callback(tx.objectStore("keyval"))
                                .then(function (x) { return result = x; })
                                .then(function () { return tx.commit(); })
                                .catch(err);
                        })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    IDBStorage.prototype.get = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        if (!ignore && !this.keys.has(key))
                            this.keys.add(key);
                        return [4 /*yield*/, this.transact(function (store) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (ok, err) {
                                                var req = store.get(key);
                                                req.onerror = function () { return err(req.error); };
                                                req.onsuccess = function () { return ok(req.result); };
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }, "readonly")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    IDBStorage.prototype.set = function (key, value, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        if (!ignore && !this.keys.has(key))
                            this.keys.add(key);
                        return [4 /*yield*/, this.transact(function (store) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (ok, err) {
                                                var req = store.put(value, key);
                                                req.onerror = function () { return err(req.error); };
                                                req.onsuccess = function () { return ok(); };
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }, "readwrite")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    IDBStorage.prototype.delete = function (key, ignore) {
        if (ignore === void 0) { ignore = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof indexedDB === "undefined")
                            return [2 /*return*/];
                        if (!ignore && this.keys.has(key))
                            this.keys.delete(key);
                        return [4 /*yield*/, this.transact(function (store) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (ok, err) {
                                                var req = store.delete(key);
                                                req.onerror = function () { return err(req.error); };
                                                req.onsuccess = function () { return ok(); };
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }, "readwrite")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return IDBStorage;
}());

export { IDBStorage, useIDBStorage };
