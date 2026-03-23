import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

export default function HomeScreen({
  onNavigate,
  points,
  streak,
  hasCheckedInToday,
  onDailyCheckIn,
  dailyChallenges = [],
  completedChallenges,
}) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";

  return (
    <ScrollView
      style={[styles.homeScrollOuter, isLight && styles.homeScrollOuterLight]}
      contentContainerStyle={styles.homeContentContainer}
      accessible
      accessibilityLabel="Home screen"
    >
      <View style={styles.homeHero}>
        <Text
          style={[
            styles.homeTitle,
            isLight && styles.homeTitleLight,
            { fontSize: 28 * fontScale },
          ]}
        >
          Welcome to AREco
        </Text>
        <Text
          style={[
            styles.homeSubtitle,
            isLight && styles.homeSubtitleLight,
            { fontSize: 14 * fontScale },
          ]}
        >
          Scan items, classify them, and ask OCERA for help with recycling when in doubt!
        </Text>
      </View>
      <View style={styles.mainContent}>
        <View style={[styles.statsCard, isLight && styles.statsCardLight]}>
          <View style={styles.statsRow}>
            <View>
              <Text
                style={[styles.statsLabel, isLight && styles.statsLabelLight, { fontSize: 12 * fontScale }]}
                numberOfLines={1}
              >
                Points
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  isLight && styles.statsValueLight,
                  { fontSize: 18 * fontScale },
                ]}
              >
                {points}
              </Text>
            </View>
            <View>
              <Text style={[styles.statsLabel, isLight && styles.statsLabelLight, { fontSize: 12 * fontScale }]}>
                Daily streak
              </Text>
              <Text
                style={[
                  styles.statsValue,
                  isLight && styles.statsValueLight,
                  { fontSize: 18 * fontScale },
                ]}
              >
                {streak} days
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.checkInButton, hasCheckedInToday && styles.checkInButtonDisabled]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDailyCheckIn && onDailyCheckIn();
            }}
            disabled={hasCheckedInToday}
          >
            <Text style={[styles.checkInButtonText, { fontSize: 13 * fontScale }]}>
              {hasCheckedInToday ? "Checked in today" : "Daily check-in (+points)"}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.challengeCard, isLight && styles.challengeCardLight]}>
          <Text
            style={[styles.challengeTitle, isLight && styles.challengeTitleLight, { fontSize: 16 * fontScale }]}
          >
            AREco Challenges
          </Text>
          <Text
            style={[
              styles.challengeSubtitle,
              isLight && styles.challengeSubtitleLight,
              { fontSize: 13 * fontScale },
            ]}
          >
            3 random challenges each day — +5 points each when completed.
          </Text>
          {dailyChallenges.map((ch) => {
            const done = completedChallenges?.[ch.id];
            const targetScreen = ch.screen;
            return (
              <View key={ch.id} style={styles.challengeRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.challengeItemTitle,
                      isLight && styles.challengeItemTitleLight,
                      { fontSize: 14 * fontScale },
                    ]}
                  >
                    {ch.title}
                  </Text>
                  <Text
                    style={[
                      styles.challengeItem,
                      isLight && styles.challengeItemLight,
                      { fontSize: 12 * fontScale },
                    ]}
                  >
                    {ch.description}
                  </Text>
                </View>
                <Pressable
                  style={[styles.challengeBtn, done && styles.challengeBtnDone]}
                  disabled={done}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (done) return;
                    if (onNavigate && targetScreen) {
                      onNavigate(targetScreen);
                    }
                  }}
                  accessibilityLabel={done ? "Challenge completed" : `Go to ${ch.title}`}
                >
                  <Text
                    style={[styles.challengeBtnText, { fontSize: 12 * fontScale }]}
                  >
                    {done ? "Done" : "+5 pts"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeScrollOuter: {
    flex: 1,
  },
  homeScrollOuterLight: {
    backgroundColor: "#f1f5f9",
  },
  homeContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    justifyContent: "flex-start",
  },
  homeHero: {
    paddingTop: 32,
  },
  homeTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  homeTitleLight: {
    color: "#020617",
  },
  homeSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
  },
  homeSubtitleLight: {
    color: "#4b5563",
  },
  statsCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  statsCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 2,
  },
  statsLabelLight: {
    color: "#4b5563",
  },
  statsValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  statsValueLight: {
    color: "#020617",
  },
  checkInButton: {
    marginTop: 4,
    backgroundColor: "pink",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 13,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  challengeCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  challengeCardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  challengeTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  challengeTitleLight: {
    color: "#020617",
  },
  challengeSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 8,
  },
  challengeSubtitleLight: {
    color: "#6b7280",
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeItemTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  challengeItemTitleLight: {
    color: "#020617",
  },
  challengeItem: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  challengeItemLight: {
    color: "#4b5563",
  },
  challengeBtn: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "pink",
  },
  challengeBtnDone: {
    backgroundColor: "#22c55e",
  },
  challengeBtnText: {
    color: "#020617",
    fontSize: 12,
    fontWeight: "700",
  },
});

