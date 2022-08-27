export interface TimeParams {
    cooldown?: number;
    expiration?: number;
    timeout?: number;
}
export declare function getTimeFromDelay(delay: number): number;
