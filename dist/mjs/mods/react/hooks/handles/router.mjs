import { __spreadArray, __read } from 'tslib';
import { ScrollSchema } from '../../../scroll/schema.mjs';
import { SingleSchema } from '../../../single/schema.mjs';
import { useMemo } from 'react';
import { useScroll } from './scroll.mjs';
import { useSingle } from './single.mjs';

function use(factory, deps) {
    var schema = useMemo(function () {
        return factory.apply(void 0, __spreadArray([], __read(deps), false));
    }, deps);
    if (schema instanceof SingleSchema) {
        var key = schema.key, fetcher = schema.fetcher, params = schema.params;
        return useSingle(key, fetcher, params);
    }
    if (schema instanceof ScrollSchema) {
        var scroller = schema.scroller, fetcher = schema.fetcher, params = schema.params;
        return useScroll(scroller, fetcher, params);
    }
    throw new Error("Invalid resource schema");
}

export { use };
//# sourceMappingURL=router.mjs.map
