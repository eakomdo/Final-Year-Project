import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router"; // Import useFocusEffect
import { useTheme } from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // Profile data state
  const [profileData, setProfileData] = useState({
    profileImage: null,
    name: "John Doe",
    email: "john.doe@example.com",
    age: "32",
    gender: "Male",
    bloodType: "O+",
    height: "175",
    weight: "70",
  });

  // Use useFocusEffect instead of useEffect with router.addListener
  useFocusEffect(
    React.useCallback(() => {
      // This runs when the screen comes into focus
      loadProfileData();

      // No cleanup needed for useFocusEffect
    }, [])
  );

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem("profileData");
      if (data) {
        setProfileData(JSON.parse(data));
      }
    } catch (error) {
      console.log("Error loading profile data:", error);
    }
  };

  const handleLogout = () => {
    router.replace("/login");
  };

  // Apply dynamic styles based on theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: "#f8f8f8", // Keep white theme
    },
    header: {
      padding: 16,
      backgroundColor: "#fff", // Keep white header
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text, // Use theme text color for title
    },
    profileSection: {
      alignItems: "center",
      padding: 24,
      backgroundColor: "#fff", // Keep white cards
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "#f0f0f0",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    section: {
      backgroundColor: "#fff", // Keep white cards
      borderRadius: 10,
      padding: 16,
      margin: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    text: {
      color: "#333", // Dark text on white background
    },
    subText: {
      color: "#666", // Gray text on white background
    },
    divider: {
      borderBottomColor: "#f0f0f0", // Light gray dividers
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
          My Profile
        </Text>
      </View>

      <View style={[styles.profileSection, dynamicStyles.profileSection]}>
        <View
          style={[
            styles.profileImageContainer,
            dynamicStyles.profileImageContainer,
          ]}
        >
          {profileData.profileImage ? (
            <Image
              source={{ uri: profileData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <Ionicons name="person" size={50} color="#2D8B85" />
          )}
        </View>
        <Text style={[styles.profileName, dynamicStyles.text]}>
          {profileData.name}
        </Text>
        <Text style={[styles.profileEmail, dynamicStyles.subText]}>
          {profileData.email}
        </Text>
        <TouchableOpacity
          style={[styles.editProfileButton]}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={[styles.editProfileText]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>
          Personal Information
        </Text>

        <View style={[styles.infoRow, dynamicStyles.divider]}>
          <Text style={[styles.infoLabel, dynamicStyles.text]}>Age</Text>
          <Text
            style={[
              styles.infoValue,
              dynamicStyles.subText,
              { minWidth: 30, textAlign: "right" },
            ]}
            allowFontScaling={false}
          >
            {profileData.age}
          </Text>
        </View>

        <View style={[styles.infoRow, dynamicStyles.divider]}>
          <Text style={[styles.infoLabel, dynamicStyles.text]}>Gender</Text>
          <Text
            style={[
              styles.infoValue,
              dynamicStyles.subText,
              { minWidth: 60, textAlign: "right" },
            ]}
            allowFontScaling={false}
          >
            {profileData.gender}
          </Text>
        </View>

        <View style={[styles.infoRow, dynamicStyles.divider]}>
          <Text style={[styles.infoLabel, dynamicStyles.text]}>Blood Type</Text>
          <Text
            style={[
              styles.infoValue,
              dynamicStyles.subText,
              { paddingHorizontal: 4, minWidth: 32, textAlign: "right" },
            ]}
          >
            {profileData.bloodType}
          </Text>
        </View>

        <View style={[styles.infoRow, dynamicStyles.divider]}>
          <Text style={[styles.infoLabel, dynamicStyles.text]}>Height</Text>
          <Text
            style={[
              styles.infoValue,
              dynamicStyles.subText,
              { minWidth: 60, textAlign: "right" },
            ]}
            allowFontScaling={false}
          >
            {profileData.height} cm
          </Text>
        </View>

        <View style={[styles.infoRow, dynamicStyles.divider]}>
          <Text style={[styles.infoLabel, dynamicStyles.text]}>Weight</Text>
          <Text
            style={[
              styles.infoValue,
              dynamicStyles.subText,
              { minWidth: 60, textAlign: "right" },
            ]}
            allowFontScaling={false}
          >
            {profileData.weight} kg
          </Text>
        </View>
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Settings </Text>

        <View style={[styles.settingRow, dynamicStyles.divider]}>
          <Text style={[styles.settingLabel, dynamicStyles.text]}>
            Push Notifications{" "}
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#d1d1d6", true: "#2D8B85" }}
            thumbColor={notifications ? "#fff" : "#f4f3f4"}
          />
        </View>

      
      </View>

      <View style={[styles.section, dynamicStyles.section]}>
        <TouchableOpacity
          style={[styles.menuRow, dynamicStyles.divider]}
          onPress={() => router.push("/about")}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#2D8B85"
          />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            About JEGHealth{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, dynamicStyles.divider]}>
          <Ionicons
            name="help-circle-outline"
            size={22}
            color="#2D8B85"
          />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            Help & Support{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, dynamicStyles.divider]}>
          <Ionicons name="shield-outline" size={22} color="#2D8B85" />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            Privacy Policy{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Keep your existing StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Light gray background
  },
  header: {
    padding: 16,
    backgroundColor: "#fff", // White header
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Dark text on white
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff", // White card
    margin: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#e0e0e0",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333", // Dark text
  },
  profileEmail: {
    fontSize: 16,
    color: "#666", // Gray text
    marginTop: 4,
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 2,
    borderColor: "#2D8B85", // Deep turquoise border
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2D8B85", // Deep turquoise background
  },
  editProfileText: {
    color: "#fff", // White text on turquoise
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff", // White cards
    borderRadius: 15,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333", // Dark text on white
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#333", // Dark text
  },
  infoValue: {
    fontSize: 16,
    color: "#666", // Gray text
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333", // Dark text
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333", // Dark text
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: "#2D8B85", // Deep turquoise for logout button
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
