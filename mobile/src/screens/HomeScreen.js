import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Image, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchGloves } from "../api/gloves";
import { addToHistory, getHistory } from "../utils/history";
import FilterBar from "../components/FilterBar";

const FILTERS = [
  { key: "cut",        label: "Kesilme" },
  { key: "chemical",   label: "Kimyasal" },
  { key: "puncture",   label: "Delinme" },
  { key: "cold",       label: "Soğuk" },
  { key: "heat",       label: "Isı/Kaynak" },
  { key: "antistatic", label: "Antistatik" },
  { key: "waterproof", label: "Su Geçirmez" },
  { key: "food",       label: "Gıda" },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [gloves, setGloves] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  async function load(reset = false) {
    if (loading) return;
    setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = { page: currentPage, limit: LIMIT, search };
      FILTERS.forEach(({ key }) => {
        if (activeFilters[key]) params[key] = "1";
      });
      const res = await fetchGloves(params);
      if (reset) {
        setGloves(res.data);
        setPage(2);
      } else {
        setGloves((prev) => [...prev, ...res.data]);
        setPage((p) => p + 1);
      }
      setTotal(res.total);
      setHasMore(res.data.length === LIMIT);
    } catch (e) {
      console.warn("Veri alınamadı:", e.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [search, activeFilters])
  );

  async function handleSearch() {
    if (search.trim()) await addToHistory(search.trim());
    load(true);
  }

  function toggleFilter(key) {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleRefresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  function renderGlove({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Detail", { id: item.id })}
        activeOpacity={0.85}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>Görsel yok</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardBrand}>{item.brand}</Text>
          <Text style={styles.cardCat}>{item.subcategory}</Text>
          <View style={styles.tags}>
            {item.is_cut_resistant      && <Tag label="Kesilme" />}
            {item.is_chemical_resistant && <Tag label="Kimyasal" />}
            {item.is_puncture_resistant && <Tag label="Delinme" />}
            {item.is_cold_resistant     && <Tag label="Soğuk" />}
            {item.is_heat_resistant     && <Tag label="Isı" />}
            {item.is_antistatic         && <Tag label="ESD" />}
            {item.is_waterproof         && <Tag label="Su Geç." />}
            {item.is_food_safe          && <Tag label="Gıda" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Arama */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Eldiven ara..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {/* Filtreler */}
      <FilterBar filters={FILTERS} active={activeFilters} onToggle={toggleFilter} />

      {/* Sonuç sayısı */}
      <Text style={styles.resultCount}>{total} eldiven bulundu</Text>

      {/* Liste */}
      <FlatList
        data={gloves}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderGlove}
        onEndReached={() => hasMore && load()}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Eldiven bulunamadı.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchRow: { flexDirection: "row", margin: 12, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: "#ddd",
  },
  searchBtn: {
    backgroundColor: "#1a73e8", borderRadius: 10, paddingHorizontal: 18,
    justifyContent: "center", alignItems: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  resultCount: { marginHorizontal: 14, marginBottom: 6, color: "#666", fontSize: 13 },
  card: {
    flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 12,
    marginBottom: 10, borderRadius: 12, overflow: "hidden",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4,
  },
  image: { width: 100, height: 100 },
  noImage: { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" },
  noImageText: { color: "#aaa", fontSize: 11 },
  cardInfo: { flex: 1, padding: 10 },
  cardName: { fontSize: 14, fontWeight: "600", color: "#222", marginBottom: 2 },
  cardBrand: { fontSize: 12, color: "#1a73e8", marginBottom: 1 },
  cardCat: { fontSize: 11, color: "#888", marginBottom: 4 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { backgroundColor: "#e8f0fe", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  tagText: { fontSize: 10, color: "#1a73e8" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#999", fontSize: 15 },
});
