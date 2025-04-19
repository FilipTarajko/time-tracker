import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  getTimestampDifferenceString,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  ONGOING_TEXT,
  SECONDS_IN_MINUTE,
} from 'src/helpers/timeHelpers';

describe('formatDuration', () => {
  it('formats 3 seconds as "00:00:03"', async () => {
    expect(formatDuration(3 * MILLISECONDS_IN_SECOND)).toBe('00:00:03');
  });

  it('formats 1h as "01:00:00"', async () => {
    expect(
      formatDuration(
        MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR
      )
    ).toBe('01:00:00');
  });

  it('formats 1h 30min 51s as "01:30:51"', async () => {
    expect(formatDuration(5451000)).toBe('01:30:51');
  });
});

describe('getTimestampDifferenceString', () => {
  it(`evaluates to "${ONGOING_TEXT}" if there is no ending value`, async () => {
    expect(getTimestampDifferenceString(undefined, 1745105090079)).toBe(
      ONGOING_TEXT
    );
  });

  it('evaluates to "00:00:00" if start and end is equal', async () => {
    expect(getTimestampDifferenceString(1745105090079, 1745105090079)).toBe(
      '00:00:00'
    );
  });

  it('evaluates to "01:30:51" if 1h 30min 51 passed', async () => {
    expect(
      getTimestampDifferenceString(1745105090079 + 5451000, 1745105090079)
    ).toBe('01:30:51');
  });
});
