export interface Result<D = any, E = any> {
    data?: D;
    error?: E;
    cooldown?: number;
    expiration?: number;
}
