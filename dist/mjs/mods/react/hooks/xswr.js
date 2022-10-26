import { useCore } from '../contexts/core.js';
import { useCallback } from 'react';

function useXSWR() {
    var core = useCore();
    var make = useCallback(function (schema) {
        return schema.make(core);
    }, [core]);
    return { core: core, make: make };
}

export { useXSWR };
//# sourceMappingURL=xswr.js.map
