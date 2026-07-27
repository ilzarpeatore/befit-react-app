import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { Colors } from "@constants/colors";
import { profileApi, GraphItem } from "../api/profile";
import { useAuth } from "../store/AuthContext";
import { ErrorRetryMem } from "../components/ErrorRetry";
import { LoadingSkeletonMem } from "../components/LoadingSkeleton";

interface Props {
  navigation: any;
}

export default function ProfileStats({ navigation }: Props) {
  const styles = useStyle();
  const { state } = useAuth();
  const [entries, setEntries] = useState<GraphItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  const userHeight = state.user?.user_profile?.height
    ? parseFloat(state.user.user_profile.height)
    : null;

  const fetchEntries = useCallback(async () => {
    try {
      setError(null);
      const res = await profileApi.getGraphList("weight");
      setEntries(res.data?.data ?? []);
    } catch (e) {
      setError("Failed to load weight data.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchEntries();
    setLoading(false);
  }, [fetchEntries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, [fetchEntries]);

  const handleAddEntry = useCallback(async () => {
    if (!newValue.trim() || !newDate.trim() || saving) return;
    setSaving(true);
    try {
      await profileApi.saveGraph({
        type: "weight",
        value: newValue.trim(),
        date: newDate.trim(),
      });
      setModalVisible(false);
      setNewValue("");
      setNewDate("");
      await fetchEntries();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  }, [newValue, newDate, saving, fetchEntries]);

  const currentWeight =
    entries.length > 0 ? parseFloat(entries[0].value) : null;

  const previousWeight =
    entries.length > 1 ? parseFloat(entries[1].value) : null;

  const weightTrend =
    currentWeight !== null && previousWeight !== null
      ? currentWeight - previousWeight
      : null;

  const bmi =
    currentWeight !== null && userHeight !== null && userHeight > 0
      ? (currentWeight / (userHeight / 100) ** 2).toFixed(1)
      : null;

  const previousBmi =
    previousWeight !== null && userHeight !== null && userHeight > 0
      ? (previousWeight / (userHeight / 100) ** 2).toFixed(1)
      : null;

  const bmiTrend =
    bmi !== null && previousBmi !== null
      ? (parseFloat(bmi) - parseFloat(previousBmi)).toFixed(1)
      : null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderEntry = useCallback(
    ({ item, index }: { item: GraphItem; index: number }) => {
      const val = parseFloat(item.value);
      const prevVal =
        index < entries.length - 1 ? parseFloat(entries[index + 1].value) : null;
      const diff = prevVal !== null ? val - prevVal : null;

      return (
        <View style={styles.entryItem}>
          <View style={styles.entryLeft}>
            <View
              style={[
                styles.entryDot,
                {
                  backgroundColor:
                    diff !== null
                      ? diff > 0
                        ? Colors.DANGER
                        : Colors.SUCCESS
                      : Colors.TEXT_MUTED,
                },
              ]}
            />
            <View>
              <Text style={styles.entryValue}>{item.value} kg</Text>
              <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          {diff !== null && (
            <Text
              style={[
                styles.entryDiff,
                { color: diff > 0 ? Colors.DANGER : Colors.SUCCESS },
              ]}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)}
            </Text>
          )}
        </View>
      );
    },
    [entries]
  );

  if (loading) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Weight Tracking</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.skeletonCards}>
            <View style={styles.skeletonCard}>
              <LoadingSkeletonMem width={"80@ratio"} height={"10@ratio"} />
              <LoadingSkeletonMem width={"60@ratio"} height={"28@ratio"} />
            </View>
            <View style={styles.skeletonCard}>
              <LoadingSkeletonMem width={"80@ratio"} height={"10@ratio"} />
              <LoadingSkeletonMem width={"60@ratio"} height={"28@ratio"} />
            </View>
            <View style={styles.skeletonCard}>
              <LoadingSkeletonMem width={"80@ratio"} height={"10@ratio"} />
              <LoadingSkeletonMem width={"60@ratio"} height={"28@ratio"} />
            </View>
          </View>
        </SafeAreaView>
        <StatusBar style="light" />
      </ImageBackground>
    );
  }

  if (error && entries.length === 0) {
    return (
      <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
        <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Weight Tracking</Text>
            <View style={styles.headerSpacer} />
          </View>
          <ErrorRetryMem message={error} onRetry={loadData} />
        </SafeAreaView>
        <StatusBar style="light" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require("@assets/bg3.png")} style={styles.bg}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.TEXT_PRIMARY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weight Tracking</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.ACCENT_START}
              colors={[Colors.ACCENT_START]}
            />
          }
          ListHeaderComponent={
            <View>
              <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                  <LinearGradient
                    start={{ x: 0.24, y: -0.09 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={[Colors.CARD_START, Colors.CARD_END]}
                    style={styles.summaryCardGradient}
                  >
                    <Text style={styles.summaryLabel}>Current Weight</Text>
                    <View style={styles.summaryValueRow}>
                      <Text style={styles.summaryValue}>
                        {currentWeight !== null ? currentWeight.toFixed(1) : "--"}
                      </Text>
                      <Text style={styles.summaryUnit}>kg</Text>
                    </View>
                    {weightTrend !== null && (
                      <Text
                        style={[
                          styles.summaryTrend,
                          {
                            color:
                              weightTrend > 0 ? Colors.DANGER : Colors.SUCCESS,
                          },
                        ]}
                      >
                        {weightTrend > 0 ? "+" : ""}
                        {weightTrend.toFixed(1)} kg
                      </Text>
                    )}
                  </LinearGradient>
                </View>

                {bmi !== null && (
                  <View style={styles.summaryCard}>
                    <LinearGradient
                      start={{ x: 0.24, y: -0.09 }}
                      end={{ x: 0.5, y: 1 }}
                      colors={[Colors.CARD_START, Colors.CARD_END]}
                      style={styles.summaryCardGradient}
                    >
                      <Text style={styles.summaryLabel}>BMI</Text>
                      <View style={styles.summaryValueRow}>
                        <Text style={styles.summaryValue}>{bmi}</Text>
                      </View>
                      {bmiTrend !== null && (
                        <Text
                          style={[
                            styles.summaryTrend,
                            {
                              color:
                                parseFloat(bmiTrend) > 0
                                  ? Colors.DANGER
                                  : Colors.SUCCESS,
                            },
                          ]}
                        >
                          {parseFloat(bmiTrend) > 0 ? "+" : ""}
                          {bmiTrend}
                        </Text>
                      )}
                    </LinearGradient>
                  </View>
                )}

                <View style={styles.summaryCard}>
                  <LinearGradient
                    start={{ x: 0.24, y: -0.09 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={[Colors.CARD_START, Colors.CARD_END]}
                    style={styles.summaryCardGradient}
                  >
                    <Text style={styles.summaryLabel}>Entries</Text>
                    <View style={styles.summaryValueRow}>
                      <Text style={styles.summaryValue}>{entries.length}</Text>
                    </View>
                    <Text style={styles.summaryTrendMuted}>total records</Text>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>History</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="analytics-outline"
                size={64}
                color={Colors.TEXT_MUTED}
              />
              <Text style={styles.emptyTitle}>No weight entries yet</Text>
              <Text style={styles.emptyMessage}>
                Tap the + button to add your first weight entry.
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            start={{ x: 0.24, y: -0.09 }}
            end={{ x: 0.5, y: 1 }}
            colors={[Colors.ACCENT_START, Colors.ACCENT_END]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color={Colors.TEXT_PRIMARY} />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Weight Entry</Text>

            <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="2024-01-15"
              placeholderTextColor={Colors.TEXT_MUTED}
              value={newDate}
              onChangeText={setNewDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="70.5"
              placeholderTextColor={Colors.TEXT_MUTED}
              value={newValue}
              onChangeText={setNewValue}
              keyboardType="decimal-pad"
              maxLength={6}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.modalCancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setNewDate("");
                  setNewValue("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddEntry}
                disabled={!newValue.trim() || !newDate.trim() || saving}
                style={styles.modalSaveBtnWrapper}
              >
                <LinearGradient
                  start={{ x: 0.24, y: -0.09 }}
                  end={{ x: 0.5, y: 1 }}
                  colors={
                    newValue.trim() && newDate.trim() && !saving
                      ? [Colors.ACCENT_START, Colors.ACCENT_END]
                      : [Colors.TEXT_MUTED, Colors.TEXT_MUTED]
                  }
                  style={styles.modalSaveBtn}
                >
                  <Text style={styles.modalSaveText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    bg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
      backgroundColor: Colors.BG_PRIMARY,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: "16@ratio",
      paddingVertical: "12@ratio",
    },
    backBtn: {
      width: "40@ratio",
      height: "40@ratio",
      borderRadius: "20@ratio",
      backgroundColor: Colors.BG_CARD,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
    },
    headerSpacer: {
      width: "40@ratio",
    },
    listContent: {
      paddingHorizontal: "16@ratio",
      paddingBottom: "100@ratio",
    },
    summaryCards: {
      flexDirection: "row",
      gap: "8@ratio",
      marginBottom: "20@ratio",
    },
    summaryCard: {
      flex: 1,
    },
    summaryCardGradient: {
      borderRadius: "16@ratio",
      padding: "14@ratio",
      minHeight: "100@ratio",
    },
    summaryLabel: {
      fontFamily: "Gilroy-Medium",
      fontSize: "11@ratio",
      color: Colors.TEXT_SECONDARY,
      marginBottom: "6@ratio",
    },
    summaryValueRow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    summaryValue: {
      fontFamily: "Gilroy-ExtraBold",
      fontSize: "22@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    summaryUnit: {
      fontFamily: "Gilroy-Bold",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginLeft: "2@ratio",
      marginBottom: "3@ratio",
    },
    summaryTrend: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "11@ratio",
      marginTop: "4@ratio",
    },
    summaryTrendMuted: {
      fontFamily: "Gilroy-Regular",
      fontSize: "11@ratio",
      color: Colors.TEXT_MUTED,
      marginTop: "4@ratio",
    },
    historyHeader: {
      marginBottom: "12@ratio",
    },
    historyTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    entryItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.BG_CARD,
      borderRadius: "12@ratio",
      padding: "14@ratio",
      marginBottom: "8@ratio",
    },
    entryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: "12@ratio",
    },
    entryDot: {
      width: "10@ratio",
      height: "10@ratio",
      borderRadius: "5@ratio",
    },
    entryValue: {
      fontFamily: "Gilroy-Bold",
      fontSize: "15@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    entryDate: {
      fontFamily: "Gilroy-Regular",
      fontSize: "12@ratio",
      color: Colors.TEXT_SECONDARY,
      marginTop: "2@ratio",
    },
    entryDiff: {
      fontFamily: "Gilroy-SemiBold",
      fontSize: "13@ratio",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: "48@ratio",
    },
    emptyTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "18@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
      marginTop: "16@ratio",
    },
    emptyMessage: {
      fontFamily: "Gilroy-Regular",
      fontSize: "14@ratio",
      color: Colors.TEXT_SECONDARY,
      textAlign: "center",
      marginTop: "8@ratio",
    },
    fab: {
      position: "absolute",
      bottom: "24@ratio",
      right: "20@ratio",
      shadowColor: Colors.ACCENT_START,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    fabGradient: {
      width: "56@ratio",
      height: "56@ratio",
      borderRadius: "28@ratio",
      alignItems: "center",
      justifyContent: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: "24@ratio",
    },
    modalContent: {
      backgroundColor: Colors.BG_CARD,
      borderRadius: "20@ratio",
      padding: "24@ratio",
      width: "100%",
    },
    modalTitle: {
      fontFamily: "Gilroy-Bold",
      fontSize: "20@ratio",
      color: Colors.TEXT_PRIMARY,
      textAlign: "center",
      marginBottom: "20@ratio",
    },
    inputLabel: {
      fontFamily: "Gilroy-Medium",
      fontSize: "13@ratio",
      color: Colors.TEXT_SECONDARY,
      marginBottom: "6@ratio",
    },
    modalInput: {
      backgroundColor: Colors.BG_INPUT,
      borderRadius: "12@ratio",
      paddingHorizontal: "14@ratio",
      paddingVertical: "12@ratio",
      fontFamily: "Gilroy-Regular",
      fontSize: "15@ratio",
      color: Colors.TEXT_PRIMARY,
      marginBottom: "16@ratio",
    },
    modalActions: {
      flexDirection: "row",
      gap: "12@ratio",
      marginTop: "8@ratio",
    },
    modalCancelBtn: {
      flex: 1,
      borderRadius: "12@ratio",
      backgroundColor: "rgba(138,140,178,0.2)",
      paddingVertical: "14@ratio",
      alignItems: "center",
    },
    modalCancelText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "15@ratio",
      color: Colors.TEXT_SECONDARY,
    },
    modalSaveBtnWrapper: {
      flex: 1,
    },
    modalSaveBtn: {
      borderRadius: "12@ratio",
      paddingVertical: "14@ratio",
      alignItems: "center",
    },
    modalSaveText: {
      fontFamily: "Gilroy-Bold",
      fontSize: "15@ratio",
      color: Colors.TEXT_PRIMARY,
    },
    skeletonCards: {
      flexDirection: "row",
      gap: "8@ratio",
      paddingHorizontal: "16@ratio",
    },
    skeletonCard: {
      flex: 1,
      backgroundColor: Colors.BG_CARD,
      borderRadius: "16@ratio",
      padding: "14@ratio",
      minHeight: "100@ratio",
      gap: "8@ratio",
    },
  });
}
