# Backend Network Access Instructions

## Problem
The Django backend is running on `127.0.0.1:8000` (localhost only) but the React Native app needs to access it from the network IP `100.66.134.229:8000`.

## Solution
Stop the current backend server and restart it with network access.

## Steps:

### 1. Stop Current Backend
In your backend terminal, press `Ctrl+C` to stop the current server.

### 2. Start Backend with Network Access
Instead of running:
```bash
python manage.py runserver
```

Run ONE of these options:

**Option A: Use the provided script**
```bash
# From the JEGHealth directory
./start-backend-network.sh
```

**Option B: Manual command**
```bash
# Navigate to your backend directory
cd /Users/phill/Desktop/jeghealth-backend

# Activate virtual environment
source .venv/bin/activate

# Start server on all network interfaces
python manage.py runserver 0.0.0.0:8000
```

### 3. Verify Network Access
After starting the server, you should see:
```
Starting development server at http://0.0.0.0:8000/
```

This means the server is accessible from:
- `http://127.0.0.1:8000/` (local)
- `http://100.66.134.229:8000/` (network)

### 4. Test the Connection
Once the backend is running on `0.0.0.0:8000`, your React Native app should be able to connect to `http://100.66.134.229:8000/`.

## Important Notes:
- The backend MUST run on `0.0.0.0:8000` for network access
- Both your computer and mobile device must be on the same network
- Make sure no firewall is blocking port 8000

## Current Network Configuration:
- Network IP: `100.66.134.229`
- Port: `8000`
- Full URL: `http://100.66.134.229:8000/`
