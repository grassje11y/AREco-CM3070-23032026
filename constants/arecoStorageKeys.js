import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  points: "areco.points",
  streak: "areco.streak",
  lastCheckInDate: "areco.lastCheckInDate",
  history: "areco.history",
  gamePlayed: "areco.gamePlayed",
  chatUsed: "areco.chatUsed",
  awardedChallenges: "areco.awardedChallenges",
  dailyChallengeAwards: "areco.dailyChallengeAwards",
  visitedScreens: "areco.visitedScreens",
};

export async function clearArecoStorage() {
  await Promise.all(Object.values(STORAGE_KEYS).map((k) => AsyncStorage.removeItem(k)));
}
