import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "../component/SafeScreen";

export default function AboutPage() {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#333"
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About JEGHealth</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Ionicons name="fitness" size={80} color="#007BFF" />
          </View>

          <Text style={styles.title}>Our Mission</Text>
          <Text style={styles.paragraph}>
            JEGHealth is dedicated to providing accessible health tracking and
            monitoring tools to help you maintain a healthy lifestyle. Our app
            empowers you to take control of your health journey through
            personalized insights and easy-to-use features.
          </Text>

          <Text style={styles.title}>About the App</Text>
          <Text style={styles.paragraph}>
            Built with React Native and Expo, JEGHealth offers a seamless
            experience across both iOS and Android platforms. We focus on
            privacy, ensuring your health data remains secure and only accessible
            to you.
          </Text>

          <Text style={styles.title}>Our Team</Text>
          <Text style={styles.paragraph}>
            JEGHealth was developed by a passionate team of health enthusiasts
            and software developers committed to creating technology that makes a
            positive impact on people&apos;s lives.
          </Text>

          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.paragraph}>
            We&apos;d love to hear your feedback! Reach out to us at
            support@jeghealth.com or visit our website at www.jeghealth.com.
          </Text>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  backButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    alignSelf: "flex-start",
    marginTop: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  version: {
    marginTop: 40,
    fontSize: 14,
    color: "#888",
  },
});
