import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  const healthData = {
    steps: "5,234",
    heartRate: "72 bpm",
    calories: "420 kcal",
    sleep: "7h 20m",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, John</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileIconContainer}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person-circle" size={40} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Today&#39;s Summary</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthCard}>
            <Ionicons name="footsteps" size={24} color="#4CAF50" />
            <Text style={styles.healthValue}>{healthData.steps}</Text>
            <Text style={styles.healthLabel}>Steps</Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="heart" size={24} color="#F44336" />
            <Text style={styles.healthValue}>{healthData.heartRate}</Text>
            <Text style={styles.healthLabel}>Heart Rate</Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="flame" size={24} color="#FF9800" />
            <Text style={styles.healthValue}>{healthData.calories}</Text>
            <Text style={styles.healthLabel}>Calories</Text>
          </View>

          <View style={styles.healthCard}>
            <Ionicons name="bed" size={24} color="#2196F3" />
            <Text style={styles.healthValue}>{healthData.sleep}</Text>
            <Text style={styles.healthLabel}>Sleep</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <Link href="/about" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See{"\u00A0"}All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tipCard}>
            <View style={[styles.tipImage, {backgroundColor: '#90CAF9', alignItems: 'center', justifyContent: 'center'}]}>
              <Ionicons name="water" size={36} color="#fff" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay{"\u00A0"}Hydrated</Text>
              <Text style={styles.tipText}>
                Drink at least 8 glasses of water daily
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={[styles.tipImage, {backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center'}]}>
              <Ionicons name="fitness" size={36} color="#fff" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Daily{"\u00A0"}Exercise</Text>
              <Text style={styles.tipText}>
                30 minutes of exercise improves health
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={[styles.tipImage, {backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center'}]}>
              <Ionicons name="moon" size={36} color="#fff" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Quality{"\u00A0"}Sleep</Text>
              <Text style={styles.tipText}>
                Aim for 7-8 hours of sleep nightly
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => router.push("/(tabs)/health")}
      >
        <Text style={styles.trackButtonText}>Track{"\u00A0"}Your{"\u00A0"}Health</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
});
