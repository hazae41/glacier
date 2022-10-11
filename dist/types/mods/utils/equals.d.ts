declare type Equals = (a: unknown, b: unknown) => boolean;
declare function refEquals(a: unknown, b: unknown): boolean;
declare function jsonEquals(a: unknown, b: unknown): boolean;
declare function shallowEquals(a?: any, b?: any): boolean;

export { Equals, jsonEquals, refEquals, shallowEquals };
