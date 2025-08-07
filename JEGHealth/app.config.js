// app.config.js - Expo configuration file
export default {
  expo: {
    scheme: "jeghealth",
    name: "JEGHealth",
    slug: "JEGHealth",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2D8B85",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jeghealth.app",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          "This app uses Bluetooth to connect to health monitoring devices",
        NSCameraUsageDescription:
          "This app uses the camera to take profile pictures and medical document photos",
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to select profile pictures and medical documents",
        NSMicrophoneUsageDescription:
          "This app may use the microphone for voice notes or health consultations",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.jeghealth.app",
      permissions: [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: "This app needs access to your photo library to select profile pictures and medical documents",
          cameraPermission: "This app uses the camera to take profile pictures and medical document photos"
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-web-browser",
      [
        "expo-build-properties",
        {
          android: {},
          ios: {},
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      enableMockDevices: true,
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
