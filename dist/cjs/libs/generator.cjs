'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

function returnOf(generator) {
    return tslib.__awaiter(this, void 0, void 0, function () {
        var next;
        return tslib.__generator(this, function (_a) {
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

exports.returnOf = returnOf;
