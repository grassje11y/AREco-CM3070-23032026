import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";
import { TrashSortingGame, FillInBlanksGame, WashRecyclablesGame } from "../games";

// shows a picker or mounts one mini game based on which card the user chose
export default function GameScreen({ onEarnPoints }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";
  /** null = picker | "drag" | "words" | "wash" */
  const [gameMode, setGameMode] = useState(null);

  if (gameMode === "wash") {
    return (
      <WashRecyclablesGame
        onBack={() => setGameMode(null)}
        onEarnPoints={onEarnPoints}
      />
    );
  }

  if (gameMode === "words") {
    return (
      <FillInBlanksGame
        onBack={() => setGameMode(null)}
        onEarnPoints={onEarnPoints}
      />
    );
  }

  if (gameMode === "drag") {
    return (
      <TrashSortingGame
        onBack={() => setGameMode(null)}
        onEarnPoints={onEarnPoints}
      />
    );
  }

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Choose a recycling game"
    >
      <Text
        style={[styles.pickerTitle, isLight && styles.pickerTitleLight, { fontSize: 20 * fontScale }]}
      >
        Recycling games
      </Text>
      <Text
        style={[styles.pickerSub, isLight && styles.pickerSubLight, { fontSize: 14 * fontScale }]}
      >
        Pick a game you like. Finishing a round can earn points.
      </Text>
      <Pressable
        style={[styles.modeCard, styles.modeCardAccent, isLight && styles.modeCardAccentLight]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setGameMode("drag");
        }}
      >
        <Text style={[styles.modeCardTitle, { fontSize: 16 * fontScale }]}>Sort this trash!</Text>
        <Text style={[styles.modeCardDesc, { fontSize: 13 * fontScale, color: "#ffffff" }]}>
          Help clean up this area! Drag and sort the items into the correct bins.
        </Text>
      </Pressable>
      <Pressable
        style={[styles.modeCard, styles.modeCardWords, isLight && styles.modeCardWordsLight]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setGameMode("words");
        }}
      >
        <Text style={[styles.modeCardTitle, { fontSize: 16 * fontScale }]}>Fill in the blanks</Text>
        <Text style={[styles.modeCardDesc, { fontSize: 13 * fontScale, color: "#ffffff" }]}>
          Guess the missing word! Test your knowledge.✦ ݁˖
        </Text>
      </Pressable>
      <Pressable
        style={[styles.modeCard, styles.modeCardWash, isLight && styles.modeCardWashLight]}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setGameMode("wash");
        }}
      >
        <Text style={[styles.modeCardTitle, { fontSize: 16 * fontScale }]}>Decontaminate these items</Text>
        <Text style={[styles.modeCardDesc, { fontSize: 13 * fontScale, color: "#ffffff" }]}>
          Wash contaminated items until they are clean enough to be recycled.
        </Text>
      </Pressable>
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
  pickerTitle: {
    color: "#f8fafc",
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  pickerTitleLight: {
    color: "#020617",
  },
  pickerSub: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  pickerSubLight: {
    color: "#64748b",
  },
  modeCard: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modeCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  modeCardAccent: {
    backgroundColor: "#21a33d",
    borderColor: "#166534",
  },
  modeCardAccentLight: {
    backgroundColor: "#16a34a",
    borderColor: "#15803d",
  },
  modeCardWords: {
    backgroundColor: "#ab3071",
    borderColor: "#4c1d95",
  },
  modeCardWordsLight: {
    backgroundColor: "#cf4e93",
    borderColor: "#6d28d9",
  },
  modeCardWash: {
    backgroundColor: "#03398f",
    borderColor: "#0f766e",
  },
  modeCardWashLight: {
    backgroundColor: "#0081d1",
    borderColor: "#0891b2",
  },
  modeCardTitle: {
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: 6,
  },
  modeCardTitleLight: {
    color: "#020617",
  },
  modeCardDesc: {
    color: "#94a3b8",
    lineHeight: 20,
  },
  modeCardDescLight: {
    color: "#475569",
  },
});
