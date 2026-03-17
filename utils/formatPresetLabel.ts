/**
 * Formats a duration in seconds to a human-readable preset label.
 *   60  → "1m"
 *   90  → "1m 30s"
 *   120 → "2m"
 *   150 → "2m 30s"
 */
export function formatPresetLabel(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}
