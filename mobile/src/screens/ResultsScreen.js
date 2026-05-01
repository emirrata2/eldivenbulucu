import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, SafeAreaView, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchGloves } from "../api/gloves";
import { addToHistory } from "../utils/history";

const C = {
  primary:  "#1B3A5C",
  accent:   "#2563EB",
  accentBg: "#EEF4FF",
  border:   "#D1D9E6",
  bg:       "#F4F6FA",
  text:     "#0F172A",
  sub:      "#64748B",
  white:    "#FFFFFF",
};

const FEATURE_LABELS = [
  { key: "is_cut_resistant",      label: "Kesilme",   color: "#B91C1C" },
  { key: "is_chemical_resistant", label: "Kimyasal",  color: "#6D28D9" },
  { key: "is_puncture_resistant", label: "Delinme",   color: "#C2410C" },
  { key: "is_cold_resistant",     label: "Soğuk",     color: "#0369A1" },
  { key: "is_heat_resistant",     label: "Isı",       color: "#B45309" },
  { key: "is_antistatic",         label: "ESD",       color: "#0F766E" },
  { key: "is_waterproof",         label: "Su Geç.",   color: "#1D4ED8" },
  { key: "is_food_safe",          label: "Gıda",      color: "#15803D" },
];

export default function ResultsScreen({ route, navigation }) {
  const { filters } = route.params;
  const [gloves, setGloves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    load();
    const summary = buildSummary(filters);
    if (summary) addToHistory(summary);
  }, []);

  async function load() {
    try {
      const res = await fetchGloves({ ...filters, limit: 100 });
      setGloves(res.data);
      setTotal(res.total);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  }

  function buildSummary(f) {
    const parts = [];
    if (f.chemical === "1")   parts.push("Kimyasal");
    if (f.cut === "1")        parts.push("Kesilme");
    if (f.puncture === "1")   parts.push("Delinme");
    if (f.heat === "1")       parts.push("Isı");
    if (f.cold === "1")       parts.push("Soğuk");
    if (f.antistatic === "1") parts.push("ESD");
    if (f.food === "1")       parts.push("Gıda");
    if (f.waterproof === "1") parts.push("Su Geçirmez");
    return parts.join(" · ");
  }

  function renderItem({ item }) {
    const activeFeatures = FEATURE_LABELS.filter((f) => item[f.key]);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Detay", { id: item.id })}
        activeOpacity={0.8}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <MaterialCommunityIcons name="hand-wash-outline" size={36} color="#94A3B8" />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.sub}>{item.subcategory}</Text>
          <View style={styles.tags}>
            {activeFeatures.map((f) => (
              <View key={f.key} style={[styles.tag, { backgroundColor: f.color }]}>
                <Text style={styles.tagText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" style={{ alignSelf: "center" }} />
      </TouchableOpacity>
    );
  }

  const summary = buildSummary(filters);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Sonuçlar</Text>
          {summary ? <Text style={styles.headerSub}>{summary}</Text> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={C.accent} />
      ) : (
        <>
          <View style={styles.countBar}>
            <MaterialCommunityIcons name="filter-check-outline" size={16} color={C.sub} />
            <Text style={styles.countText}>
              {total === 0 ? "Uygun eldiven bulunamadı" : `${total} ürün listelendi`}
            </Text>
            {total === 0 && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryLink}>
                <Text style={styles.retryLinkText}>Kriterleri Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={gloves}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons name="magnify-remove-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Eşleşen Ürün Bulunamadı</Text>
                <Text style={styles.emptyDesc}>
                  Seçtiğiniz kriterlere uygun eldiven mevcut değil.{"\n"}
                  Geri dönüp farklı seçenekler deneyebilirsiniz.
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.retryBtnText}>Kriterleri Değiştir</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.primary,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: { padding: 2 },
  headerTitle: { color: C.white, fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 1 },
  countBar: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  countText: { flex: 1, fontSize: 13, color: C.sub, fontWeight: "500" },
  retryLink: {},
  retryLinkText: { fontSize: 13, color: C.accent, fontWeight: "600" },
  card: {
    flexDirection: "row", backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, overflow: "hidden",
    alignItems: "stretch",
  },
  image: { width: 100, height: 100 },
  noImage: { backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  info: { flex: 1, padding: 12 },
  name: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 3, lineHeight: 18 },
  brand: { fontSize: 12, color: C.accent, fontWeight: "600", marginBottom: 1 },
  sub: { fontSize: 11, color: C.sub, marginBottom: 6 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: C.white, fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 8, marginTop: 16 },
  emptyDesc: { fontSize: 13, color: C.sub, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  retryBtn: {
    backgroundColor: C.accent, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 13,
  },
  retryBtnText: { color: C.white, fontSize: 14, fontWeight: "700" },
});
