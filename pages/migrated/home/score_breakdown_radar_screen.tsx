import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { C, FONT } from "../theme";

const METRICS = ["Calorie", "Steps", "BMI", "Sleep", "BPM", "Hydration"];
const CATEGORIES = ["Strength", "Agility", "Endurance"];

export default function ScoreBreakdownRadarScreen() {

  const [activeCategory, setActiveCategory] = useState("Strength");
  const [sliders, setSliders] = useState([75, 80, 60, 85, 70, 90]);

  const handleSliderChange = (index: number, value: number) => {
    const updated = [...sliders];
    updated[index] = Math.max(0, Math.min(100, value));
    setSliders(updated);
  };

  const renderRadar = () => {
    const size = 220;
    const center = size / 2;
    const radius = 90;
    const angleStep = (2 * Math.PI) / 6;

    const points = METRICS.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const value = sliders[i] / 100;
      return {
        x: center + radius * value * Math.cos(angle),
        y: center + radius * value * Math.sin(angle),
      };
    });

    const pathD =
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

    const gridLevels = [0.25, 0.5, 0.75, 1];

    return (
      <View style={[styles.radarContainer, { width: size, height: size }]}>
        {gridLevels.map((level) => {
          const gridPoints = Array.from({ length: 6 }, (_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return {
              x: center + radius * level * Math.cos(angle),
              y: center + radius * level * Math.sin(angle),
            };
          });
          return (
            <View key={level} style={StyleSheet.absoluteFill}>
              {gridPoints.map((p, i) => {
                const next = gridPoints[(i + 1) % 6];
                return (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      left: Math.min(p.x, next.x),
                      top: Math.min(p.y, next.y),
                      width: Math.abs(next.x - p.x) || 1,
                      height: Math.abs(next.y - p.y) || 1,
                    }}
                  />
                );
              })}
            </View>
          );
        })}

        {METRICS.map((metric, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelX = center + (radius + 24) * Math.cos(angle);
          const labelY = center + (radius + 24) * Math.sin(angle);
          return (
            <Text
              key={metric}
              style={[
                styles.radarLabel,
                {
                  left: labelX - 30,
                  top: labelY - 8,
                  width: 60,
                  textAlign: "center",
                },
              ]}
            >
              {metric}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Score Breakdown</Text>

        <View style={styles.tabs}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.tabActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === cat && styles.tabTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.radarWrapper}>{renderRadar()}</View>

        <View style={styles.slidersSection}>
          {METRICS.map((metric, i) => (
            <View key={metric} style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>{metric}</Text>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${sliders[i]}%` },
                  ]}
                />
              </View>
              <View style={styles.sliderButtons}>
                <TouchableOpacity
                  onPress={() => handleSliderChange(i, sliders[i] - 5)}
                >
                  <Text style={styles.sliderBtn}>-</Text>
                </TouchableOpacity>
                <Text style={styles.sliderValue}>{sliders[i]}</Text>
                <TouchableOpacity
                  onPress={() => handleSliderChange(i, sliders[i] + 5)}
                >
                  <Text style={styles.sliderBtn}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: C.text,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.card,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: C.gray,
  },
  tabTextActive: {
    color: C.white,
  },
  radarWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  radarContainer: {
    position: "relative",
  },
  radarLabel: {
    position: "absolute",
    fontSize: 11,
    fontFamily: FONT.medium,
    color: C.text,
  },
  slidersSection: {
    gap: 16,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderLabel: {
    width: 80,
    fontSize: 13,
    fontFamily: FONT.medium,
    color: C.text,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: C.card,
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  sliderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 70,
    justifyContent: "flex-end",
  },
  sliderBtn: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: C.textPrimary,
  },
  sliderValue: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: C.text,
    width: 28,
    textAlign: "center",
  },
});
