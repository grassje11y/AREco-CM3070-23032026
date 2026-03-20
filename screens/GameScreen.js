import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

const BINS = [
  { id: "plastic", label: "Plastic", color: "#22c55e" },
  { id: "paper", label: "Paper", color: "#3b82f6" },
  { id: "glass", label: "Glass", color: "#0ea5e9" },
  { id: "metal", label: "Metal", color: "#a855f7" },
  { id: "trash", label: "Trash", color: "#6b7280" },
];

const BASE_ITEMS = [
  { id: "1", label: "Water bottle", icon: "🥤", type: "plastic" },
  { id: "2", label: "Newspaper", icon: "📰", type: "paper" },
  { id: "3", label: "Glass jar", icon: "🥫", type: "glass" },
  { id: "4", label: "Aluminium can", icon: "🥫", type: "metal" },
  { id: "5", label: "Plastic bag", icon: "🛍️", type: "plastic" },
  { id: "6", label: "Cardboard box", icon: "📦", type: "paper" },
  { id: "7", label: "Broken mug", icon: "☕", type: "trash" },
  { id: "8", label: "Food wrapper", icon: "🍫", type: "trash" },
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function GameScreen({ onEarnPoints }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";
  const [items, setItems] = useState(() => shuffle(BASE_ITEMS).slice(0, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Tap an item, then tap the correct bin.");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const currentItem = items[currentIndex] || null;
  const remaining = useMemo(() => items.length - currentIndex, [items.length, currentIndex]);

  const resetGame = () => {
    setItems(shuffle(BASE_ITEMS).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setMessage("New round! Tap an item, then tap the correct bin.");
    setSelectedItemId(null);
    setPointsAwarded(false);
  };

  const handleSelectItem = async (itemId) => {
    await Haptics.selectionAsync();
    setSelectedItemId(itemId);
    setMessage("Now tap the correct bin for this item.");
  };

  const handleDropOnBin = async (binId) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const item = items.find((it) => it.id === selectedItemId) || currentItem;
    if (!item) return;

    const correct = item.type === binId;

    if (correct) {
      setScore((s) => s + 1);
      setMessage(`Nice! "${item.label}" belongs in ${BINS.find((b) => b.id === binId)?.label || "that bin"}.`);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedItemId(null);
    } else {
      setMessage("Try again – think about what the item is made of.");
    }
  };

  const gameFinished = currentIndex >= items.length;

  useEffect(() => {
    if (gameFinished && !pointsAwarded && typeof onEarnPoints === "function") {
      onEarnPoints(20);
      setPointsAwarded(true);
    }
  }, [gameFinished, pointsAwarded, onEarnPoints]);

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Recycling sorting mini game"
    >
      <View style={styles.scoreRow}>
        <Text
          style={[styles.scoreText, isLight && styles.scoreTextLight, { fontSize: 14 * fontScale }]}
        >
          Score: {score}
        </Text>
        <Text
          style={[styles.scoreText, isLight && styles.scoreTextLight, { fontSize: 14 * fontScale }]}
        >
          Items left: {Math.max(remaining, 0)}
        </Text>
      </View>

      {!gameFinished ? (
        <>
          <View style={styles.itemsArea}>
            <Text
              style={[styles.sectionTitle, isLight && styles.sectionTitleLight, { fontSize: 14 * fontScale }]}
            >
              Items to sort
            </Text>
            <View style={styles.itemsRow}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isLight && styles.itemCardLight,
                    selectedItemId === item.id && styles.itemCardSelected,
                    currentItem?.id === item.id && !selectedItemId && styles.itemCardHighlight,
                  ]}
                  onPress={() => handleSelectItem(item.id)}
                  accessibilityLabel={`Select item ${item.label}`}
                >
                  <Text style={[styles.itemIcon, { fontSize: 24 * fontScale }]}>{item.icon}</Text>
                  <Text
                    style={[styles.itemLabel, isLight && styles.itemLabelLight, { fontSize: 13 * fontScale }]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.messageArea}>
            <Text
              style={[styles.messageText, isLight && styles.messageTextLight, { fontSize: 13 * fontScale }]}
            >
              {message}
            </Text>
          </View>

          <View style={styles.binsArea}>
            <Text
              style={[styles.sectionTitle, isLight && styles.sectionTitleLight, { fontSize: 14 * fontScale }]}
            >
              Bins
            </Text>
            <View style={styles.binsRow}>
              {BINS.map((bin) => (
                <Pressable
                  key={bin.id}
                  style={[styles.binCard, { backgroundColor: bin.color }]}
                  onPress={() => handleDropOnBin(bin.id)}
                  accessibilityLabel={`Bin ${bin.label}`}
                >
                  <Text style={[styles.binLabel, { fontSize: 14 * fontScale }]}>{bin.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.finishedArea}>
          <Text
            style={[
              styles.finishedTitle,
              isLight && styles.finishedTitleLight,
              { fontSize: 20 * fontScale },
            ]}
          >
            Great job!
          </Text>
          <Text
            style={[
              styles.finishedText,
              isLight && styles.finishedTextLight,
              { fontSize: 14 * fontScale },
            ]}
          >
            You sorted all the items correctly.
          </Text>
          <Pressable
            style={styles.resetButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              resetGame();
            }}
          >
            <Text style={styles.resetButtonText}>Play again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  containerLight: {
    backgroundColor: "#f1f5f9",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  scoreText: {
    color: "#e5e7eb",
    fontWeight: "700",
  },
  scoreTextLight: {
    color: "#020617",
  },
  itemsArea: {
    flex: 1.3,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitleLight: {
    color: "#020617",
  },
  itemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: "47%",
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  itemCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  itemCardSelected: {
    borderColor: "pink",
    borderWidth: 2,
  },
  itemCardHighlight: {
    borderColor: "#4ade80",
  },
  itemIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  itemLabel: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  itemLabelLight: {
    color: "#020617",
  },
  messageArea: {
    minHeight: 56,
    justifyContent: "center",
    marginVertical: 4,
  },
  messageText: {
    color: "#9ca3af",
  },
  messageTextLight: {
    color: "#4b5563",
  },
  binsArea: {
    flex: 1,
    marginTop: 4,
  },
  binsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  binCard: {
    width: "47%",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  binLabel: {
    color: "#020617",
    fontWeight: "800",
    textAlign: "center",
  },
  finishedArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  finishedTitle: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  finishedTitleLight: {
    color: "#020617",
  },
  finishedText: {
    color: "#9ca3af",
    marginBottom: 16,
  },
  finishedTextLight: {
    color: "#4b5563",
  },
  resetButton: {
    backgroundColor: "pink",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  resetButtonText: {
    color: "#020617",
    fontWeight: "800",
  },
});

