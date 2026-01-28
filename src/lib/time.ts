/**
 * Returns current time in milliseconds.
 * Accepts optional test time.
 */
export function nowMs(testNowMs?: number): number {
  if (
    process.env.TEST_MODE === "1" &&
    typeof testNowMs === "number"
  ) {
    return testNowMs;
  }

  return Date.now();
}
