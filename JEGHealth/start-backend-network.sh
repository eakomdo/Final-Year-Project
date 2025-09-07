#!/bin/bash

# Django Backend Network Start Script for JEGHealth
# This script starts the Django backend on the network IP address for mobile device access

echo "🌐 Starting JEGHealth Django Backend for Network Access..."

# Get the current network IP
NETWORK_IP="100.66.134.229"
PORT="8000"

echo "📱 Network IP: $NETWORK_IP"
echo "🔌 Port: $PORT"
echo "🌐 Backend will be accessible at: http://$NETWORK_IP:$PORT/"

# Check if we're in the correct directory structure
BACKEND_DIR="../jeghealth-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Error: Django backend directory not found at $BACKEND_DIR"
    echo "   Please ensure the Django backend is in the correct location."
    exit 1
fi

cd "$BACKEND_DIR"

# Check if manage.py exists
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found in $BACKEND_DIR"
    echo "   Please ensure you're in the correct Django project directory."
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Warning: No virtual environment detected."
    echo "   Activate your Python virtual environment first:"
    echo "   source venv/bin/activate  # or your specific venv path"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 Starting Django development server..."
echo "   Available on network at: http://$NETWORK_IP:$PORT/"
echo "   Also available locally at: http://127.0.0.1:$PORT/"
echo ""
echo "📱 Make sure your mobile device is on the same network!"
echo "🔥 Press Ctrl+C to stop the server"
echo ""

# Start the Django server on all interfaces
python manage.py runserver 0.0.0.0:$PORT