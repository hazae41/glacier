'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');

var AbortError = /** @class */ (function (_super) {
    tslib.__extends(AbortError, _super);
    function AbortError(signal) {
        return _super.call(this, "Aborted: ".concat(signal.reason), { cause: signal }) || this;
    }
    return AbortError;
}(Error));
function isAbortError(e) {
    if (e instanceof AbortError)
        return true;
    if (e instanceof DOMException && e.name === "AbortError")
        return true;
    return false;
}

exports.AbortError = AbortError;
exports.isAbortError = isAbortError;
