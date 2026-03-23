import React from "react";
import { ScrollView, View, Text, Pressable, ActivityIndicator, Image, StyleSheet, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { CameraView } from "expo-camera";
import { useSettings } from "../context/SettingsContext";

export default function ScanScreen({
  cameraRef,
  permission,
  busy,
  photoUri,
  selectedCategory,
  overlayCategory,
  overlayPulse,
  err,
  onRequestPermission,
  onTakePhoto,
  onSelectCategory,
  onClearPhoto,
  getOverlayStyleForCategory,
}) {
  const { fontScale } = useSettings();
  const cameraEnabled = permission && permission.granted;

  return (
    <ScrollView style={styles.screenContent}>
      <View style={styles.cameraRow}>
        <View style={styles.cameraColumn}>
          <View style={styles.cameraCard}>
            {cameraEnabled ? (
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            ) : (
              <View style={styles.cameraUnavailable}>
                <Text style={[styles.label, { fontSize: 13 * fontScale }]}>Camera preview</Text>
                <Text style={[styles.placeholderText, { fontSize: 12 * fontScale }]}>
                  Grant permission to start scanning.
                </Text>
              </View>
            )}
            {overlayCategory && cameraEnabled && (
              <View style={styles.overlay}>
                <Animated.View
                  style={[
                    styles.overlayBubble,
                    {
                      borderColor: getOverlayStyleForCategory(overlayCategory).borderColor,
                      transform: [{ scale: overlayPulse }],
                    },
                  ]}
                >
                  <Text style={[styles.overlayEmoji, { fontSize: 26 * fontScale }]}>
                    {getOverlayStyleForCategory(overlayCategory).emoji}
                  </Text>
                  <Text
                    style={[
                      styles.overlayTitle,
                      { color: getOverlayStyleForCategory(overlayCategory).titleColor },
                      { fontSize: 16 * fontScale },
                    ]}
                  >
                    {overlayCategory} bin
                  </Text>
                  <Text style={[styles.overlayText, { fontSize: 12 * fontScale }]}>
                    Ensure this is clean without any food stains on it.
                  </Text>
                </Animated.View>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        {!cameraEnabled && (
          <View style={styles.permissionPanel}>
            <Text
              style={[
                styles.label,
                { marginBottom: 12, fontSize: 13 * fontScale },
              ]}
            >
              Camera permission needed to scan items.
            </Text>
            <Pressable
              style={styles.btn}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onRequestPermission && onRequestPermission();
              }}
            >
              <Text style={[styles.btnText, { fontSize: 13 * fontScale }]}>Grant permission</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onTakePhoto && onTakePhoto();
          }}
          disabled={busy}
        >
          <Text style={[styles.btnText, { fontSize: 13 * fontScale }]}>
            {busy ? "Taking Photo..." : "Snap Photo"}
          </Text>
        </Pressable>

        {busy && <ActivityIndicator style={{ marginTop: 12 }} />}

        {/* Clear action placed between the camera preview and the captured photo */}
        {photoUri && (
          <Pressable
            style={[styles.btn, { marginTop: 12, backgroundColor: "#64748b" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClearPhoto && onClearPhoto();
            }}
          >
            <Text style={[styles.btnText, { fontSize: 13 * fontScale }]}>Clear Photo</Text>
          </Pressable>
        )}

        {photoUri && (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { fontSize: 13 * fontScale }]}>Captured Image:</Text>
            <Image source={{ uri: photoUri }} style={styles.thumb} />
          </View>
        )}

        {photoUri && (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { fontSize: 13 * fontScale }]}>Choose Category:</Text>
            <View style={styles.buttonsContainer}>
              {["Plastic", "Paper", "Glass", "Metal", "Trash"].map((cat) => (
                <Pressable
                  key={cat}
                  style={styles.categoryButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onSelectCategory && onSelectCategory(cat);
                  }}
                >
                  <Text style={[styles.categoryButtonText, { fontSize: 12 * fontScale }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {selectedCategory && (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.label, { fontSize: 13 * fontScale }]}>Selected Category:</Text>
            <Text style={[styles.resultText, { fontSize: 18 * fontScale }]}>{selectedCategory}</Text>
          </View>
        )}

        {err && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.err}>{err}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContent: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  cameraRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 8,
  },
  cameraColumn: {
    flex: 1,
  },
  cameraCard: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020617",
  },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  overlayBubble: {
    backgroundColor: "rgba(15,23,42,0.88)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  overlayEmoji: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 4,
  },
  overlayTitle: {
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  overlayText: {
    color: "#e5e7eb",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  cameraUnavailable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  placeholderText: {
    color: "#cbd5e1",
    marginTop: 6,
    textAlign: "center",
  },
  panel: {
    flex: 1,
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  permissionPanel: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  btn: { backgroundColor: "pink", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#020617", fontWeight: "700" },
  label: { color: "#cbd5e1", marginBottom: 8 },
  resultText: { color: "white", fontSize: 18, fontWeight: "800" },
  err: { color: "#fb7185" },
  thumb: { width: "100%", height: 180, borderRadius: 14 },
  buttonsContainer: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 4,
  },
  categoryButtonText: { color: "white", fontWeight: "700" },
});

