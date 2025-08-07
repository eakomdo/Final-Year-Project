#!/bin/bash

# Django Backend Start Script for JEGHealth
# This script helps ensure the Django backend is running with the correct configuration

echo "🚀 Starting JEGHealth Django Backend..."

# Check if we're in the correct directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Please run this script from your Django project directory."
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Warning: No virtual environment detected. Make sure you have activated your Python virtual environment."
    echo "   Example: source venv/bin/activate"
fi

# Check if required packages are installed
echo "📦 Checking Django installation..."
python -c "import django; print(f'Django version: {django.get_version()}')" 2>/dev/null || {
    echo "❌ Django not found. Please install requirements:"
    echo "   pip install django djangorestframework django-cors-headers"
    exit 1
}

# Run Django migrations
echo "📊 Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create superuser if needed (optional)
echo "👤 Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin / admin123')
else:
    print('Superuser already exists')
" 2>/dev/null

# Start the Django development server
echo "🌐 Starting Django development server..."
echo "📱 Mobile app will connect to: http://localhost:8000"
echo "🌍 API will be available at: http://localhost:8000/api/v1/"
echo "🔧 Admin panel available at: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start server on all interfaces so mobile devices can connect
python manage.py runserver 0.0.0.0:8000
