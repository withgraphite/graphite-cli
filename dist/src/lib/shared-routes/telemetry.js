"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("../retype"));
const base_1 = require("./base");
/**
 * These are just intended for "sad-path" logging (i.e. places where
 * something has gone wrong). If you are trying to log metrics on things
 * which went well, please just hit our monolith directly.
 */
const API_ROUTES = base_1.asRouteTree({
    oldIntercut: {
        method: "POST",
        url: "/intercut/:releaseSecret/telemetry",
        urlParams: {
            releaseSecret: t.string,
        },
        params: {
            kind: t.literal("ERROR"),
            errorKind: t.string,
        },
    },
    intercut: {
        method: "POST",
        url: "/intercut/telemetry",
        headers: {
            "X-SP-APP-SECRET": t.string,
        },
        params: {
            kind: t.literal("ERROR"),
            errorKind: t.string,
        },
    },
    buildPhase: {
        method: "POST",
        url: "/error-logging/build-phase",
        params: {
            errors: t.array(t.shape({
                name: t.string,
                message: t.string,
                stack: t.optional(t.string),
            })),
            argv: t.array(t.string),
            appSecret: t.optional(t.string),
        },
    },
    cli: {
        method: "POST",
        url: "/error-logging/cli",
        params: {
            name: t.string,
            message: t.string,
            stack: t.string,
            argv: t.array(t.string),
            user: t.optional(t.string),
        },
    },
    cliEvent: {
        method: "POST",
        url: "/event/cli",
        params: {
            eventName: t.string,
            message: t.string,
            user: t.optional(t.string),
        },
    },
});
exports.default = API_ROUTES;
//# sourceMappingURL=telemetry.js.map