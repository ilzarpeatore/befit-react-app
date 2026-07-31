import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const { width: SW } = Dimensions.get("window");

const QUESTIONS = [
  "Â¿Ha dicho algÃºn mÃ©dico que tiene algÃºn problema cardÃ­aco y que solo deberÃ­a realizar actividad fÃ­sica recomendada por un mÃ©dico?",
  "Â¿Siente dolor en el pecho cuando realiza actividad fÃ­sica?",
  "Ha sentido dolor en el pecho en el Ãºltimo mes?",
  "Â¿Se ha mareado o perdido la conciencia como resultado de una lesiÃ³n?",
  "Â¿Tiene algÃºn problema Ã³seo o articular que pudiera empeorar con la actividad fÃ­sica?",
  "Â¿Toma algÃºn medicamento para la presiÃ³n arterial o una condiciÃ³n cardÃ­aca?",
  "Â¿Conoce alguna otra razÃ³n por la que no deberÃ­a realizar actividad fÃ­sica?",
];

export default function ParqScreen({ navigation }: any) {
  const styles = useStyle();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const handleAnswer = (yes: boolean) => {
    const newAnswers = [...answers, yes];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      scrollRef.current?.scrollTo({ x: next * SW, animated: true });
    } else {
      const hasYes = newAnswers.some(a => a);
      navigation.replace("ParqResult", { cleared: !hasYes, answers: newAnswers });
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 0 }} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Encuesta PAR-Q</Text>
          <Text style={styles.counter}>{currentQ + 1}/{QUESTIONS.length}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }]} />
        </View>
      </SafeAreaView>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color={C.blue50} />
        <Text style={styles.infoText}>El cuestionario PAR-Q determina si estÃ¡s listo para iniciar un programa de ejercicio. Responde con honestidad.</Text>
      </View>

      <ScrollView ref={scrollRef} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false}>
        {QUESTIONS.map((q, i) => (
          <View key={i} style={styles.questionPage}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={32} color={C.destructive50} />
            </View>
            <Text style={styles.qNumber}>Pregunta {i + 1}</Text>
            <Text style={styles.qText}>{q}</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.noBtn} onPress={() => handleAnswer(false)}>
                <Ionicons name="checkmark-circle-outline" size={22} color={C.success50} />
                <Text style={styles.noText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={() => handleAnswer(true)}>
                <Ionicons name="close-circle-outline" size={22} color={C.destructive50} />
                <Text style={styles.yesText}>SÃ­</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    infoBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: C.blue10, borderRadius: 14, padding: 14, marginHorizontal: 20, marginTop: 16, gap: 10 },
    infoText: { flex: 1, fontSize: 12, fontFamily: FONT.medium, color: C.white, lineHeight: 18 },
    questionPage: { width: SW, alignItems: "center", paddingHorizontal: 32, paddingTop: 32 },
    heartCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.destructive5, justifyContent: "center", alignItems: "center", marginBottom: 24 },
    qNumber: { fontSize: 14, fontFamily: FONT.semiBold, color: C.gray50, marginBottom: 8 },
    qText: { fontSize: 18, fontFamily: FONT.bold, color: C.white, textAlign: "center", lineHeight: 26, marginBottom: 32 },
    btnRow: { flexDirection: "row", gap: 16, width: "100%" },
    noBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.success5, borderRadius: 16, paddingVertical: 16, gap: 8, borderWidth: 1, borderColor: C.success50 },
    noText: { fontSize: 16, fontFamily: FONT.bold, color: C.success50 },
    yesBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.destructive5, borderRadius: 16, paddingVertical: 16, gap: 8, borderWidth: 1, borderColor: C.destructive50 },
    yesText: { fontSize: 16, fontFamily: FONT.bold, color: C.destructive50 },
  });
}
