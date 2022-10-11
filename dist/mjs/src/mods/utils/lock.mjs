import { __awaiter, __generator } from '../../../node_modules/tslib/tslib.es6.mjs';

var Lock = /** @class */ (function () {
    function Lock() {
    }
    Lock.prototype.lock = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mutex) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.mutex];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        promise = callback();
                        this.mutex = promise;
                        return [4 /*yield*/, promise];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Lock;
}());

export { Lock };
