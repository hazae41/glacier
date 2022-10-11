import { jsonEquals } from './equals.js';

declare const DEFAULT_EQUALS: typeof jsonEquals;
declare const DEFAULT_SERIALIZER: JSON;
declare const DEFAULT_COOLDOWN: number;
declare const DEFAULT_EXPIRATION = -1;
declare const DEFAULT_TIMEOUT: number;

export { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT };
