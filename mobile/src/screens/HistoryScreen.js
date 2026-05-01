import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getHistory, clearHistory, removeFromHistory } from "../utils/history";

const C = {
  primary:  "#1B3A5C",
  accent:   "#2563EB",
  border:   "#D1D9E6",
  bg:       "#F4F6FA",
  text:     "#0F172A",
  sub:      "#64748B",
  white:    "#FFFFFF",
};

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  async function handleClear() {
    Alert.alert(
      "Geçmişi Temizle",
      "Tüm arama geçmişi kalıcı olarak silinecektir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Temizle", style: "destructive",
          onPress: async () => { await clearHistory(); setHistory([]); },
        },
      ]
    );
  }

  async function handleRemove(query) {
    await removeFromHistory(query);
    setHistory((prev) => prev.filter((h) => h !== query));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <FlatList
        data={history}
        keyExtractor={(item, i) => `${item}-${i}`}
        contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: 40 }}
        ListHeaderComponent={
          history.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>{history.length} kayıtlı arama</Text>
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={14} color="#DC2626" />
                <Text style={styles.clearText}>Tümünü Sil</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="history" size={18} color={C.sub} />
            </View>
            <Text style={styles.query} numberOfLines={1}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
              <MaterialCommunityIcons name="close" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={52} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Arama Geçmişi Boş</Text>
            <Text style={styles.emptyDesc}>
              Eldiven arama kriterleriniz burada kaydedilecektir.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  listHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 6, paddingHorizontal: 2,
  },
  listHeaderText: { fontSize: 12, color: C.sub, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearText: { fontSize: 12, color: "#DC2626", fontWeight: "600" },
  row: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.white,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.border, gap: 12,
  },
  iconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  query: { flex: 1, fontSize: 14, color: C.text, fontWeight: "500" },
  removeBtn: { padding: 4 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: C.text, marginTop: 14, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: C.sub, textAlign: "center", lineHeight: 20 },
});
