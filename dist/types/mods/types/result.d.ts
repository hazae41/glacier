export interface Result<D = any, E = any, K = any> {
    data?: D;
    error?: E;
    time?: number;
    cooldown?: number;
    expiration?: number;
}
