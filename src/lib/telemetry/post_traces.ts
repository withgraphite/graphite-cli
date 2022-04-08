#!/usr/bin/env node
import graphiteCLIRoutes from '@withgraphite/graphite-cli-routes';
import { request } from '@withgraphite/retyped-routes';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { getUserEmail, SHOULD_REPORT_TELEMETRY, tracer } from '.';
import { version } from '../../../package.json';
import { API_SERVER } from '../api';
import { initContext, TContext } from '../context/context';
import { spawnDetached } from '../utils/spawn';

type oldTelemetryT = {
  canonicalCommandName: string;
  commandName: string;
  durationMiliSeconds: number;
  err?: { errName: string; errMessage: string; errStack: string };
};

function saveTracesToTmpFile(): string {
  const tmpDir = tmp.dirSync();
  const json = tracer.flushJson();
  const tracesPath = path.join(tmpDir.name, 'traces.json');
  fs.writeFileSync(tracesPath, json);
  return tracesPath;
}

function saveOldTelemetryToFile(data: oldTelemetryT): string {
  const tmpDir = tmp.dirSync();
  const tracesPath = path.join(tmpDir.name, 'oldTelemetry.json');
  fs.writeFileSync(tracesPath, JSON.stringify(data));
  return tracesPath;
}

export function postTelemetryInBackground(oldDetails: oldTelemetryT): void {
  const tracesPath = saveTracesToTmpFile();
  const oldTelemetryPath = saveOldTelemetryToFile(oldDetails);
  spawnDetached(__filename, [tracesPath, oldTelemetryPath]);
}

async function logCommand(
  oldTelemetryFilePath: string,
  context: TContext
): Promise<void> {
  const data = JSON.parse(
    fs.readFileSync(oldTelemetryFilePath).toString().trim()
  ) as oldTelemetryT;
  if (SHOULD_REPORT_TELEMETRY && data) {
    try {
      await request.requestWithArgs(API_SERVER, graphiteCLIRoutes.logCommand, {
        commandName: data.commandName,
        durationMiliSeconds: data.durationMiliSeconds,
        user: getUserEmail() || 'NotFound',
        auth: context.userConfig.data.authToken,
        version: version,
        err: data.err
          ? {
              name: data.err.errName,
              message: data.err.errMessage,
              stackTrace: data.err.errStack || '',
              debugContext: undefined,
            }
          : undefined,
      });
    } catch {
      // dont log err
    }
  }
}

async function postTelemetry(context: TContext): Promise<void> {
  if (!SHOULD_REPORT_TELEMETRY) {
    return;
  }
  const tracesPath = process.argv[2];
  if (tracesPath && fs.existsSync(tracesPath)) {
    // Failed to find traces file, exit
    try {
      await request.requestWithArgs(API_SERVER, graphiteCLIRoutes.traces, {
        jsonTraces: fs.readFileSync(tracesPath).toString(),
        cliVersion: version,
      });
    } catch (err) {
      return;
    }
    // Cleanup despite it being a temp file.
    fs.readFileSync(tracesPath);
  }

  const oldTelemetryFilePath = process.argv[3];
  if (oldTelemetryFilePath && fs.existsSync(oldTelemetryFilePath)) {
    await logCommand(oldTelemetryFilePath, context);
    // Cleanup despite it being a temp file.
    fs.removeSync(oldTelemetryFilePath);
  }
}

if (process.argv[1] === __filename) {
  void postTelemetry(initContext());
}
