import React from "react";
import { View, ActivityIndicator, StyleSheet, Platform, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { WebView } from "react-native-webview";
import { useSettings } from "../context/SettingsContext";

const BOTPRESS_EMBED_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
    />
    <title>Areco Chatbot</title>
    <style>
      html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }

      /* Force Botpress webchat containers to mount at the very top. */
      #bp-webchat, #botpress-webchat, #bp-embedded-webchat {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <!-- Botpress embedded mode usually expects a container div -->
    <div id="bp-webchat"></div>
    <div id="botpress-webchat"></div>
    <!-- Botpress "Where to show chat" container id (per deploy settings) -->
    <div id="bp-embedded-webchat"></div>
    <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
    <script src="https://files.bpcontent.cloud/2025/12/16/09/20251216091315-NKIYVQFT.js" defer></script>
  </body>
</html>`;

export default function ChatScreen() {
  const { theme } = useSettings();
  const isLight = theme === "light";

  const openWebChatInNewTab = async () => {
    // WebView isn't supported on Expo Web. Open the embed in a new tab instead.
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (typeof window !== "undefined" && window?.open) {
      const url = `data:text/html;charset=utf-8,${encodeURIComponent(BOTPRESS_EMBED_HTML)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={[styles.container, isLight && styles.containerLight, styles.webFallback]}
        accessible
        accessibilityLabel="Chatbot (web fallback)"
      >
        <Text style={[styles.webTitle, isLight && styles.webTitleLight]}>Tips & Chatbot</Text>
        <Text style={[styles.webText, isLight && styles.webTextLight]}>
          The in-app chatbot view isn’t supported in the web preview. Open it in a new tab, or run the app on an
          Android/iOS device for the embedded experience.
        </Text>
        <Pressable style={styles.webBtn} onPress={openWebChatInNewTab} accessibilityLabel="Open chatbot in new tab">
          <Text style={styles.webBtnText}>Open chatbot</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, isLight && styles.containerLight]}
      accessible
      accessibilityLabel="Tips and chatbot screen"
    >
      <WebView
        source={{ html: BOTPRESS_EMBED_HTML }}
        style={{ flex: 1 }}
        startInLoadingState
        originWhitelist={["*"]}
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
  webTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  webTitleLight: {
    color: "#020617",
  },
  webText: {
    color: "#9ca3af",
    marginBottom: 16,
    lineHeight: 20,
  },
  webTextLight: {
    color: "#4b5563",
  },
  webBtn: {
    alignSelf: "flex-start",
    backgroundColor: "pink",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  webBtnText: {
    color: "#020617",
    fontWeight: "800",
  },
});

