import React, { useState, useMemo } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const C = {
  primary:   "#1B3A5C",
  accent:    "#2563EB",
  accentBg:  "#EEF4FF",
  border:    "#D1D9E6",
  bg:        "#F4F6FA",
  text:      "#0F172A",
  sub:       "#64748B",
  white:     "#FFFFFF",
  disabled:  "#94A3B8",
};

// EN 374 standard chemical test list
const EN374_CHEMICALS = [
  { code: "A", label: "Metanol",              detail: "Metanol %100" },
  { code: "B", label: "Aseton",               detail: "Aseton %100" },
  { code: "C", label: "Asetonitril",          detail: "Asetonitril %100" },
  { code: "D", label: "Diklorometan",         detail: "Diklorometan %100" },
  { code: "E", label: "Karbon Disülfür",      detail: "Karbon disülfür %100" },
  { code: "F", label: "Toluen",               detail: "Toluen %100" },
  { code: "G", label: "Dietilamin",           detail: "Dietilamin %100" },
  { code: "H", label: "Tetrahidrofuran",      detail: "Tetrahidrofuran %100" },
  { code: "I", label: "Etil Asetat",          detail: "Etil asetat %100" },
  { code: "J", label: "n-Heptan",             detail: "n-Heptan %100" },
  { code: "K", label: "Sodyum Hidroksit",     detail: "Sodyum hidroksit %40" },
  { code: "L", label: "Sülfürik Asit",        detail: "Sülfürik asit %96" },
  { code: "M", label: "Nitrik Asit",          detail: "Nitrik asit %65" },
  { code: "N", label: "Asetik Asit",          detail: "Asetik asit %99" },
  { code: "O", label: "Amonyak",              detail: "Amonyak %25" },
  { code: "P", label: "Hidrojen Peroksit",    detail: "Hidrojen peroksit %30" },
  { code: "S", label: "Hidroflorik Asit",     detail: "Hidroflorik asit %40" },
  { code: "T", label: "Formaldehit",          detail: "Formaldehit %37" },
];

const CUT_LEVELS = [
  { level: 1, desc: "Hafif kesme riski" },
  { level: 2, desc: "Orta kesme riski" },
  { level: 3, desc: "Yüksek kesme riski" },
  { level: 4, desc: "Çok yüksek kesme riski" },
  { level: 5, desc: "Maksimum kesme direnci" },
];

export default function WizardScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [environment, setEnvironment] = useState(null);
  const [chemicals, setChemicals] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [cutLevel, setCutLevel] = useState(null);
  const [extras, setExtras] = useState([]);

  // Dynamic step list based on environment selection
  const steps = useMemo(() => {
    const list = ["environment"];
    if (environment === "chemical") list.push("chemicals");
    list.push("hazards");
    list.push("extras");
    return list;
  }, [environment]);

  const currentStepId = steps[step];
  const totalSteps = steps.length;

  const STEP_META = {
    environment: { label: "Ortam",     title: "Çalışma Ortamı",      subtitle: "Eldiveni hangi ortamda kullanacaksınız?" },
    chemicals:   { label: "Kimyasal",  title: "Kimyasal Maddeler",    subtitle: "Hangi kimyasallara karşı koruma gerekiyor? (EN 374 · Çoklu seçim · İsteğe bağlı)" },
    hazards:     { label: "Tehlikeler",title: "Tehlike Türleri",      subtitle: "Hangi risklere maruz kalıyorsunuz? (İsteğe bağlı)" },
    extras:      { label: "Ekstra",    title: "Ek Gereksinimler",     subtitle: "Varsa seçin, yoksa 'Devam Et' ile geçebilirsiniz." },
  };

  const ENV_OPTIONS = [
    { key: "dry",      label: "Kuru",         icon: "white-balance-sunny", desc: "Temiz ve kuru yüzeyler" },
    { key: "wet",      label: "Islak / Yağlı", icon: "water-outline",       desc: "Islak, yağlı veya kaygan yüzeyler" },
    { key: "chemical", label: "Kimyasal",       icon: "flask-outline",       desc: "Kimyasal madde veya solvent teması" },
  ];

  const HAZARD_OPTIONS = [
    { key: "cut_puncture", label: "Kesilme / Delinme Direnci", icon: "content-cut",            desc: "Keskin kenar, bıçak, cam, iğne, çivi" },
    { key: "heat",         label: "Isı",                        icon: "thermometer-high",       desc: "Yüksek ısı ve alev" },
    { key: "cold",         label: "Soğuk",                      icon: "snowflake",              desc: "Düşük ısı, soğuk hava ortamı" },
    { key: "antistatic",   label: "Elektrostatik (ESD)",         icon: "lightning-bolt-outline", desc: "Statik elektrik, hassas elektronik" },
    { key: "abrasion",     label: "Aşınma",                      icon: "texture-box",            desc: "Sert ve pürüzlü yüzeyler" },
  ];

  const EXTRA_OPTIONS = [
    { key: "food",       label: "Gıda Uyumlu", icon: "food-apple-outline", desc: "Gıda ile temas eden çalışma ortamları" },
    { key: "waterproof", label: "Su Geçirmez",  icon: "water-off-outline",  desc: "Tam su geçirmezlik gerektiren ortamlar" },
  ];

  function canProceed() {
    if (currentStepId === "environment") return !!environment;
    // chemicals, hazards, extras are all optional
    if (currentStepId === "chemicals") return true;
    if (currentStepId === "extras") return true;
    if (currentStepId === "hazards") {
      // Optional — but if cut_puncture selected, level must be chosen
      if (hazards.includes("cut_puncture") && !cutLevel) return false;
      return true;
    }
    return true;
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      navigation.navigate("Sonuçlar", { filters: buildFilterParams() });
    }
  }

  function handleBack() {
    if (step === 0) return;
    const prevStepId = steps[step - 1];
    if (prevStepId === "environment") setEnvironment(null);
    if (prevStepId === "chemicals")   setChemicals([]);
    if (prevStepId === "hazards")     { setHazards([]); setCutLevel(null); }
    if (prevStepId === "extras")      setExtras([]);
    setStep((s) => s - 1);
  }

  function handleRestart() {
    setStep(0);
    setEnvironment(null);
    setChemicals([]);
    setHazards([]);
    setCutLevel(null);
    setExtras([]);
  }

  function toggleHazard(key) {
    setHazards((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      if (key === "cut_puncture" && prev.includes(key)) setCutLevel(null);
      return next;
    });
  }

  function toggleChemical(code) {
    setChemicals((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function toggleExtra(key) {
    setExtras((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function buildFilterParams() {
    const p = {};
    if (environment === "chemical")          p.chemical = "1";
    if (chemicals.length > 0)               p.chemicals = chemicals.join(",");
    if (hazards.includes("cut_puncture"))   { p.cut = "1"; p.puncture = "1"; }
    if (hazards.includes("heat"))           p.heat = "1";
    if (hazards.includes("cold"))           p.cold = "1";
    if (hazards.includes("antistatic"))     p.antistatic = "1";
    if (extras.includes("food"))            p.food = "1";
    if (extras.includes("waterproof"))      p.waterproof = "1";
    if (cutLevel)                           p.cut_level = String(cutLevel);
    return p;
  }

  const meta = STEP_META[currentStepId];
  const stepLabels = steps.map((s) => STEP_META[s].label);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>ELDİVEN BULUCU</Text>
          <Text style={styles.appSub}>İş Güvenliği Ekipmanları</Text>
        </View>
        {step > 0 && (
          <TouchableOpacity onPress={handleRestart} style={styles.restartBtn}>
            <MaterialCommunityIcons name="refresh" size={16} color={C.white} />
            <Text style={styles.restartText}>Başa Dön</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Step Progress */}
      <View style={styles.stepBar}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i <= step && styles.stepCircleActive,
                i < step && styles.stepCircleDone,
              ]}>
                {i < step
                  ? <MaterialCommunityIcons name="check" size={14} color={C.white} />
                  : <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]} numberOfLines={1}>
                {stepLabels[i]}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>{meta.title}</Text>
        <Text style={styles.stepSubtitle}>{meta.subtitle}</Text>

        {/* ENVIRONMENT */}
        {currentStepId === "environment" && (
          <View style={styles.optionList}>
            {ENV_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.key}
                opt={opt}
                selected={environment === opt.key}
                onPress={() => setEnvironment(opt.key)}
                multiple={false}
              />
            ))}
          </View>
        )}

        {/* CHEMICALS — EN 374 grid */}
        {currentStepId === "chemicals" && (
          <>
            <View style={styles.chemGrid}>
              {EN374_CHEMICALS.map((chem) => {
                const active = chemicals.includes(chem.code);
                return (
                  <TouchableOpacity
                    key={chem.code}
                    style={[styles.chemCard, active && styles.chemCardActive]}
                    onPress={() => toggleChemical(chem.code)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chemCode, active && styles.chemCodeActive]}>
                      {chem.code}
                    </Text>
                    <Text style={[styles.chemLabel, active && styles.chemLabelActive]} numberOfLines={2}>
                      {chem.label}
                    </Text>
                    <Text style={[styles.chemDetail, active && styles.chemDetailActive]} numberOfLines={1}>
                      {chem.detail}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {chemicals.length > 0 && (
              <View style={styles.selectedChemRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={14} color={C.accent} />
                <Text style={styles.selectedChemText}>
                  {chemicals.length} kimyasal seçildi: {chemicals.join(", ")}
                </Text>
              </View>
            )}
          </>
        )}

        {/* HAZARDS */}
        {currentStepId === "hazards" && (
          <View style={styles.optionList}>
            {HAZARD_OPTIONS.map((opt) => (
              <React.Fragment key={opt.key}>
                <OptionCard
                  opt={opt}
                  selected={hazards.includes(opt.key)}
                  onPress={() => toggleHazard(opt.key)}
                  multiple={true}
                />
                {opt.key === "cut_puncture" && hazards.includes("cut_puncture") && (
                  <CutLevelSelector cutLevel={cutLevel} onSelect={setCutLevel} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* EXTRAS */}
        {currentStepId === "extras" && (
          <View style={styles.optionList}>
            {EXTRA_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.key}
                opt={opt}
                selected={extras.includes(opt.key)}
                onPress={() => toggleExtra(opt.key)}
                multiple={true}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={C.primary} />
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextText}>
            {step === totalSteps - 1 ? "Eldivenlerimi Listele" : "Devam Et"}
          </Text>
          <MaterialCommunityIcons
            name={step === totalSteps - 1 ? "magnify" : "arrow-right"}
            size={18} color={C.white}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OptionCard({ opt, selected, onPress, multiple }) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
        <MaterialCommunityIcons name={opt.icon} size={26} color={selected ? C.white : C.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
        <Text style={styles.optionDesc}>{opt.desc}</Text>
      </View>
      <View style={[multiple ? styles.checkbox : styles.radio, selected && styles.radioSelected]}>
        {selected && <MaterialCommunityIcons name="check" size={14} color={C.white} />}
      </View>
    </TouchableOpacity>
  );
}

function CutLevelSelector({ cutLevel, onSelect }) {
  return (
    <View style={styles.cutLevelBox}>
      <Text style={styles.cutLevelTitle}>Kesilme Direnç Seviyesi</Text>
      <Text style={styles.cutLevelSub}>EN 388 standardına göre  ·  1 = Düşük  ·  5 = Maksimum</Text>
      <View style={styles.cutLevelRow}>
        {CUT_LEVELS.map((cl) => {
          const active = cutLevel === cl.level;
          return (
            <TouchableOpacity
              key={cl.level}
              style={[styles.levelBtn, active && styles.levelBtnActive]}
              onPress={() => onSelect(cl.level)}
              activeOpacity={0.75}
            >
              <Text style={[styles.levelNum, active && styles.levelNumActive]}>{cl.level}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {cutLevel ? (
        <View style={styles.levelDescRow}>
          <MaterialCommunityIcons name="information-outline" size={13} color={C.accent} />
          <Text style={styles.levelDescText}>
            {CUT_LEVELS.find((cl) => cl.level === cutLevel)?.desc}
          </Text>
        </View>
      ) : (
        <Text style={styles.levelRequiredText}>* Devam etmek için seviye seçin</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  appName: { color: C.white, fontSize: 15, fontWeight: "800", letterSpacing: 1.5 },
  appSub:  { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 1 },
  restartBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  restartText: { color: C.white, fontSize: 12, fontWeight: "600" },

  stepBar: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.white,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  stepItem:        { alignItems: "center", gap: 4, minWidth: 52 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
    borderColor: C.border, backgroundColor: C.white,
    justifyContent: "center", alignItems: "center",
  },
  stepCircleActive: { borderColor: C.accent, backgroundColor: C.accentBg },
  stepCircleDone:   { borderColor: C.accent, backgroundColor: C.accent },
  stepNum:          { fontSize: 12, fontWeight: "700", color: C.disabled },
  stepNumActive:    { color: C.accent },
  stepLabel:        { fontSize: 9, fontWeight: "600", color: C.disabled, textAlign: "center", maxWidth: 52 },
  stepLabelActive:  { color: C.accent },
  stepLine:         { flex: 1, height: 2, backgroundColor: C.border, marginBottom: 14 },
  stepLineActive:   { backgroundColor: C.accent },

  scroll:        { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  stepTitle:     { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 4 },
  stepSubtitle:  { fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 19 },

  optionList: { gap: 10 },
  optionCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.white, borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: C.border,
  },
  optionCardSelected: { borderColor: C.accent, backgroundColor: C.accentBg },
  iconBox: {
    width: 52, height: 52, borderRadius: 10, backgroundColor: "#EEF1F7",
    justifyContent: "center", alignItems: "center",
  },
  iconBoxSelected:      { backgroundColor: C.accent },
  optionText:           { flex: 1 },
  optionLabel:          { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 2 },
  optionLabelSelected:  { color: C.accent },
  optionDesc:           { fontSize: 12, color: C.sub, lineHeight: 17 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: C.border, justifyContent: "center", alignItems: "center",
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 2,
    borderColor: C.border, justifyContent: "center", alignItems: "center",
  },
  radioSelected: { backgroundColor: C.accent, borderColor: C.accent },

  // Chemicals
  chemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chemCard: {
    width: "30%", borderRadius: 10, padding: 10,
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", gap: 3,
  },
  chemCardActive:   { borderColor: C.accent, backgroundColor: C.accentBg },
  chemCode:         { fontSize: 20, fontWeight: "800", color: C.primary },
  chemCodeActive:   { color: C.accent },
  chemLabel:        { fontSize: 11, fontWeight: "600", color: C.text, textAlign: "center" },
  chemLabelActive:  { color: C.accent },
  chemDetail:       { fontSize: 9, color: C.sub, textAlign: "center" },
  chemDetailActive: { color: C.accent },
  selectedChemRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  selectedChemText: { fontSize: 12, color: C.accent, fontWeight: "600", flex: 1 },

  // Cut level
  cutLevelBox: {
    backgroundColor: C.white, borderRadius: 12, padding: 16,
    borderWidth: 1.5, borderColor: C.accent, marginTop: -4,
  },
  cutLevelTitle:     { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 2 },
  cutLevelSub:       { fontSize: 11, color: C.sub, marginBottom: 14 },
  cutLevelRow:       { flexDirection: "row", gap: 8, marginBottom: 10 },
  levelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.5, borderColor: C.border, alignItems: "center", backgroundColor: C.bg,
  },
  levelBtnActive:    { borderColor: C.accent, backgroundColor: C.accent },
  levelNum:          { fontSize: 18, fontWeight: "800", color: C.sub },
  levelNumActive:    { color: C.white },
  levelDescRow:      { flexDirection: "row", alignItems: "center", gap: 5 },
  levelDescText:     { fontSize: 12, color: C.accent, fontWeight: "500" },
  levelRequiredText: { fontSize: 11, color: "#DC2626", fontStyle: "italic" },

  navBar: {
    flexDirection: "row", paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white, gap: 12,
  },
  backBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, paddingVertical: 14,
  },
  backText: { fontSize: 15, fontWeight: "600", color: C.primary },
  nextBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14,
  },
  nextBtnDisabled: { backgroundColor: C.disabled },
  nextText:        { color: C.white, fontSize: 15, fontWeight: "700" },
});
