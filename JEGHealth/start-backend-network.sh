#!/bin/bash

# Get the current machine's IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "Starting Django server on network IP: $IP:8000"
echo "This will allow your physical iOS device to connect"
echo "Make sure your device is on the same WiFi network"
echo ""

# Navigate to your Django project directory (adjust this path if needed)
cd ../backend || cd ../django-backend || cd ../server || {
    echo "Error: Could not find Django backend directory"
    echo "Please run this script from your Django project directory or update the path"
    exit 1
}

# Start Django server on all interfaces
python manage.py runserver 0.0.0.0:8000
