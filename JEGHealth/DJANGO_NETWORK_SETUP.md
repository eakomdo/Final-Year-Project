# Django Network Setup Instructions

## Problem
Your Django server is running on 127.0.0.1:8000 (localhost only), which means your physical iOS device can't connect to it.

## Solution
1. Stop your current Django server (Ctrl+C)
2. Restart it with network binding:

```bash
python manage.py runserver 0.0.0.0:8000
```

This will make your Django server accessible at:
- http://127.0.0.1:8000 (from your Mac)
- http://192.168.1.50:8000 (from your iOS device on the same network)

## Verify Connection
After restarting Django with 0.0.0.0:8000, test the connection:

```bash
curl http://192.168.1.50:8000/api/auth/test/
```

## Security Note
- Only use 0.0.0.0 in development
- Make sure you're on a trusted network
- For production, use proper host configuration

## Troubleshooting
If you get permission errors, you might need to:
1. Check Django's ALLOWED_HOSTS setting
2. Update firewall settings
3. Ensure you're on the same WiFi network
