import fs from 'fs-extra';
import tmp from 'tmp';

export function performInTmpDir<T>(handler: (dirPath: string) => T): T {
  const tmpDir = tmp.dirSync();
  const result: T = handler(tmpDir.name);
  fs.emptyDirSync(tmpDir.name);
  tmpDir.removeCallback();
  return result;
}
