import { UserPreferences } from '../types';
import { todayString } from './dateUtils';

/**
 * Returns a partial preferences update if the split needs to advance or the
 * date needs to roll over, or null if nothing has changed.
 *
 * Advance rules:
 *  - Last status was 'confirmed': advance by exactly 1 (workout was completed)
 *  - Anything else (skipped, cardio, pending/missed): stay on the same day
 *
 * @param todayOverride - DEV ONLY: treat this date as "today" instead of the real date
 */
export function advanceSplitIfNeeded(
  prefs: UserPreferences,
  splitLength: number,
  todayOverride?: string,
): Partial<UserPreferences> | null {
  if (splitLength === 0) return null;

  const today = todayOverride ?? todayString();

  // First time tracking — start at index 0
  if (!prefs.splitLastDate) {
    return {
      splitCurrentIndex: 0,
      splitLastDate: today,
      splitTodayStatus: 'pending',
    };
  }

  // Same day, nothing to do
  if (prefs.splitLastDate === today) return null;

  const last = new Date(prefs.splitLastDate + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const daysDiff = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 0) return null;

  // Only advance if the user explicitly completed the workout
  const currentIndex = prefs.splitCurrentIndex ?? 0;
  const advance = prefs.splitTodayStatus === 'confirmed' ? 1 : 0;
  const newIndex = (currentIndex + advance) % splitLength;

  return {
    splitCurrentIndex: newIndex,
    splitLastDate: today,
    splitTodayStatus: 'pending',
  };
}

