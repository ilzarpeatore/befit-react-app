import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const { width: SW } = Dimensions.get("window");
const TOTAL_STEPS = 4;

const GOALS = [
  { key: "lose_weight", icon: "flame-outline" as const, label: "Perder peso", color: C.orange },
  { key: "gain_muscle", icon: "barbell-outline" as const, label: "Ganar mÃºsculo", color: C.white },
  { key: "stay_fit", icon: "heart-outline" as const, label: "Mantenerme en forma", color: C.success50 },
  { key: "improve_endurance", icon: "walk-outline" as const, label: "Mejorar resistencia", color: C.blue50 },
  { key: "improve_flexibility", icon: "body-outline" as const, label: "Mejorar flexibilidad", color: C.purple50 },
];

const EXPERIENCE = [
  { key: "beginner", label: "Principiante", desc: "Nuevo en el ejercicio" },
  { key: "intermediate", label: "Intermedio", desc: "6-18 meses" },
  { key: "advanced", label: "Avanzado", desc: "1-3 aÃ±os" },
  { key: "expert", label: "Experto", desc: "3+ aÃ±os" },
];

const EQUIPMENT = [
  { key: "bodyweight", icon: "body-outline" as const, label: "Peso corporal" },
  { key: "dumbbells", icon: "barbell-outline" as const, label: "Mancuernas" },
  { key: "full_gym", icon: "fitness-outline" as const, label: "Gimnasio completo" },
  { key: "machines", icon: "settings-outline" as const, label: "MÃ¡quinas" },
  { key: "kettlebells", icon: "ellipse-outline" as const, label: "Pesanillas" },
];

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function FitnessAssessmentScreen({ navigation }: any) {
  const styles = useStyle();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [equipment, setEquipment] = useState("");
  const [frequency, setFrequency] = useState(3);
  const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, false, false, false, false]);
  const scrollRef = useRef<ScrollView>(null);

  const canNext = () => {
    if (step === 0) return !!goal;
    if (step === 1) return !!experience;
    if (step === 2) return !!equipment;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: next * SW, animated: true });
    } else {
      navigation.replace("Home");
    }
  };

  const toggleDay = (idx: number) => {
    const newDays = [...selectedDays];
    newDays[idx] = !newDays[idx];
    setSelectedDays(newDays);
  };

  const activeDaysCount = selectedDays.filter(Boolean).length;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 0 }} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (step > 0 ? setStep(step - 1) : navigation.goBack())} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EvaluaciÃ³n Fitness</Text>
          <Text style={styles.counter}>{step + 1}/{TOTAL_STEPS}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </SafeAreaView>

      <ScrollView ref={scrollRef} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false}>
        {/* Step 0: Goal */}
        <View style={styles.stepPage}>
          <Text style={styles.stepTitle}>Â¿CuÃ¡l es tu objetivo principal?</Text>
          <View style={{ gap: 12, width: "100%" }}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.key}
                style={[styles.optionCard, goal === g.key && { borderColor: g.color, backgroundColor: `${g.color}15` }]}
                onPress={() => setGoal(g.key)}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${g.color}20` }]}>
                  <Ionicons name={g.icon} size={24} color={g.color} />
                </View>
                <Text style={[styles.optionLabel, goal === g.key && { color: C.white }]}>{g.label}</Text>
                {goal === g.key && <Ionicons name="checkmark-circle" size={22} color={g.color} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 1: Experience */}
        <View style={styles.stepPage}>
          <Text style={styles.stepTitle}>Â¿CuÃ¡l es tu nivel de experiencia?</Text>
          <View style={{ gap: 12, width: "100%" }}>
            {EXPERIENCE.map(e => (
              <TouchableOpacity
                key={e.key}
                style={[styles.optionCard, experience === e.key && styles.optionOn]}
                onPress={() => setExperience(e.key)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, experience === e.key && { color: C.white }]}>{e.label}</Text>
                  <Text style={styles.optionDesc}>{e.desc}</Text>
                </View>
                {experience === e.key && <Ionicons name="checkmark-circle" size={22} color={C.white} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 2: Equipment */}
        <View style={styles.stepPage}>
          <Text style={styles.stepTitle}>Â¿QuÃ© equipamiento tienes disponible?</Text>
          <View style={{ gap: 12, width: "100%" }}>
            {EQUIPMENT.map(eq => (
              <TouchableOpacity
                key={eq.key}
                style={[styles.optionCard, equipment === eq.key && styles.optionOn]}
                onPress={() => setEquipment(eq.key)}
              >
                <View style={[styles.optionIcon, { backgroundColor: equipment === eq.key ? C.brand10 : C.gray40 }]}>
                  <Ionicons name={eq.icon} size={24} color={equipment === eq.key ? C.white : C.gray50} />
                </View>
                <Text style={[styles.optionLabel, equipment === eq.key && { color: C.white }]}>{eq.label}</Text>
                {equipment === eq.key && <Ionicons name="checkmark-circle" size={22} color={C.white} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 3: Frequency */}
        <View style={styles.stepPage}>
          <Text style={styles.stepTitle}>Â¿CuÃ¡ntos dÃ­as por semana puedes entrenar?</Text>

          <View style={styles.freqCard}>
            <View style={styles.freqHeader}>
              <Ionicons name="trending-up" size={20} color={C.gray50} />
              <Text style={styles.freqLabel}>HÃ¡bito de entrenamiento</Text>
            </View>
            <View style={styles.freqBar}>
              <View style={[styles.freqFill, { width: `${(frequency / 7) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.freqDisplay}>
            <Text style={styles.freqBig}>{frequency}</Text>
            <Text style={styles.freqSub}>veces por semana</Text>
          </View>

          <View style={styles.sliderRow}>
            <TouchableOpacity onPress={() => setFrequency(Math.max(1, frequency - 1))} style={styles.sliderBtn}>
              <Ionicons name="remove" size={22} color={C.white} />
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((frequency - 1) / 6) * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setFrequency(Math.min(7, frequency + 1))} style={styles.sliderBtn}>
              <Ionicons name="add" size={22} color={C.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysRow}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayBtn, selectedDays[i] && styles.dayOn]}
                onPress={() => toggleDay(i)}
              >
                <Text style={[styles.dayLabel, selectedDays[i] && { color: C.white }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.recoBanner}>
            <Ionicons name="bulb-outline" size={18} color={C.warning40} />
            <Text style={styles.recoText}>
              {frequency <= 2
                ? "Una frecuencia baja es ideal para principiantes. Puedes aumentar gradualmente."
                : frequency <= 4
                ? "Excelente frecuencia. Esto te ayudarÃ¡ a mantener un progreso constante."
                : "Frecuencia alta. AsegÃºrate de incluir dÃ­as de descanso para recuperaciÃ³n."}
            </Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView style={{ flex: 0 }} edges={["bottom"]}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && { opacity: 0.5 }]}
            disabled={!canNext()}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>{step === TOTAL_STEPS - 1 ? "Finalizar" : "Continuar"}</Text>
            <Ionicons name="arrow-forward" size={20} color={C.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: "center", alignItems: "center" },
    headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: FONT.bold, color: C.white },
    counter: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50 },
    progressTrack: { height: 4, backgroundColor: C.gray30, marginHorizontal: 20, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: C.brand50, borderRadius: 2 },
    stepPage: { width: SW, paddingHorizontal: 24, paddingTop: 24 },
    stepTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white, marginBottom: 24 },
    optionCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 14 },
    optionOn: { backgroundColor: C.brand10, borderColor: C.brand50 },
    optionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    optionLabel: { flex: 1, fontSize: 15, fontFamily: FONT.semiBold, color: C.gray50 },
    optionDesc: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, marginTop: 2 },
    freqCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 20 },
    freqHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    freqLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
    freqBar: { height: 8, backgroundColor: C.gray30, borderRadius: 4 },
    freqFill: { height: 8, backgroundColor: C.brand50, borderRadius: 4 },
    freqDisplay: { alignItems: "center", marginBottom: 20 },
    freqBig: { fontSize: 64, fontFamily: FONT.extraBold, color: C.white },
    freqSub: { fontSize: 16, fontFamily: FONT.medium, color: C.gray50, marginTop: -4 },
    sliderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
    sliderBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.gray40, justifyContent: "center", alignItems: "center" },
    sliderTrack: { flex: 1, height: 8, backgroundColor: C.gray30, borderRadius: 4 },
    sliderFill: { height: 8, backgroundColor: C.brand50, borderRadius: 4 },
    daysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    dayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.gray40, justifyContent: "center", alignItems: "center" },
    dayOn: { backgroundColor: C.brand50 },
    dayLabel: { fontSize: 14, fontFamily: FONT.bold, color: C.gray50 },
    recoBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: C.warning5, borderRadius: 14, padding: 14, gap: 10 },
    recoText: { flex: 1, fontSize: 12, fontFamily: FONT.medium, color: C.white, lineHeight: 18 },
    footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
    nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, gap: 8 },
    nextBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  });
}
