import * as index from './mods/index.js';
export { index as XSWR };
export { Core } from './mods/core.js';
export { AbortError, isAbortError } from './mods/errors/abort.js';
export { CoreContext, CoreProvider, useCore, useCoreProvider } from './mods/react/contexts/core.js';
export { useDebug } from './mods/react/hooks/blocks/use-debug.js';
export { useError } from './mods/react/hooks/blocks/use-error.js';
export { useFallback } from './mods/react/hooks/blocks/use-fallback.js';
export { useFetch } from './mods/react/hooks/blocks/use-fetch.js';
export { useInterval } from './mods/react/hooks/blocks/use-interval.js';
export { useMount } from './mods/react/hooks/blocks/use-mount.js';
export { useOnce } from './mods/react/hooks/blocks/use-once.js';
export { useOnline } from './mods/react/hooks/blocks/use-online.js';
export { useRetry } from './mods/react/hooks/blocks/use-retry.js';
export { useVisible } from './mods/react/hooks/blocks/use-visible.js';
export { useQuery } from './mods/react/hooks/queries/router.js';
export { useScrollQuery } from './mods/react/hooks/queries/scroll.js';
export { useSingleQuery } from './mods/react/hooks/queries/single.js';
export { useXSWR } from './mods/react/hooks/xswr.js';
export { ScrollHelper } from './mods/scroll/helper.js';
export { ScrollInstance, getScrollStorageKey } from './mods/scroll/instance.js';
export { ScrollSchema, getScrollSchema } from './mods/scroll/schema.js';
export { SingleHelper } from './mods/single/helper.js';
export { SingleInstance, getSingleStorageKey } from './mods/single/instance.js';
export { SingleSchema, getSingleSchema } from './mods/single/schema.js';
export { IDBStorage, useIDBStorage } from './mods/storages/idb/async.js';
export { AsyncLocalStorage, useAsyncLocalStorage } from './mods/storages/localStorage/async.js';
export { SyncLocalStorage, useSyncLocalStorage } from './mods/storages/localStorage/sync.js';
export { isAsyncStorage } from './mods/types/storage.js';
export { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT } from './mods/utils/defaults.js';
export { jsonEquals, refEquals, shallowEquals } from './mods/utils/equals.js';
//# sourceMappingURL=index.js.map
