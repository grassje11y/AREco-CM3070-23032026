import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
  Animated,
  Alert,
  Platform,
  DevSettings,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useCameraPermissions } from "expo-camera";
import HomeScreen from "./screens/Home";
import GameScreen from "./screens/GameScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ChatScreen from "./screens/ChatScreen";
import RecyclingSearchScreen from "./screens/NEARecycling";
import ScanScreen from "./screens/ScanScreen";
import PrizesScreen from "./screens/PrizesScreen";
import ARScreen from "./screens/ARScreen";
import QuickActionsMenu from "./components/QuickMenu";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  pickDailyChallengeIds,
  getChallengeById,
  isChallengeComplete,
} from "./constants/challenges";
import { parseDailyChallengeAwards } from "./constants/challengeStorageParse";
import { computeDailyCheckIn } from "./constants/streakCheckIn";
import { STORAGE_KEYS, clearArecoStorage } from "./constants/arecoStorageKeys";
import { getSingaporeDateKey, getSingaporeYesterdayKey } from "./constants/singaporeDate";

// reload the bundle so the next frame loads with empty storage
function reloadAppAfterClear() {
  if (Platform.OS === "web" && typeof globalThis !== "undefined" && globalThis.location?.reload) {
    globalThis.location.reload();
    return;
  }
  if (typeof DevSettings?.reload === "function") {
    DevSettings.reload();
  }
}

// ask then wipe storage and reload the app
function confirmClearStorageAndReload() {
  Alert.alert(
    "Clear AREco data?",
    "Removes points, streak, scan history, and challenge progress on this device. The app will reload.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await clearArecoStorage();
            reloadAppAfterClear();
          } catch (e) {
            console.warn("Clear storage failed:", e);
            Alert.alert("Error", "Could not clear storage.");
          }
        },
      },
    ]
  );
}

function AppInner() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [overlayCategory, setOverlayCategory] = useState(null);
  const [err, setErr] = useState(null);
  const [activeScreen, setActiveScreen] = useState("home"); // home | scanner | histor | tips | game | settings | search | prizes
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [hydrating, setHydrating] = useState(true);
  const [history, setHistory] = useState([]); 
  const [gamePlayed, setGamePlayed] = useState(false);
  const [chatUsed, setChatUsed] = useState(false);
  const [dailyChallengeAwards, setDailyChallengeAwards] = useState({});
  const [visitedScreens, setVisitedScreens] = useState({});

  useEffect(() => {
    // read points streak history games chat flags challenges visits from disk and migrate old challenge data if needed
    (async () => {
      try {
        const [storedPoints, storedStreak, storedLastCheckInDate] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.points),
          AsyncStorage.getItem(STORAGE_KEYS.streak),
          AsyncStorage.getItem(STORAGE_KEYS.lastCheckInDate),
        ]);

        const [
          storedHistory,
          storedGamePlayed,
          storedChatUsed,
          storedOldAwarded,
          storedDailyAwards,
          storedVisited,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.gamePlayed),
          AsyncStorage.getItem(STORAGE_KEYS.chatUsed),
          AsyncStorage.getItem(STORAGE_KEYS.awardedChallenges),
          AsyncStorage.getItem(STORAGE_KEYS.dailyChallengeAwards),
          AsyncStorage.getItem(STORAGE_KEYS.visitedScreens),
        ]);

        if (storedPoints !== null) setPoints(Number(storedPoints) || 0);
        if (storedStreak !== null) setStreak(Number(storedStreak) || 0);
        if (storedLastCheckInDate !== null) setLastCheckInDate(storedLastCheckInDate);

        if (storedHistory !== null) {
          try {
            const parsed = JSON.parse(storedHistory);
            if (Array.isArray(parsed)) setHistory(parsed);
          } catch {
            // ignore corrupted history payload
          }
        }

        if (storedGamePlayed !== null) setGamePlayed(storedGamePlayed === "true");
        if (storedChatUsed !== null) setChatUsed(storedChatUsed === "true");

        const todayForAwards = getSingaporeDateKey(new Date());
        const awards = parseDailyChallengeAwards(
          storedDailyAwards,
          storedOldAwarded,
          todayForAwards
        );
        if (Object.keys(awards).length > 0) {
          setDailyChallengeAwards(awards);
        }

        if (storedVisited !== null) {
          try {
            const parsed = JSON.parse(storedVisited);
            if (parsed && typeof parsed === "object") setVisitedScreens(parsed);
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.log("Failed to load progress from AsyncStorage:", e);
      } finally {
        setHydrating(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrating) return;

    // write points streak and last check in string whenever they change
    AsyncStorage.setItem(STORAGE_KEYS.points, String(points)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.streak, String(streak)).catch(() => {});
    if (lastCheckInDate) {
      AsyncStorage.setItem(STORAGE_KEYS.lastCheckInDate, String(lastCheckInDate)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.lastCheckInDate).catch(() => {});
    }
  }, [hydrating, points, streak, lastCheckInDate]);

  useEffect(() => {
    if (hydrating) return;

    // save history game flags and per day challenge payouts so restarts do not duplicate rewards
    AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.gamePlayed, String(gamePlayed)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.chatUsed, String(chatUsed)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.dailyChallengeAwards, JSON.stringify(dailyChallengeAwards)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.visitedScreens, JSON.stringify(visitedScreens)).catch(() => {});
  }, [hydrating, history, gamePlayed, chatUsed, dailyChallengeAwards, visitedScreens]);

  useEffect(() => {
    setErr(null);
    // new photo means old category choice should clear
    setSelectedCategory(null);
  }, [photoUri]);

  const todayKey = getSingaporeDateKey(new Date());
  const hasCheckedInToday = lastCheckInDate === todayKey;

  useEffect(() => {
    if (hydrating) return;
    // flip visit flags when user opens screens that daily challenges care about
    const trackVisit = ["history", "search", "settings", "prizes", "ar"];
    if (!trackVisit.includes(activeScreen)) return;
    setVisitedScreens((prev) => {
      if (prev[activeScreen]) return prev;
      return { ...prev, [activeScreen]: true };
    });
  }, [activeScreen, hydrating]);

  const [overlayPulse] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!overlayCategory) {
      overlayPulse.setValue(1);
      return;
    }

    // gentle pulse on the scan result bubble so it is easier to notice
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(overlayPulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(overlayPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [overlayCategory, overlayPulse]);

  // map each bin type to border color emoji and title color for the camera overlay
  const getOverlayStyleForCategory = (category) => {
    switch (category) {
      case "Plastic":
        return { emoji: "🥤", borderColor: "#22c55e", titleColor: "#bbf7d0" };
      case "Paper":
        return { emoji: "📄", borderColor: "#38bdf8", titleColor: "#bae6fd" };
      case "Glass":
        return { emoji: "🧴", borderColor: "#22d3ee", titleColor: "#a5f3fc" };
      case "Metal":
        return { emoji: "🥫", borderColor: "#a855f7", titleColor: "#e9d5ff" };
      case "Trash":
      default:
        return { emoji: "🗑️", borderColor: "#6b7280", titleColor: "#e5e7eb" };
    }
  };

  // bump or reset streak using singapore yesterday then grant points and a big bonus at seven days
  const handleDailyCheckIn = () => {
    const outcome = computeDailyCheckIn({
      lastCheckInDate,
      streak,
      todayKey,
      yesterdayKey: getSingaporeYesterdayKey(new Date()),
    });
    if (!outcome.applied) return;

    setStreak(outcome.nextStreak);
    setLastCheckInDate(outcome.newLastCheckInDate);
    setPoints((prev) => prev + outcome.pointsToAdd);
  };

  const handleEarnGamePoints = (amount) => {
    setPoints((prev) => prev + amount);
    setGamePlayed(true);
  };

  // subtract cost from points only when balance is enough and tell caller if it worked
  const handleRedeemPrize = (prize) => {
    if (!prize || typeof prize.cost !== "number") return false;
    let success = false;
    setPoints((prev) => {
      if (prev >= prize.cost) {
        success = true;
        return prev - prize.cost;
      }
      return prev;
    });
    return success;
  };

  // take one picture from the camera ref and store uri or set error text
  const takePhoto = async () => {
    try {
      setBusy(true);
      setErr(null);

      const cam = cameraRef.current;
      if (!cam) throw new Error("Camera not ready");

      const photo = await cam.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false,
      });

      setPhotoUri(photo.uri);
    } catch (error) {
      console.log(error);
      setErr("Failed to take photo.");
    } finally {
      setBusy(false);
    }
  };

  // store chosen bin show overlay and prepend a history row for this scan
  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    setOverlayCategory(category);

    if (photoUri) {
      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          uri: photoUri,
          category,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const clearPhoto = () => {
    setPhotoUri(null);
    setSelectedCategory(null);
    setOverlayCategory(null);
    setErr(null);
  };

  useEffect(() => {
    if (activeScreen === "tips") {
      setChatUsed(true);
    }
  }, [activeScreen]);

  const challengeCtx = {
    history,
    gamePlayed,
    chatUsed,
    visitedScreens,
    hasCheckedInToday,
  };

  const todayChallengeIds = pickDailyChallengeIds(todayKey, 3);
  const dailyChallenges = todayChallengeIds
    .map((id) => getChallengeById(id))
    .filter(Boolean);

  const completedChallenges = Object.fromEntries(
    todayChallengeIds.map((id) => [id, isChallengeComplete(id, challengeCtx)])
  );

  useEffect(() => {
    if (hydrating) return;
    // add five points per todays challenge that is done and not yet marked paid for this date
    const ctx = {
      history,
      gamePlayed,
      chatUsed,
      visitedScreens,
      hasCheckedInToday,
    };
    const ids = pickDailyChallengeIds(todayKey, 3);
    const todayAwarded = dailyChallengeAwards[todayKey] || {};
    const nextAwards = { ...todayAwarded };
    let pointsToAdd = 0;
    for (const id of ids) {
      if (!isChallengeComplete(id, ctx)) continue;
      if (nextAwards[id]) continue;
      nextAwards[id] = true;
      pointsToAdd += 5;
    }
    if (pointsToAdd > 0) {
      setPoints((prev) => prev + pointsToAdd);
      setDailyChallengeAwards((prev) => ({
        ...prev,
        [todayKey]: nextAwards,
      }));
    }
  }, [
    hydrating,
    todayKey,
    history,
    gamePlayed,
    chatUsed,
    visitedScreens,
    hasCheckedInToday,
    dailyChallengeAwards,
  ]);

  const { theme, fontScale } = useSettings();

  if (hydrating) {
    return (
      <View style={{ flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  // pick which screen fills the main area under the header and menu
  const renderActiveScreen = () => {
    if (activeScreen === "home")
      return (
        <HomeScreen
          onNavigate={setActiveScreen}
          points={points}
          streak={streak}
          hasCheckedInToday={hasCheckedInToday}
          onDailyCheckIn={handleDailyCheckIn}
          dailyChallenges={dailyChallenges}
          completedChallenges={completedChallenges}
        />
      );
    if (activeScreen === "scanner")
      return (
        <ScanScreen
          cameraRef={cameraRef}
          permission={permission}
          busy={busy}
          photoUri={photoUri}
          selectedCategory={selectedCategory}
          overlayCategory={overlayCategory}
          overlayPulse={overlayPulse}
          err={err}
          onRequestPermission={requestPermission}
          onTakePhoto={takePhoto}
          onSelectCategory={handleCategorySelection}
          onClearPhoto={clearPhoto}
          getOverlayStyleForCategory={getOverlayStyleForCategory}
        />
      );
    if (activeScreen === "game") return <GameScreen onEarnPoints={handleEarnGamePoints} />;
    if (activeScreen === "history") return <HistoryScreen history={history} />;
    if (activeScreen === "tips") return <ChatScreen />;
    if (activeScreen === "settings") return <SettingsScreen />;
    if (activeScreen === "search") return <RecyclingSearchScreen />;
    if (activeScreen === "prizes") return <PrizesScreen points={points} onRedeem={handleRedeemPrize} />;
    if (activeScreen === "ar") return <ARScreen />;
    return renderScannerScreen();
  };

  const openChat = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveScreen("tips");
  };

  const isLight = theme === "light";

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <View style={[styles.header, isLight && styles.headerLight]}>
        <Pressable
          onLongPress={__DEV__ ? confirmClearStorageAndReload : undefined}
          delayLongPress={700}
          accessibilityLabel="AREco header"
          accessibilityHint={
            __DEV__ ? "Long press to clear saved app data (development only)" : undefined
          }
        >
          <Text style={[styles.logoText, isLight && styles.logoTextLight, { fontSize: 20 * fontScale }]}>
            ✧˖ AREco ˙✧˖° ༘ ⋆｡˚
          </Text>
        </Pressable>
      </View>

      <QuickActionsMenu onNavigate={setActiveScreen} />
      {renderActiveScreen()}

      {activeScreen !== "tips" && (
        <Pressable
          style={styles.chatFab}
          onPress={openChat}
          accessibilityLabel="Open help chat"
        >
          <Image
            source={require("./assets/mini.png")}
            style={styles.chatFabImage}
            resizeMode="contain"
          />
        </Pressable>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  containerLight: { backgroundColor: "#f1f5f9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "#0b0f14" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  headerLight: {
    backgroundColor: "#f8fafc",
    borderBottomColor: "#e5e7eb",
  },
  logoText: { color: "white", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  logoTextLight: { color: "#020617" },
  chatFab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  chatFabImage: {
    width: 56,
    height: 56,
  },
});