#!/bin/bash

echo "🔍 Django Server Connectivity Test"
echo "=================================="
echo

# Test 1: Check if Django server is running on localhost
echo "1. Testing Django server on localhost..."
if curl -s -I http://127.0.0.1:8000/ > /dev/null 2>&1; then
    echo "✅ Django server is running on http://127.0.0.1:8000/"
else
    echo "❌ Django server is NOT accessible on http://127.0.0.1:8000/"
    echo "   → Please make sure your Django server is running"
    echo "   → Run: python manage.py runserver"
    exit 1
fi

# Test 2: Check if Django server is accessible from network IP
echo
echo "2. Testing Django server on network IP..."
MACHINE_IP="192.168.1.50"
if curl -s -I http://$MACHINE_IP:8000/ > /dev/null 2>&1; then
    echo "✅ Django server is accessible on http://$MACHINE_IP:8000/"
else
    echo "❌ Django server is NOT accessible on http://$MACHINE_IP:8000/"
    echo "   → Your Django server is only running on localhost"
    echo "   → Stop your current server (Ctrl+C) and restart with:"
    echo "   → python manage.py runserver 0.0.0.0:8000"
    echo
    echo "🛠️  Quick Fix:"
    echo "   1. Stop Django server (Ctrl+C)"
    echo "   2. Run: python manage.py runserver 0.0.0.0:8000"
    echo "   3. Test again with this script"
    exit 1
fi

# Test 3: Check Django auth endpoints
echo
echo "3. Testing Django authentication endpoints..."

AUTH_ENDPOINTS=("/api/auth/login/" "/api/auth/register/" "/auth/login/" "/auth/register/")

for endpoint in "${AUTH_ENDPOINTS[@]}"; do
    echo -n "   Testing $endpoint... "
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$MACHINE_IP:8000$endpoint 2>/dev/null)
    
    if [ "$STATUS_CODE" = "000" ]; then
        echo "❌ Connection failed"
    elif [ "$STATUS_CODE" = "200" ] || [ "$STATUS_CODE" = "405" ] || [ "$STATUS_CODE" = "400" ]; then
        echo "✅ Accessible (Status: $STATUS_CODE)"
    else
        echo "⚠️  Status: $STATUS_CODE"
    fi
done

# Test 4: Test with sample login data
echo
echo "4. Testing login with sample data..."
LOGIN_RESPONSE=$(curl -s -X POST http://$MACHINE_IP:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "error\|detail\|non_field_errors"; then
    echo "✅ Login endpoint is working (returned expected error for invalid credentials)"
elif echo "$LOGIN_RESPONSE" | grep -q "access\|token"; then
    echo "✅ Login endpoint is working (returned success response)"
else
    echo "⚠️  Login endpoint response: $LOGIN_RESPONSE"
fi

echo
echo "🎉 Network connectivity test completed!"
echo
echo "📱 Next steps for your iOS device:"
echo "   1. Make sure your iOS device is on the same WiFi network"
echo "   2. Your app should connect to: http://$MACHINE_IP:8000"
echo "   3. If issues persist, check Django's ALLOWED_HOSTS setting"
