# Network Connectivity Troubleshooting Guide

## Current Status:
- ✅ Backend running on: `http://0.0.0.0:8000` (accessible from network)
- ✅ App configured to use: `http://100.66.134.229:8000`
- ❌ Still getting timeout errors
- ⚠️  Metro running on: `exp://192.168.1.50:8081` (different IP)

## Possible Issues:

### 1. **Network IP Mismatch**
Your Metro server is on `192.168.1.50` but backend config uses `100.66.134.229`. This suggests you might have multiple network interfaces.

### 2. **Firewall/Port Blocking**
macOS firewall might be blocking incoming connections to port 8000.

### 3. **Network Interface Issues**
Your Mac might have switched network interfaces.

## Troubleshooting Steps:

### Step 1: Verify Your Current IP
```bash
# Check all network interfaces
ifconfig | grep "inet " | grep -v 127.0.0.1

# Check which IP your Mac is actually using
ifconfig en0 | grep "inet "
ifconfig en1 | grep "inet "
```

### Step 2: Test Backend Accessibility
```bash
# From your Mac, test if backend is accessible
curl http://100.66.134.229:8000/api/v1/auth/current-user/

# Also test with the Metro IP
curl http://192.168.1.50:8000/api/v1/auth/current-user/
```

### Step 3: Check Firewall Settings
```bash
# Check if firewall is blocking port 8000
sudo lsof -i :8000

# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

### Step 4: Update Network Config
If `192.168.1.50` is the correct IP, update the network configuration.

## Quick Fix Options:

### Option A: Use Metro's IP (if that's the correct one)
Update network config to use `192.168.1.50` instead of `100.66.134.229`

### Option B: Restart with Correct IP
1. Stop backend and Metro
2. Verify your correct IP with `ifconfig`
3. Update network config with correct IP
4. Restart both backend and Metro

### Option C: Test with Both IPs
Try running backend on both IPs to see which one works:
```bash
# Terminal 1: Backend on Metro's IP
python manage.py runserver 192.168.1.50:8000

# Terminal 2: Backend on current config IP  
python manage.py runserver 100.66.134.229:8000
```
