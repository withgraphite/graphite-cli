import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { version } from '../../package.json';
import { API_SERVER } from '../lib/api/server';
import { userConfigFactory } from '../lib/spiffy/user_config_spf';
import { spawnDetached } from '../lib/utils/spawn';
import { tracer } from '../lib/utils/tracer';

function saveTracesToTmpFile(): string {
  const tmpDir = tmp.dirSync();
  const json = tracer.flushJson();
  const tracesPath = path.join(tmpDir.name, 'traces.json');
  fs.writeFileSync(tracesPath, json);
  return tracesPath;
}

export function postTelemetryInBackground(): void {
  const tracesPath = saveTracesToTmpFile();
  spawnDetached(__filename, [tracesPath]);
}

async function postTelemetry(): Promise<void> {
  if (!process.env.GRAPHITE_DISABLE_TELEMETRY) {
    return;
  }
  const tracesPath = process.argv[2];
  if (tracesPath && fs.existsSync(tracesPath)) {
    // Failed to find traces file, exit
    try {
      await request.requestWithArgs(API_SERVER, API_ROUTES.traces, {
        auth: userConfigFactory.loadIfExists()?.data.authToken,
        jsonTraces: fs.readFileSync(tracesPath).toString(),
        cliVersion: version,
      });
    } catch (err) {
      return;
    }
    // Cleanup despite it being a temp file.
    fs.removeSync(tracesPath);
  }
}

if (process.argv[1] === __filename) {
  void postTelemetry();
}
