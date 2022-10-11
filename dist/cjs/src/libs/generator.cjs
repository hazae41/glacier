'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../node_modules/tslib/tslib.es6.cjs');

function returnOf(generator) {
    return tslib_es6.__awaiter(this, void 0, void 0, function () {
        var next;
        return tslib_es6.__generator(this, function (_a) {
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
