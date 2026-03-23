// master list of daily challenge definitions used on the home screen
export const ALL_CHALLENGES = [
  {
    id: "scan-3-items",
    title: "Scan 3 items",
    description: "Scan and classify 3 different items correctly.",
    screen: "scanner",
  },
  {
    id: "scan-1-item",
    title: "Scan an item",
    description: "Scan and classify at least one item.",
    screen: "scanner",
  },
  {
    id: "play-game-once",
    title: "Play the game",
    description: "Complete one full round of the recycling mini game.",
    screen: "game",
  },
  {
    id: "ask-chatbot",
    title: "Ask OCERA",
    description: "Open the chatbot and ask about recycling.",
    screen: "tips",
  },
  {
    id: "view-history",
    title: "View scan history",
    description: "Open your scan history screen once.",
    screen: "history",
  },
  {
    id: "nea-search",
    title: "NEA recycling search",
    description: "Use the NEA recycling search engine.",
    screen: "search",
  },
  {
    id: "open-settings",
    title: "Open settings",
    description: "Visit the settings screen.",
    screen: "settings",
  },
  {
    id: "visit-prizes",
    title: "Visit the prize store",
    description: "Check out the prizes screen.",
    screen: "prizes",
  },
  {
    id: "play-ar",
    title: "Try AR",
    description: "Open the AR experience.",
    screen: "ar",
  },
  {
    id: "daily-check-in",
    title: "Daily check-in",
    description: "Complete your daily check-in from the home screen.",
    screen: "home",
  },
];

const byId = Object.fromEntries(ALL_CHALLENGES.map((c) => [c.id, c]));

export function getChallengeById(id) {
  return byId[id];
}

// turn a string into a numeric seed so the same date always shuffles the same way
function hashDateString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// small fast random number generator from one seed
function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

//picking the daily challenges
export function pickDailyChallengeIds(dateKey, count = 3) {
  const ids = ALL_CHALLENGES.map((c) => c.id);
  const rng = mulberry32(hashDateString(`areco-daily-${dateKey}`));
  const pool = [...ids];
  const out = [];
  const n = Math.min(count, pool.length);
  for (let k = 0; k < n; k++) {
    const j = k + Math.floor(rng() * (pool.length - k));
    [pool[k], pool[j]] = [pool[j], pool[k]];
    out.push(pool[k]);
  }
  return out;
}

// true when that challenge id is satisfied given scans games chat visits and check in state
export function isChallengeComplete(id, ctx) {
  const h = ctx.history?.length ?? 0;
  const v = ctx.visitedScreens || {};
  switch (id) {
    case "scan-3-items":
      return h >= 3;
    case "scan-1-item":
      return h >= 1;
    case "play-game-once":
      return !!ctx.gamePlayed;
    case "ask-chatbot":
      return !!ctx.chatUsed;
    case "view-history":
      return !!v.history;
    case "nea-search":
      return !!v.search;
    case "open-settings":
      return !!v.settings;
    case "visit-prizes":
      return !!v.prizes;
    case "play-ar":
      return !!v.ar;
    case "daily-check-in":
      return !!ctx.hasCheckedInToday;
    default:
      return false;
  }
}
