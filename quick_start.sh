#!/bin/bash
# CGJBCSC - Quick Server Start
# Simple script to start both servers

echo "🚀 Starting CGJBCSC Sewa Portal..."
echo ""

# Start Django
echo "Starting Django backend..."
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver &
DJANGO_PID=$!
echo "✅ Django started (PID: $DJANGO_PID)"

# Wait a bit
sleep 3

# Start Vite
echo "Starting React frontend..."
cd /home/rohan/Desktop/projects/CGJBCSC/frontend
npm run dev &
VITE_PID=$!
echo "✅ Vite started (PID: $VITE_PID)"

echo ""
echo "✅ Servers running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "   Django PID: $DJANGO_PID"
echo "   Vite PID:   $VITE_PID"
echo ""
echo "Press Ctrl+C to stop monitoring (servers will continue)"
echo ""

# Keep script alive
wait
