"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracer = void 0;
// https://docs.datadoghq.com/api/latest/tracing/
const graphite_cli_routes_1 = __importDefault(require("@withgraphite/graphite-cli-routes"));
const retyped_routes_1 = require("@withgraphite/retyped-routes");
const package_json_1 = require("../../../package.json");
const server_1 = require("../api/server");
const cute_string_1 = require("../utils/cute_string");
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
    end(err) {
        this.endedSpan = {
            error: err ? 1 : 0,
            meta: err
                ? {
                    ...this.meta,
                    err: (0, cute_string_1.cuteString)(err),
                }
                : this.meta,
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
            span.end(err);
            throw err;
        }
        span.end();
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
            span.end(err);
            throw err;
        }
        span.end();
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
    async flush() {
        if (process.env.NODE_ENV !== 'development') {
            await retyped_routes_1.request.requestWithArgs(server_1.API_SERVER, graphite_cli_routes_1.default.traces, {
                cliVersion: package_json_1.version,
                jsonTraces: this.flushJson(),
            });
        }
    }
}
exports.tracer = new Tracer();
//# sourceMappingURL=tracer.js.map