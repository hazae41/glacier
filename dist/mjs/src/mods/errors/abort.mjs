import { __extends } from '../../../node_modules/tslib/tslib.es6.mjs';

var AbortError = /** @class */ (function (_super) {
    __extends(AbortError, _super);
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

export { AbortError, isAbortError };
