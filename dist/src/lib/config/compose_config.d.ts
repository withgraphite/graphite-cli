import * as t from '@withgraphite/retype';
declare type TDefaultConfigLocation = {
    relativePath: string;
    relativeTo: 'USER_HOME' | 'REPO';
};
declare type TConfigMutator<TConfigData> = (data: TConfigData) => void;
declare type TConfigTemplate<TConfigData, THelperFunctions> = {
    defaultLocations: TDefaultConfigLocation[];
    schema: t.Schema<TConfigData>;
    initialize: () => unknown;
    helperFunctions: (data: TConfigData, update: (mutator: TConfigMutator<TConfigData>) => void) => THelperFunctions;
};
declare type TConfigInstance<TConfigData, THelperFunctions> = {
    readonly data: TConfigData;
    readonly update: (mutator: TConfigMutator<TConfigData>) => void;
    readonly path: string;
} & THelperFunctions;
declare type TConfigFactory<TConfigData, THelperFunctions> = {
    load: (configPath?: string) => TConfigInstance<TConfigData, THelperFunctions>;
};
export declare function composeConfig<TConfigData, THelperFunctions>(configTemplate: TConfigTemplate<TConfigData, THelperFunctions>): TConfigFactory<TConfigData, THelperFunctions>;
export {};
