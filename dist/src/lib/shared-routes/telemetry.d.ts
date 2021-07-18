import * as t from "../retype";
/**
 * These are just intended for "sad-path" logging (i.e. places where
 * something has gone wrong). If you are trying to log metrics on things
 * which went well, please just hit our monolith directly.
 */
declare const API_ROUTES: {
    readonly oldIntercut: {
        readonly method: "POST";
        readonly url: "/intercut/:releaseSecret/telemetry";
        readonly urlParams: {
            readonly releaseSecret: t.StringType;
        };
        readonly params: {
            readonly kind: t.LiteralType<"ERROR">;
            readonly errorKind: t.StringType;
        };
    };
    readonly intercut: {
        readonly method: "POST";
        readonly url: "/intercut/telemetry";
        readonly headers: {
            readonly "X-SP-APP-SECRET": t.StringType;
        };
        readonly params: {
            readonly kind: t.LiteralType<"ERROR">;
            readonly errorKind: t.StringType;
        };
    };
    readonly buildPhase: {
        readonly method: "POST";
        readonly url: "/error-logging/build-phase";
        readonly params: {
            readonly errors: t.ArrayType<{
                name: string;
                message: string;
                stack: string | undefined;
            }>;
            readonly argv: t.ArrayType<string>;
            readonly appSecret: t.UnionType<string, undefined>;
        };
    };
    readonly cli: {
        readonly method: "POST";
        readonly url: "/error-logging/cli";
        readonly params: {
            readonly name: t.StringType;
            readonly message: t.StringType;
            readonly stack: t.StringType;
            readonly argv: t.ArrayType<string>;
            readonly user: t.UnionType<string, undefined>;
        };
    };
    readonly cliEvent: {
        readonly method: "POST";
        readonly url: "/event/cli";
        readonly params: {
            readonly eventName: t.StringType;
            readonly message: t.StringType;
            readonly user: t.UnionType<string, undefined>;
        };
    };
};
export default API_ROUTES;
