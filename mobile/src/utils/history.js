import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "search_history";
const MAX = 20;

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToHistory(query) {
  if (!query.trim()) return;
  try {
    const history = await getHistory();
    const filtered = history.filter((h) => h !== query);
    const updated = [query, ...filtered].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEY);
}

export async function removeFromHistory(query) {
  try {
    const history = await getHistory();
    const updated = history.filter((h) => h !== query);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}
