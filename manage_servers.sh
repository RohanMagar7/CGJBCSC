#!/bin/bash
# Quick Server Management Script

echo "🔧 Sewa Portal Server Manager"
echo "=============================="
echo ""

# Function to kill Django processes
kill_django() {
    echo "🧹 Stopping any running Django servers..."
    pkill -9 -f "manage.py runserver" 2>/dev/null
    sleep 2
    
    if lsof -ti:8000 > /dev/null 2>&1; then
        echo "⚠️  Port 8000 still in use, force killing..."
        kill -9 $(lsof -ti:8000) 2>/dev/null
        sleep 1
    fi
    
    echo "✅ All Django processes stopped"
}

# Function to kill Vite processes
kill_vite() {
    echo "🧹 Stopping any running Vite servers..."
    pkill -9 -f "vite" 2>/dev/null
    sleep 1
    echo "✅ All Vite processes stopped"
}

# Function to start Django
start_django() {
    echo ""
    echo "🚀 Starting Django Backend..."
    cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
    python3 manage.py runserver &
    DJANGO_PID=$!
    sleep 3
    
    if lsof -ti:8000 > /dev/null 2>&1; then
        echo "✅ Django running on http://localhost:8000 (PID: $DJANGO_PID)"
    else
        echo "❌ Django failed to start"
    fi
}

# Function to start Vite
start_vite() {
    echo ""
    echo "🚀 Starting Vite Frontend..."
    cd /home/rohan/Desktop/projects/CGJBCSC/frontend
    npm run dev > /tmp/vite.log 2>&1 &
    VITE_PID=$!
    sleep 3
    
    if lsof -ti:5173 > /dev/null 2>&1; then
        echo "✅ Vite running on http://localhost:5173 (PID: $VITE_PID)"
    else
        echo "❌ Vite failed to start"
        echo "Check logs: tail /tmp/vite.log"
    fi
}

# Function to check status
check_status() {
    echo ""
    echo "📊 Server Status"
    echo "================"
    
    if lsof -ti:8000 > /dev/null 2>&1; then
        echo "✅ Django Backend: RUNNING on port 8000"
    else
        echo "❌ Django Backend: NOT RUNNING"
    fi
    
    if lsof -ti:5173 > /dev/null 2>&1; then
        echo "✅ Vite Frontend: RUNNING on port 5173"
    elif lsof -ti:5174 > /dev/null 2>&1; then
        echo "✅ Vite Frontend: RUNNING on port 5174"
    else
        echo "❌ Vite Frontend: NOT RUNNING"
    fi
}

# Main menu
case "${1:-help}" in
    stop)
        kill_django
        kill_vite
        echo ""
        check_status
        ;;
    
    start)
        kill_django
        kill_vite
        start_django
        start_vite
        check_status
        echo ""
        echo "🎉 All servers started!"
        echo ""
        echo "📝 Access your app:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend:  http://localhost:8000"
        echo ""
        echo "📊 To check status: ./manage_servers.sh status"
        echo "🛑 To stop servers: ./manage_servers.sh stop"
        ;;
    
    restart)
        echo "🔄 Restarting servers..."
        kill_django
        kill_vite
        sleep 2
        start_django
        start_vite
        check_status
        ;;
    
    status)
        check_status
        echo ""
        echo "Process details:"
        ps aux | grep -E "manage.py runserver|vite" | grep -v grep
        ;;
    
    django)
        kill_django
        start_django
        ;;
    
    frontend)
        kill_vite
        start_vite
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|django|frontend}"
        echo ""
        echo "Commands:"
        echo "  start    - Start both Django and Vite servers"
        echo "  stop     - Stop all servers"
        echo "  restart  - Restart both servers"
        echo "  status   - Check server status"
        echo "  django   - Restart only Django backend"
        echo "  frontend - Restart only Vite frontend"
        echo ""
        echo "Examples:"
        echo "  ./manage_servers.sh start"
        echo "  ./manage_servers.sh stop"
        echo "  ./manage_servers.sh status"
        ;;
esac
