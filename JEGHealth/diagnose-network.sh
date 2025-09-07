#!/bin/bash

# Network Diagnostic Script for JEGHealth
echo "🔍 JEGHealth Network Diagnostics"
echo "================================="
echo ""

echo "📱 Current Network Configuration:"
echo "Metro Server IP: 192.168.1.50 (from logs)"
echo "Backend Config IP: 100.66.134.229"
echo "Backend Port: 8000"
echo ""

echo "🌐 Available Network Interfaces:"
ifconfig | grep -A 1 "flags=" | grep -E "(^[a-z]|inet )" | grep -v "127.0.0.1"
echo ""

echo "🔍 Active Network IPs:"
ifconfig | grep "inet " | grep -v "127.0.0.1"
echo ""

echo "🔌 Checking if port 8000 is in use:"
lsof -i :8000
echo ""

echo "🧪 Testing Backend Connectivity:"
echo "Testing 100.66.134.229:8000..."
curl -s --connect-timeout 5 http://100.66.134.229:8000/api/v1/auth/current-user/ && echo "✅ 100.66.134.229:8000 - Accessible" || echo "❌ 100.66.134.229:8000 - Not accessible"

echo "Testing 192.168.1.50:8000..."
curl -s --connect-timeout 5 http://192.168.1.50:8000/api/v1/auth/current-user/ && echo "✅ 192.168.1.50:8000 - Accessible" || echo "❌ 192.168.1.50:8000 - Not accessible"

echo "Testing localhost:8000..."
curl -s --connect-timeout 5 http://localhost:8000/api/v1/auth/current-user/ && echo "✅ localhost:8000 - Accessible" || echo "❌ localhost:8000 - Not accessible"
echo ""

echo "🔥 Firewall Status:"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
echo ""

echo "💡 Recommendations:"
echo "1. If 192.168.1.50:8000 works, update network config to use this IP"
echo "2. If none work, check if Django backend is running on 0.0.0.0:8000"  
echo "3. If firewall is on, add exception for port 8000"
echo "4. Ensure mobile device is on same network as your Mac"
