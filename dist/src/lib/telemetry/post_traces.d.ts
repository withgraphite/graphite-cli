#!/usr/bin/env node
export declare const SHOULD_REPORT_TELEMETRY: boolean;
declare type oldTelemetryT = {
    canonicalCommandName: string;
    commandName: string;
    durationMiliSeconds: number;
    err?: Error;
};
export declare function postTelemetryInBackground(oldDetails: oldTelemetryT): void;
export {};
