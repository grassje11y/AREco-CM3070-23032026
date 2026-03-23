import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

//trashbins and their colours + labels
export const SORT_BINS = [
  { id: "paper", label: "PAPER", color: "#2563eb", textColor: "#ffffff" },
  { id: "plastic", label: "PLASTIC", color: "#dc2626", textColor: "#ffffff" },
  { id: "glass", label: "GLASS", color: "#16a34a", textColor: "#ffffff" },
  { id: "metal", label: "METAL", color: "#ca8a04", textColor: "#020617" },
  { id: "trash", label: "General waste", color: "#273438", textColor: "#ffffff" },
];

export const SORT_POOL = [
  { id: "n1", label: "Newspaper", icon: "📰", category: "paper" },
  { id: "n2", label: "Cardboard", icon: "📦", category: "paper" },
  { id: "n3", label: "Magazine", icon: "📓", category: "paper" },
  { id: "p1", label: "Water bottle", icon: "🍼", category: "plastic" },
  { id: "p2", label: "Plastic bag", icon: "🛍️", category: "plastic" },
  { id: "p3", label: "Straw", icon: "🥤", category: "plastic" },
  { id: "g1", label: "Glass jar", icon: "🫙", category: "glass" },
  { id: "g2", label: "Wine bottle", icon: "🍾", category: "glass" },
  { id: "g3", label: "Broken glass", icon: "🥃", category: "glass" },
  { id: "m1", label: "Tomato can", icon: "🥫", category: "metal" },
  { id: "m2", label: "Bubble tea",icon: "🧋", category: "trash" },
  { id: "m3", label: "Tin can", icon: "🥫", category: "metal" },
  { id: "o1", label: "Apple core", icon: "🍎", category: "trash" },
  { id: "o2", label: "Banana peel", icon: "🍌", category: "trash" },
  { id: "o3", label: "Food scraps", icon: "🥗", category: "trash" },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const INITIAL_SECONDS = 30;
const ITEMS_PER_ROUND = 5;
const POINTS_ON_WIN = 20;

function safeHaptics(fn) {
  if (Platform.OS === "web") return;
  fn().catch(() => {});
}

//drag and drop the items before time finishie
export default function TrashSortingGame({ onBack, onEarnPoints }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";

  const [queue, setQueue] = useState(() => shuffle(SORT_POOL).slice(0, ITEMS_PER_ROUND));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [phase, setPhase] = useState("playing"); // playing | won | lost
  const [feedback, setFeedback] = useState("");
  const [pointsSent, setPointsSent] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const binRefs = useRef({});

  const currentItem = queue[index] || null;
  const targetScore = queue.length;

  const resetPan = useCallback(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [pan]);

  const springPanHome = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  }, [pan]);

  const processDrop = useCallback(
    (binId) => {
      if (!currentItem || phase !== "playing") return;

      if (binId === currentItem.category) {
        safeHaptics(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
        setScore((s) => s + 1);
        setFeedback("Nice! Correct bin.");
        resetPan();
        setTimeout(() => {
          setFeedback("");
          setIndex((i) => {
            const next = i + 1;
            if (next >= queue.length) {
              setPhase("won");
              return i;
            }
            return next;
          });
        }, 280);
      } else {
        safeHaptics(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
        setFeedback("Wrong bin — try again!");
        springPanHome();
        setTimeout(() => setFeedback(""), 1200);
      }
    },
    [currentItem, phase, queue.length, resetPan, springPanHome]
  );

  const handleRelease = useCallback(
    (moveX, moveY) => {
      if (!currentItem || phase !== "playing") return;

      let remaining = SORT_BINS.length;
      let matched = null;

      const finishBins = () => {
        if (matched) {
          processDrop(matched);
        } else {
          setFeedback("Drop on a bin!");
          springPanHome();
          setTimeout(() => setFeedback(""), 900);
        }
      };

      SORT_BINS.forEach((bin) => {
        const ref = binRefs.current[bin.id];
        if (!ref) {
          remaining--;
          if (remaining === 0) finishBins();
          return;
        }
        ref.measureInWindow((bx, by, bw, bh) => {
          if (moveX >= bx && moveX <= bx + bw && moveY >= by && moveY <= by + bh) {
            matched = bin.id;
          }
          remaining--;
          if (remaining === 0) finishBins();
        });
      });
    },
    [currentItem, phase, processDrop, springPanHome]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phase === "playing" && !!currentItem,
        onMoveShouldSetPanResponder: () => phase === "playing" && !!currentItem,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (e, gestureState) => {
          const moveX = gestureState.moveX;
          const moveY = gestureState.moveY;
          handleRelease(moveX, moveY);
        },
      }),
    [phase, currentItem, pan, handleRelease]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase((p) => (p === "playing" ? "lost" : p));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "won" && !pointsSent && typeof onEarnPoints === "function") {
      onEarnPoints(POINTS_ON_WIN);
      setPointsSent(true);
    }
  }, [phase, pointsSent, onEarnPoints]);

  const restart = () => {
    safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    setQueue(shuffle(SORT_POOL).slice(0, ITEMS_PER_ROUND));
    setIndex(0);
    setScore(0);
    setSecondsLeft(INITIAL_SECONDS);
    setPhase("playing");
    setFeedback("");
    setPointsSent(false);
    resetPan();
  };

  const bg = isLight ? "#169e38" : "#042912";
  const sky = isLight ? "#3c91cf" : "#001e57";

  return (
    <View style={[styles.root, isLight && styles.rootLight]} accessible accessibilityLabel="Drag and drop sorting game">
      {/* background sky and grass */}
      <View style={[styles.sky, { backgroundColor: sky }]} />
      <View style={[styles.grass, { backgroundColor: bg }]} />

      <View style={styles.layer}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.backBtn, isLight && styles.backBtnLight]}
            onPress={() => {
              safeHaptics(() => Haptics.selectionAsync());
              onBack && onBack();
            }}
            accessibilityLabel="Back"
          >
            <Text style={[styles.backIcon, isLight && styles.backIconLight]}>←</Text>
          </Pressable>
          <View style={[styles.timerBox, isLight && styles.timerBoxLight]}>
            <Text style={[styles.timerText, { fontSize: 18 * fontScale }]}>{secondsLeft}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <Text
          style={[styles.instruction, isLight && styles.instructionLight, { fontSize: 14 * fontScale }]}
        >
          Drag the object to the correct bin
        </Text>

        {/* Active item */}
        <View style={styles.centerStage}>
          <View style={[styles.itemFrame, isLight && styles.itemFrameLight]}>
            {currentItem && phase === "playing" ? (
              <Animated.View
                style={[
                  styles.draggable,
                  { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
                ]}
                collapsable={false}
                {...panResponder.panHandlers}
              >
                <Text style={[styles.itemEmoji, { fontSize: 52 * fontScale }]}>{currentItem.icon}</Text>
                <Text
                  style={[styles.itemLabel, isLight && styles.itemLabelLight, { fontSize: 13 * fontScale }]}
                  numberOfLines={2}
                >
                  {currentItem.label}
                </Text>
              </Animated.View>
            ) : (
              <Text style={[styles.placeholder, { fontSize: 14 * fontScale }]}>
                {phase === "won" ? "🎉" : phase === "lost" ? "⏱️" : ""}
              </Text>
            )}
          </View>
        </View>

        {!!feedback && (
          <Text style={[styles.feedback, isLight && styles.feedbackLight, { fontSize: 13 * fontScale }]}>
            {feedback}
          </Text>
        )}

        {/* trashbins */}
        <View style={styles.binsWrap}>
          {SORT_BINS.map((bin) => (
            <View
              key={bin.id}
              ref={(r) => {
                binRefs.current[bin.id] = r;
              }}
              collapsable={false}
              style={[styles.bin, { backgroundColor: bin.color }]}
            >
              <Text style={[styles.binRecycle, { color: bin.textColor }]}>♻</Text>
              <Text style={[styles.binLabel, { color: bin.textColor, fontSize: 12 * fontScale }]}>
                {bin.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.scoreHint, isLight && styles.scoreHintLight, { fontSize: 12 * fontScale }]}>
            Score: {score} / {targetScore}
          </Text>
          <View style={[styles.scoreBox, isLight && styles.scoreBoxLight]}>
            <Text style={[styles.scoreBoxText, { fontSize: 16 * fontScale }]}>{score}</Text>
          </View>
        </View>

        {phase === "won" && (
          <View style={styles.overlayCard}>
            <Text style={[styles.overlayTitle, { fontSize: 20 * fontScale }]}>Great job!</Text>
            <Text style={[styles.overlaySub, { fontSize: 14 * fontScale }]}>
              Everything is sorted in time! Yay! +{POINTS_ON_WIN} points!
            </Text>
            <Pressable style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.primaryBtnText}>Play again</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                safeHaptics(() => Haptics.selectionAsync());
                onBack && onBack();
              }}
            >
              <Text style={[styles.secondaryBtnText, { fontSize: 14 * fontScale }]}>Back to games</Text>
            </Pressable>
          </View>
        )}

        {phase === "lost" && (
          <View style={styles.overlayCard}>
            <Text style={[styles.overlayTitle, { fontSize: 20 * fontScale }]}>Time&apos;s up!</Text>
            <Text style={[styles.overlaySub, { fontSize: 14 * fontScale }]}>
              You scored {score} / {targetScore}. Try again!
            </Text>
            <Pressable style={styles.primaryBtn} onPress={restart}>
              <Text style={styles.primaryBtnText}>Try again</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                safeHaptics(() => Haptics.selectionAsync());
                onBack && onBack();
              }}
            >
              <Text style={[styles.secondaryBtnText, { fontSize: 14 * fontScale }]}>Back to games</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#14532d",
  },
  rootLight: {
    backgroundColor: "#dcfce7",
  },
  sky: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "38%",
  },
  grass: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "32%",
  },
  layer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6b7280",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnLight: {
    backgroundColor: "#9ca3af",
  },
  backIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  backIconLight: {
    color: "#fff",
  },
  timerBox: {
    minWidth: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "pink",
    alignItems: "center",
  },
  timerBoxLight: {
    backgroundColor: "#3b82f6",
  },
  timerText: {
    color: "#020617",
    fontWeight: "800",
  },
  instruction: {
    color: "#fef08a",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionLight: {
    color: "#854d0e",
    textShadowColor: "transparent",
  },
  centerStage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 140,
  },
  itemFrame: {
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: "#020617",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemFrameLight: {
    backgroundColor: "#ffffff",
    borderColor: "#334155",
  },
  draggable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  itemEmoji: {
    marginBottom: 4,
  },
  itemLabel: {
    color: "#f8fafc",
    fontWeight: "700",
    textAlign: "center",
  },
  itemLabelLight: {
    color: "#020617",
  },
  placeholder: {
    color: "#64748b",
  },
  feedback: {
    textAlign: "center",
    color: "#fef08a",
    fontWeight: "600",
    minHeight: 22,
    marginBottom: 4,
  },
  feedbackLight: {
    color: "#b45309",
  },
  binsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  bin: {
    width: "17%",
    minWidth: 58,
    aspectRatio: 0.85,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
  },
  binRecycle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  binLabel: {
    fontWeight: "800",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  scoreHint: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  scoreHintLight: {
    color: "#334155",
  },
  scoreBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBoxLight: {
    backgroundColor: "#3b82f6",
  },
  scoreBoxText: {
    color: "#fff",
    fontWeight: "800",
  },
  overlayCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  overlayTitle: {
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: 8,
  },
  overlaySub: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: "pink",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryBtn: {
    padding: 12,
  },
  secondaryBtnText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
});
