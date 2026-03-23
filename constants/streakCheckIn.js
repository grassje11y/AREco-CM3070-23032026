// pure rules for daily check in streak and point bonus used by App

export function computeDailyCheckIn({
  lastCheckInDate,
  streak,
  todayKey,
  yesterdayKey,
}) {
  const hasCheckedInToday = lastCheckInDate === todayKey;
  if (hasCheckedInToday) {
    return { applied: false };
  }

  let nextStreak = 1;
  if (lastCheckInDate && lastCheckInDate === yesterdayKey) {
    nextStreak = streak + 1;
  }

  let pointsToAdd = 5;
  if (nextStreak >= 7) {
    pointsToAdd += 50;
  }

  return {
    applied: true,
    nextStreak,
    pointsToAdd,
    newLastCheckInDate: todayKey,
  };
}
