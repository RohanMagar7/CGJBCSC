#!/bin/bash
# Quick Start Script for Sewa Portal Project

echo "========================================="
echo "Sewa Portal - Quick Start"
echo "========================================="

# Activate virtual environment
echo "Activating virtual environment..."
source /home/rohan/Desktop/projects/CGJBCSC/sys/bin/activate

# Navigate to project directory
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal

# Run system check
echo ""
echo "Running system check..."
python manage.py check

# Show migration status
echo ""
echo "Migration status:"
python manage.py showmigrations core

# Start server
echo ""
echo "========================================="
echo "Starting Django development server..."
echo "API available at: http://localhost:8000/api/"
echo "Admin panel at: http://localhost:8000/admin/"
echo "Press CTRL+C to stop the server"
echo "========================================="
echo ""

python manage.py runserver 0.0.0.0:8000
