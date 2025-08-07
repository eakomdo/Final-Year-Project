import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showSuccess, showInfo } from "../src/utils/NotificationHelper";
import { authAPI } from "../api/services";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Profile state
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodType, setBloodType] = useState("O+");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodTypeModalVisible, setBloodTypeModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data when component mounts
  useEffect(() => {
    loadProfileData();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Update age when date of birth changes
  useEffect(() => {
    if (dateOfBirth) {
      const calculatedAge = calculateAge(dateOfBirth);
      setAge(calculatedAge.toString());
    }
  }, [dateOfBirth]);

  // Split full name into first and last name
  const splitFullName = (fullName) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  // Load profile data from API with fallback to AsyncStorage
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // First try to load from API
      try {
        console.log('Attempting to load profile from API...');
        
        // Try to fetch basic profile information
        const basicResponse = await authAPI.getBasicProfile();
        const basicData = basicResponse.data;
        
        console.log('Basic profile loaded:', basicData);
        
        setName(basicData.full_name || basicData.name || '');
        setEmail(basicData.email || '');
        setProfileImage(basicData.profile_image);
        
        // Try to fetch personal profile information
        try {
          const personalResponse = await authAPI.getPersonalProfile();
          const personalData = personalResponse.data;
          
          console.log('Personal profile loaded:', personalData);
          
          if (personalData.date_of_birth) {
            const dobDate = new Date(personalData.date_of_birth);
            setDateOfBirth(dobDate);
            setAge(personalData.age?.toString() || calculateAge(dobDate).toString());
          }
          
          setHeight(personalData.height?.toString() || '');
          setWeight(personalData.weight?.toString() || '');
          setGender(personalData.gender === 'M' ? 'Male' : personalData.gender === 'F' ? 'Female' : 'Male');
          setBloodType(personalData.blood_type || 'O+');
          
        } catch (personalError) {
          console.log('Personal profile API not available, using defaults:', personalError.message);
          // Personal profile API not available, use defaults or AsyncStorage fallback
        }
        
      } catch (apiError) {
        console.log('Profile API not available, falling back to AsyncStorage:', apiError.message);
        
        // API not available, fallback to AsyncStorage
        const profileData = await AsyncStorage.getItem("profileData");
        if (profileData) {
          const parsedData = JSON.parse(profileData);
          setProfileImage(parsedData.profileImage);
          setName(parsedData.name || "");
          setEmail(parsedData.email || "");
          
          if (parsedData.dateOfBirth) {
            const dobDate = new Date(parsedData.dateOfBirth);
            setDateOfBirth(dobDate);
          }
          
          setGender(parsedData.gender === "Other" ? "Male" : parsedData.gender || "Male");
          setBloodType(parsedData.bloodType || "O+");
          setHeight(parsedData.height || "");
          setWeight(parsedData.weight || "");
        } else {
          console.log('No profile data found in storage, using defaults');
        }
      }
      
    } catch (error) {
      console.log('Error loading profile data:', error);
      showError('Info', 'Profile API is not available. Using local data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile data to API with fallback to AsyncStorage
  const saveProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Always save to AsyncStorage as backup
      const profileData = {
        profileImage,
        name,
        email,
        dateOfBirth: dateOfBirth.toISOString(),
        age,
        gender,
        bloodType,
        height,
        weight,
      };

      await AsyncStorage.setItem("profileData", JSON.stringify(profileData));
      
      // Try to save to API
      try {
        console.log('Attempting to save profile to API...');
        
        // Split full name for basic profile
        const { firstName, lastName } = splitFullName(name);
        
        // Update basic profile information
        const basicData = {
          first_name: firstName,
          last_name: lastName,
          email: email
        };
        
        await authAPI.updateBasicProfile(basicData);
        console.log('Basic profile saved successfully');
        
        // Update personal profile information
        const personalData = {
          date_of_birth: dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
          height: parseFloat(height) || null,
          weight: parseFloat(weight) || null,
          gender: gender === 'Male' ? 'M' : 'F',
          blood_type: bloodType
        };
        
        await authAPI.updatePersonalProfile(personalData);
        console.log('Personal profile saved successfully');
        
        // Upload profile picture if it's a local URI (starts with file:// or content://)
        if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://'))) {
          try {
            await authAPI.uploadProfilePicture(profileImage);
            console.log('Profile picture uploaded successfully');
          } catch (imageError) {
            console.log('Profile picture upload failed:', imageError.message);
            // Don't fail the entire save operation if image upload fails
          }
        }
        
        showSuccess("Success", "Profile updated successfully");
        
      } catch (apiError) {
        console.log('API save failed, but local save succeeded:', apiError.message);
        showSuccess("Success", "Profile updated locally. Changes will sync when API is available.");
      }
      
      router.back();
      
    } catch (error) {
      console.log("Error saving profile data:", error);
      showError("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      console.log('Gallery button pressed - requesting permissions...');
      console.log('ImagePicker object:', ImagePicker);
      console.log('ImagePicker.MediaType:', ImagePicker.MediaType);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log('Media library permission status:', status);

      if (status !== "granted") {
        showError(
          "Permission Denied",
          "We need camera roll permission to change your profile picture"
        );
        return;
      }

      console.log('Launching image picker...');

      // Launch image picker with defensive MediaType check
      const mediaType = ImagePicker.MediaType && ImagePicker.MediaType.Images 
        ? ImagePicker.MediaType.Images 
        : 'Images'; // Fallback for compatibility

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('Selected image URI:', selectedImageUri);
        setProfileImage(selectedImageUri);
        
        // Store the image URI immediately to fix AsyncStorage sync issues
        await AsyncStorage.setItem('profile_image_temp', selectedImageUri);
        showSuccess('Success', 'Profile image updated');
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      showError('Error', 'Failed to select image from gallery');
    }
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      console.log('Camera button pressed - requesting permissions...');
      
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      console.log('Camera permission status:', status);

      if (status !== "granted") {
        showError(
          "Permission Denied",
          "We need camera permission to take a profile picture"
        );
        return;
      }

      console.log('Launching camera...');

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        console.log('Captured image URI:', selectedImageUri);
        setProfileImage(selectedImageUri);
        
        // Store the image URI immediately to fix AsyncStorage sync issues
        await AsyncStorage.setItem('profile_image_temp', selectedImageUri);
        showSuccess('Success', 'Profile image captured');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showError('Error', 'Failed to take photo');
    }
  };

  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      "Profile Picture",
      "Choose how you'd like to update your profile picture",
      [
        {
          text: "Camera",
          onPress: takePhoto,
          style: "default"
        },
        {
          text: "Photo Library",
          onPress: pickImage,
          style: "default"
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Add platform-specific text styles where you have rendering issues
  const androidTextFix =
    Platform.OS === "android"
      ? {
          includeFontPadding: false,
          textAlignVertical: "center",
        }
      : {};

  // Enhanced dynamic styles with better color theming
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa', // Light gray background
    },
    header: {
      backgroundColor: '#ffffff', // White header
      borderBottomColor: '#e9ecef',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    title: {
      color: '#2D8B85', // Teal color for title
      fontSize: 20,
      fontWeight: '600',
    },
    inputContainer: {
      backgroundColor: '#ffffff', // White cards
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    inputLabel: {
      color: '#495057', // Dark gray for labels
      fontSize: 16,
      fontWeight: '500',
    },
    input: {
      color: '#212529', // Dark text
      backgroundColor: '#f8f9fa', // Light background for inputs
      borderColor: '#dee2e6',
      borderWidth: 1.5,
    },
    sectionTitle: {
      color: '#2D8B85', // Teal for section titles
      fontSize: 18,
      fontWeight: '600',
    },
    profileImagePlaceholder: {
      backgroundColor: '#e9ecef',
    },
    cameraButtonBackground: {
      backgroundColor: '#2D8B85', // Teal camera button
      shadowColor: '#2D8B85',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    saveButton: {
      backgroundColor: '#2D8B85', // Teal save button
      shadowColor: '#2D8B85',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
    cancelButton: {
      borderColor: '#6c757d',
      borderWidth: 1.5,
      backgroundColor: '#ffffff',
    },
    cancelButtonText: {
      color: '#6c757d',
      fontWeight: '500',
    },
    genderButtonActive: {
      backgroundColor: '#2D8B85',
      borderColor: '#2D8B85',
    },
    bloodTypeButton: {
      borderColor: '#dee2e6',
      backgroundColor: '#ffffff',
    },
    bloodTypeButtonActive: {
      backgroundColor: '#2D8B85',
      borderColor: '#2D8B85',
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D8B85" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D8B85" />
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
              <Ionicons name="person" size={60} color="#6c757d" />
            </View>
          )}
          <View
            style={[styles.cameraButton, dynamicStyles.cameraButtonBackground]}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        {/* Action buttons for image selection */}
        <View style={styles.imageActionButtons}>
          <TouchableOpacity 
            style={[styles.imageActionButton, { backgroundColor: '#2D8B85' }]}
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.imageActionText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.imageActionButton, { backgroundColor: '#2D8B85' }]}
            onPress={pickImage}
          >
            <Ionicons name="images" size={16} color="#fff" />
            <Text style={styles.imageActionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
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
            placeholderTextColor="#6c757d"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input, 
              dynamicStyles.input, 
              { backgroundColor: '#e9ecef', color: '#6c757d' }
            ]}
            value={email}
            placeholder="Email address"
            placeholderTextColor="#6c757d"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            selectTextOnFocus={false}
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
            Date of Birth
          </Text>
          <TouchableOpacity
            style={[
              styles.input, 
              dynamicStyles.input, 
              { 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingHorizontal: 12 
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: '#212529', fontSize: 16 }}>
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#2D8B85" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
            Age
          </Text>
          <TextInput
            style={[
              styles.input, 
              dynamicStyles.input, 
              { backgroundColor: '#e9ecef', color: '#6c757d' }
            ]}
            value={age}
            placeholder="Age is calculated from date of birth"
            placeholderTextColor="#6c757d"
            editable={false}
            selectTextOnFocus={false}
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
                gender === "Male" && dynamicStyles.genderButtonActive,
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
                gender === "Female" && dynamicStyles.genderButtonActive,
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
              style={[styles.selectText, { color: '#212529' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false} // Prevent text scaling issues
            >
              {bloodType}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
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
                  { backgroundColor: '#ffffff' },
                ]}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <Text style={[styles.pickerTitle, { color: '#2D8B85' }]}>
                  Select Blood Type
                </Text>
                <View style={styles.bloodTypeGrid}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.bloodTypeOption,
                          bloodType === type && dynamicStyles.bloodTypeButtonActive,
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
                    { borderColor: '#dee2e6' },
                  ]}
                  onPress={() => setBloodTypeModalVisible(false)}
                >
                  <Text
                    style={[styles.cancelButtonFullText, { color: '#6c757d' }]}
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
            placeholderTextColor="#6c757d"
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
            placeholderTextColor="#6c757d"
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
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Match the container background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2D8B85',
    fontWeight: '500',
  },
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
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  imageActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
    gap: 12, // Add gap between buttons
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  genderButtonActive: {
    borderWidth: 0,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
    textAlign: "center",
  },
});
