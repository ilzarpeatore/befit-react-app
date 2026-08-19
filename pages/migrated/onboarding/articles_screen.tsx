import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { C, FONT } from "../theme";
import { blogApi, BlogListItem } from "@api/blog";

const { width } = Dimensions.get("window");

export default function ArticlesScreen({ navigation }: any) {
  const [articles, setArticles] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getList(1, { per_page: 6 })
      .then((res) => setArticles((res.data?.data ?? []).filter((p: any) => p.status === 'publish')))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = articles[0];
  const gridArticles = articles.slice(1);
  const openArticle = (post: BlogListItem) => navigation.navigate("MigratedBlogDetail", { mBlogModel: post });

  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <Text style={[localStyles.title, { color: C.textPrimary }]}>
          Artículos recomendados
        </Text>

        {loading && <ActivityIndicator color={C.primary} style={{ marginVertical: 30 }} />}

        {!loading && articles.length === 0 && (
          <Text style={[localStyles.featuredAuthor, { color: C.gray, textAlign: "center", marginVertical: 20 }]}>
            Todavía no hay artículos publicados.
          </Text>
        )}

        {featured && (
          <TouchableOpacity style={localStyles.featuredCard} onPress={() => openArticle(featured)}>
            <View style={localStyles.featuredImage}>
              {featured.post_image ? (
                <Image source={{ uri: featured.post_image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <Ionicons name="newspaper-outline" size={48} color={C.textPrimary} />
              )}
            </View>
            <View style={localStyles.featuredContent}>
              <Text style={localStyles.featuredTitle}>{featured.title}</Text>
              {!!featured.blog_category?.title && (
                <Text style={[localStyles.featuredAuthor, { color: C.gray }]}>{featured.blog_category.title}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        <View style={localStyles.grid}>
          {gridArticles.map((article) => (
            <TouchableOpacity key={article.id} style={localStyles.gridCard} onPress={() => openArticle(article)}>
              <View style={localStyles.gridImage}>
                {article.post_image ? (
                  <Image source={{ uri: article.post_image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <Ionicons name="document-text-outline" size={32} color={C.textPrimary} />
                )}
              </View>
              <View style={localStyles.gridContent}>
                {!!article.blog_category?.title && (
                  <View style={[localStyles.categoryTag, { backgroundColor: C.primaryLight }]}>
                    <Text style={[localStyles.categoryText, { color: C.textPrimary }]}>{article.blog_category.title}</Text>
                  </View>
                )}
                <Text style={localStyles.gridTitle} numberOfLines={2}>{article.title}</Text>
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
