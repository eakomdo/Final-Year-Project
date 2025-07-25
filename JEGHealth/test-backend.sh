#!/bin/bash

# Django Backend Test Script
# Run this script to verify your Django backend is ready

echo "🔍 Testing Django Backend Connection..."
echo "=================================="

# Test if Django server is running
DJANGO_URL="http://192.168.137.224:8000"

echo "1. Testing if Django server is accessible..."
if curl -s --connect-timeout 5 "$DJANGO_URL" > /dev/null; then
    echo "✅ Django server is running at $DJANGO_URL"
else
    echo "❌ Django server is NOT accessible at $DJANGO_URL"
    echo "   Please start your Django server with: python manage.py runserver 0.0.0.0:8000"
    exit 1
fi

echo ""
echo "2. Testing API endpoints..."

# Test health endpoint (if you have one)
echo "   Testing health endpoint..."
if curl -s --connect-timeout 5 "$DJANGO_URL/api/v1/health/" > /dev/null; then
    echo "   ✅ Health endpoint accessible"
else
    echo "   ⚠️  Health endpoint not found (this is optional)"
fi

# Test auth endpoints
echo "   Testing auth endpoints..."
AUTH_RESPONSE=$(curl -s -w "%{http_code}" --connect-timeout 5 "$DJANGO_URL/api/v1/auth/login/" -o /dev/null)
if [ "$AUTH_RESPONSE" = "405" ] || [ "$AUTH_RESPONSE" = "200" ]; then
    echo "   ✅ Auth endpoints accessible"
else
    echo "   ❌ Auth endpoints not accessible (Status: $AUTH_RESPONSE)"
fi

echo ""
echo "3. Network Configuration Check..."
echo "   Your IP: $(hostname -I | awk '{print $1}')"
echo "   Configured IP in app: 192.168.137.224"
echo "   ⚠️  Make sure these IPs match!"

echo ""
echo "4. CORS Check..."
echo "   Make sure your Django settings.py includes:"
echo "   CORS_ALLOWED_ORIGINS = ['http://localhost:8081', 'http://192.168.137.224:8081']"

echo ""
echo "5. Firewall Check..."
echo "   Make sure port 8000 is open in your firewall"

echo ""
echo "=================================="
echo "Backend test complete!"
echo "If all checks pass, your React Native app should be able to connect."
