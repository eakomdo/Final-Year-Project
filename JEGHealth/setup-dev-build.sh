#!/bin/bash

# 🚀 JEGHealth - Development Build Setup Script
# This script helps set up a development build with full notification support

echo "🏥 JEGHealth Development Build Setup"
echo "===================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/eas-cli
else
    echo "✅ EAS CLI is already installed"
fi

# Login to Expo (if not already logged in)
echo "🔑 Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "Please log in to your Expo account:"
    eas login
else
    echo "✅ Already logged in to Expo"
fi

# Configure EAS Build
echo "⚙️  Configuring EAS build..."
if [ ! -f "eas.json" ]; then
    eas build:configure
    echo "✅ EAS configuration created"
else
    echo "ℹ️  EAS configuration already exists"
fi

# Create notification-specific configuration
echo "🔔 Setting up notification configuration..."

# Update app.config.js for notifications
cat > app.config.js << 'EOF'
export default {
  expo: {
    name: "JEGHealth",
    slug: "jeghealth",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jeghealth.app",
      infoPlist: {
        UIBackgroundModes: ["remote-notification"]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.jeghealth.app",
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "ACCESS_NOTIFICATION_POLICY"
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#007AFF",
          sounds: []
        }
      ]
    ],
    notification: {
      icon: "./assets/notification-icon.png",
      color: "#007AFF"
    },
    scheme: "jeghealth",
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    }
  }
};
EOF

echo "✅ app.config.js updated with notification support"

# Create notification assets if they don't exist
echo "🎨 Creating notification assets..."
if [ ! -f "assets/notification-icon.png" ]; then
    echo "⚠️  Please add a notification-icon.png file to the assets folder"
    echo "   Recommended size: 256x256px, transparent background"
fi

# Build development version
echo "🔨 Building development version..."
echo "Choose your platform:"
echo "1) Android"
echo "2) iOS"
echo "3) Both"
read -p "Enter your choice (1-3): " platform_choice

case $platform_choice in
    1)
        echo "🤖 Building Android development build..."
        eas build --platform android --profile development
        ;;
    2)
        echo "🍎 Building iOS development build..."
        echo "Note: iOS requires device registration for development builds"
        echo "Run 'eas device:create' first if needed"
        eas build --platform ios --profile development
        ;;
    3)
        echo "📱 Building for both platforms..."
        eas build --platform all --profile development
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Build setup complete!"
echo ""
echo "Next steps:"
echo "1. Wait for the build to complete (check EAS dashboard)"
echo "2. Download and install the development build on your device"
echo "3. Start the dev server: npx expo start --dev-client"
echo "4. Test full notification functionality!"
echo ""
echo "📋 Features unlocked in development build:"
echo "   ✅ Push notifications"
echo "   ✅ Background notifications"
echo "   ✅ Rich notifications"
echo "   ✅ Real Bluetooth connectivity"
echo "   ✅ Background health monitoring"
echo ""
echo "🔗 Useful commands:"
echo "   View builds: eas build:list"
echo "   Install build: eas build:run -p android"
echo "   Start dev client: npx expo start --dev-client"
