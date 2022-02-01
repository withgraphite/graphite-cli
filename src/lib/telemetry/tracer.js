"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Span = void 0;
// https://docs.datadoghq.com/api/latest/tracing/
var retyped_routes_1 = require("@screenplaydev/retyped-routes");
var graphite_cli_routes_1 = require("graphite-cli-routes");
var package_json_1 = require("../../../package.json");
var api_1 = require("../api");
var traceId = generateId();
function generateId() {
    return Math.ceil(Math.random() * 1000000000);
}
function notUndefined(value) {
    return value !== null && value !== undefined;
}
function currentNanoSeconds() {
    var hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}
var Span = /** @class */ (function () {
    function Span(opts) {
        this.name = opts.name;
        this.parentId = opts.parentId;
        this.resource = opts.resource;
        this.meta = opts.meta;
        this.spanId = generateId();
        this.start = currentNanoSeconds();
    }
    Span.prototype.end = function (err) {
        this.endedSpan = __assign({ error: err ? 1 : 0, meta: err
                ? __assign(__assign({ 'error.msg': err.message, 'error.type': err.constructor.name }, (err.stack ? { 'error.stack': err.stack } : {})), this.meta) : this.meta, metrics: {}, name: this.name, resource: this.resource, service: 'graphite-cli', span_id: this.spanId, start: Math.round(this.start), trace_id: traceId, type: 'custom', duration: Math.round(currentNanoSeconds() - this.start) }, (this.parentId ? { parent_id: this.parentId } : { parent_id: 0 }));
    };
    return Span;
}());
exports.Span = Span;
var Tracer = /** @class */ (function () {
    function Tracer() {
        this.allSpans = [];
    }
    Tracer.prototype.startSpan = function (opts) {
        var span = new Span(__assign(__assign({}, opts), (this.currentSpanId ? { parentId: this.currentSpanId } : {})));
        this.allSpans.push(span);
        return span;
    };
    Tracer.prototype.spanSync = function (opts, handler) {
        var span = this.startSpan(opts);
        this.currentSpanId = span.spanId;
        var result;
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
    };
    Tracer.prototype.span = function (opts, handler) {
        return __awaiter(this, void 0, void 0, function () {
            var span, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = this.startSpan(opts);
                        this.currentSpanId = span.spanId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, handler()];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        span.end(err_1);
                        throw err_1;
                    case 4:
                        span.end();
                        this.currentSpanId = span.parentId;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Tracer.prototype.flushJson = function () {
        var trace = this.allSpans
            .map(function (s) { return s.endedSpan; })
            .filter(notUndefined);
        // Set the parent id to the command if any are unset
        var rootSpanId = trace.find(function (span) { return span.name == 'command'; });
        if (rootSpanId) {
            trace = trace.map(function (s) {
                return __assign(__assign({}, s), (s.parent_id != undefined
                    ? { parent_id: s.parent_id }
                    : { parent_id: rootSpanId.span_id }));
            });
        }
        var traces = [trace];
        this.allSpans = this.allSpans.filter(function (s) { return !s.endedSpan; });
        return JSON.stringify(traces);
    };
    Tracer.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(process.env.NODE_ENV !== 'development')) return [3 /*break*/, 2];
                        return [4 /*yield*/, retyped_routes_1.request.requestWithArgs(api_1.API_SERVER, graphite_cli_routes_1["default"].traces, {
                                cliVersion: package_json_1.version,
                                jsonTraces: this.flushJson()
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Tracer;
}());
var globalTracer = new Tracer();
exports["default"] = globalTracer;
