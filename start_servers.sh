#!/bin/bash
# CGJBCSC Sewa Portal - Server Startup Script
# Usage: bash start_servers.sh

set -e

echo "======================================"
echo "CGJBCSC Sewa Portal - Starting Servers"
echo "======================================"

PROJECT_ROOT="/home/rohan/Desktop/projects/CGJBCSC"
VENV_PYTHON="$PROJECT_ROOT/sys/bin/python"

# Check if virtualenv exists
if [ ! -f "$VENV_PYTHON" ]; then
    echo "❌ Virtual environment not found at $VENV_PYTHON"
    exit 1
fi

# Check if Django is installed
$VENV_PYTHON -c "import django" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Django not installed in virtual environment"
    exit 1
fi

echo ""
echo "✅ Environment checks passed"
echo ""

# Function to check if port is in use
check_port() {
    PORT=$1
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Port $PORT is already in use"
        PID=$(lsof -ti:$PORT)
        echo "   Process PID: $PID"
        read -p "   Kill process and continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill -9 $PID
            sleep 1
            echo "   ✅ Process killed"
        else
            echo "   ❌ Cannot start on port $PORT - exiting"
            exit 1
        fi
    fi
}

# Check ports
echo "Checking ports..."
check_port 8000
check_port 5173

echo ""
echo "======================================"
echo "Starting Django Backend on port 8000"
echo "======================================"

cd "$PROJECT_ROOT/sewa_portal"
$VENV_PYTHON manage.py migrate --noinput 2>&1 | grep -v "No changes detected" || true
echo "Starting Django server in background..."
$VENV_PYTHON manage.py runserver > /tmp/django_server.log 2>&1 &
DJANGO_PID=$!
echo "✅ Django started (PID: $DJANGO_PID)"
echo "   Log: /tmp/django_server.log"

# Wait for Django to start
echo "Waiting for Django to initialize..."
for i in {1..10}; do
    if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
        echo "✅ Django is responding"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Django failed to start. Check logs:"
        tail -20 /tmp/django_server.log
        kill $DJANGO_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

echo ""
echo "======================================"
echo "Starting React Frontend on port 5173"
echo "======================================"

cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo "Starting Vite dev server in background..."
npm run dev > /tmp/vite_server.log 2>&1 &
VITE_PID=$!
echo "✅ Vite started (PID: $VITE_PID)"
echo "   Log: /tmp/vite_server.log"

# Wait for Vite to start
echo "Waiting for Vite to initialize..."
for i in {1..15}; do
    if curl -s http://localhost:5173/ > /dev/null 2>&1; then
        echo "✅ Vite is responding"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "⚠️  Vite may still be starting. Check logs:"
        tail -10 /tmp/vite_server.log
    fi
    sleep 1
done

echo ""
echo "======================================"
echo "✅ ALL SERVERS RUNNING!"
echo "======================================"
echo ""
echo "📡 Backend API:  http://localhost:8000"
echo "🌐 Frontend:     http://localhost:5173"
echo ""
echo "🔑 Test Credentials:"
echo "   User:  testuser / test123"
echo "   Admin: admin / admin123"
echo ""
echo "📋 Server PIDs:"
echo "   Django: $DJANGO_PID"
echo "   Vite:   $VITE_PID"
echo ""
echo "📝 Logs:"
echo "   Django: tail -f /tmp/django_server.log"
echo "   Vite:   tail -f /tmp/vite_server.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $DJANGO_PID $VITE_PID"
echo "   Or: pkill -f 'manage.py runserver' && pkill -f 'vite'"
echo ""
echo "======================================"
echo "Press Ctrl+C to view logs (servers will continue running)"
echo "======================================"

# Optional: Follow Django logs
trap 'echo ""; echo "Servers still running in background"; exit 0' INT
tail -f /tmp/django_server.log
