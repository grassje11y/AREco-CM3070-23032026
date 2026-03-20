import React from "react";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

export default function SettingsScreen() {
  const {
    theme,
    setTheme,
    fontScale,
    setFontScale,
    resolvedFontFamily,
  } = useSettings();

  const isLight = theme === "light";
  const fontStyle = resolvedFontFamily ? { fontFamily: resolvedFontFamily } : null;

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Settings screen"
    >
      <Text
        style={[styles.title, isLight && styles.titleLight, { fontSize: 22 * fontScale }, fontStyle]}
      >
        Settings
      </Text>

      <View style={[styles.section, isLight && styles.sectionLight]}>
        <Text
          style={[
            styles.sectionTitle,
            isLight && styles.sectionTitleLight,
            { fontSize: 14 * fontScale },
            fontStyle,
          ]}
        >
          Theme
        </Text>
        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              isLight && styles.labelLight,
              { fontSize: 13 * fontScale },
              fontStyle,
            ]}
          >
            {isLight ? "Light mode" : "Dark mode"}
          </Text>
          <Switch
            value={!isLight}
            onValueChange={async (val) => {
              await Haptics.selectionAsync();
              setTheme(val ? "dark" : "light");
            }}
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

      <View style={[styles.section, isLight && styles.sectionLight]}>
        <Text
          style={[
            styles.sectionTitle,
            isLight && styles.sectionTitleLight,
            { fontSize: 14 * fontScale },
            fontStyle,
          ]}
        >
          Font size
        </Text>
        <Text
          style={[
            styles.label,
            isLight && styles.labelLight,
            { fontSize: 13 * fontScale },
            fontStyle,
          ]}
        >
          Adjust text size across the app
        </Text>
        <View style={styles.fontButtonsRow}>
          <Pressable
            style={styles.chip}
            onPress={async () => {
              await Haptics.selectionAsync();
              setFontScale(0.9);
            }}
            accessibilityLabel="Small font size"
          >
            <Text
              style={[
                styles.chipText,
                isLight && styles.chipTextLight,
                { fontSize: 13 * fontScale },
                fontStyle,
              ]}
            >
              Small
            </Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={async () => {
              await Haptics.selectionAsync();
              setFontScale(1);
            }}
            accessibilityLabel="Normal font size"
          >
            <Text
              style={[
                styles.chipText,
                isLight && styles.chipTextLight,
                { fontSize: 13 * fontScale },
                fontStyle,
              ]}
            >
              Normal
            </Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={async () => {
              await Haptics.selectionAsync();
              setFontScale(1.2);
            }}
            accessibilityLabel="Large font size"
          >
            <Text
              style={[
                styles.chipText,
                isLight && styles.chipTextLight,
                { fontSize: 13 * fontScale },
                fontStyle,
              ]}
            >
              Large
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Font family toggle intentionally removed (fontFamily can still be controlled via other UI). */}
    </View>
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
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  titleLight: {
    color: "#020617",
  },
  section: {
    marginBottom: 38,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitleLight: {
    color: "#020617",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  labelLight: {
    color: "#111827",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "pink",
    borderColor: "pink",
  },
  chipText: {
    color: "white",
    fontWeight: "600",
  },
  chipTextLight: {
    color: "#111827",
  },
  fontButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
  },
});

