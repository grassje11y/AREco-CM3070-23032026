import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";
import { useSettings } from "../context/SettingsContext";

let didCreateViroMaterials = false;
let haveBoxMaterial = false;

export default function ARScreen() {
  const { theme, fontScale } = useSettings();
  const isLight = theme === "light";

  // ViroReact is native-only; keep web from crashing/blanking.
  if (Platform.OS === "web") {
    return (
      <View
        style={[styles.container, isLight && styles.containerLight]}
        accessible
        accessibilityLabel="AR implementation screen"
      >
        <Text style={[styles.title, isLight && styles.titleLight, { fontSize: 24 * fontScale }]}>AR</Text>
        <Text style={[styles.subtitle, isLight && styles.subtitleLight, { fontSize: 13 * fontScale }]}>
          ViroReact AR requires a native build (Android/iOS). Use `npm run android` / `npm run ios` for testing.
        </Text>
      </View>
    );
  }

  // Native runtime: load ViroReact dynamically to avoid bundling issues.
  let Viro;
  try {
    Viro = require("@reactvision/react-viro");
  } catch (e) {
    return (
      <View
        style={[styles.container, isLight && styles.containerLight]}
        accessible
        accessibilityLabel="AR implementation screen"
      >
        <Text style={[styles.title, isLight && styles.titleLight, { fontSize: 20 * fontScale }]}>AR setup needed</Text>
        <Text style={[styles.subtitle, isLight && styles.subtitleLight, { fontSize: 12 * fontScale }]}>
          Failed to load ViroReact. Install and configure it (see instructions).
        </Text>
      </View>
    );
  }

  // Some bundlers/react-native configurations may resolve the module to `undefined`
  // (no throw). Guard against that to avoid crashing with a white screen.
  if (!Viro || !Viro.ViroARSceneNavigator) {
    return (
      <View
        style={[styles.container, isLight && styles.containerLight]}
        accessible
        accessibilityLabel="AR implementation screen"
      >
        <Text style={[styles.title, isLight && styles.titleLight, { fontSize: 20 * fontScale }]}>AR setup failed</Text>
        <Text style={[styles.subtitle, isLight && styles.subtitleLight, { fontSize: 12 * fontScale }]}>
          `@reactvision/react-viro` loaded, but Viro components were not found.
          Make sure you are running a native development build (not Expo Go / not web).
        </Text>
      </View>
    );
  }

  const { ViroARSceneNavigator, ViroARScene, ViroARPlane, ViroBox, ViroMaterials } = Viro;

  if (!didCreateViroMaterials) {
    try {
      // This requires Viro's native renderer to be present.
      ViroMaterials.createMaterials({
        boxMaterial: {
          diffuseColor: "#22c55e",
          lightingModel: "Lambert",
        },
      });
      haveBoxMaterial = true;
    } catch (e) {
      // If the native side isn't installed (common when running Expo Go),
      // materials will fail to initialize. We'll show AR without custom materials.
      haveBoxMaterial = false;
    }
    didCreateViroMaterials = true;
  }

  const ARBasicScene = () => (
    <ViroARScene anchorDetectionTypes={["PlanesHorizontal"]}>
      <ViroARPlane>
        <ViroBox
          width={0.3}
          height={0.3}
          length={0.3}
          position={[0, 0.15, 0]}
          materials={haveBoxMaterial ? ["boxMaterial"] : undefined}
        />
      </ViroARPlane>
    </ViroARScene>
  );

  return (
    <View style={styles.viroContainer}>
      <ViroARSceneNavigator
        style={StyleSheet.absoluteFill}
        autofocus={true}
        initialScene={{ scene: ARBasicScene }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#020617",
    justifyContent: "center",
  },
  containerLight: {
    backgroundColor: "#f1f5f9",
  },
  title: {
    color: "white",
    fontWeight: "800",
    marginBottom: 6,
  },
  titleLight: {
    color: "#020617",
  },
  subtitle: {
    color: "#9ca3af",
    lineHeight: 18,
  },
  subtitleLight: {
    color: "#4b5563",
  },
  viroContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
});

