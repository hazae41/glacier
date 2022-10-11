import { useCore } from '../contexts/core.mjs';
import { useCallback } from 'react';

function useXSWR() {
    var core = useCore();
    var make = useCallback(function (schema) {
        return schema.make(core);
    }, [core]);
    return { core: core, make: make };
}

export { useXSWR };
