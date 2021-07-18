/// <reference types="node" />
import "isomorphic-fetch";
import * as t from "../retype";
import { TRoute } from "./types";
export declare function endpointWithArgs<TActualRoute extends TRoute>(apiServer: string, route: TActualRoute & {
    method: "GET";
}, queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>, urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>): string;
export declare function formatReqDetails<TActualRoute extends TRoute>(apiServer: string, route: TActualRoute, params: TActualRoute["rawBody"] extends true ? Buffer : t.UnwrapSchemaMap<TActualRoute["params"]>, queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>, urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>, headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>): {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
};
export declare function requestWithArgs<TActualRoute extends TRoute>(apiServer: string, route: TActualRoute, params: TActualRoute["rawBody"] extends true ? Buffer : t.UnwrapSchemaMap<TActualRoute["params"]>, queryParams?: t.UnwrapSchemaMap<TActualRoute["queryParams"]>, urlParams?: t.UnwrapSchemaMap<TActualRoute["urlParams"]>, headers?: t.UnwrapSchemaMap<TActualRoute["headers"]>): Promise<t.UnwrapSchemaMap<TActualRoute["response"]> & {
    _response: Response;
}>;
