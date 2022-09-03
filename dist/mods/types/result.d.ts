export interface Result<D = any, E = any> {
    data?: D;
    error?: E;
    time?: number;
    cooldown?: number;
    expiration?: number;
}
