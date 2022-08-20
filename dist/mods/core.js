"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Core = void 0;
var arrays_1 = require("../libs/arrays");
var jsoneq_1 = require("../libs/jsoneq");
var ortho_1 = require("./ortho");
var Core = /** @class */ (function (_super) {
    __extends(Core, _super);
    function Core(storage, equals) {
        if (storage === void 0) { storage = new Map(); }
        if (equals === void 0) { equals = jsoneq_1.jsoneq; }
        var _this = _super.call(this) || this;
        _this.storage = storage;
        _this.equals = equals;
        return _this;
    }
    /**
     * Check if key exists from storage
     * @param key Key
     * @returns boolean
     */
    Core.prototype.has = function (key) {
        if (!key)
            return false;
        return this.storage.has(key);
    };
    /**
     * Grab current state from storage
     * @param key Key
     * @returns Current state
     */
    Core.prototype.get = function (key) {
        if (!key)
            return;
        return this.storage.get(key);
    };
    /**
     * Force set a key to a state and publish it
     * No check, no merge
     * @param key Key
     * @param state New state
     * @returns
     */
    Core.prototype.set = function (key, state) {
        if (!key)
            return;
        this.storage.set(key, state);
        this.publish(key, state);
    };
    /**
     * Delete key and publish undefined
     * @param key
     * @returns
     */
    Core.prototype["delete"] = function (key) {
        if (!key)
            return;
        this.storage["delete"](key);
        this.publish(key, undefined);
    };
    /**
     * Merge a new state with the old state
     * - Will check if the new time is after the old time
     * - Will check if it changed using this.equals
     * @param key
     * @param state
     * @returns
     */
    Core.prototype.mutate = function (key, state) {
        if (!key)
            return;
        var current = this.get(key);
        if (!state.time)
            state.time = Date.now();
        if ((current === null || current === void 0 ? void 0 : current.time) && state.time < current.time)
            return current;
        var next = __assign(__assign({}, current), state);
        if (this.equals(state.data, current === null || current === void 0 ? void 0 : current.data))
            next.data = current === null || current === void 0 ? void 0 : current.data;
        if (this.equals(state.error, current === null || current === void 0 ? void 0 : current.error))
            next.error = current === null || current === void 0 ? void 0 : current.error;
        if (state.data)
            delete next.error;
        if (!state.loading)
            delete next.loading;
        if (this.equals(current, next))
            return current;
        this.set(key, next);
        return next;
    };
    /**
     * True if we should cooldown this resource
     */
    Core.prototype.cooldown = function (current, cooldown) {
        if (!cooldown || !(current === null || current === void 0 ? void 0 : current.time))
            return false;
        if (Date.now() - current.time < cooldown)
            return true;
        return false;
    };
    /**
     * Simple fetch
     * @param key
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    Core.prototype.fetch = function (key, fetcher, cooldown) {
        return __awaiter(this, void 0, void 0, function () {
            var current, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        current = this.get(key);
                        if (current === null || current === void 0 ? void 0 : current.loading)
                            return [2 /*return*/, current];
                        if (this.cooldown(current, cooldown))
                            return [2 /*return*/, current];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.mutate(key, { loading: true });
                        return [4 /*yield*/, fetcher(key)];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, this.mutate(key, { data: data })];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.mutate(key, { error: error_1 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param key Key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    Core.prototype.first = function (key, scroller, fetcher, cooldown) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var current, pages, first, page, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        current = this.get(key);
                        if (current === null || current === void 0 ? void 0 : current.loading)
                            return [2 /*return*/, current];
                        if (this.cooldown(current, cooldown))
                            return [2 /*return*/, current];
                        pages = (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [];
                        first = scroller(undefined);
                        if (!first)
                            return [2 /*return*/, current];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        this.mutate(key, { loading: true });
                        return [4 /*yield*/, fetcher(first)];
                    case 2:
                        page = _b.sent();
                        if (this.equals(page, pages[0]))
                            return [2 /*return*/, this.mutate(key, { data: pages })];
                        else
                            return [2 /*return*/, this.mutate(key, { data: [page] })];
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        return [2 /*return*/, this.mutate(key, { error: error_2 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param key
     * @param scroller We don't care if it's not memoized
     * @param fetcher We don't care if it's not memoized
     * @param cooldown
     * @returns
     */
    Core.prototype.scroll = function (key, scroller, fetcher, cooldown) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var current, pages, last, data, _b, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!key)
                            return [2 /*return*/];
                        current = this.get(key);
                        if (current === null || current === void 0 ? void 0 : current.loading)
                            return [2 /*return*/, current];
                        if (this.cooldown(current, cooldown))
                            return [2 /*return*/, current];
                        pages = (_a = current === null || current === void 0 ? void 0 : current.data) !== null && _a !== void 0 ? _a : [];
                        last = scroller((0, arrays_1.lastOf)(pages));
                        if (!last)
                            return [2 /*return*/, current];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        this.mutate(key, { loading: true });
                        _b = [__spreadArray([], pages, true)];
                        return [4 /*yield*/, fetcher(last)];
                    case 2:
                        data = __spreadArray.apply(void 0, _b.concat([[_c.sent()], false]));
                        return [2 /*return*/, this.mutate(key, { data: data })];
                    case 3:
                        error_3 = _c.sent();
                        return [2 /*return*/, this.mutate(key, { error: error_3 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Core;
}(ortho_1.Ortho));
exports.Core = Core;
