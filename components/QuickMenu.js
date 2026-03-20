import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

export default function QuickActionsMenu({ onNavigate }) {
  const { theme, fontScale } = useSettings();
  const isLight = theme === "light";
  const [open, setOpen] = useState(false);

  const safeHaptics = async (cb) => {
    // `expo-haptics` is not reliably supported on the web build.
    // Avoid crashing the whole app on web.
    if (Platform.OS === "web") return;
    try {
      await cb();
    } catch {
      // Ignore haptic failures on unsupported platforms.
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.menuToggle, isLight && styles.menuToggleLight]}
        onPress={async () => {
          await safeHaptics(() => Haptics.selectionAsync());
          setOpen((prev) => !prev);
        }}
        accessibilityLabel="Toggle the menu"
      >
        <Text
          style={[
            styles.menuToggleIcon,
            isLight && styles.menuToggleIconLight,
            { fontSize: 16 * fontScale },
          ]}
        >
          ☰
        </Text>
        <Text
          style={[
            styles.menuToggleText,
            isLight && styles.menuToggleTextLight,
            { fontSize: 15 * fontScale },
          ]}
        >
         ⤷ ゛Menu ˎˊ˗ 
        </Text>
      </Pressable>

      {open && (
        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("home");
              setOpen(false);
            }}
            accessibilityLabel="Go to home screen"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              Home
            </Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, isLight && styles.primaryButtonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("scanner");
              setOpen(false);
            }}
            accessibilityLabel="Start scanning items"
          >
            <Text
              style={[
                styles.primaryButtonText,
                isLight && styles.primaryButtonTextLight,
                { fontSize: 16 * fontScale },
              ]}
            >
              Start Scanning
            </Text>
            <Text
              style={[
                styles.primaryButtonSub,
                isLight && styles.primaryButtonSubLight,
                { fontSize: 13 * fontScale },
              ]}
            >
             Scan your items here
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("game");
              setOpen(false);
            }}
            accessibilityLabel="Play the recycling game"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              Play Recycling Game
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("search");
              setOpen(false);
            }}
            accessibilityLabel="NEA recycling search engine"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              NEA Recycling Search Engine
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("history");
              setOpen(false);
            }}
            accessibilityLabel="View scan history"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              View Scan History
            </Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, isLight && styles.primaryButtonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("tips");
              setOpen(false);
            }}
            accessibilityLabel="Click for OCERA, the recycling chatbot!"
          >
            <Text style={[
                styles.primaryButtonText,
                isLight && styles.primaryButtonTextLight,
                { fontSize: 16 * fontScale },
              ]}
            >
              OCERA
            </Text>
            <Text
              style={[
                styles.primaryButtonSub,
                isLight && styles.primaryButtonSubLight,
                { fontSize: 13 * fontScale },
              ]}
            >
             Ask OCERA, the recycling chatbot for help with classification!
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("ar");
              setOpen(false);
            }}
            accessibilityLabel="Open AR screen"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
                
              ]}
            >
              Play around with AR
            </Text>
          </Pressable>
          
           <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("prizes");
              setOpen(false);
            }}
            accessibilityLabel="prizes store"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              Prizes
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, isLight && styles.buttonLight]}
            onPress={async () => {
              await safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
              onNavigate("settings");
              setOpen(false);
            }}
            accessibilityLabel="Open settings"
          >
            <Text
              style={[
                styles.buttonText,
                isLight && styles.buttonTextLight,
                { fontSize: 15 * fontScale },
              ]}
            >
              Settings
            </Text>
          </Pressable>


        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  menuToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 999,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 18,
    marginBottom: 5,
  },
  menuToggleLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  menuToggleIcon: {
    color: "#e5e7eb",
    fontSize: 16,
    marginRight: 8,
  },
  menuToggleIconLight: {
    color: "#020617",
  },
  menuToggleText: {
    color: "#e5e7eb",
    fontWeight: "700",
  },
  menuToggleTextLight: {
    color: "#020617",
  },
  buttons: {
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "pink",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  primaryButtonLight: {
    backgroundColor: "pink",
  },
  primaryButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  primaryButtonTextLight: {
    color: "#020617",
  },
  primaryButtonSub: {
    color: "#020617",
    fontSize: 13,
    opacity: 0.9,
  },
  primaryButtonSubLight: {
    color: "#111827",
  },
  button: {
    backgroundColor: "#020617",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  buttonLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonTextLight: {
    color: "#020617",
  },
});

