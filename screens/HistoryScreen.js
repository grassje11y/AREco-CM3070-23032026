import React, { useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

export default function HistoryScreen({ history }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";
  //const fontStyle = resolvedFontFamily ? { fontFamily: resolvedFontFamily } : null;
  if (!history || !history.length) {
    return (
      <View
        style={[styles.screenPlaceholder, isLight && styles.screenPlaceholderLight]}
        accessible
        accessibilityLabel="Empty scan history"
      >
        <Text
          style={[
            styles.placeholderTitle,
            isLight && styles.placeholderTitleLight,
            { fontSize: 20 * fontScale },
            
          ]}
        >
          Scan History
        </Text>
        <Text
          style={[
            styles.placeholderText,
            isLight && styles.placeholderTextLight,
            { fontSize: 13 * fontScale },
            
          ]}
        >
          No items yet. Scan and classify something to see it here.
        </Text>
      </View>
    );
  }

  const grouped = useMemo(() => {
    const map = {};
    history.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return Object.entries(map).map(([category, items]) => ({
      category,
      items,
    }));
  }, [history]);

  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = async (cat) => {
    await Haptics.selectionAsync();
    setOpenCategory((prev) => (prev === cat ? null : cat));
  };

  const getFolderIconForCategory = (category) => {
    switch (category) {
      case "Plastic":
        return "🥤";
      case "Paper":
        return "📄";
      case "Glass":
        return "🧴";
      case "Metal":
        return "🥫";
      case "Trash":
      default:
        return "🗑️";
    }
  };

  return (
    <View
      style={[styles.historyContainer, isLight && styles.historyContainerLight]}
      accessible
      accessibilityLabel="Scan history screen"
    >
      <Text
        style={[
          styles.historyTitle,
          isLight && styles.historyTitleLight,
          { fontSize: 18 * fontScale },
          
        ]}
      >
        Your previous scans
      </Text>
      <View style={styles.historyList}>
        {grouped.map((group) => (
          <View key={group.category} style={styles.folderBlock}>
            <Pressable
              style={[styles.folderHeader, isLight && styles.folderHeaderLight]}
              onPress={() => toggleCategory(group.category)}
              accessibilityLabel={`Toggle history for ${group.category}`}
            >
              <Text style={[styles.folderIcon, fontStyle]}>
                {getFolderIconForCategory(group.category)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.folderTitle,
                    isLight && styles.folderTitleLight,
                    { fontSize: 15 * fontScale },
                    
                  ]}
                >
                  {group.category}
                </Text>
                <Text
                  style={[
                    styles.folderSubtitle,
                    isLight && styles.folderSubtitleLight,
                    { fontSize: 12 * fontScale },
                    
                  ]}
                >
                  {group.items.length} item(s)
                </Text>
              </View>
              <Text style={[styles.folderChevron, fontStyle]}>
                {openCategory === group.category ? "▲" : "▼"}
              </Text>
            </Pressable>

            {openCategory === group.category && (
              <View style={styles.folderContent}>
                {group.items.map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <Image source={{ uri: item.uri }} style={styles.historyThumb} />
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyDate, { fontSize: 12 * fontScale }, fontStyle]}>
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenPlaceholder: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  screenPlaceholderLight: {
    backgroundColor: "#f1f5f9",
  },
  placeholderTitle: { color: "white", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  placeholderTitleLight: { color: "#020617" },
  placeholderText: { color: "#9ca3af", textAlign: "center" },
  placeholderTextLight: { color: "#4b5563" },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  historyContainerLight: {
    backgroundColor: "#f1f5f9",
  },
  historyTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  historyTitleLight: {
    color: "#020617",
  },
  historyList: {
    flex: 1,
  },
  folderBlock: {
    marginBottom: 12,
  },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  folderHeaderLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  folderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  folderTitle: {
    color: "white",
    fontWeight: "700",
  },
  folderTitleLight: {
    color: "#020617",
  },
  folderSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },
  folderSubtitleLight: {
    color: "#4b5563",
  },
  folderChevron: {
    color: "#9ca3af",
    fontSize: 12,
    marginLeft: 8,
  },
  folderContent: {
    marginTop: 6,
    paddingLeft: 20,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
  },
  historyThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyCategory: {
    color: "white",
    fontWeight: "700",
    marginBottom: 2,
  },
  historyDate: {
    color: "#9ca3af",
    fontSize: 12,
  },
});

