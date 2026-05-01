import React, { useEffect, useState } from "react";
import {
  View, Text, Image, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Linking, SafeAreaView, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchGlove } from "../api/gloves";

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
  { key: "is_cut_resistant",      label: "Kesilmeye Dayanıklı",     icon: "content-cut",            color: "#B91C1C" },
  { key: "is_chemical_resistant", label: "Kimyasala Dayanıklı",     icon: "flask-outline",          color: "#6D28D9" },
  { key: "is_puncture_resistant", label: "Delinmeye Dayanıklı",     icon: "needle",                 color: "#C2410C" },
  { key: "is_cold_resistant",     label: "Soğuğa Dayanıklı",        icon: "snowflake",              color: "#0369A1" },
  { key: "is_heat_resistant",     label: "Isıya / Kaynağa Dayanıklı", icon: "thermometer-high",    color: "#B45309" },
  { key: "is_antistatic",         label: "Antistatik (ESD)",         icon: "lightning-bolt-outline", color: "#0F766E" },
  { key: "is_waterproof",         label: "Su Geçirmez",              icon: "water-off-outline",      color: "#1D4ED8" },
  { key: "is_food_safe",          label: "Gıdaya Uygun",             icon: "food-apple-outline",     color: "#15803D" },
];

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [glove, setGlove] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlove(id).then(setGlove).catch(console.warn).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={C.accent} />;
  }

  if (!glove) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ürün bulunamadı.</Text>
      </View>
    );
  }

  const activeFeatures = FEATURE_LABELS.filter((f) => glove[f.key]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{glove.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {glove.image_url ? (
          <Image source={{ uri: glove.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="hand-wash-outline" size={64} color="#CBD5E1" />
          </View>
        )}

        {glove.product_url ? (
          <TouchableOpacity
            style={styles.linkBtnTop}
            onPress={() => Linking.openURL(glove.product_url)}
          >
            <MaterialCommunityIcons name="open-in-new" size={18} color={C.white} />
            <Text style={styles.linkBtnText}>Eldivene Git</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.body}>
          {/* Identity */}
          <View style={styles.identityRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{glove.brand}</Text>
            </View>
            <Text style={styles.subcategory}>{glove.subcategory}</Text>
          </View>
          <Text style={styles.name}>{glove.name}</Text>

          {glove.en_standard ? (
            <View style={styles.standardBadge}>
              <MaterialCommunityIcons name="certificate-outline" size={14} color={C.accent} />
              <Text style={styles.standardText}>{glove.en_standard}</Text>
            </View>
          ) : null}

          {/* Features */}
          {activeFeatures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Koruma Özellikleri</Text>
              <View style={styles.featureGrid}>
                {activeFeatures.map((f) => (
                  <View key={f.key} style={[styles.featureChip, { borderColor: f.color }]}>
                    <MaterialCommunityIcons name={f.icon} size={16} color={f.color} />
                    <Text style={[styles.featureChipText, { color: f.color }]}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {glove.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
              <Text style={styles.description}>{glove.description}</Text>
            </View>
          ) : null}

          {/* CTA */}
          {glove.product_url ? (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => Linking.openURL(glove.product_url)}
            >
              <MaterialCommunityIcons name="open-in-new" size={18} color={C.white} />
              <Text style={styles.linkBtnText}>Eldivene Git</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: C.sub, fontSize: 15 },
  header: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.primary,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, color: C.white, fontSize: 15, fontWeight: "700" },
  image: { width: "100%", height: 260, backgroundColor: "#F8FAFC" },
  imagePlaceholder: {
    width: "100%", height: 200, backgroundColor: "#F1F5F9",
    justifyContent: "center", alignItems: "center",
  },
  body: { padding: 20 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  brandBadge: {
    backgroundColor: C.accentBg, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  brandBadgeText: { color: C.accent, fontSize: 12, fontWeight: "700" },
  subcategory: { fontSize: 12, color: C.sub },
  name: { fontSize: 20, fontWeight: "800", color: C.text, lineHeight: 27, marginBottom: 10 },
  standardBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.accentBg, alignSelf: "flex-start",
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 4,
  },
  standardText: { fontSize: 12, color: C.accent, fontWeight: "600" },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: C.sub, letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 12,
  },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featureChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  featureChipText: { fontSize: 12, fontWeight: "600" },
  description: { fontSize: 14, color: "#334155", lineHeight: 22 },
  linkBtnTop: {
    backgroundColor: C.accent, borderRadius: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
  },
  linkBtn: {
    marginTop: 28, backgroundColor: C.accent, borderRadius: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 15,
  },
  linkBtnText: { color: C.white, fontSize: 15, fontWeight: "700" },
});
