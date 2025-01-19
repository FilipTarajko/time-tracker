export const MILLISECONDS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;

export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;

export const MILLISECONDS_IN_MINUTE =
  MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
export const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * HOURS_IN_DAY;

export function getTimestampDifferenceString(
  later: number | undefined,
  earlier: number
): string {
  if (!later) {
    return 'ongoing';
  }
  return formatDuration(later - earlier);
}

export function formatDuration(duration: number) {
  const durationSeconds = duration / MILLISECONDS_IN_SECOND;
  const secondsPart = Math.floor(durationSeconds % SECONDS_IN_MINUTE);
  const minutesPart = Math.floor(
    (durationSeconds / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR
  );
  const hoursPart = Math.floor(durationSeconds / SECONDS_IN_HOUR);
  return `${hoursPart < 10 ? '0' : ''}${hoursPart}:${
    minutesPart < 10 ? '0' : ''
  }${minutesPart}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
}
