declare type spanNameT = 'function' | 'execSync' | 'command';
declare type spanT = {
    duration: number;
    error: number;
    meta?: Record<string, string>;
    metrics: Record<string, number>;
    name: spanNameT;
    parent_id?: number;
    resource: string;
    service: 'graphite-cli';
    span_id: number;
    start: number;
    trace_id: number;
    type: 'custom';
};
export declare class Span {
    name: spanNameT;
    parentId?: number;
    resource: string;
    spanId: number;
    start: number;
    meta?: Record<string, string>;
    endedSpan: spanT | undefined;
    constructor(opts: {
        resource: string;
        name: spanNameT;
        parentId?: number;
        meta?: Record<string, string>;
    });
    end(err?: Error): void;
}
declare class Tracer {
    currentSpanId: number | undefined;
    allSpans: Span[];
    startSpan(opts: {
        resource: string;
        name: spanNameT;
        meta?: Record<string, string>;
    }): Span;
    spanSync<T>(opts: {
        resource: string;
        name: spanNameT;
        meta?: Record<string, string>;
    }, handler: () => T): T;
    span<T>(opts: {
        resource: string;
        name: spanNameT;
        meta?: Record<string, string>;
    }, handler: () => Promise<T>): Promise<T>;
    flushJson(): string;
    flush(): Promise<void>;
}
export declare const globalTracer: Tracer;
export {};
