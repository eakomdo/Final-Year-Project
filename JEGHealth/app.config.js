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
