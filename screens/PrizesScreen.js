import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

const PRIZES = [
  { id: "badge-honour", name: "Badge of Honour", cost: 5023680, description: "For recycling so consistently!" },
  { id: "theme-cool", name: "Really cool theme", cost: 80670081, description: "Unlock the coolest theme" },
  { id: "avatar-pet", name: "A really awesome pet avatar", cost: 12020907830, description: "Adopt the most awesome recycling pet" },
];

export default function PrizesScreen({ points, onRedeem }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";
  const [recentRedeemedId, setRecentRedeemedId] = useState(null);

  // tell parent to spend points then mark this prize as redeemed in the ui when it succeeds
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
              style={[styles.prizeContainer, isLight && styles.prizeContainerLight]}
            >
              <View style={[styles.prizeIconWrap, isLight && styles.prizeIconWrapLight]}>
                <Text style={[styles.prizeIcon, { fontSize: 28 * fontScale }]}>🎁</Text>
              </View>
              <View style={styles.prizeBody}>
                <Text
                  style={[
                    styles.prizeName,
                    isLight && styles.prizeNameLight,
                    { fontSize: 17 * fontScale },
                  ]}
                >
                  {prize.name}
                </Text>
                <Text
                  style={[
                    styles.prizeDescription,
                    isLight && styles.prizeDescriptionLight,
                    { fontSize: 14 * fontScale },
                  ]}
                >
                  {prize.description}
                </Text>
                <View style={[styles.costPill, isLight && styles.costPillLight]}>
                  <Text
                    style={[
                      styles.prizeCost,
                      isLight && styles.prizeCostLight,
                      { fontSize: 13 * fontScale },
                    ]}
                  >
                    {prize.cost.toLocaleString()} pts
                  </Text>
                </View>
                {recently && (
                  <Text
                    style={[
                      styles.redeemedText,
                      isLight && styles.redeemedTextLight,
                      { fontSize: 12 * fontScale },
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
                <Text style={[styles.redeemButtonText, { fontSize: 15 * fontScale }]}>
                  {affordable ? "Redeem prize" : "Not enough points"}
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
    gap: 16,
    paddingBottom: 24,
  },
  prizeContainer: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "#334155",
    marginBottom: 4,
    minHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  prizeContainerLight: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
    ...Platform.select({
      ios: {
        shadowColor: "#64748b",
        shadowOpacity: 0.15,
      },
      default: {},
    }),
  },
  prizeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#475569",
  },
  prizeIconWrapLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  prizeIcon: {
    lineHeight: 34,
  },
  prizeBody: {
    flexGrow: 1,
    marginBottom: 16,
  },
  costPill: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#475569",
  },
  costPillLight: {
    backgroundColor: "#e2e8f0",
    borderColor: "#cbd5e1",
  },
  prizeName: {
    color: "white",
    fontWeight: "800",
    marginBottom: 8,
  },
  prizeNameLight: {
    color: "#020617",
  },
  prizeDescription: {
    color: "#9ca3af",
    marginBottom: 0,
    lineHeight: 22,
  },
  prizeDescriptionLight: {
    color: "#4b5563",
  },
  prizeCost: {
    color: "#f1f5f9",
    fontWeight: "700",
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#f472b6",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  redeemButtonDisabled: {
    backgroundColor: "#475569",
  },
  redeemButtonText: {
    color: "#020617",
    fontWeight: "800",
  },
});

