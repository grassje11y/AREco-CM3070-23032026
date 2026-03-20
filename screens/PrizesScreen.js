import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

const PRIZES = [
  { id: "badge-eco-explorer", name: "Eco Explorer badge", cost: 50, description: "Show off your 50-point eco streak." },
  { id: "theme-leaf", name: "Leaf accent theme", cost: 80, description: "Unlock a subtle leafy accent for future designs." },
  { id: "avatar-pet", name: "Recycling pet avatar", cost: 120, description: "Adopt a cute recycling pet for your profile." },
];

export default function PrizesScreen({ points, onRedeem }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";
  const [recentRedeemedId, setRecentRedeemedId] = useState(null);

  const handleRedeem = async (prize) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (typeof onRedeem === "function") {
      const success = onRedeem(prize);
      if (success) {
        setRecentRedeemedId(prize.id);
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Prizes screen"
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            isLight && styles.titleLight,
            { fontSize: 20 * fontScale },
          ]}
        >
          Redeem your points
        </Text>
        <Text
          style={[
            styles.pointsText,
            isLight && styles.pointsTextLight,
            { fontSize: 14 * fontScale },
          ]}
        >
          You currently have {points} points.
        </Text>
      </View>

      <View style={styles.prizeList}>
        {PRIZES.map((prize) => {
          const affordable = points >= prize.cost;
          const recently = recentRedeemedId === prize.id;
          return (
            <View
              key={prize.id}
              style={[styles.prizeCard, isLight && styles.prizeCardLight]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.prizeName,
                    isLight && styles.prizeNameLight,
                    { fontSize: 15 * fontScale },
                  ]}
                >
                  {prize.name}
                </Text>
                <Text
                  style={[
                    styles.prizeDescription,
                    isLight && styles.prizeDescriptionLight,
                    { fontSize: 13 * fontScale },
                  ]}
                >
                  {prize.description}
                </Text>
                <Text
                  style={[
                    styles.prizeCost,
                    isLight && styles.prizeCostLight,
                    { fontSize: 12 * fontScale },
                  ]}
                >
                  Cost: {prize.cost} pts
                </Text>
                {recently && (
                  <Text
                    style={[
                      styles.redeemedText,
                      isLight && styles.redeemedTextLight,
                      { fontSize: 11 * fontScale },
                    ]}
                  >
                    Redeemed! (for demo purposes only)
                  </Text>
                )}
              </View>
              <Pressable
                style={[
                  styles.redeemButton,
                  !affordable && styles.redeemButtonDisabled,
                ]}
                disabled={!affordable}
                onPress={() => handleRedeem(prize)}
                accessibilityLabel={
                  affordable
                    ? `Redeem ${prize.name} for ${prize.cost} points`
                    : `Need more points to redeem ${prize.name}`
                }
              >
                <Text style={styles.redeemButtonText}>
                  {affordable ? "Redeem" : "Need points"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  containerLight: {
    backgroundColor: "#f1f5f9",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  titleLight: {
    color: "#020617",
  },
  pointsText: {
    color: "#9ca3af",
  },
  pointsTextLight: {
    color: "#4b5563",
  },
  prizeList: {
    gap: 12,
  },
  prizeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
  },
  prizeCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  prizeName: {
    color: "white",
    fontWeight: "700",
    marginBottom: 2,
  },
  prizeNameLight: {
    color: "#020617",
  },
  prizeDescription: {
    color: "#9ca3af",
    marginBottom: 4,
  },
  prizeDescriptionLight: {
    color: "#4b5563",
  },
  prizeCost: {
    color: "#cbd5e1",
  },
  prizeCostLight: {
    color: "#0f172a",
  },
  redeemedText: {
    marginTop: 4,
    color: "#22c55e",
  },
  redeemedTextLight: {
    color: "#16a34a",
  },
  redeemButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "pink",
  },
  redeemButtonDisabled: {
    backgroundColor: "#4b5563",
  },
  redeemButtonText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 13,
  },
});

