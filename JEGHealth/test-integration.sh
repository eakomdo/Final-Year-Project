#!/bin/bash

# React Native + Django Integration Test Script
# This script helps you quickly test your app integration

echo "🚀 React Native + Django Integration Test"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from your React Native project root."
    exit 1
fi

print_status "Found React Native project"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_status "Dependencies already installed"
fi

# Check for required Django integration files
echo ""
echo "📁 Checking Django integration files..."

files_to_check=(
    "api/config.js"
    "api/services.js"
    "lib/djangoAuth.js"
    "lib/djangoDatabase.js"
    "lib/networkConfig.js"
    "components/DjangoConnectionTest.jsx"
    "app/test-django.jsx"
)

all_files_exist=true

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file missing"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required Django integration files are missing!"
    echo "Please ensure all Django integration files are properly created."
    exit 1
fi

echo ""
echo "🔧 Configuration Check..."

# Check network configuration
if grep -q "your-django-backend-url" lib/networkConfig.js; then
    print_warning "Backend URL not configured! Please update lib/networkConfig.js with your Django backend URL."
    echo "Example: http://localhost:8000 or http://192.168.1.100:8000"
else
    print_status "Backend URL appears to be configured"
fi

# Test backend connectivity (if test script exists)
echo ""
echo "🌐 Testing Backend Connectivity..."

if [ -f "test-backend.sh" ]; then
    chmod +x test-backend.sh
    ./test-backend.sh
else
    print_warning "Backend test script not found. Manual backend testing required."
fi

echo ""
echo "📱 Starting React Native Development Server..."

# Check if Expo CLI is available
if command -v npx expo &> /dev/null; then
    print_status "Expo CLI found"
    
    echo ""
    echo "🎯 Testing Instructions:"
    echo "1. After the app loads, look for the 'Test Django' button on the home screen"
    echo "2. Or manually navigate to /test-django in your app"
    echo "3. The test screen will show connection status and API test results"
    echo "4. Test authentication by signing up/logging in"
    echo "5. Check other screens to verify data loading"
    
    echo ""
    print_info "Starting Expo development server..."
    print_info "Choose your platform:"
    print_info "  - Press 'i' for iOS simulator"
    print_info "  - Press 'a' for Android emulator"
    print_info "  - Scan QR code with Expo Go app"
    
    echo ""
    echo "Press Ctrl+C to stop the server when done testing."
    echo ""
    
    # Start the Expo server
    npx expo start
    
else
    print_error "Expo CLI not found. Please install Expo CLI:"
    echo "npm install -g @expo/cli"
    exit 1
fi
