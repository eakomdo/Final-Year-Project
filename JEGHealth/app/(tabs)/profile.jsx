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
      backgroundColor: theme.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
    },
    profileSection: {
      alignItems: "center",
      padding: 24,
      backgroundColor: theme.card,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.profileImage,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 16,
      margin: 10,
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    text: {
      color: theme.text,
    },
    subText: {
      color: theme.subText,
    },
    divider: {
      borderBottomColor: theme.divider,
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
            <Ionicons name="person" size={50} color={theme.iconColor} />
          )}
        </View>
        <Text style={[styles.profileName, dynamicStyles.text]}>
          {profileData.name}
        </Text>
        <Text style={[styles.profileEmail, dynamicStyles.subText]}>
          {profileData.email}
        </Text>
        <TouchableOpacity
          style={[styles.editProfileButton, { borderColor: theme.primary }]}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={[styles.editProfileText, { color: theme.primary }]}>
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
            trackColor={theme.switchTrack}
          />
        </View>

        <View style={[styles.settingRow, dynamicStyles.divider]}>
          <Text style={[styles.settingLabel, dynamicStyles.text]}>
            Dark Mode{" "}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={theme.switchTrack}
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
            color={theme.primary}
          />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            About JEGHealth{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, dynamicStyles.divider]}>
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={theme.primary}
          />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            Help & Support{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, dynamicStyles.divider]}>
          <Ionicons name="shield-outline" size={22} color={theme.primary} />
          <Text style={[styles.menuText, dynamicStyles.text]}>
            Privacy Policy{" "}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
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
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editProfileText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
    color: "#333",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 5, // Add horizontal padding
    marginLeft: 8,        // Add left margin for spacing
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
    color: "#333",
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
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 40,
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
