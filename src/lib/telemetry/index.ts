import { getNumBranches, getNumCommitObjects, getUserEmail } from "./context";
import { postTelemetryInBackground } from "./post_traces";
import { profile } from "./profile";
import { registerSigintHandler } from "./sigint_handler";
import tracer from "./tracer";
import { fetchUpgradePromptInBackground } from "./upgrade_prompt";

const SHOULD_REPORT_TELEMETRY = process.env.NODE_ENV != "development";

export {
  tracer,
  getNumBranches,
  getNumCommitObjects,
  profile,
  getUserEmail,
  SHOULD_REPORT_TELEMETRY,
  fetchUpgradePromptInBackground,
  postTelemetryInBackground,
  registerSigintHandler,
};
