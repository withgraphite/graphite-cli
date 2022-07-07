import * as t from '@withgraphite/retype';
/**
 * Spiffy is our utility for Schematized Persisted Files
 * Pretty simple: we use Retype to define a schema which parsed JSON is validated against
 */
export declare function spiffy<TSpfData, THelperFunctions>(template: TSpfTemplate<TSpfData, THelperFunctions>): TSpfFactory<TSpfData, THelperFunctions>;
declare type TDefaultFileLocation = {
    relativePath: string;
    relativeTo: 'USER_HOME' | 'REPO';
};
declare type TSpfMutator<TSpfData> = (data: TSpfData) => void;
declare type TSpfTemplate<TSpfData, THelperFunctions> = {
    defaultLocations: TDefaultFileLocation[];
    schema: t.Schema<TSpfData>;
    initialize: () => unknown;
    helperFunctions: (data: TSpfData, update: (mutator: TSpfMutator<TSpfData>) => void) => THelperFunctions;
    options?: {
        removeIfEmpty?: boolean;
        removeIfInvalid?: boolean;
    };
};
declare type TSpfInstance<TSpfData, THelperFunctions> = {
    readonly data: TSpfData;
    readonly update: (mutator: TSpfMutator<TSpfData>) => void;
    readonly path: string;
    delete: () => void;
} & THelperFunctions;
declare type TSpfFactory<TSpfData, THelperFunctions> = {
    load: (filePath?: string) => TSpfInstance<TSpfData, THelperFunctions>;
    loadIfExists: (filePath?: string) => TSpfInstance<TSpfData, THelperFunctions> | undefined;
};
export {};
