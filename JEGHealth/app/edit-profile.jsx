import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Profile state
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("Male");
  const [bloodType, setBloodType] = useState("O+");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [bloodTypeModalVisible, setBloodTypeModalVisible] = useState(false);

  // Load profile data when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  // Load profile data from AsyncStorage
  const loadProfileData = async () => {
    try {
      const profileData = await AsyncStorage.getItem("profileData");
      if (profileData) {
        const parsedData = JSON.parse(profileData);
        setProfileImage(parsedData.profileImage);
        setName(parsedData.name || "John Doe");
        setEmail(parsedData.email || "john.doe@example.com");
        setAge(parsedData.age || "32");
        setGender(parsedData.gender || "Male");
        setBloodType(parsedData.bloodType || "O+");
        setHeight(parsedData.height || "175");
        setWeight(parsedData.weight || "70");
      }
    } catch (error) {
      console.log("Error loading profile data:", error);
    }
  };

  // Save profile data to AsyncStorage
  const saveProfileData = async () => {
    try {
      const profileData = {
        profileImage,
        name,
        email,
        age,
        gender,
        bloodType,
        height,
        weight,
      };

      await AsyncStorage.setItem("profileData", JSON.stringify(profileData));
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.log("Error saving profile data:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permission to change your profile picture"
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permission to take a profile picture"
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // Add platform-specific text styles where you have rendering issues
  const androidTextFix =
    Platform.OS === "android"
      ? {
          includeFontPadding: false,
          textAlignVertical: "center",
        }
      : {};

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
    inputContainer: {
      backgroundColor: theme.card,
    },
    inputLabel: {
      color: theme.text,
    },
    input: {
      color: theme.text,
      backgroundColor: theme.background,
      borderColor: theme.border,
    },
    sectionTitle: {
      color: theme.text,
    },
    profileImagePlaceholder: {
      backgroundColor: theme.profileImage,
    },
    cameraButtonBackground: {
      backgroundColor: theme.primary,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    cancelButton: {
      borderColor: theme.border,
    },
    cancelButtonText: {
      color: theme.text,
    },
  };

  return (
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.title]}>
          Edit Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageSection}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={showImageOptions}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View
              style={[
                styles.profileImagePlaceholder,
                dynamicStyles.profileImagePlaceholder,
              ]}
            >
              <Ionicons name="person" size={60} color={theme.iconColor} />
            </View>
          )}
          <View
            style={[styles.cameraButton, dynamicStyles.cameraButtonBackground]}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Basic Information */}
      <View style={[styles.section, dynamicStyles.inputContainer]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Basic Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Full Name
          </Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            placeholderTextColor={theme.subText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Email
          </Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={theme.subText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Personal Information */}
      <View style={[styles.section, dynamicStyles.inputContainer]}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          Personal Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Age{" "}
          </Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={theme.subText}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Gender
          </Text>
          <View style={styles.genderButtonContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Male" && styles.genderButtonActive,
                gender === "Male" && { backgroundColor: theme.primary },
              ]}
              onPress={() => setGender("Male")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "Male" && { color: "#fff" },
                ]}
                allowFontScaling={false} // Prevent text scaling issues
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Female" && styles.genderButtonActive,
                gender === "Female" && { backgroundColor: theme.primary },
              ]}
              onPress={() => setGender("Female")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "Female" && { color: "#fff" },
                ]}
                allowFontScaling={false} // Prevent text scaling issues
              >
                Female
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Other" && styles.genderButtonActive,
                gender === "Other" && { backgroundColor: theme.primary },
              ]}
              onPress={() => setGender("Other")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === "Other" && { color: "#fff" },
                ]}
                allowFontScaling={false} // Prevent text scaling issues
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Blood Type
          </Text>
          <TouchableOpacity
            style={[styles.fullWidthButton, dynamicStyles.input]}
            onPress={() => setBloodTypeModalVisible(true)}
          >
            <Text
              style={[styles.selectText, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false} // Prevent text scaling issues
            >
              {bloodType}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.subText} />
          </TouchableOpacity>

          {/* Blood Type Picker Modal */}
          <Modal
            transparent={true}
            visible={bloodTypeModalVisible}
            animationType="slide"
            onRequestClose={() => setBloodTypeModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setBloodTypeModalVisible(false)}
            >
              <View
                style={[
                  styles.pickerModalContainer,
                  { backgroundColor: theme.card },
                ]}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <Text style={[styles.pickerTitle, { color: theme.text }]}>
                  Select Blood Type
                </Text>
                <View style={styles.bloodTypeGrid}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.bloodTypeOption,
                          bloodType === type && styles.bloodTypeOptionSelected,
                          bloodType === type && {
                            backgroundColor: theme.primary,
                          },
                        ]}
                        onPress={() => {
                          setBloodType(type);
                          setBloodTypeModalVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.bloodTypeText,
                            bloodType === type && { color: "#fff" },
                            androidTextFix,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.cancelPickerButton,
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setBloodTypeModalVisible(false)}
                >
                  <Text
                    style={[styles.cancelButtonFullText, { color: theme.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Height (cm){" "}
          </Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter your height in cm"
            placeholderTextColor={theme.subText}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Weight (kg){" "}
          </Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter your weight in kg"
            placeholderTextColor={theme.subText}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.cancelButton, dynamicStyles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text
            style={[styles.cancelButtonText, dynamicStyles.cancelButtonText]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, dynamicStyles.saveButton]}
          onPress={saveProfileData}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: "relative",
    width: 120,
    height: 120,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginHorizontal: -5, // Negative margin to offset button margins
  },
  radioButton: {
    minWidth: 85, // Ensure minimum width
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    paddingHorizontal: 10, // Ensure there's enough padding
  },
  radioButtonSelected: {
    borderWidth: 2,
  },
  radioText: {
    fontSize: 15, // Slightly smaller font size
    fontWeight: "500",
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
  selectContainer: {
    borderRadius: 8,
  },
  selectButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    marginBottom: 40,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 8,
    overflow: "hidden",
    height: 48,
  },
  segmentButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  segmentButtonActive: {
    borderWidth: 0,
  },
  segmentButtonText: {
    fontSize: 16,
    color: "#666",
  },
  segmentButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  fullWidthButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 16,
    paddingVertical: 4,
    flex: 1, // Take up available space
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContainer: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  bloodTypeOption: {
    width: "48%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8, // Add horizontal padding
  },
  bloodTypeOptionSelected: {
    borderWidth: 0,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: "500",
    includeFontPadding: false, // Fix Android text rendering issues
    textAlign: "center",
  },
  cancelPickerButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 32, // Increase horizontal padding
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonFullText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 4, // Add some padding
  },
  genderButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    paddingHorizontal: 4,
  },
  genderButtonActive: {
    borderWidth: 0,
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
    padding: 0,
  },
});
