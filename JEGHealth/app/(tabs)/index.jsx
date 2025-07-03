import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../src/constants/colors";
import JEGHealthLogo from "../../src/components/JEGHealthLogo";
import CaretakerQuickAccess from "../../src/components/CaretakerQuickAccess";

const HomeScreen = () => {
  const router = useRouter();

  const healthStats = [
    { icon: "heart", label: "Heart Rate", value: "72 BPM", color: Colors.error },
    { icon: "fitness", label: "Steps Today", value: "8,420", color: Colors.primary },
    { icon: "water", label: "Water Intake", value: "1.8L", color: Colors.info },
    { icon: "moon", label: "Sleep", value: "7h 30m", color: Colors.warning },
  ];

  const quickActions = [
    { icon: "add-circle", label: "Log Health Data", route: "/log-health" },
    { icon: "calendar", label: "Appointments", route: "/appointments" },
    { icon: "medical", label: "Medications", route: "/medications" },
    { icon: "analytics", label: "Reports", route: "/reports" },
  ];

  const renderStatCard = (stat, index) => (
    <View key={index} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
        <Ionicons name={stat.icon} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderActionCard = (action, index) => (
    <TouchableOpacity
      key={index}
      style={styles.actionCard}
      onPress={() => router.push(action.route)}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={action.icon} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <JEGHealthLogo size="normal" />
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSubtext}>Here's your health overview for today</Text>
        </View>

        {/* Health Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsGrid}>
            {healthStats.map(renderStatCard)}
          </View>
        </View>

        {/* Caretaker Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <CaretakerQuickAccess />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderActionCard)}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={16} color={Colors.error} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Heart rate logged</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={[styles.activityItem, styles.lastActivityItem]}>
              <View style={styles.activityIcon}>
                <Ionicons name="fitness" size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Daily steps goal reached</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.featureIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
