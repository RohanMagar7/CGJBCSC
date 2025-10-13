# Service Model Update - Migration Guide

## Changes Made to Service Model

Added two new fields to the `Service` model:
1. **price** - DecimalField to store service cost in NPR (Nepalese Rupees)
2. **processing_days** - PositiveIntegerField to store number of days to process the service

## How to Apply the Migration

Run these commands in the `sewa_portal` directory:

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal

# Create migration file
python3 manage.py makemigrations core

# Apply migration to database
python3 manage.py migrate core
```

## What the Migration Will Do

- Add `price` column (default: 0.00, max 10 digits with 2 decimal places)
- Add `processing_days` column (default: 7 days, positive integer only)
- Existing services will get default values (0.00 NPR, 7 days)

## After Migration

You can update existing services with proper prices and processing times:
1. Go to Django Admin: http://localhost:8000/admin/
2. Click on "Services"
3. Edit each service to add:
   - Price (e.g., 500.00, 1000.00, etc.)
   - Processing days (e.g., 3, 7, 14, 30 days)

## API Response Example

After migration, the API will return services with new fields:

```json
{
  "service_id": 1,
  "service_name": "Citizenship Certificate",
  "description": "Apply for citizenship certificate",
  "price": "500.00",
  "processing_days": 7,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Frontend Updates Needed

You may want to update the frontend to display:
- Service price when showing service details
- Expected processing time (e.g., "Ready in 7 days")
- Calculate total cost for multiple services
