import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function FilterBar({ filters, active, onToggle }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filters.map(({ key, label }) => {
          const isActive = !!active[key];
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onToggle(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  scroll: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  chip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
  },
  chipActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  chipText: { fontSize: 13, color: "#555", fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});
