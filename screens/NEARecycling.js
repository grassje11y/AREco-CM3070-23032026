import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { WebView } from "react-native-webview";
import { useSettings } from "../context/SettingsContext";

//NEA recycling search engine link
const RECYCLING_SEARCH_URL = "https://www.nea.gov.sg/recycling-search-engine";

export default function RecyclingSearchScreen() {
  const { theme } = useSettings();
  const isLight = theme === "light";

  // browser build cannot embed webview a button that opens nea in a new tab
  if (Platform.OS === "web") {
    return (
      <View
        style={[styles.container, isLight && styles.containerLight, styles.webFallback]}
        accessible
        accessibilityLabel="Recycling search (web fallback)"
      >
        <Text style={[styles.title, isLight && styles.titleLight]}>Recycling Search</Text>
        <Text style={[styles.text, isLight && styles.textLight]}>
          The embedded browser is not supported in the web preview. Use the button below to open the recycling search
          site in a new tab, or run the app on a device for the in-app view.
        </Text>
        <Pressable
          style={styles.button}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (typeof window !== "undefined" && window?.open) {
              window.open(RECYCLING_SEARCH_URL, "_blank", "noopener,noreferrer");
            }
          }}
          accessibilityLabel="Open recycling search in new tab"
        >
          <Text style={styles.buttonText}>Open recycling search</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Recycling search screen"
    >
      <WebView
        source={{ uri: RECYCLING_SEARCH_URL }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  containerLight: {
    backgroundColor: "#f1f5f9",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webFallback: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  titleLight: {
    color: "#020617",
  },
  text: {
    color: "#9ca3af",
    marginBottom: 16,
    lineHeight: 20,
  },
  textLight: {
    color: "#4b5563",
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "pink",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  buttonText: {
    color: "#020617",
    fontWeight: "800",
  },
});

