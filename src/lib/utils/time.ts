const MILLISECONDS_IN_SECONDS = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const SECONDS_IN_WEEK = 7 * SECONDS_IN_DAY;
const SECONDS_IN_MONTH = 30 * SECONDS_IN_WEEK;
const SECONDS_IN_YEAR = 12 * SECONDS_IN_MONTH;

export function getReadableTimeBeforeNow(earlierTimeInSeconds: number) {
  const nowInSeconds = Date.now() / MILLISECONDS_IN_SECONDS;
  return `${getReadableTimeDiff(earlierTimeInSeconds, nowInSeconds)} ago`;
}

function getReadableTimeDiff(
  earlierTimeInSeconds: number,
  laterTimeInSeconds: number
) {
  const diff = laterTimeInSeconds - earlierTimeInSeconds;
  if (diff < SECONDS_IN_MINUTE) {
    return "< 1 min";
  } else if (diff < SECONDS_IN_HOUR) {
    const mins = Math.round(diff / SECONDS_IN_MINUTE);
    return `${mins} min${mins === 1 ? "" : "s"}`;
  } else if (diff < SECONDS_IN_DAY) {
    const hours = Math.round(diff / SECONDS_IN_HOUR);
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  } else if (diff < SECONDS_IN_WEEK) {
    const days = Math.round(diff / SECONDS_IN_DAY);
    return `${days} day${days === 1 ? "" : "s"}`;
  } else if (diff < SECONDS_IN_MONTH) {
    const weeks = Math.round(diff / SECONDS_IN_WEEK);
    return `${weeks} wk${weeks === 1 ? "" : "s"}`;
  } else if (diff < SECONDS_IN_YEAR) {
    const months = Math.round(diff / SECONDS_IN_MONTH);
    return `${months} mo${months === 1 ? "" : "s"}`;
  } else {
    const years = Math.round(diff / SECONDS_IN_YEAR);
    return `${years} yr${years === 1 ? "" : "s"}`;
  }
}
