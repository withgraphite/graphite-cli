import { getUserEmail } from './context';
import { postTelemetryInBackground } from './post_traces';
import { profile } from './profile';
import { registerSigintHandler } from './sigint_handler';
import tracer from './tracer';
import { fetchUpgradePromptInBackground } from './upgrade_prompt';
declare const SHOULD_REPORT_TELEMETRY: boolean;
export { tracer, profile, getUserEmail, SHOULD_REPORT_TELEMETRY, fetchUpgradePromptInBackground, postTelemetryInBackground, registerSigintHandler, };
