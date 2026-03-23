// helpers for yyyy mm dd strings in singapore time used for streaks and daily picks

const SG = "Asia/Singapore";

function partsToKey(parts) {
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) return "";
  return `${y}-${m}-${d}`;
}

/** Today's date in Singapore as YYYY-MM-DD */
export function getSingaporeDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SG,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return partsToKey(parts);
}

// calendar yesterday in singapore used to decide if streak should increase
export function getSingaporeYesterdayKey(ref = new Date()) {
  const todayKey = getSingaporeDateKey(ref);
  const [Y, M, D] = todayKey.split("-").map(Number);
  const isoDay = `${String(Y).padStart(4, "0")}-${String(M).padStart(2, "0")}-${String(D).padStart(2, "0")}`;
  const todayStartSG = new Date(`${isoDay}T00:00:00+08:00`);
  const yesterdayMs = todayStartSG.getTime() - 24 * 60 * 60 * 1000;
  return getSingaporeDateKey(new Date(yesterdayMs));
}
