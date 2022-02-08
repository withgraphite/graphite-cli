import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import {} from '../../actions/edit/stack_edits';
import { logDebug } from '../utils';
import { TStackEdit } from './../../actions/edit/stack_edits';
import { getRepoRootPath } from './repo_root_path';

const CONFIG_NAME = '.graphite_pending_stack_edits';
const CURRENT_REPO_CONFIG_PATH = path.join(getRepoRootPath(), CONFIG_NAME);

export function savePendingStackEdits(stackEdits: TStackEdit[]): void {
  fs.writeFileSync(
    CURRENT_REPO_CONFIG_PATH,
    JSON.stringify(stackEdits, null, 2)
  );
}

export function getPendingStackEdits(): TStackEdit[] | undefined {
  if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
    try {
      return JSON.parse(repoConfigRaw.toString().trim()) as TStackEdit[];
    } catch (e) {
      logDebug(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
    }
  }
  return undefined;
}

export function clearPendingStackEdits(): void {
  fs.unlinkSync(CURRENT_REPO_CONFIG_PATH);
}
