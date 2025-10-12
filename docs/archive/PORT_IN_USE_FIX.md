# 🔧 Port Already in Use - Quick Fix

## The Error

```bash
python3 manage.py runserver
Error: That port is already in use.
```

## ✅ Quick Solutions

### Solution 1: Kill the Process (Recommended)

```bash
# Kill all Django processes
pkill -9 -f "manage.py runserver"

# Wait a moment
sleep 2

# Now start fresh
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver
```

### Solution 2: Use a Different Port

```bash
# Start Django on port 8001 instead
python3 manage.py runserver 8001
```

Then update frontend `.env`:
```
VITE_API_URL=http://localhost:8001
```

### Solution 3: Find and Kill Specific Process

```bash
# Find what's using port 8000
lsof -ti:8000

# Kill that specific process (replace PID with the number from above)
kill -9 <PID>

# Example: kill -9 54185
```

## 🚀 Automated Solution

I've created a server management script for you!

### Using the Script

```bash
cd /home/rohan/Desktop/projects/CGJBCSC

# Start both servers (kills old ones first)
./manage_servers.sh start

# Check status
./manage_servers.sh status

# Stop all servers
./manage_servers.sh stop

# Restart servers
./manage_servers.sh restart

# Restart only Django
./manage_servers.sh django

# Restart only Frontend
./manage_servers.sh frontend
```

## 📝 Manual Step-by-Step

### 1. Stop Old Server

```bash
# Find the process
ps aux | grep "manage.py runserver"

# You'll see something like:
# rohan  54185  1.7  0.7  ... python manage.py runserver

# Kill it (use the PID number)
kill -9 54185

# Or kill all Django processes at once
pkill -9 -f "manage.py runserver"
```

### 2. Verify Port is Free

```bash
lsof -ti:8000
```

If this returns nothing, port is free! ✅

### 3. Start Server

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver
```

## 🎯 Current Status

Run this to check:

```bash
# Check if Django is running
lsof -ti:8000 && echo "Django is running" || echo "Django is not running"

# Check if Frontend is running
lsof -ti:5173 && echo "Frontend is running" || echo "Frontend is not running"

# See all processes
ps aux | grep -E "manage.py|vite" | grep -v grep
```

## 💡 Pro Tips

### Running in Background

```bash
# Start Django in background
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver > /tmp/django.log 2>&1 &

# Check logs anytime
tail -f /tmp/django.log

# Stop it later
pkill -f "manage.py runserver"
```

### Using Screen (Keeps running after terminal closes)

```bash
# Install screen if needed
sudo apt install screen

# Start Django in screen
screen -S django
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver

# Detach: Press Ctrl+A then D

# Reattach later
screen -r django

# List all screens
screen -ls
```

## 🐛 Troubleshooting

### Port still shows as in use after killing

```bash
# Force kill everything on port 8000
kill -9 $(lsof -ti:8000)

# Wait and check
sleep 2
lsof -ti:8000
```

### Can't find the process

```bash
# This will show EVERYTHING related to Django
ps aux | grep python | grep manage.py

# Or check all ports in use
lsof -i :8000
lsof -i :5173
```

### Multiple servers running

```bash
# Kill ALL Python processes (BE CAREFUL!)
# pkill -9 python3  # DON'T do this if you have other Python apps

# Better: Kill only Django
pkill -9 -f "manage.py runserver"

# Kill only Vite
pkill -9 -f "vite"
```

## ✅ Recommended Workflow

**Every time you want to start the servers:**

```bash
cd /home/rohan/Desktop/projects/CGJBCSC

# Use the management script
./manage_servers.sh start
```

This will:
1. ✅ Kill old processes
2. ✅ Start Django on port 8000
3. ✅ Start Vite on port 5173
4. ✅ Show status
5. ✅ Display URLs

**When done working:**

```bash
./manage_servers.sh stop
```

## 📋 Quick Reference

| Problem | Solution |
|---------|----------|
| Port 8000 in use | `pkill -9 -f "manage.py runserver"` |
| Port 5173 in use | `pkill -9 -f "vite"` |
| Can't find process | `lsof -ti:8000` or `ps aux \| grep manage.py` |
| Start servers | `./manage_servers.sh start` |
| Check status | `./manage_servers.sh status` |
| Stop servers | `./manage_servers.sh stop` |

---

**Created**: October 12, 2025  
**File**: `manage_servers.sh` (automated solution)  
**Status**: ✅ Ready to use
