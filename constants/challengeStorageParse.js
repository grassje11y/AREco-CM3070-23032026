// parse daily challenge award blob from async storage including old key migration

export function parseDailyChallengeAwards(storedDailyAwards, storedOldAwarded, todayKey) {
  if (storedDailyAwards != null) {
    try {
      const parsed = JSON.parse(storedDailyAwards);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      // ignore bad json
    }
    return {};
  }
  if (storedOldAwarded != null) {
    try {
      const parsed = JSON.parse(storedOldAwarded);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return { [todayKey]: parsed };
      }
    } catch {
      // ignore
    }
  }
  return {};
}
