import React, { useCallback, useRef, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useNavigation } from "@react-navigation/native";
import { AuthTextField } from "@components/auth/AuthTextField";
import { AuthPrimaryButton } from "@components/auth/AuthPrimaryButton";
import { AuthErrorBanner } from "@components/auth/AuthErrorBanner";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { useAuth } from "@store/AuthContext";
import { Colors } from "@constants/colors";
import {
  UserRegistrationData,
  INITIAL_REGISTRATION,
  GOALS,
  ACTIVITY_LEVELS,
  EXPERIENCE_LEVELS,
  EQUIPMENT_OPTIONS,
  calcStrength,
  calculateBMI,
  getBMILabel,
} from "../../types/registration";

const TOTAL_STEPS = 8;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RegisterFlowScreen() {
  const styles = useStyle();
  const navigation = useNavigation<any>();
  const { register: authRegister } = useAuth();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<UserRegistrationData>({ ...INITIAL_REGISTRATION });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = useCallback((patch: Partial<UserRegistrationData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const showError = (msg: string) => {
    setError(msg);
    return false;
  };

  const validateStep = (): boolean => {
    setError("");
    switch (step) {
      case 0:
        if (!data.firstName.trim()) return showError("First name is required");
        if (!data.lastName.trim()) return showError("Last name is required");
        if (!data.email.trim()) return showError("Email is required");
        if (!data.email.includes("@")) return showError("Invalid email");
        if (!data.password) return showError("Password is required");
        if (data.password !== data.confirmPassword) return showError("Passwords do not match");
        if (calcStrength(data.password) < 2) return showError("Password is too weak");
        return true;
      case 1:
        if (!data.gender) return showError("Please select your gender");
        return true;
      case 2:
        if (data.age < 16 || data.age > 100) return showError("Age must be between 16 and 100");
        return true;
      case 3:
        if (data.weightKg <= 0) return showError("Please enter your weight");
        if (data.heightCm <= 0) return showError("Please enter your height");
        return true;
      case 4:
        if (!data.goal) return showError("Please select a goal");
        return true;
      case 5:
        if (!data.experienceLevel) return showError("Please select your experience level");
        return true;
      case 6:
        if (!data.equipment) return showError("Please select your equipment");
        return true;
      case 7:
        if (data.workoutFrequency < 1 || data.workoutFrequency > 7) return showError("Please set your workout frequency");
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep((prev) => prev - 1);
    else navigation.goBack();
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await authRegister({
        username: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        user_type: "user",
        status: "active",
        gender: data.gender,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.username?.[0] ||
        "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.2 }]}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Sign Up</Text>
            <Text style={styles.stepCounter}>{step + 1}/{TOTAL_STEPS}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
              style={[styles.progressFill, { width: `${progressWidth}%` }]}
            />
          </View>

          {/* Error */}
          {error ? <AuthErrorBanner message={error} onDismiss={() => setError("")} /> : null}

          {/* Step content */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {step === 0 && <StepAccount data={data} update={update} />}
            {step === 1 && <StepGender data={data} update={update} />}
            {step === 2 && <StepAge data={data} update={update} />}
            {step === 3 && <StepMetrics data={data} update={update} />}
            {step === 4 && <StepGoal data={data} update={update} />}
            {step === 5 && <StepExperience data={data} update={update} />}
            {step === 6 && <StepEquipment data={data} update={update} />}
            {step === 7 && <StepFrequency data={data} update={update} />}
          </ScrollView>

          {/* Next button */}
          <View style={styles.bottom}>
            <AuthPrimaryButton
              label={step === TOTAL_STEPS - 1 ? "Create Account" : "Next"}
              onPress={handleNext}
              loading={loading}
            />
          </View>

          <StatusBar style="dark" />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ─── Step 0: Account ─── */
function StepAccount({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  return (
    <View>
      <Text style={stepStyles.title}>Create your account</Text>
      <Text style={stepStyles.subtitle}>Enter your details to get started.</Text>
      <AuthTextField label="First Name" hint="John" prefixIcon="person-outline" value={data.firstName} onChangeText={(v) => update({ firstName: v })} autoCapitalize="words" />
      <AuthTextField label="Last Name" hint="Doe" prefixIcon="person-outline" value={data.lastName} onChangeText={(v) => update({ lastName: v })} autoCapitalize="words" />
      <AuthTextField label="Email" hint="john@example.com" prefixIcon="mail-outline" value={data.email} onChangeText={(v) => update({ email: v })} keyboardType="email-address" />
      <AuthTextField label="Password" hint="Min 6 characters" prefixIcon="lock-closed-outline" value={data.password} onChangeText={(v) => update({ password: v })} secureTextEntry />
      <PasswordStrengthInline password={data.password} />
      <AuthTextField label="Confirm Password" hint="Repeat password" prefixIcon="lock-closed-outline" value={data.confirmPassword} onChangeText={(v) => update({ confirmPassword: v })} secureTextEntry />
    </View>
  );
}

const PASSWORD_STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Excellent"];
const PASSWORD_STRENGTH_COLORS = ["", Colors.DANGER, Colors.TEXT_PRIMARY, Colors.SUCCESS, Colors.SUCCESS];

function PasswordStrengthInline({ password }: { password: string }) {
  const styles = useStyle();
  const strength = calcStrength(password);
  if (!password) return null;
  return (
    <View style={stepStyles.strengthRow}>
      <View style={stepStyles.strengthTrack}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[stepStyles.strengthSeg, i <= strength && { backgroundColor: PASSWORD_STRENGTH_COLORS[strength] }]} />
        ))}
      </View>
      <Text style={[stepStyles.strengthLabel, { color: PASSWORD_STRENGTH_COLORS[strength] }]}>{PASSWORD_STRENGTH_LABELS[strength]}</Text>
    </View>
  );
}

/* ─── Step 1: Gender ─── */
const GENDER_OPTIONS: { key: UserRegistrationData["gender"]; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "male", label: "Male", icon: "male" },
  { key: "female", label: "Female", icon: "female" },
  { key: "other", label: "Other", icon: "male-female" },
];

function StepGender({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  const options = GENDER_OPTIONS;
  return (
    <View>
      <Text style={stepStyles.title}>What's your gender?</Text>
      <Text style={stepStyles.subtitle}>This helps us personalize your experience.</Text>
      <View style={stepStyles.cardRow}>
        {options.map((opt) => {
          const selected = data.gender === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => update({ gender: opt.key })}
              style={({ pressed }) => [stepStyles.genderCard, pressed && { opacity: 0.2 }]}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                colors={selected ? [Colors.ACCENT_START, Colors.ACCENT_END] : [Colors.CARD_START, Colors.CARD_END]}
                style={stepStyles.genderGradient}
              >
                <Ionicons name={opt.icon} size={32} color={Colors.TEXT_PRIMARY} />
                <Text style={stepStyles.genderLabel}>{opt.label}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ─── Step 2: Age ─── */
function StepAge({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  return (
    <View>
      <Text style={stepStyles.title}>How old are you?</Text>
      <Text style={stepStyles.subtitle}>We use this to tailor your plan.</Text>
      <View style={stepStyles.pickerContainer}>
        <Pressable
          onPress={() => update({ age: Math.max(16, data.age - 1) })}
          style={({ pressed }) => [stepStyles.pickerBtn, pressed && { opacity: 0.2 }]}
        >
          <Ionicons name="remove" size={28} color={Colors.TEXT_PRIMARY} />
        </Pressable>
        <Text style={stepStyles.pickerValue}>{data.age}</Text>
        <Pressable
          onPress={() => update({ age: Math.min(100, data.age + 1) })}
          style={({ pressed }) => [stepStyles.pickerBtn, pressed && { opacity: 0.2 }]}
        >
          <Ionicons name="add" size={28} color={Colors.TEXT_PRIMARY} />
        </Pressable>
      </View>
      <Text style={stepStyles.hint}>Age: {data.age} years</Text>
    </View>
  );
}

/* ─── Step 3: Metrics (Weight + Height + BMI) ─── */
function StepMetrics({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  const bmi = calculateBMI(data.weightKg, data.heightCm);
  const bmiLabel = getBMILabel(bmi);

  return (
    <View>
      <Text style={stepStyles.title}>Your metrics</Text>
      <Text style={stepStyles.subtitle}>We'll use these to calculate your targets.</Text>

      {/* Weight */}
      <View style={stepStyles.metricBox}>
        <Text style={stepStyles.metricLabel}>Weight (kg)</Text>
        <View style={stepStyles.metricRow}>
          <Pressable
            onPress={() => update({ weightKg: Math.max(30, data.weightKg - 1) })}
            style={({ pressed }) => [stepStyles.metricBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="remove" size={22} color={Colors.TEXT_PRIMARY} />
          </Pressable>
          <Text style={stepStyles.metricValue}>{data.weightKg}</Text>
          <Pressable
            onPress={() => update({ weightKg: Math.min(200, data.weightKg + 1) })}
            style={({ pressed }) => [stepStyles.metricBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="add" size={22} color={Colors.TEXT_PRIMARY} />
          </Pressable>
        </View>
      </View>

      {/* Height */}
      <View style={stepStyles.metricBox}>
        <Text style={stepStyles.metricLabel}>Height (cm)</Text>
        <View style={stepStyles.metricRow}>
          <Pressable
            onPress={() => update({ heightCm: Math.max(120, data.heightCm - 1) })}
            style={({ pressed }) => [stepStyles.metricBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="remove" size={22} color={Colors.TEXT_PRIMARY} />
          </Pressable>
          <Text style={stepStyles.metricValue}>{data.heightCm}</Text>
          <Pressable
            onPress={() => update({ heightCm: Math.min(220, data.heightCm + 1) })}
            style={({ pressed }) => [stepStyles.metricBtn, pressed && { opacity: 0.2 }]}
          >
            <Ionicons name="add" size={22} color={Colors.TEXT_PRIMARY} />
          </Pressable>
        </View>
      </View>

      {/* BMI */}
      <View style={stepStyles.bmiBox}>
        <Text style={stepStyles.bmiValue}>{bmi.toFixed(1)}</Text>
        <Text style={stepStyles.bmiLabel}>{bmiLabel}</Text>
      </View>
    </View>
  );
}

/* ─── Step 4: Goal ─── */
function StepGoal({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  return (
    <View>
      <Text style={stepStyles.title}>What's your goal?</Text>
      <Text style={stepStyles.subtitle}>Select what you want to achieve.</Text>
      {Object.entries(GOALS).map(([key, label]) => {
        const selected = data.goal === key;
        return (
          <Pressable
            key={key}
            onPress={() => update({ goal: key })}
            style={({ pressed }) => [stepStyles.optionCard, pressed && { opacity: 0.2 }]}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              colors={selected ? [Colors.ACCENT_START, Colors.ACCENT_END] : [Colors.CARD_START, Colors.CARD_END]}
              style={stepStyles.optionGradient}
            >
              <Text style={stepStyles.optionLabel}>{label}</Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.TEXT_PRIMARY} />}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Step 5: Experience ─── */
function StepExperience({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  return (
    <View>
      <Text style={stepStyles.title}>Experience level</Text>
      <Text style={stepStyles.subtitle}>How experienced are you with exercise?</Text>
      {Object.entries(EXPERIENCE_LEVELS).map(([key, label]) => {
        const selected = data.experienceLevel === key;
        return (
          <Pressable
            key={key}
            onPress={() => update({ experienceLevel: key })}
            style={({ pressed }) => [stepStyles.optionCard, pressed && { opacity: 0.2 }]}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              colors={selected ? [Colors.ACCENT_START, Colors.ACCENT_END] : [Colors.CARD_START, Colors.CARD_END]}
              style={stepStyles.optionGradient}
            >
              <Text style={stepStyles.optionLabel}>{label}</Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.TEXT_PRIMARY} />}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Step 6: Equipment ─── */
function StepEquipment({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  return (
    <View>
      <Text style={stepStyles.title}>Available equipment</Text>
      <Text style={stepStyles.subtitle}>What equipment do you have access to?</Text>
      {Object.entries(EQUIPMENT_OPTIONS).map(([key, label]) => {
        const selected = data.equipment === key;
        return (
          <Pressable
            key={key}
            onPress={() => update({ equipment: key })}
            style={({ pressed }) => [stepStyles.optionCard, pressed && { opacity: 0.2 }]}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              colors={selected ? [Colors.ACCENT_START, Colors.ACCENT_END] : [Colors.CARD_START, Colors.CARD_END]}
              style={stepStyles.optionGradient}
            >
              <Text style={stepStyles.optionLabel}>{label}</Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.TEXT_PRIMARY} />}
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Step 7: Frequency ─── */
const FREQUENCY_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function StepFrequency({ data, update }: { data: UserRegistrationData; update: (p: Partial<UserRegistrationData>) => void }) {
  const days = FREQUENCY_DAYS;

  return (
    <View>
      <Text style={stepStyles.title}>Workout frequency</Text>
      <Text style={stepStyles.subtitle}>How many days per week can you train?</Text>

      <View style={stepStyles.pickerContainer}>
        <Pressable
          onPress={() => update({ workoutFrequency: Math.max(1, data.workoutFrequency - 1) })}
          style={({ pressed }) => [stepStyles.pickerBtn, pressed && { opacity: 0.2 }]}
        >
          <Ionicons name="remove" size={28} color={Colors.TEXT_PRIMARY} />
        </Pressable>
        <Text style={stepStyles.pickerValue}>{data.workoutFrequency}</Text>
        <Pressable
          onPress={() => update({ workoutFrequency: Math.min(7, data.workoutFrequency + 1) })}
          style={({ pressed }) => [stepStyles.pickerBtn, pressed && { opacity: 0.2 }]}
        >
          <Ionicons name="add" size={28} color={Colors.TEXT_PRIMARY} />
        </Pressable>
      </View>

      <View style={stepStyles.daysRow}>
        {days.map((d, i) => (
          <View key={i} style={[stepStyles.dayCircle, i < data.workoutFrequency && stepStyles.dayCircleActive]}>
            <Text style={[stepStyles.dayText, i < data.workoutFrequency && stepStyles.dayTextActive]}>{d}</Text>
          </View>
        ))}
      </View>

      <Text style={stepStyles.hint}>{data.workoutFrequency} days per week</Text>
    </View>
  );
}

/* ─── Styles ─── */
function useStyle() {
  return useResponsiveStyleSheet({
    bg: { width: "100%", height: "100%", backgroundColor: Colors.BG_PRIMARY },
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: "20@ratio", paddingTop: "10@ratio", height: "48@ratio" },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontFamily: "Gilroy-Bold", fontSize: "18@ratio", color: Colors.TEXT_PRIMARY },
    stepCounter: { fontFamily: "Gilroy-Medium", fontSize: "14@ratio", color: Colors.TEXT_SECONDARY },
    progressTrack: { height: "4@ratio", backgroundColor: Colors.BG_CARD, marginHorizontal: "20@ratio", borderRadius: 2, marginBottom: "8@ratio" },
    progressFill: { height: "100%", borderRadius: 2 },
    scrollContent: { paddingHorizontal: "24@ratio", paddingBottom: "30@ratio", flexGrow: 1 },
    bottom: { paddingHorizontal: "24@ratio", paddingBottom: "20@ratio" },
  });
}

const stepStyles = {
  title: { fontFamily: "Gilroy-ExtraBold" as const, fontSize: 24, color: Colors.TEXT_PRIMARY, marginBottom: 6 },
  subtitle: { fontFamily: "Gilroy-Regular" as const, fontSize: 15, color: Colors.TEXT_SECONDARY, marginBottom: 24, lineHeight: 22 },
  strengthRow: { flexDirection: "row" as const, alignItems: "center" as const, marginTop: 4, marginBottom: 12, gap: 10 },
  strengthTrack: { flex: 1, flexDirection: "row" as const, gap: 4 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.TEXT_MUTED },
  strengthLabel: { fontFamily: "Gilroy-Medium" as const, fontSize: 12 },
  cardRow: { flexDirection: "row" as const, gap: 12 },
  genderCard: { flex: 1, borderRadius: 16, overflow: "hidden" as const },
  genderGradient: { alignItems: "center" as const, justifyContent: "center" as const, paddingVertical: 24, borderRadius: 16, gap: 8 },
  genderLabel: { fontFamily: "Gilroy-Bold" as const, fontSize: 14, color: Colors.TEXT_PRIMARY },
  pickerContainer: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 40, marginVertical: 30 },
  pickerBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.BG_CARD, alignItems: "center" as const, justifyContent: "center" as const },
  pickerValue: { fontFamily: "Gilroy-ExtraBold" as const, fontSize: 64, color: Colors.TEXT_PRIMARY, minWidth: 80, textAlign: "center" as const },
  hint: { fontFamily: "Gilroy-Medium" as const, fontSize: 14, color: Colors.TEXT_SECONDARY, textAlign: "center" as const, marginTop: 12 },
  metricBox: { marginBottom: 20 },
  metricLabel: { fontFamily: "Gilroy-Medium" as const, fontSize: 14, color: Colors.TEXT_SECONDARY, marginBottom: 10 },
  metricRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 30 },
  metricBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.BG_CARD, alignItems: "center" as const, justifyContent: "center" as const },
  metricValue: { fontFamily: "Gilroy-ExtraBold" as const, fontSize: 40, color: Colors.TEXT_PRIMARY, minWidth: 80, textAlign: "center" as const },
  bmiBox: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: Colors.BG_CARD, borderRadius: 16, padding: 16, marginTop: 10, gap: 12 },
  bmiValue: { fontFamily: "Gilroy-ExtraBold" as const, fontSize: 28, color: Colors.TEXT_PRIMARY },
  bmiLabel: { fontFamily: "Gilroy-Medium" as const, fontSize: 16, color: Colors.TEXT_SECONDARY },
  optionCard: { marginBottom: 12, borderRadius: 16, overflow: "hidden" as const },
  optionGradient: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 16 },
  optionLabel: { fontFamily: "Gilroy-Bold" as const, fontSize: 16, color: Colors.TEXT_PRIMARY },
  daysRow: { flexDirection: "row" as const, justifyContent: "center" as const, gap: 10, marginTop: 20 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.BG_CARD, alignItems: "center" as const, justifyContent: "center" as const },
  dayCircleActive: { backgroundColor: Colors.ACCENT_ACTIVE },
  dayText: { fontFamily: "Gilroy-Bold" as const, fontSize: 14, color: Colors.TEXT_MUTED },
  dayTextActive: { color: Colors.TEXT_PRIMARY },
};
