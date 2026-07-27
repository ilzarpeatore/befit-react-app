import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";

const { width } = Dimensions.get("window");

const ARTICLES = [
  { id: "1", title: "10 ejercicios para principiantes", category: "Fitness", author: "Coach Ana", image: "https://picsum.photos/400/250?r=1" },
  { id: "2", title: "NutriciÃ³n deportiva bÃ¡sica", category: "NutriciÃ³n", author: "Dr. Carlos", image: "https://picsum.photos/400/250?r=2" },
  { id: "3", title: "Mejora tu resistencia", category: "Cardio", author: "Coach Luis", image: "https://picsum.photos/400/250?r=3" },
  { id: "4", title: "Yoga para relajaciÃ³n", category: "Bienestar", author: "MarÃ­a LÃ³pez", image: "https://picsum.photos/400/250?r=4" },
  { id: "5", title: "Rutinas de fuerza", category: "Fuerza", author: "Coach Pedro", image: "https://picsum.photos/400/250?r=5" },
  { id: "6", title: "Descanso y recuperaciÃ³n", category: "Salud", author: "Dr. Ana", image: "https://picsum.photos/400/250?r=6" },
];

const featured = ARTICLES[0];
const gridArticles = ARTICLES.slice(1);

export default function ArticlesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.primary }]}>
          ArtÃ­culos recomendados
        </Text>

        <TouchableOpacity style={localStyles.featuredCard}>
          <View style={localStyles.featuredImage}>
            <Ionicons name="newspaper-outline" size={48} color={C.primary} />
          </View>
          <View style={localStyles.featuredContent}>
            <Text style={localStyles.featuredTitle}>{featured.title}</Text>
            <Text style={[localStyles.featuredAuthor, { color: C.gray }]}>Por {featured.author}</Text>
          </View>
        </TouchableOpacity>

        <View style={localStyles.grid}>
          {gridArticles.map((article) => (
            <TouchableOpacity key={article.id} style={localStyles.gridCard}>
              <View style={localStyles.gridImage}>
                <Ionicons name="document-text-outline" size={32} color={C.primary} />
              </View>
              <View style={localStyles.gridContent}>
                <View style={[localStyles.categoryTag, { backgroundColor: C.primaryLight }]}>
                  <Text style={[localStyles.categoryText, { color: C.primary }]}>{article.category}</Text>
                </View>
                <Text style={[localStyles.gridTitle]} numberOfLines={2}>{article.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={localStyles.bottomBar}>
        <TouchableOpacity
          style={[localStyles.continueBtn, { backgroundColor: C.primary }]}
          onPress={() => navigation.navigate("MigratedOnboardingComplete")}
        >
          <Text style={[localStyles.continueBtnText, { color: C.white }]}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontFamily: FONT.bold, marginBottom: 20, textAlign: "center" },
  featuredCard: { backgroundColor: C.surface, borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  featuredImage: { height: 180, backgroundColor: C.surfaceLight, justifyContent: "center", alignItems: "center" },
  featuredContent: { padding: 16 },
  featuredTitle: { fontSize: 18, fontFamily: FONT.bold, marginBottom: 4 },
  featuredAuthor: { fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridCard: { width: (width - 52) / 2, backgroundColor: C.surface, borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  gridImage: { height: 100, backgroundColor: C.surfaceLight, justifyContent: "center", alignItems: "center" },
  gridContent: { padding: 12 },
  categoryTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  categoryText: { fontSize: 11, fontFamily: FONT.semiBold },
  gridTitle: { fontSize: 14, fontFamily: FONT.semiBold },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, backgroundColor: C.surface },
  continueBtn: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  continueBtnText: { fontSize: 16, fontFamily: FONT.bold },
});
