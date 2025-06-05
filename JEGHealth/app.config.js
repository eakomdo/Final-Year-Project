// app.config.js - Expo configuration file
export default {
  expo: {
    scheme: "jeghealth",
    name: "JEGHealth",
    slug: "jeg-health",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/app-icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jeghealth.app",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          "This app uses Bluetooth to connect to health monitoring devices",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/app-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.jeghealth.app",
      permissions: [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {},
          ios: {},
        },
      ],
    ],
    extra: {
      enableMockDevices: true,
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
