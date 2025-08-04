#!/bin/bash

echo "🔍 JEGHealth Network Diagnostics"
echo "================================"

# Get current machine IP
MACHINE_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📍 Machine IP: $MACHINE_IP"

# Test Django server on different interfaces
echo ""
echo "🔗 Testing Django server connectivity..."

# Test localhost
echo "Testing localhost:8000..."
curl -s -o /dev/null -w "Localhost:8000 - HTTP Status: %{http_code}\n" http://localhost:8000/api/v1/health/ 2>/dev/null || echo "Localhost:8000 - Connection failed"

# Test machine IP
echo "Testing $MACHINE_IP:8000..."
curl -s -o /dev/null -w "$MACHINE_IP:8000 - HTTP Status: %{http_code}\n" http://$MACHINE_IP:8000/api/v1/health/ 2>/dev/null || echo "$MACHINE_IP:8000 - Connection failed"

# Test if Django server is running at all
echo ""
echo "🔍 Checking if Django process is running..."
ps aux | grep "python.*manage.py runserver" | grep -v grep || echo "No Django runserver process found"

# Show listening ports
echo ""
echo "🔍 Checking listening ports on 8000..."
lsof -i :8000 2>/dev/null || echo "No process listening on port 8000"

echo ""
echo "💡 Recommendations:"
echo "1. Make sure Django server is running with: python manage.py runserver 0.0.0.0:8000"
echo "2. Check Django ALLOWED_HOSTS includes '$MACHINE_IP'"
echo "3. Verify firewall allows connections on port 8000"
echo "4. Update JEGHealth app to use IP: $MACHINE_IP"
