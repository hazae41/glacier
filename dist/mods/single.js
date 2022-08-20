"use strict";
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
exports.__esModule = true;
exports.useSingle = void 0;
var react_1 = require("react");
var core_1 = require("../comps/core");
var ortho_1 = require("./ortho");
/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
function useSingle(key, fetcher, cooldown) {
    var _this = this;
    if (cooldown === void 0) { cooldown = 1000; }
    var core = (0, core_1.useCore)();
    var _a = (0, react_1.useState)(function () { return core.get(key); }), state = _a[0], setState = _a[1];
    (0, react_1.useEffect)(function () {
        setState(core.get(key));
    }, [key]);
    (0, ortho_1.useOrtho)(core, key, setState);
    var mutate = (0, react_1.useCallback)(function (res) {
        return core.mutate(key, res);
    }, [core, key]);
    var fetch = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.fetch(key, fetcher, cooldown)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, key, fetcher, cooldown]);
    var refetch = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core.fetch(key, fetcher)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); }, [core, key, fetcher]);
    var clear = (0, react_1.useCallback)(function () {
        core["delete"](key);
    }, [core, key]);
    var _b = state !== null && state !== void 0 ? state : {}, data = _b.data, error = _b.error, time = _b.time, _c = _b.loading, loading = _c === void 0 ? false : _c;
    return { key: key, data: data, error: error, time: time, loading: loading, mutate: mutate, fetch: fetch, refetch: refetch, clear: clear };
}
exports.useSingle = useSingle;
