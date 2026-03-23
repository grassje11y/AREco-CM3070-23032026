import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

//scrub dirty recyclables till its clean
const ITEM_POOL = [
  {
    id: "p1",
    label: "Plastic  bottle",
    icon: "🍼",
    material: "plastic",
    mess: "sticky soda residue",
  },
  {
    id: "p2",
    label: "Yogurt tub",
    icon: "🥛",
    material: "plastic",
    mess: "dried yogurt film",
  },
  {
    id: "g1",
    label: "Glass jar",
    icon: "🫙",
    material: "glass",
    mess: "sticky jam inside",
  },
  {
    id: "g2",
    label: "Wine glass",
    icon: "🍷",
    material: "glass",
    mess: "wine residue",
  },
  {
    id: "m1",
    label: "Metal can",
    icon: "🥫",
    material: "metal",
    mess: "food bits stuck in the rim",
  },
  {
    id: "m2",
    label: "Metal utensils",
    icon: "🍴",
    material: "metal",
    mess: "greasy residue",
  },
  {
    id: "p3",
    label: "Takeaway container",
    icon: "🍽",
    material: "plastic",
    mess: "curry oil coating",
  },
  {
    id: "g3",
    label: "Wine bottle",
    icon: "🍾",
    material: "glass",
    mess: "labels & dust (rinse inside)",
  },
];

const ROUND_SIZE = 4;
const BONUS_POINTS = 20;
const MAX_CLEAN = 100;

export const MATERIAL_TIP = {
  plastic: "Tip: Empty, rinse, and let plastic bottles dry, wet loads can spoil recycling.",
  glass: "Tip: Rinse glass jars; remove lids if your programme asks for them separately.",
  metal: "Tip: Rinse items so food doesn’t contaminate other metals in the bin.",
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export default function WashRecyclablesGame({ onBack, onEarnPoints }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";

  const [queue, setQueue] = useState(() => shuffle(ITEM_POOL).slice(0, ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [phase, setPhase] = useState("wash"); // wash | itemDone | roundDone
  const [pointsSent, setPointsSent] = useState(false);
  const [message, setMessage] = useState("");

  const item = queue[index];
  const grimeOpacity = useMemo(() => {
    const dirty = 1 - cleanliness / MAX_CLEAN;
    return Math.max(0, Math.min(1, dirty * 0.75));
  }, [cleanliness]);

  const roundComplete = index >= queue.length;

  useEffect(() => {
    if (roundComplete && !pointsSent && typeof onEarnPoints === "function") {
      onEarnPoints(BONUS_POINTS);
      setPointsSent(true);
    }
  }, [roundComplete, pointsSent, onEarnPoints]);

  const pulseHaptic = async (light) => {
    try {
      await Haptics.impactAsync(
        light ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    } catch {
      /* ignore */
    }
  };

  const addClean = async (amount) => {
    if (phase !== "wash" || !item) return;
    await pulseHaptic(true);
    setCleanliness((c) => {
      const next = Math.min(MAX_CLEAN, c + amount);
      if (next >= MAX_CLEAN && c < MAX_CLEAN) {
        requestAnimationFrame(() => {
          setPhase("itemDone");
          setMessage(`Clean enough to recycle! ${MATERIAL_TIP[item.material] || ""}`);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        });
      }
      return next;
    });
  };

  const rinse = () => addClean(randInt(10, 18));
  const scrub = () => addClean(randInt(14, 24));

  const nextItem = async () => {
    await pulseHaptic(false);
    setMessage("");
    setCleanliness(0);
    setPhase("wash");
    setIndex((i) => i + 1);
  };

  const restartRound = () => {
    setQueue(shuffle(ITEM_POOL).slice(0, ROUND_SIZE));
    setIndex(0);
    setCleanliness(0);
    setPhase("wash");
    setMessage("");
    setPointsSent(false);
  };

  return (
    <ScrollView
      style={[styles.root, isLight && styles.rootLight]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      accessible
      accessibilityLabel="Wash recyclables mini game"
    >
      <Pressable
        style={[styles.backRow, isLight && styles.backRowLight]}
        onPress={async () => {
          await Haptics.selectionAsync();
          onBack && onBack();
        }}
      >
        <Text style={[styles.backText, isLight && styles.backTextLight, { fontSize: 14 * fontScale }]}>
          ← Other games
        </Text>
      </Pressable>

      <Text style={[styles.title, isLight && styles.titleLight, { fontSize: 20 * fontScale }]}>
        Rinse &amp; recycle
      </Text>
      <Text style={[styles.sub, isLight && styles.subLight, { fontSize: 13 * fontScale }]}>
        Contaminated plastic, glass, and metal often cannot be recycled until they are clean. Scrub and rinse each item until the bar is full.
      </Text>

      {!roundComplete && item && (
        <>
          <Text style={[styles.progress, isLight && styles.progressLight, { fontSize: 12 * fontScale }]}>
            Item {index + 1} of {queue.length} · {item.material}
          </Text>

          <View style={[styles.card, isLight && styles.cardLight]}>
            <Text style={[styles.itemLabel, isLight && styles.itemLabelLight, { fontSize: 15 * fontScale }]}>
              {item.label}
            </Text>
            <Text style={[styles.messLine, isLight && styles.messLineLight, { fontSize: 13 * fontScale }]}>
              Problem: {item.mess}
            </Text>

            <View style={styles.emojiStage}>
              <Text style={[styles.bigEmoji, { fontSize: 72 * fontScale }]}>{item.icon}</Text>
              <View
                pointerEvents="none"
                style={[
                  styles.grimeLayer,
                  { opacity: grimeOpacity, backgroundColor: "rgba(101, 67, 33, 0.55)" },
                ]}
              />
            </View>

            <View style={[styles.barTrack, isLight && styles.barTrackLight]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(cleanliness / MAX_CLEAN) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, isLight && styles.barLabelLight, { fontSize: 12 * fontScale }]}>
              Clean enough for recycling: {Math.round(cleanliness)}%
            </Text>

            {phase === "wash" && (
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionBtn, styles.rinseBtn]}
                  onPress={rinse}
                  accessibilityLabel="Rinse under water"
                >
                  <Text style={styles.actionEmoji}>💧</Text>
                  <Text style={[styles.actionText, { fontSize: 14 * fontScale }]}>Rinse</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.scrubBtn]}
                  onPress={scrub}
                  accessibilityLabel="Scrub clean"
                >
                  <Text style={styles.actionEmoji}>🧽</Text>
                  <Text style={[styles.actionText, { fontSize: 14 * fontScale }]}>Scrub</Text>
                </Pressable>
              </View>
            )}

            {phase === "itemDone" && (
              <View style={styles.doneBlock}>
                <Text style={[styles.doneMsg, isLight && styles.doneMsgLight, { fontSize: 13 * fontScale }]}>
                  {message}
                </Text>
                <Pressable style={styles.nextBtn} onPress={nextItem}>
                  <Text style={styles.nextBtnText}>
                    {index + 1 >= queue.length ? "Finish round" : "Next item"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}

      {roundComplete && (
        <View style={[styles.card, isLight && styles.cardLight]}>
          <Text style={[styles.roundTitle, isLight && styles.roundTitleLight, { fontSize: 20 * fontScale }]}>
            All clean!
          </Text>
          <Text style={[styles.roundSub, isLight && styles.roundSubLight, { fontSize: 14 * fontScale }]}>
            You prepped {queue.length} recyclables. In real life, a quick rinse helps keep recycling loads
            from being rejected. +{BONUS_POINTS} points!
          </Text>
          <Pressable
            style={styles.nextBtn}
            onPress={async () => {
              await pulseHaptic(false);
              restartRound();
            }}
          >
            <Text style={styles.nextBtnText}>Play again</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  rootLight: {
    backgroundColor: "#f1f5f9",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  backRow: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 6,
  },
  backRowLight: {},
  backText: {
    color: "#93c5fd",
    fontWeight: "700",
  },
  backTextLight: {
    color: "#2563eb",
  },
  title: {
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: 6,
  },
  titleLight: {
    color: "#020617",
  },
  sub: {
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 14,
  },
  subLight: {
    color: "#64748b",
  },
  progress: {
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "capitalize",
  },
  progressLight: {
    color: "#475569",
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  itemLabel: {
    color: "#e2e8f0",
    fontWeight: "800",
    marginBottom: 4,
  },
  itemLabelLight: {
    color: "#0f172a",
  },
  messLine: {
    color: "#94a3b8",
    marginBottom: 14,
  },
  messLineLight: {
    color: "#64748b",
  },
  emojiStage: {
    alignSelf: "center",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  bigEmoji: {
    lineHeight: 88,
  },
  grimeLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  barTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    overflow: "hidden",
    marginBottom: 6,
  },
  barTrackLight: {
    backgroundColor: "#e2e8f0",
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#38bdf8",
    minWidth: 4,
  },
  barLabel: {
    color: "#64748b",
    marginBottom: 16,
  },
  barLabelLight: {
    color: "#475569",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  actionBtn: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  rinseBtn: {
    backgroundColor: "#0c4a6e",
    borderColor: "#0284c7",
  },
  scrubBtn: {
    backgroundColor: "#713f12",
    borderColor: "#ca8a04",
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionText: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  doneBlock: {
    marginTop: 4,
  },
  doneMsg: {
    color: "#86efac",
    lineHeight: 20,
    marginBottom: 14,
  },
  doneMsgLight: {
    color: "#15803d",
  },
  nextBtn: {
    backgroundColor: "#ec4899",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 16,
  },
  roundTitle: {
    color: "#f8fafc",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  roundTitleLight: {
    color: "#020617",
  },
  roundSub: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  roundSubLight: {
    color: "#64748b",
  },
});
