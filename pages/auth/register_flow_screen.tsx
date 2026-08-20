import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../migrated/theme";

const { width: SW } = Dimensions.get("window");
const STEPS = ["Cuenta", "Género", "Edad", "Métricas", "Objetivo", "Actividad", "Dieta"];

const GOALS = [
  { key: "lose_weight", icon: "flame-outline" as const, label: "Perder peso" },
  { key: "gain_muscle", icon: "barbell-outline" as const, label: "Ganar músculo" },
  { key: "stay_fit", icon: "heart-outline" as const, label: "Mantenerme en forma" },
];

const ACTIVITIES = [
  { key: "sedentary", label: "Sedentario", desc: "Poco o nada de ejercicio" },
  { key: "light", label: "Ligero", desc: "1-3 días/semana" },
  { key: "moderate", label: "Moderado", desc: "3-5 días/semana" },
  { key: "active", label: "Activo", desc: "6-7 días/semana" },
  { key: "very_active", label: "Muy Activo", desc: "Ejercicio intenso diario" },
];

const DIETS = [
  { key: "balanced", label: "Equilibrada" },
  { key: "high_protein", label: "Alta en proteína" },
  { key: "low_carb", label: "Baja en carbohidratos" },
  { key: "keto", label: "Keto" },
  { key: "custom", label: "Personalizada" },
];

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={prStyles.row}>
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={i} style={[prStyles.seg, i < step + 1 && prStyles.segOn]} />
      ))}
    </View>
  );
}

const prStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4, marginBottom: 20 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.gray30 },
  segOn: { backgroundColor: C.brand50 },
});

function PasswordStrength({ password }: { password: string }) {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  const colors = [C.destructive50, C.orange, C.warning40, C.success50, C.success60];
  const labels = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < strength ? colors[strength] : C.gray30 }} />
      ))}
      {password.length > 0 && <Text style={{ fontSize: 11, fontFamily: FONT.medium, color: colors[strength] }}>{labels[strength]}</Text>}
    </View>
  );
}

export default function RegisterFlowScreen({ navigation }: any) {
  const styles = useStyle();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");
  const [diet, setDiet] = useState("");
  const [proteinPct, setProteinPct] = useState(30);
  const [fatPct, setFatPct] = useState(25);
  const [carbPct, setCarbPct] = useState(45);

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

  const canNext = () => {
    if (step === 0) return name && email && password && password === confirm;
    if (step === 1) return gender;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return goal;
    if (step === 5) return activity;
    if (step === 6) return diet;
    return false;
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else navigation.navigate("Home");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={styles.inputWrap}><Ionicons name="person-outline" size={20} color={C.gray50} /><TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={C.gray40} value={name} onChangeText={setName} /></View>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}><Ionicons name="mail-outline" size={20} color={C.gray50} /><TextInput style={styles.input} placeholder="tucorreo@email.com" placeholderTextColor={C.gray40} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputWrap}><Ionicons name="call-outline" size={20} color={C.gray50} /><TextInput style={styles.input} placeholder="+34 600 000 000" placeholderTextColor={C.gray40} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrap}><Ionicons name="lock-closed-outline" size={20} color={C.gray50} /><TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={C.gray40} value={password} onChangeText={setPassword} secureTextEntry={!showPass} /><Pressable onPress={() => setShowPass(!showPass)} style={({ pressed }) => pressed && { opacity: 0.2 }}><Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={C.gray50} /></Pressable></View>
            <PasswordStrength password={password} />
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrap}><Ionicons name="lock-closed-outline" size={20} color={C.gray50} /><TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={C.gray40} value={confirm} onChangeText={setConfirm} secureTextEntry /></View>
            {confirm.length > 0 && password !== confirm && <Text style={{ fontSize: 12, color: C.destructive50, fontFamily: FONT.medium, marginTop: 4 }}>Las contraseñas no coinciden</Text>}
          </>
        );
      case 1:
        return (
          <View style={{ gap: 12 }}>
            {GOALS.map(g => (
              <Pressable
                key={g.key}
                style={({ pressed }) => [styles.optionCard, gender === g.key && styles.optionOn, pressed && { opacity: 0.2 }]}
                onPress={() => setGender(g.key)}
              >
                <Ionicons name={g.icon} size={28} color={gender === g.key ? C.white : C.gray50} />
                <Text style={[styles.optionLabel, gender === g.key && { color: C.white }]}>{g.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.bigNumber}>{age}</Text>
            <Text style={styles.bigLabel}>años</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20 }} contentContainerStyle={{ paddingHorizontal: 40 }}>
              {Array.from({ length: 85 }).map((_, i) => {
                const v = i + 16;
                return (
                  <Pressable
                    key={v}
                    onPress={() => setAge(v)}
                    style={({ pressed }) => [{ alignItems: "center", marginHorizontal: 10 }, pressed && { opacity: 0.2 }]}
                  >
                    <View style={[styles.tickMark, v === age && styles.tickOn]} />
                    {v % 5 === 0 && <Text style={[styles.tickLabel, v === age && { color: C.white }]}>{v}</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        );
      case 3:
        return (
          <>
            <Text style={styles.label}>Peso: {weight} kg</Text>
            <View style={styles.sliderWrap}>
              <Text style={styles.sliderMin}>30</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((weight - 30) / 170) * 100}%` }]} />
                <View style={[styles.sliderThumb, { left: `${((weight - 30) / 170) * 100}%` }]} />
              </View>
              <Text style={styles.sliderMax}>200</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.sliderBtn, pressed && { opacity: 0.2 }]} onPress={() => setWeight(Math.max(30, weight - 1))}><Ionicons name="remove" size={20} color={C.white} /></Pressable>
            <Pressable style={({ pressed }) => [styles.sliderBtn, pressed && { opacity: 0.2 }]} onPress={() => setWeight(Math.min(200, weight + 1))}><Ionicons name="add" size={20} color={C.white} /></Pressable>

            <Text style={[styles.label, { marginTop: 24 }]}>Altura: {height} cm</Text>
            <View style={styles.sliderWrap}>
              <Text style={styles.sliderMin}>120</Text>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${((height - 120) / 100) * 100}%` }]} />
                <View style={[styles.sliderThumb, { left: `${((height - 120) / 100) * 100}%` }]} />
              </View>
              <Text style={styles.sliderMax}>220</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.sliderBtn, pressed && { opacity: 0.2 }]} onPress={() => setHeight(Math.max(120, height - 1))}><Ionicons name="remove" size={20} color={C.white} /></Pressable>
            <Pressable style={({ pressed }) => [styles.sliderBtn, pressed && { opacity: 0.2 }]} onPress={() => setHeight(Math.min(220, height + 1))}><Ionicons name="add" size={20} color={C.white} /></Pressable>

            <View style={styles.bmiCard}>
              <Text style={styles.bmiLabel}>IMC</Text>
              <Text style={styles.bmiValue}>{bmi}</Text>
            </View>
          </>
        );
      case 4:
        return (
          <View style={{ gap: 12 }}>
            {GOALS.map(g => (
              <Pressable
                key={g.key}
                style={({ pressed }) => [styles.optionCard, goal === g.key && styles.optionOn, pressed && { opacity: 0.2 }]}
                onPress={() => setGoal(g.key)}
              >
                <Ionicons name={g.icon} size={28} color={goal === g.key ? C.white : C.gray50} />
                <Text style={[styles.optionLabel, goal === g.key && { color: C.white }]}>{g.label}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 5:
        return (
          <View style={{ gap: 12 }}>
            {ACTIVITIES.map(a => (
              <Pressable
                key={a.key}
                style={({ pressed }) => [styles.optionCard, activity === a.key && styles.optionOn, pressed && { opacity: 0.2 }]}
                onPress={() => setActivity(a.key)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, activity === a.key && { color: C.white }]}>{a.label}</Text>
                  <Text style={styles.optionDesc}>{a.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        );
      case 6:
        return (
          <>
            <View style={{ gap: 12, marginBottom: 20 }}>
              {DIETS.map(d => (
                <Pressable
                  key={d.key}
                  style={({ pressed }) => [styles.optionCard, diet === d.key && styles.optionOn, pressed && { opacity: 0.2 }]}
                  onPress={() => setDiet(d.key)}
                >
                  <Text style={[styles.optionLabel, diet === d.key && { color: C.white }]}>{d.label}</Text>
                </Pressable>
              ))}
            </View>
            {diet === "custom" && (
              <View style={{ gap: 16 }}>
                <MacroSlider label="Proteína" value={proteinPct} color={C.orange} onChange={setProteinPct} />
                <MacroSlider label="Grasas" value={fatPct} color={C.purple50} onChange={setFatPct} />
                <MacroSlider label="Carbohidratos" value={carbPct} color={C.blue50} onChange={setCarbPct} />
                <Text style={{ fontSize: 12, color: C.gray50, fontFamily: FONT.medium, textAlign: "center" }}>Total: {proteinPct + fatPct + carbPct}%</Text>
              </View>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 0 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => (step > 0 ? setStep(step - 1) : navigation.goBack())}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <Text style={styles.stepCounter}>{step + 1}/7</Text>
        </View>
        <ProgressBar step={step} />
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>{STEPS[step]}</Text>
        {renderStep()}
      </ScrollView>

      <SafeAreaView style={{ flex: 0 }} edges={["bottom"]}>
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.nextBtn, !canNext() && { opacity: 0.5 }, pressed && { opacity: 0.2 }]}
            disabled={!canNext()}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>{step === 6 ? "Continuar a PAR-Q" : "Continuar"}</Text>
            <Ionicons name="arrow-forward" size={20} color={C.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function MacroSlider({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 13, fontFamily: FONT.semiBold, color: C.white }}>{label}</Text>
        <Text style={{ fontSize: 13, fontFamily: FONT.medium, color }}>{value}%</Text>
      </View>
      <View style={{ height: 4, backgroundColor: C.gray30, borderRadius: 2, marginTop: 8 }}>
        <View style={{ height: 4, backgroundColor: color, borderRadius: 2, width: `${value}%` }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
        <Pressable onPress={() => onChange(Math.max(0, value - 5))} style={({ pressed }) => pressed && { opacity: 0.2 }}><Ionicons name="remove-circle" size={28} color={C.gray50} /></Pressable>
        <Pressable onPress={() => onChange(Math.min(100, value + 5))} style={({ pressed }) => pressed && { opacity: 0.2 }}><Ionicons name="add-circle" size={28} color={C.gray50} /></Pressable>
      </View>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: "center", alignItems: "center" },
    headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: FONT.bold, color: C.white },
    stepCounter: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50 },
    body: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
    stepTitle: { fontSize: 22, fontFamily: FONT.bold, color: C.white, marginBottom: 20 },
    label: { fontSize: 13, fontFamily: FONT.semiBold, color: C.gray50, marginBottom: 6, marginTop: 4 },
    inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, gap: 10 },
    input: { flex: 1, fontSize: 15, fontFamily: FONT.regular, color: C.white },
    optionCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 14 },
    optionOn: { backgroundColor: C.brand10, borderColor: C.brand50 },
    optionLabel: { fontSize: 15, fontFamily: FONT.semiBold, color: C.gray50 },
    optionDesc: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, marginTop: 2 },
    bigNumber: { fontSize: 64, fontFamily: FONT.extraBold, color: C.white },
    bigLabel: { fontSize: 16, fontFamily: FONT.medium, color: C.gray50, marginTop: -4 },
    tickMark: { width: 3, height: 20, backgroundColor: C.gray30, borderRadius: 2 },
    tickOn: { backgroundColor: C.brand50, height: 30 },
    tickLabel: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, marginTop: 6 },
    sliderWrap: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    sliderMin: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, width: 30 },
    sliderMax: { fontSize: 12, fontFamily: FONT.medium, color: C.gray50, width: 30, textAlign: "right" },
    sliderTrack: { flex: 1, height: 6, backgroundColor: C.gray30, borderRadius: 3, marginHorizontal: 8, position: "relative" },
    sliderFill: { height: 6, backgroundColor: C.brand50, borderRadius: 3 },
    sliderThumb: { position: "absolute", top: -7, width: 20, height: 20, borderRadius: 10, backgroundColor: C.brand50, borderWidth: 3, borderColor: C.white },
    sliderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gray40, justifyContent: "center", alignItems: "center", alignSelf: "center", marginTop: 4 },
    bmiCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.surface, borderRadius: 16, padding: 16, marginTop: 20, gap: 12 },
    bmiLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50 },
    bmiValue: { fontSize: 24, fontFamily: FONT.extraBold, color: C.white },
    footer: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
    nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, gap: 8 },
    nextBtnText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  });
}
