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
  } = useSettings();

  const isLight = theme === "light";

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Settings screen"
    >
      <Text
        style={[styles.title, isLight && styles.titleLight, { fontSize: 26 * fontScale }]}
      >
        Settings
      </Text>

      <View style={[styles.section, isLight && styles.sectionLight]}>
        <Text
          style={[
            styles.sectionTitle,
            isLight && styles.sectionTitleLight,
            { fontSize: 19 * fontScale },
          ]}
        >
          Theme
        </Text>
        <View style={[styles.row, styles.rowTall]}>
          <Text
            style={[
              styles.label,
              isLight && styles.labelLight,
              { fontSize: 18 * fontScale },
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

      <View style={[styles.section, styles.sectionFontBlock, isLight && styles.sectionLight]}>
        <Text
          style={[
            styles.sectionTitle,
            isLight && styles.sectionTitleLight,
            { fontSize: 19 * fontScale },
          ]}
        >
          Font size
        </Text>
        <Text
          style={[
            styles.label,
            isLight && styles.labelLight,
            styles.labelSpaced,
            { fontSize: 18 * fontScale },
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
                { fontSize: 17 * fontScale },
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
                { fontSize: 17 * fontScale },
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
                { fontSize: 17 * fontScale },
              ]}
            >
              Large
            </Text>
          </Pressable>
        </View>
      </View>
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
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  titleLight: {
    color: "#020617",
  },
  section: {
    marginBottom: 50,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    minHeight: 132,
  },
  sectionLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  sectionFontBlock: {
    minHeight: 220,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionTitleLight: {
    color: "#020617",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTall: {
    minHeight: 52,
    paddingVertical: 4,
  },
  labelSpaced: {
    marginBottom: 14,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 18,
  },
  labelLight: {
    color: "#111827",
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    marginRight: 10,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
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
    flexWrap: "wrap",
    marginTop: 4,
  },
});

