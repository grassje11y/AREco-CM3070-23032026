import React, { useRef, useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, StyleSheet, Animated } from "react-native";
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

function AppInner() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [overlayCategory, setOverlayCategory] = useState(null);
  const [err, setErr] = useState(null);
  const [activeScreen, setActiveScreen] = useState("home"); // "home" | "scanner" | "history" | "tips" | "game" | "settings" | "search" | "prizes"
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState(null);
  const [history, setHistory] = useState([]); // { id, uri, category, createdAt }
  const [gamePlayed, setGamePlayed] = useState(false);
  const [chatUsed, setChatUsed] = useState(false);
  const [awardedChallenges, setAwardedChallenges] = useState({}); // { [id]: true }

  useEffect(() => {
    setErr(null);
    // reset category when a new photo is taken
    setSelectedCategory(null);
  }, [photoUri]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = lastCheckInDate === todayKey;

  const [overlayPulse] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!overlayCategory) {
      overlayPulse.setValue(1);
      return;
    }

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

  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) return;

    let nextStreak = 1;
    if (lastCheckInDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);
      if (lastCheckInDate === yesterdayKey) {
        nextStreak = streak + 1;
      }
    }

    setStreak(nextStreak);
    setLastCheckInDate(todayKey);
    setPoints((prev) => prev + 5);

    if (nextStreak >= 7) {
      setPoints((prev) => prev + 50);
    }
  };

  const handleEarnGamePoints = (amount) => {
    setPoints((prev) => prev + amount);
    setGamePlayed(true);
  };

  const handleRedeemPrize = (prize) => {
    // Ensure enough points before redeeming
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

  useEffect(() => {
    const scanCompleted = history.length >= 3;
    const gameCompleted = gamePlayed;
    const chatCompleted = chatUsed;

    const mapping = {
      "scan-3-items": scanCompleted,
      "play-game-once": gameCompleted,
      "ask-chatbot": chatCompleted,
    };

    Object.entries(mapping).forEach(([id, done]) => {
      if (done && !awardedChallenges[id]) {
        setPoints((prev) => prev + 5);
        setAwardedChallenges((prev) => ({ ...prev, [id]: true }));
      }
    });
  }, [history.length, gamePlayed, chatUsed, awardedChallenges]);

  const completedChallenges = {
    "scan-3-items": history.length >= 3,
    "play-game-once": gamePlayed,
    "ask-chatbot": chatUsed,
  };

  const { theme, fontScale } = useSettings();

  const renderActiveScreen = () => {
    if (activeScreen === "home")
      return (
        <HomeScreen
          onNavigate={setActiveScreen}
          points={points}
          streak={streak}
          hasCheckedInToday={hasCheckedInToday}
          onDailyCheckIn={handleDailyCheckIn}
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
        <Text style={[styles.logoText, isLight && styles.logoTextLight, { fontSize: 20 * fontScale }]}>
          ✧˖ AREco ˙✧˖° ༘ ⋆｡˚
        </Text>
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