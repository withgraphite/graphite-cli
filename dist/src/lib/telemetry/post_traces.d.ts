#!/usr/bin/env node
declare type oldTelemetryT = {
    canonicalCommandName: string;
    commandName: string;
    durationMiliSeconds: number;
    err?: {
        errName: string;
        errMessage: string;
        errStack: string;
    };
};
export declare function postTelemetryInBackground(oldDetails: oldTelemetryT): void;
export {};
