#!/bin/bash

# Navigate to sewa_portal directory
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal

echo "========================================"
echo "Applying Service Model Migration"
echo "========================================"

# Apply migration
python3 manage.py migrate

echo ""
echo "========================================"
echo "Migration Complete!"
echo "========================================"
echo ""
echo "The Service table now has:"
echo "  - price field (NPR currency)"
echo "  - processing_days field"
echo ""
echo "You can now update services in Django Admin:"
echo "http://localhost:8000/admin/core/service/"
