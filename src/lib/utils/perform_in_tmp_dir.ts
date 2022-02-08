import fs from 'fs-extra';
import tmp from 'tmp';

export async function performInTmpDir<T>(
  handler: (dirPath: string) => T
): Promise<T> {
  const tmpDir = tmp.dirSync();
  const result: T = await handler(tmpDir.name);
  fs.emptyDirSync(tmpDir.name);
  tmpDir.removeCallback();
  return result;
}
