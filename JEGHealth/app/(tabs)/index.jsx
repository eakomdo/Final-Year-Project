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
    {
      icon: "heart-outline",
      label: "Heart Rate",
      value: "72 BPM",
      color: Colors.error,
      status: "Normal",
    },
    {
      icon: "walk-outline",
      label: "Steps Today",
      value: "8,420",
      color: Colors.primary,
      status: "Goal: 10,000",
    },
    {
      icon: "water-outline",
      label: "Water Intake",
      value: "1.8L",
      color: Colors.info,
      status: "Goal: 2.5L",
    },
    {
      icon: "moon-outline",
      label: "Sleep",
      value: "7h 30m",
      color: Colors.warning,
      status: "Good quality",
    },
  ];

  const healthTips = [
    {
      id: "1",
      title: "Stay Hydrated",
      description:
        "Drink 8-10 glasses of water daily to maintain optimal health and support all bodily functions.",
      icon: "water-outline",
      color: Colors.info,
      priority: "medium",
    },
    {
      id: "2",
      title: "Daily Exercise",
      description:
        "Aim for 30 minutes of moderate exercise daily to strengthen your heart and boost energy.",
      icon: "fitness-outline",
      color: Colors.primary,
      priority: "high",
    },
    {
      id: "3",
      title: "Quality Sleep",
      description:
        "Get 7-9 hours of quality sleep to help your body recover and improve cognitive function.",
      icon: "moon-outline",
      color: Colors.warning,
      priority: "high",
    },
    {
      id: "4",
      title: "Balanced Diet",
      description:
        "Eat a variety of nutrient-rich foods including fruits, vegetables, lean proteins, and whole grains.",
      icon: "nutrition-outline",
      color: Colors.success,
      priority: "high",
    },
  ];

  const quickActions = [
    { icon: "add-circle-outline", label: "Log Health Data", route: "/log-health" },
    { icon: "calendar-outline", label: "Appointments", route: "/appointments" },
    { icon: "medical-outline", label: "Medications", route: "/medications" },
    { icon: "analytics-outline", label: "Reports", route: "/reports" },
    { icon: "flask-outline", label: "Test Appwrite", route: "/appwrite-test" }, // Temporary test button
  ];

  const renderStatCard = (stat, index) => (
    <TouchableOpacity key={index} style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={stat.icon} size={24} color={stat.color} />
        <Text style={styles.statValue}>{stat.value}</Text>
      </View>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={[styles.statStatus, { color: stat.color }]}>{stat.status}</Text>
    </TouchableOpacity>
  );

  const renderHealthTip = (tip, index) => (
    <TouchableOpacity 
      key={tip.id} 
      style={styles.tipCard}
      onPress={() => router.push({
        pathname: "/tip-detail",
        params: {
          title: tip.title,
          color: tip.color,
          icon: tip.icon
        }
      })}
      activeOpacity={0.7}
    >
      <View style={styles.tipHeader}>
        <View style={[styles.tipIcon, { backgroundColor: `${tip.color}15` }]}>
          <Ionicons name={tip.icon} size={24} color={tip.color} />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
        <View style={styles.tipArrow}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.textPrimary}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSubtext}>
            Here&#39;s your health overview for today
          </Text>
        </View>

        {/* Health Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsWrapper}>
            <View style={styles.statsGrid}>{healthStats.map(renderStatCard)}</View>
          </View>
        </View>

        {/* Health Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Tips</Text>
            <TouchableOpacity onPress={() => router.push("/health-tips")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tipsContainer}>{healthTips.map(renderHealthTip)}</View>
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
                <Ionicons name="heart-outline" size={16} color={Colors.error} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Heart rate logged</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={[styles.activityItem, styles.lastActivityItem]}>
              <View style={styles.activityIcon}>
                <Ionicons name="walk-outline" size={16} color={Colors.primary} />
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
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCount: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.primary,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsWrapper: {
    backgroundColor: Colors.primary, // Deep turquoise background
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: 'white', // Ensure white background inside turquoise container
    borderRadius: 16,
    padding: 16,
    borderWidth: 0, // Remove border since we have the turquoise container
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tipArrow: {
    padding: 4,
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
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
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
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
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
