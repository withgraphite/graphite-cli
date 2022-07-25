"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracer = void 0;
// https://docs.datadoghq.com/api/latest/tracing/
const cute_string_1 = require("./cute_string");
const traceId = generateId();
function generateId() {
    return Math.ceil(Math.random() * 1000000000);
}
function notUndefined(value) {
    return value !== null && value !== undefined;
}
function currentNanoSeconds() {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}
class Span {
    name;
    parentId;
    resource;
    spanId;
    start;
    meta;
    endedSpan;
    constructor(opts) {
        this.name = opts.name;
        this.parentId = opts.parentId;
        this.resource = opts.resource;
        this.meta = opts.meta;
        this.spanId = generateId();
        this.start = currentNanoSeconds();
    }
    end(result, err) {
        this.endedSpan = {
            error: err ? 1 : 0,
            meta: {
                ...(typeof result === 'string' ? { result } : { ...result }),
                ...(err
                    ? {
                        'error.msg': err.message,
                        'error.type': err.constructor.name,
                        ...(err.stack ? { 'error.stack': err.stack } : {}),
                    }
                    : {}),
                ...this.meta,
            },
            metrics: {},
            name: this.name,
            resource: this.resource,
            service: 'graphite-cli',
            span_id: this.spanId,
            start: Math.round(this.start),
            trace_id: traceId,
            type: 'custom',
            duration: Math.round(currentNanoSeconds() - this.start),
            ...(this.parentId ? { parent_id: this.parentId } : { parent_id: 0 }),
        };
    }
}
class Tracer {
    currentSpanId;
    allSpans = [];
    startSpan(opts) {
        const span = new Span({
            ...opts,
            ...(this.currentSpanId ? { parentId: this.currentSpanId } : {}),
        });
        this.allSpans.push(span);
        return span;
    }
    spanSync(opts, handler) {
        const span = this.startSpan(opts);
        this.currentSpanId = span.spanId;
        let result;
        try {
            result = handler();
        }
        catch (err) {
            span.end(result, err);
            throw err;
        }
        span.end(result);
        this.currentSpanId = span.parentId;
        return result;
    }
    async span(opts, handler) {
        const span = this.startSpan(opts);
        this.currentSpanId = span.spanId;
        let result;
        try {
            result = await handler();
        }
        catch (err) {
            span.end(result, err);
            throw err;
        }
        span.end(result);
        this.currentSpanId = span.parentId;
        return result;
    }
    flushJson() {
        let trace = this.allSpans
            .map((s) => s.endedSpan)
            .filter(notUndefined);
        // Set the parent id to the command if any are unset
        const rootSpanId = trace.find((span) => span.name == 'command');
        if (rootSpanId) {
            trace = trace.map((s) => {
                return {
                    ...s,
                    ...(s.parent_id != undefined
                        ? { parent_id: s.parent_id }
                        : { parent_id: rootSpanId.span_id }),
                };
            });
        }
        const traces = [trace];
        this.allSpans = this.allSpans.filter((s) => !s.endedSpan);
        return (0, cute_string_1.cuteString)(traces);
    }
}
exports.tracer = new Tracer();
//# sourceMappingURL=tracer.js.map