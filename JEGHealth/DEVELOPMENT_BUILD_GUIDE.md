# 🚀 Expo Notifications & Development Build Setup Guide

## Current Status: Expo Go Limitations

Your app is currently running in **Expo Go** which has the following limitations:

### ❌ Limitations in Expo Go:
- **Push notifications**: Limited functionality, no background notifications
- **Bluetooth**: Mock mode only (cannot connect to real devices)
- **Background tasks**: Limited or disabled
- **Native modules**: Restricted access

### ✅ Available in Expo Go:
- **Local notifications**: Work when app is open
- **Basic app functionality**: All UI and core features
- **Development and testing**: Perfect for development workflow

## 🎯 Solution: Create a Development Build

A development build gives you full native functionality while keeping the developer experience.

### Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure Build

```bash
cd /path/to/your/JEGHealth/project
eas build:configure
```

This creates `eas.json` with build profiles:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4: Build Development Version

**For Android:**
```bash
eas build --platform android --profile development
```

**For iOS:**
```bash
eas build --platform ios --profile development
```

### Step 5: Install Development Build

**Android:**
```bash
# Download and install the APK from EAS dashboard
# OR use EAS CLI to install directly
eas build:run -p android
```

**iOS:**
```bash
# For physical device, add UDID to Apple Developer account
# Then build and install via TestFlight or direct install
eas device:create
eas build --platform ios --profile development
```

### Step 6: Start Development Server

```bash
npx expo start --dev-client
```

## 📱 Enhanced Notification Features in Development Build

Once you have a development build, you'll unlock:

### 🔔 Push Notifications
- Full background notification support
- Rich notifications with images and actions
- Custom notification sounds
- Notification categories and grouping

### 📊 Advanced Features
- Real Bluetooth device connections
- Background health monitoring
- Scheduled medication reminders that work when app is closed
- Location-based health reminders

## 🧪 Testing Current Implementation

### In Expo Go (Current):
1. **Test Local Notifications**: Use the NotificationTester component
2. **Mock BLE**: All Bluetooth features work in simulation mode
3. **Basic Reminders**: Local notifications when app is active

### Commands to Test:
```bash
# Clear cache and restart
npx expo start --clear

# Test notifications
# Use the "Notification Tester" in your home screen

# Check logs for BLE and notification status
# Look for "Development Mode" logs
```

## 🔧 Configuration for Production

### Update app.json/app.config.js:

```javascript
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#ffffff"
    }
  }
}
```

### Add Notification Permissions:

**Android (app.json):**
```json
{
  "android": {
    "permissions": [
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "WAKE_LOCK"
    ]
  }
}
```

**iOS (app.json):**
```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]
    }
  }
}
```

## 📋 Migration Checklist

- [ ] Install EAS CLI
- [ ] Configure build profiles
- [ ] Create development build
- [ ] Test push notifications
- [ ] Test BLE connectivity
- [ ] Verify health reminders work in background
- [ ] Test appointment notifications
- [ ] Configure production push notification service

## 🚨 Quick Development Testing

While setting up the development build, you can test the current implementation:

```bash
# 1. Clear cache and restart
npx expo start --clear

# 2. Test notification system
# - Open app and use NotificationTester
# - Check console for "Notification Service" logs
# - Test medication reminders
# - Test health recommendations

# 3. Monitor logs
# Look for:
# - "📱 NotificationService: Expo Go mode"
# - "🔵 BLE: Using mock mode"
# - "🎯 Generated X health recommendations"
```

## 💡 Benefits of Development Build

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Local Notifications | ✅ (limited) | ✅ (full) |
| Push Notifications | ❌ | ✅ |
| Background Notifications | ❌ | ✅ |
| Bluetooth | Mock only | ✅ Real devices |
| Rich Notifications | ❌ | ✅ |
| Custom Sounds | ❌ | ✅ |
| Background Tasks | ❌ | ✅ |

## 🔗 Useful Links

- [Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)

## 🎯 Next Steps

1. **Immediate**: Continue testing in Expo Go with current implementation
2. **Short-term**: Create development build for full functionality  
3. **Long-term**: Deploy to app stores with production configuration

The current implementation is designed to work well in both Expo Go (limited) and development builds (full functionality), so you can continue development and testing while preparing the enhanced build environment.
