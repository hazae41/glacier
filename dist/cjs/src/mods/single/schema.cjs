'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_es6 = require('../../../node_modules/tslib/tslib.es6.cjs');
var object = require('./object.cjs');

function single(key, fetcher, params) {
    if (params === void 0) { params = {}; }
    return new SingleSchema(key, fetcher, params);
}
var SingleSchema = /** @class */ (function () {
    function SingleSchema(key, fetcher, params) {
        if (params === void 0) { params = {}; }
        this.key = key;
        this.fetcher = fetcher;
        this.params = params;
    }
    SingleSchema.prototype.make = function (core) {
        var _a = this, key = _a.key, fetcher = _a.fetcher, params = _a.params;
        return new object.SingleObject(core, key, fetcher, params);
    };
    SingleSchema.prototype.normalize = function (data, more) {
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var _a, time, cooldown, expiration, optimistic, state;
            return tslib_es6.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (more.shallow)
                            return [2 /*return*/];
                        _a = more.root, time = _a.time, cooldown = _a.cooldown, expiration = _a.expiration, optimistic = _a.optimistic;
                        state = { data: data, time: time, cooldown: cooldown, expiration: expiration, optimistic: optimistic };
                        return [4 /*yield*/, this.make(more.core).mutate(function () { return state; })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SingleSchema;
}());

exports.SingleSchema = SingleSchema;
exports.single = single;
