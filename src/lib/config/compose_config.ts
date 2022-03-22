/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/ban-types */
import * as t from '@withgraphite/retype';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { ExitFailedError } from '../errors';
import { getRepoRootPath } from './repo_root_path';

type TDefaultConfigLocation = {
  relativePath: string;
  relativeTo: 'USER_HOME' | 'REPO';
};

type TConfigMutator<TConfigData> = (data: TConfigData) => void;
type TConfigTemplate<TConfigData, THelperFunctions> = {
  defaultLocations: TDefaultConfigLocation[];
  schema: t.Schema<TConfigData>;
  initialize: () => unknown;
  helperFunctions: (
    data: TConfigData,
    update: (mutator: TConfigMutator<TConfigData>) => void
  ) => THelperFunctions;
  options?: {
    removeIfEmpty: boolean;
  };
};

type TConfigInstance<TConfigData, THelperFunctions> = {
  readonly data: TConfigData;
  readonly update: (mutator: TConfigMutator<TConfigData>) => void;
  readonly path: string;
  delete: () => void;
} & THelperFunctions;

type TConfigFactory<TConfigData, THelperFunctions> = {
  load: (configPath?: string) => TConfigInstance<TConfigData, THelperFunctions>;
  loadIfExists: (
    configPath?: string
  ) => TConfigInstance<TConfigData, THelperFunctions> | undefined;
};

export function composeConfig<TConfigData, THelperFunctions>(
  configTemplate: TConfigTemplate<TConfigData, THelperFunctions>
): TConfigFactory<TConfigData, THelperFunctions> {
  const determinePath = (defaultPathOverride?: string): string => {
    const configPaths = configAbsolutePaths(
      configTemplate.defaultLocations,
      defaultPathOverride
    );
    return configPaths.find((p) => fs.existsSync(p)) || configPaths[0];
  };
  const loadHandler = (defaultPathOverride?: string) => {
    const curPath = determinePath(defaultPathOverride);
    const _data: TConfigData = readOrInitConfig(
      curPath,
      configTemplate.schema,
      configTemplate.initialize
    );
    const update = (mutator: TConfigMutator<TConfigData>) => {
      mutator(_data);
      const shouldRemoveBecauseEmpty =
        configTemplate.options?.removeIfEmpty &&
        JSON.stringify(_data) === JSON.stringify({});
      if (shouldRemoveBecauseEmpty) {
        fs.removeSync(curPath);
      } else {
        fs.writeFileSync(curPath, JSON.stringify(_data, null, 2));
      }
    };
    return {
      data: _data,
      update,
      path: curPath,
      delete: (defaultPathOverride?: string) => {
        const curPath = determinePath(defaultPathOverride);
        if (fs.existsSync(curPath)) {
          fs.removeSync(curPath);
        }
      },
      ...configTemplate.helperFunctions(_data, update),
    };
  };
  return {
    load: loadHandler,
    loadIfExists: (defaultPathOverride?: string) => {
      const curPath = determinePath(defaultPathOverride);
      if (!fs.existsSync(curPath)) {
        return undefined;
      }
      return loadHandler(defaultPathOverride);
    },
  };
}

function configAbsolutePaths(
  defaultLocations: TDefaultConfigLocation[],
  defaultPathOverride?: string
): string[] {
  const repoRoot = getRepoRootPath();
  const home = os.homedir();
  return (defaultPathOverride ? [defaultPathOverride] : []).concat(
    defaultLocations.map((l) =>
      path.join(l.relativeTo === 'REPO' ? repoRoot : home, l.relativePath)
    )
  );
}

function readOrInitConfig<TConfigData>(
  configPath: string,
  schema: t.Schema<TConfigData>,
  initialize: () => unknown
): TConfigData {
  const hasExistingConfig = configPath && fs.existsSync(configPath);
  const rawConfig = hasExistingConfig
    ? JSON.parse(fs.readFileSync(configPath).toString())
    : initialize();

  const validConfigFile = schema(rawConfig, { logFailures: false });
  if (!validConfigFile) {
    throw new ExitFailedError(`Malformed config file at ${configPath}`);
  }
  return rawConfig;
}
