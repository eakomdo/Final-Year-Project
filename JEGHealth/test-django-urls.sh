#!/bin/bash

echo "🔍 Django URL Structure Test"
echo "============================="
echo

MACHINE_IP="192.168.1.50"
BASE_URL="http://$MACHINE_IP:8000"

echo "Testing common Django URL patterns..."
echo

# Test root URLs
echo "1. Testing root endpoints:"
URLS=(
    "/"
    "/admin/"
    "/api/"
    "/auth/"
)

for url in "${URLS[@]}"; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url" 2>/dev/null)
    echo "   $url → Status: $STATUS_CODE"
done

echo
echo "2. Testing auth URL patterns:"

# Test various auth URL patterns
AUTH_PATTERNS=(
    "/api/auth/"
    "/api/v1/auth/"
    "/auth/"
    "/accounts/"
    "/api/accounts/"
    "/users/"
    "/api/users/"
)

for pattern in "${AUTH_PATTERNS[@]}"; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$pattern" 2>/dev/null)
    echo "   $pattern → Status: $STATUS_CODE"
done

echo
echo "3. Testing specific login endpoints:"

LOGIN_PATTERNS=(
    "/api/auth/login/"
    "/api/v1/auth/login/"
    "/auth/login/"
    "/accounts/login/"
    "/api/accounts/login/"
    "/users/login/"
    "/api/users/login/"
    "/login/"
    "/api/login/"
)

for pattern in "${LOGIN_PATTERNS[@]}"; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$pattern" 2>/dev/null)
    echo "   $pattern → Status: $STATUS_CODE"
done

echo
echo "4. Getting Django's available URLs (if debug mode is on):"
RESPONSE=$(curl -s "$BASE_URL" 2>/dev/null)
if echo "$RESPONSE" | grep -q "DisallowedHost\|not allowed"; then
    echo "   ⚠️  Django ALLOWED_HOSTS issue detected"
    echo "   Add your IP to ALLOWED_HOSTS in Django settings"
elif echo "$RESPONSE" | grep -q "URLconf\|urls"; then
    echo "   📋 Django debug page found - check browser for URL patterns"
else
    echo "   ✅ Django is responding"
fi
