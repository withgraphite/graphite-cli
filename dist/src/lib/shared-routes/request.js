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
exports.requestWithArgs = exports.formatReqDetails = exports.endpointWithArgs = void 0;
require("isomorphic-fetch");
const pathToRegexp = __importStar(require("path-to-regexp"));
/* eslint-disable @typescript-eslint/no-explicit-any */
function serializeURLArgs(obj) {
    const str = [];
    for (const p in obj) {
        const v = obj[p];
        if (v !== undefined) {
            /**
             * TODO (tomasreimers): This will fail on any non-string types.
             * When that becomes an issue we'll update it to do some form of
             * serialization. For now, GET requests are really ONLY using
             * string params
             */
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}
function endpointWithArgs(apiServer, route, queryParams, urlParams) {
    // Inspired by https://github.com/ReactTraining/react-router/blob/ea44618e68f6a112e48404b2ea0da3e207daf4f0/packages/react-router/modules/generatePath.js
    const path = urlParams
        ? pathToRegexp.compile(route.url)(urlParams)
        : route.url;
    let url = apiServer + path;
    if (queryParams) {
        const urlArgs = serializeURLArgs(queryParams);
        if (urlArgs != "") {
            url += "?" + urlArgs;
        }
    }
    return url;
}
exports.endpointWithArgs = endpointWithArgs;
function request(url, verb, headers, body) {
    return fetch(url, Object.assign({ method: verb, mode: "cors", credentials: "include", headers: headers }, (body ? { body: body } : {})));
}
function formatReqDetails(apiServer, route, params, queryParams, urlParams, headers) {
    // Inspired by https://github.com/ReactTraining/react-router/blob/ea44618e68f6a112e48404b2ea0da3e207daf4f0/packages/react-router/modules/generatePath.js
    const path = urlParams
        ? pathToRegexp.compile(route.url)(urlParams)
        : route.url;
    let url = apiServer + path;
    let body = null;
    if (route.method == "GET") {
        if (queryParams) {
            const urlArgs = serializeURLArgs(queryParams);
            if (urlArgs != "") {
                url += "?" + urlArgs;
            }
        }
    }
    else {
        body = route.rawBody ? params : JSON.stringify(params);
    }
    return {
        url,
        method: route.method,
        headers: Object.assign(Object.assign({}, headers), { "Content-Type": "text/plain" }),
        body,
    };
}
exports.formatReqDetails = formatReqDetails;
function requestWithArgs(apiServer, route, params, queryParams, urlParams, headers) {
    const reqDetails = formatReqDetails(apiServer, route, params, queryParams, urlParams, headers);
    return request(reqDetails.url, reqDetails.method, reqDetails.headers, reqDetails.body).then((response) => {
        // if there is supposed to be a response type, parse it
        if (!!route.response && response.status === 200) {
            return response.json().then((body) => {
                return Object.assign(Object.assign({}, body), { _response: response });
            });
        }
        return { _response: response };
    });
}
exports.requestWithArgs = requestWithArgs;
//# sourceMappingURL=request.js.map