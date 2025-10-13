# Payment Settings Setup Guide

## Issue Fixed ✅
**Problem**: When admin accepts a service application, the payment information (UPI ID, QR Code) was not showing for users.

**Root Cause**: No payment settings were configured in the database.

**Solution**: Created payment settings record with UPI ID and UPI Number.

---

## Current Setup

Payment settings have been created with:
- **UPI ID**: merchant@paytm
- **UPI Number**: 9876543210  
- **Status**: Active

Now when an admin accepts an application, users will see the UPI payment details.

---

## How to Update Payment Settings

### Method 1: Using Django Shell (Current)

```bash
cd /home/rohan/Desktop/projects/CGJBCSC
source sys/bin/activate
cd sewa_portal
python manage.py shell
```

Then in the shell:
```python
from core.models import PaymentSettings

# Get existing settings
ps = PaymentSettings.objects.filter(is_active=True).first()

# Update UPI details
ps.upi_id = "yourbusiness@upi"
ps.upi_number = "9876543210"
ps.save()

# To upload QR code image (manual file copy required)
# 1. Copy QR image to: sewa_portal/media/payment_qr/
# 2. Then update:
ps.qr_code_image = "payment_qr/your_qr_image.png"
ps.save()
```

### Method 2: Add Admin UI (Recommended)

I can create an admin UI page where you can:
- Update UPI ID
- Update UPI Number
- Upload QR Code Image
- Enable/Disable payment methods

---

## Testing the Fix

1. **Login as Admin**
2. **Go to Applications**
3. **Accept an Application**
4. **Logout and login as the User**
5. **Go to Applications → View Details**
6. **Check Payment Information section** - should now show:
   - UPI ID: merchant@paytm
   - UPI Number: 9876543210
   - QR Code (if uploaded)

---

## What's Displayed to Users

When an application is **Approved**, the user sees:

```
Payment Information
├── Amount to Pay: NPR [service price]
├── Payment Method: UPI / QR / Cash
├── Payment Status: Pending / Completed
└── Payment Details:
    ├── UPI ID: merchant@paytm (if payment method is UPI)
    ├── UPI Number: 9876543210 (if set)
    └── QR Code Image (if payment method is QR and image uploaded)
```

---

## Adding QR Code Image

### Step 1: Create QR Code
1. Use any QR code generator for UPI payments
2. Include your UPI ID in the QR code
3. Save as PNG/JPG

### Step 2: Upload to Server
```bash
# Copy your QR code to the media folder
cp /path/to/your/qr_code.png /home/rohan/Desktop/projects/CGJBCSC/sewa_portal/media/payment_qr/
```

### Step 3: Update Database
```bash
cd /home/rohan/Desktop/projects/CGJBCSC
source sys/bin/activate
cd sewa_portal
python manage.py shell
```

```python
from core.models import PaymentSettings
ps = PaymentSettings.objects.filter(is_active=True).first()
ps.qr_code_image = "payment_qr/qr_code.png"  # use your filename
ps.save()
print("QR Code updated successfully!")
```

---

## Creating Admin UI for Payment Settings

Would you like me to create an admin interface where you can:
1. View current payment settings
2. Update UPI ID and Number
3. Upload/change QR code image
4. Enable/disable settings

This would be much easier than using Django shell!

---

## API Endpoints

Payment settings are fetched from:
- **GET** `/api/payment-settings/` - All active settings
- **GET** `/api/payment-settings/active/` - Get active settings (used by frontend)
- **PATCH** `/api/payment-settings/{id}/` - Update settings (admin only)

---

## Database Structure

```sql
PaymentSettings {
  settings_id: Primary Key (Auto)
  upi_id: VARCHAR(100) - UPI ID like "merchant@paytm"
  upi_number: VARCHAR(20) - Phone number for UPI
  qr_code_image: ImageField - Path to QR code image
  is_active: Boolean - Enable/disable settings
  created_at: DateTime
  updated_at: DateTime
}
```

---

## Important Notes

⚠️ **Only ONE payment setting should be active at a time**
- When creating new settings, deactivate old ones
- The system uses `is_active=True` to fetch current settings

✅ **Settings Apply Globally**
- All users see the same payment details
- Update once, applies to all pending payments

🔒 **Security**
- Only admins can update payment settings
- Users can only view settings (read-only)

---

## Next Steps

1. ✅ **Done**: Created basic payment settings
2. **TODO**: Add your actual UPI ID
3. **TODO**: Upload your QR code image
4. **Optional**: Create admin UI for easy management

Let me know if you want me to create the admin UI page for managing payment settings!
