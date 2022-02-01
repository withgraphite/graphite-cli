"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asRouteTree = void 0;
// Hack so that typescript doesn't widen types for us,
// as it might if we rewrote this code as:
//
// const API_ROUTES: TRouteTree = { ... } as const;
function asRouteTree(routeTree) {
    return routeTree;
}
exports.asRouteTree = asRouteTree;
//# sourceMappingURL=base.js.map