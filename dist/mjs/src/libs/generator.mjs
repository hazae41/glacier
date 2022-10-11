import { __awaiter, __generator } from '../../node_modules/tslib/tslib.es6.mjs';

function returnOf(generator) {
    return __awaiter(this, void 0, void 0, function () {
        var next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generator.next()];
                case 1:
                    next = _a.sent();
                    if (next.done)
                        return [2 /*return*/, next.value];
                    return [2 /*return*/];
            }
        });
    });
}

export { returnOf };
