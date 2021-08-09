import { getUserEmail } from "./context";
import { refreshPRInfoInBackground } from "./fetch_pr_info";
import { postTelemetryInBackground } from "./post_traces";
import { profile } from "./profile";
import { registerSigintHandler } from "./sigint_handler";
import tracer from "./tracer";
import { fetchUpgradePromptInBackground } from "./upgrade_prompt";

const SHOULD_REPORT_TELEMETRY = process.env.NODE_ENV != "development";

export {
  tracer,
  profile,
  getUserEmail,
  SHOULD_REPORT_TELEMETRY,
  fetchUpgradePromptInBackground,
  postTelemetryInBackground,
  registerSigintHandler,
  refreshPRInfoInBackground,
};
