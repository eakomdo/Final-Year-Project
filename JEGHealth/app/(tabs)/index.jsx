import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Health tip data array that can be repeated for "infinite" scrolling
  const healthTips = [
    {
      id: 1,
      title: "Stay Hydrated",
      text: "Drink at least 8 glasses of water daily",
      icon: "water",
      color: "#90CAF9",
    },
    {
      id: 2,
      title: "Daily Exercise",
      text: "30 minutes of exercise improves health",
      icon: "fitness",
      color: "#4CAF50",
    },
    {
      id: 3,
      title: "Quality Sleep",
      text: "Aim for 7-8 hours of sleep nightly",
      icon: "moon",
      color: "#2196F3",
    },
    {
      id: 4,
      title: "Balanced Diet",
      text: "Eat a variety of fruits, vegetables, and proteins",
      icon: "nutrition",
      color: "#FF9800",
    },
    {
      id: 5,
      title: "Reduce Stress",
      text: "Practice meditation or deep breathing exercises",
      icon: "flower",
      color: "#9C27B0",
    },
    {
      id: 6,
      title: "Limit Screen Time",
      text: "Take regular breaks from screens to reduce eye strain",
      icon: "phone-portrait",
      color: "#607D8B",
    },
  ];

  // Create a repeating array to simulate infinite scrolling
  const repeatedTips = [...healthTips, ...healthTips, ...healthTips];

  const healthData = {
    steps: "5,234",
    heartRate: "72 bpm",
    calories: "420 kcal",
    sleep: "7h 20m",
  };

  // Handle tip card tap
  const handleTipPress = (tip) => {
    router.push({
      pathname: "/tip-detail",
      params: {
        id: tip.id,
        title: tip.title,
        color: tip.color,
        icon: tip.icon,
      },
    });
  };

  // Apply dynamic styles based on theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      borderBottomColor: theme.border,
    },
    title: {
      color: theme.text,
    },
    card: {
      backgroundColor: theme.card,
      shadowColor: theme.text,
    },
    text: {
      color: theme.text,
    },
    subText: {
      color: theme.subText,
    },
    section: {
      backgroundColor: theme.card,
    },
    tipCard: {
      backgroundColor: theme.card,
    },
    tipTitle: {
      color: theme.text,
    },
    tipText: {
      color: theme.subText,
    },
    healthCard: {
      backgroundColor: theme.background,
    },
    healthValue: {
      color: theme.text,
    },
    healthLabel: {
      color: theme.subText,
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.title, dynamicStyles.title]}>Home</Text>
      </View>

      <View style={[styles.card, dynamicStyles.card]}>
        <Text style={[styles.cardTitle, dynamicStyles.text]}>
          Welcome to JEGHealth
        </Text>
        <Text style={[styles.cardText, dynamicStyles.subText]}>
          Your health monitoring companion
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Today&#39;s Summary</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthCard}>
            <Ionicons name="footsteps" size={24} color="#4CAF50" />
            <Text style={styles.healthValue}>{healthData.steps}</Text>
            <Text style={styles.healthLabel}>Steps </Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="heart" size={24} color="#F44336" />
            <Text style={styles.healthValue}>{healthData.heartRate}</Text>
            <Text style={styles.healthLabel}>Heart Rate </Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="flame" size={24} color="#FF9800" />
            <Text style={styles.healthValue}>{healthData.calories}</Text>
            <Text style={styles.healthLabel}>Calories </Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="bed" size={24} color="#2196F3" />
            <Text style={styles.healthValue}>{healthData.sleep}</Text>
            <Text style={styles.healthLabel}>Sleep </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>
            Health Tips
          </Text>
          <TouchableOpacity onPress={() => router.push("/health-tips")}>
            <Text style={styles.seeAllText}>See All </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={212} // Card width (200) + margin (12)
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {repeatedTips.map((tip, index) => (
            <TouchableOpacity
              key={`${tip.id}-${index}`}
              style={[styles.tipCard, dynamicStyles.tipCard]}
              onPress={() => handleTipPress(tip)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tipImage,
                  {
                    backgroundColor: tip.color,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <Ionicons name={tip.icon} size={36} color="#fff" />
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, dynamicStyles.tipTitle]}>
                  {tip.title}
                </Text>
                <Text style={[styles.tipText, dynamicStyles.tipText]}>
                  {tip.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => router.push("/(tabs)/health")}
      >
        <Text style={styles.trackButtonText}>
          Track{"\u00A0"}Your{"\u00A0"}Health
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    color: "#007BFF",
    fontSize: 14,
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  healthCard: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  healthValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  healthLabel: {
    fontSize: 14,
    color: "#666",
  },
  tipCard: {
    width: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipImage: {
    width: "100%",
    height: 120,
  },
  tipContent: {
    padding: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
  },
  trackButton: {
    flexDirection: "row",
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
  },
});
