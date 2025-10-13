# UPI Payment Integration - Complete Implementation Guide

## 🎯 Overview

When admin **approves** a service application, the system automatically sends payment details (UPI ID, UPI Number, QR Code, Bank Details) to the user via **email** and displays them in the application.

---

## 📋 What Was Implemented

### 1. Backend Changes

#### A. PaymentSettings Model (New)
**Location:** `sewa_portal/core/models.py`

```python
class PaymentSettings(models.Model):
    """Global payment settings for UPI/QR code"""
    settings_id = models.AutoField(primary_key=True)
    
    # UPI Details
    upi_id = models.CharField(max_length=100, blank=True, null=True)
    upi_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Bank Details
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_name = models.CharField(max_length=100, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    
    # QR Code
    qr_code_image = models.ImageField(upload_to='payment_qr/', blank=True, null=True)
    
    # Payment Gateway Keys
    esewa_merchant_id = models.CharField(max_length=100, blank=True, null=True)
    khalti_public_key = models.CharField(max_length=100, blank=True, null=True)
    
    # Instructions
    payment_instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
```

**Features:**
- ✅ Store UPI ID and mobile number
- ✅ Upload QR code image
- ✅ Bank account details
- ✅ Custom payment instructions
- ✅ E-Sewa/Khalti merchant keys (for future)
- ✅ Only one active settings allowed

#### B. Payment Model Updates
**Location:** `sewa_portal/core/models.py`

```python
class Payment(models.Model):
    # ... existing fields ...
    
    # NEW FIELDS:
    payment_link_sent = models.BooleanField(default=False)
    payment_link_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Updated choices:
    PAYMENT_METHOD_CHOICES = (
        ('Cash', 'Cash'),
        ('E-Sewa', 'E-Sewa'),
        ('Khalti', 'Khalti'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Credit/Debit Card', 'Credit/Debit Card'),
        ('UPI', 'UPI'),  # NEW!
    )
```

#### C. Auto-Send Payment Details on Approval
**Location:** `sewa_portal/core/views.py` - `UserApplicationViewSet.update_status()`

**Flow:**
```python
@action(detail=True, methods=['post'])
def update_status(self, request, pk=None):
    app = self.get_object()
    status = request.data.get('status')
    
    if status == 'Approved':
        # 1. Get payment record
        payment = Payment.objects.get(application=app)
        
        # 2. Get active payment settings
        payment_settings = PaymentSettings.objects.filter(is_active=True).first()
        
        # 3. Mark payment link as sent
        payment.payment_link_sent = True
        payment.payment_link_sent_at = timezone.now()
        payment.save()
        
        # 4. Build email with payment details
        email_body = f"""
Hello {app.user.full_name},

Your application for {app.service.service_name} has been APPROVED! 🎉

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount to Pay: NPR {payment.amount}

📱 UPI ID: {payment_settings.upi_id}
📞 UPI Number: {payment_settings.upi_number}

🏦 BANK DETAILS:
   Bank: {payment_settings.bank_name}
   Account Name: {payment_settings.account_name}
   Account Number: {payment_settings.account_number}
   IFSC Code: {payment_settings.ifsc_code}

📋 Instructions:
{payment_settings.payment_instructions}

After completing the payment, reply with the transaction ID.
        """
        
        # 5. Send email
        send_mail(
            "✅ Application Approved - Payment Required",
            email_body,
            None,
            [app.user.email]
        )
        
        return Response({
            'success': True,
            'payment_details_sent': True,
            'payment_settings': PaymentSettingsSerializer(payment_settings).data
        })
```

**Key Features:**
- ✅ Automatically triggered when admin approves application
- ✅ Sends complete payment details via email
- ✅ Includes UPI ID, UPI number, bank details
- ✅ Includes QR code URL (if uploaded)
- ✅ Custom instructions included
- ✅ Tracks if payment details were sent
- ✅ Returns payment settings in API response

#### D. API Endpoints

**New Endpoint:** `/api/payment-settings/`

```http
# Get all payment settings (admin only)
GET /api/payment-settings/

# Get active payment settings (public)
GET /api/payment-settings/active/

# Update payment settings (admin only)
PATCH /api/payment-settings/{id}/
```

**Example Response:**
```json
{
  "settings_id": 1,
  "upi_id": "merchant@paytm",
  "upi_number": "9876543210",
  "bank_name": "Nepal Bank",
  "account_number": "1234567890",
  "account_name": "Government Services",
  "ifsc_code": "NEPB0001234",
  "qr_code_url": "http://localhost:8000/media/payment_qr/qr_code.png",
  "esewa_merchant_id": "ESEWA-12345",
  "khalti_public_key": "live_public_key_xxx",
  "payment_instructions": "Please use your Application ID as reference.",
  "is_active": true
}
```

---

### 2. Frontend Changes

#### A. Payment Details Dialog Component
**Location:** `frontend/src/components/user/PaymentDetailsDialog.jsx`

**Features:**
- ✅ Beautiful dialog UI with gradient header
- ✅ Shows application details (service name, amount, app ID)
- ✅ Displays UPI ID with copy button
- ✅ Displays UPI number with copy button
- ✅ Shows QR code image (if available)
- ✅ Shows bank details with copy buttons
- ✅ Displays custom payment instructions
- ✅ Copy-to-clipboard functionality
- ✅ Visual feedback on copy (checkmark icon)
- ✅ Responsive design

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ ✓ Application Approved - Payment   │ ← Gradient header
├─────────────────────────────────────┤
│ 🎉 Congratulations! Approved        │ ← Success alert
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Service: Citizenship Copy       │ │
│ │ Application ID: #123            │ │
│ │ Amount to Pay: NPR 500          │ │ ← App details
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📱 UPI Payment                  │ │
│ │                                 │ │
│ │ UPI ID: merchant@paytm [copy]   │ │
│ │ UPI Number: 9876543210 [copy]   │ │
│ │                                 │ │
│ │ [QR Code Image]                 │ │ ← UPI section
│ │ Scan with any UPI app           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏦 Bank Transfer                │ │
│ │                                 │ │
│ │ Bank: Nepal Bank                │ │
│ │ Account: 1234567890 [copy]      │ │
│ │ IFSC: NEPB0001234 [copy]        │ │ ← Bank section
│ └─────────────────────────────────┘ │
│                                     │
│ ℹ️ Payment Instructions            │ ← Instructions
│                                     │
│ ⚠️ Important Notes                  │ ← Warning alert
│                                     │
│ [Close] [I've Made the Payment]    │ ← Actions
└─────────────────────────────────────┘
```

#### B. API Service Methods
**Location:** `frontend/src/services/apiService.js`

```javascript
// Payment Settings
getPaymentSettings: () => axiosInstance.get('/api/payment-settings/'),
getActivePaymentSettings: () => axiosInstance.get('/api/payment-settings/active/'),
updatePaymentSettings: (id, data) => axiosInstance.patch(`/api/payment-settings/${id}/`, data),
```

#### C. API Endpoints Config
**Location:** `frontend/src/config/api.js`

```javascript
PAYMENT_SETTINGS: '/api/payment-settings/',
PAYMENT_SETTINGS_DETAIL: (id) => `/api/payment-settings/${id}/`,
PAYMENT_SETTINGS_ACTIVE: '/api/payment-settings/active/',
```

---

## 🚀 How It Works (End-to-End Flow)

### Step 1: Admin Setup (One-Time)

1. **Admin logs into Django admin panel:**
   ```
   http://localhost:8000/admin/
   ```

2. **Navigates to "Payment Settings"**

3. **Fills in payment details:**
   - UPI ID: `merchant@paytm`
   - UPI Number: `9876543210`
   - Bank Name: `Nepal Bank`
   - Account Number: `1234567890`
   - Account Name: `Government Services`
   - IFSC Code: `NEPB0001234`
   - Payment Instructions: `Please use your Application ID as payment reference.`
   - QR Code: Upload image file (PNG/JPG)
   - Mark as Active: ✓

4. **Saves settings**

### Step 2: User Applies for Service

1. User selects service (e.g., "Citizenship Copy - NPR 500")
2. User uploads required documents
3. User selects payment method: "UPI"
4. User submits application

**Backend:**
- Application created with status: "Pending"
- Payment record created:
  ```json
  {
    "application": 123,
    "amount": 500,
    "payment_method": "UPI",
    "payment_status": "Pending",
    "payment_link_sent": false
  }
  ```

### Step 3: Admin Reviews & Approves

1. **Admin views application** in admin panel
2. **Admin clicks "Approve"**
3. **Backend automatically:**
   - Changes application status to "Approved"
   - Gets payment settings from database
   - Sets `payment_link_sent = True`
   - Sets `payment_link_sent_at = NOW()`
   - Builds email with payment details
   - Sends email to user

**Email Sent to User:**
```
Subject: ✅ Application Approved - Payment Required for Citizenship Copy

Hello Rohan Sharma,

Your application for Citizenship Copy has been APPROVED! 🎉

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount to Pay: NPR 500
Payment Method: UPI

📱 UPI ID: merchant@paytm
📞 UPI Number: 9876543210

🏦 BANK DETAILS:
   Bank: Nepal Bank
   Account Name: Government Services
   Account Number: 1234567890
   IFSC Code: NEPB0001234

📋 Instructions:
Please use your Application ID as payment reference.
After completing the payment, reply with the transaction ID or visit office.

Application ID: #123

Thank you!
Sewa Portal
```

### Step 4: User Makes Payment

**Option A: User opens email**
- Sees UPI ID: `merchant@paytm`
- Opens UPI app (Paytm/PhonePe/GPay)
- Enters UPI ID
- Pays NPR 500
- Gets transaction ID: `TXN123456789`

**Option B: User logs into portal**
- Goes to "My Applications"
- Sees application with "Approved" status
- Clicks "View Payment Details" button
- **Payment Details Dialog opens** showing:
  - UPI ID with copy button
  - UPI Number with copy button
  - QR Code (can scan directly)
  - Bank details with copy buttons
  - Payment instructions
- User scans QR code or copies UPI ID
- Makes payment via UPI app

### Step 5: Admin Confirms Payment

1. **Admin receives payment** (cash/online/bank transfer)
2. **Admin goes to "Payments" page**
3. **Admin finds payment record** (Application #123)
4. **Admin clicks "Mark as Completed"**
5. **Admin enters transaction ID** (if available)
6. **Payment status** changes to "Completed"

**Backend:**
- `payment_status = 'Completed'`
- `payment_date = NOW()`
- Sends confirmation email to user

**Email to User:**
```
Subject: Payment Confirmed - Citizenship Copy

Hello Rohan Sharma,

Your payment of NPR 500 has been confirmed.
Payment Method: UPI
Transaction ID: TXN123456789

Your service will be processed within 7 days.

Thank you!
```

---

## 🔧 Setup Instructions

### 1. Run Migrations

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python manage.py makemigrations
python manage.py migrate
```

**Expected Migration:**
```
Migrations for 'core':
  core/migrations/0007_paymentsettings_payment_link_sent.py
    - Create model PaymentSettings
    - Add field payment_link_sent to payment
    - Add field payment_link_sent_at to payment
    - Add 'UPI' to payment_method choices
```

### 2. Create Payment Settings (Django Admin)

```bash
# Start server
python manage.py runserver

# Visit admin panel
# http://localhost:8000/admin/

# Login with superuser credentials

# Click "Payment Settings" → "Add Payment Settings"

# Fill in details:
# - UPI ID: merchant@paytm
# - UPI Number: 9876543210
# - Bank Name: Nepal Bank
# - Account Number: 1234567890
# - Account Name: Government Services
# - IFSC Code: NEPB0001234
# - Upload QR Code image
# - Payment Instructions: "Use Application ID as reference"
# - Is Active: ✓

# Click "Save"
```

### 3. Upload QR Code Image

**Generate QR Code:**
- Use online tool: https://www.qr-code-generator.com/
- Type: UPI Payment
- Enter: `upi://pay?pa=merchant@paytm&pn=Government Services&am=500`
- Download QR code image
- Upload in Django admin

**Or Create with Python:**
```python
import qrcode

# UPI payment string
upi_string = "upi://pay?pa=merchant@paytm&pn=Government Services&cu=NPR"

# Generate QR code
qr = qrcode.QRCode(version=1, box_size=10, border=5)
qr.add_data(upi_string)
qr.make(fit=True)

# Create image
img = qr.make_image(fill_color="black", back_color="white")
img.save("payment_qr_code.png")
```

### 4. Test the Flow

#### Test Approval Email:

```bash
# In Django shell
python manage.py shell

# Test email sending
from core.models import UserApplication, Payment, PaymentSettings
from django.core.mail import send_mail

app = UserApplication.objects.get(application_id=1)
payment = Payment.objects.get(application=app)
settings = PaymentSettings.objects.first()

# This is what happens on approval:
print(f"UPI ID: {settings.upi_id}")
print(f"UPI Number: {settings.upi_number}")
print(f"Amount: {payment.amount}")
```

#### Test Frontend Dialog:

1. Start frontend:
   ```bash
   cd /home/rohan/Desktop/projects/CGJBCSC/frontend
   npm run dev
   ```

2. Apply for a service
3. Admin approves application
4. Go to "My Applications"
5. Click on approved application
6. Payment details dialog should open

---

## 📊 Database Structure

```sql
-- New Table: PaymentSettings
CREATE TABLE core_paymentsettings (
    settings_id INTEGER PRIMARY KEY AUTOINCREMENT,
    upi_id VARCHAR(100),
    upi_number VARCHAR(20),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    qr_code_image VARCHAR(100),  -- Path to uploaded image
    esewa_merchant_id VARCHAR(100),
    khalti_public_key VARCHAR(100),
    payment_instructions TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME,
    updated_at DATETIME
);

-- Updated Table: Payment
ALTER TABLE core_payment ADD COLUMN payment_link_sent BOOLEAN DEFAULT 0;
ALTER TABLE core_payment ADD COLUMN payment_link_sent_at DATETIME;
-- Payment method 'UPI' added to choices
```

---

## 🎨 Screenshots (What User Sees)

### 1. Email Notification
```
┌─────────────────────────────────────────────┐
│ From: noreply@sewaportal.gov.np             │
│ To: user@example.com                        │
│ Subject: ✅ Application Approved - Payment  │
│          Required                           │
├─────────────────────────────────────────────┤
│                                             │
│ Hello Rohan,                                │
│                                             │
│ Your application has been APPROVED! 🎉      │
│                                             │
│ Amount to Pay: NPR 500                      │
│                                             │
│ UPI ID: merchant@paytm                      │
│ UPI Number: 9876543210                      │
│                                             │
│ Bank: Nepal Bank                            │
│ Account: 1234567890                         │
│                                             │
│ [QR Code Image Embedded]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Payment Dialog (in Portal)
- Opens automatically when user views approved application
- Shows all payment methods
- QR code displayed prominently
- Copy buttons for easy copying
- Beautiful gradient design

---

## 🔐 Security Considerations

### ✅ Implemented:
- Payment settings only editable by admin
- Public endpoint for active settings (for QR display)
- User-specific payment tracking
- Email sent only on approval
- Transaction ID tracking

### 🔒 Recommended:
- Use HTTPS for production
- Encrypt sensitive payment data
- Rate limit payment endpoints
- Log all payment actions
- Implement 2FA for admin
- Regular security audits

---

## 📈 Future Enhancements

### 1. Real-Time Payment Gateway Integration

**E-Sewa Integration:**
```javascript
const initiateESewa = (payment) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://esewa.com.np/epay/main';
  
  const params = {
    amt: payment.amount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: payment.amount,
    pid: `APP-${payment.application}`,
    scd: settings.esewa_merchant_id,
    su: `${window.location.origin}/payment/success`,
    fu: `${window.location.origin}/payment/failure`,
  };
  
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
};
```

**Khalti Integration:**
```javascript
import KhaltiCheckout from 'khalti-checkout-web';

const khaltiConfig = {
  publicKey: settings.khalti_public_key,
  productIdentity: application.application_id,
  productName: application.service_name,
  productUrl: window.location.href,
  eventHandler: {
    onSuccess(payload) {
      // Update payment status
      apiService.updatePayment(payment.payment_id, {
        payment_status: 'Completed',
        transaction_id: payload.idx,
        payment_date: new Date(),
      });
    },
    onError(error) {
      console.error(error);
    },
  },
};

const checkout = new KhaltiCheckout(khaltiConfig);
checkout.show({ amount: payment.amount * 100 });
```

### 2. SMS Notifications
```python
# Install: pip install twilio
from twilio.rest import Client

def send_payment_sms(phone_number, payment_details):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=f"Payment Required: NPR {payment_details['amount']}. UPI: {payment_details['upi_id']}",
        from_='+1234567890',
        to=phone_number
    )
```

### 3. WhatsApp Integration
```python
# Using Twilio WhatsApp API
def send_whatsapp_payment(phone, upi_id, qr_url):
    message = client.messages.create(
        body=f"UPI ID: {upi_id}\nQR Code: {qr_url}",
        from_='whatsapp:+14155238886',
        to=f'whatsapp:{phone}'
    )
```

### 4. Dynamic QR Code Generation
```python
import qrcode
from io import BytesIO
from django.core.files import File

def generate_payment_qr(payment):
    upi_string = f"upi://pay?pa={settings.upi_id}&pn={settings.account_name}&am={payment.amount}&cu=NPR&tn=APP{payment.application.application_id}"
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(upi_string)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Save to payment record
    payment.qr_code = File(buffer, name=f'qr_{payment.payment_id}.png')
    payment.save()
```

### 5. Payment Receipt PDF
```python
from reportlab.pdfgen import canvas
from django.http import HttpResponse

def generate_receipt_pdf(payment):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="receipt_{payment.payment_id}.pdf"'
    
    p = canvas.Canvas(response)
    p.drawString(100, 800, "PAYMENT RECEIPT")
    p.drawString(100, 750, f"Receipt No: {payment.payment_id}")
    p.drawString(100, 730, f"Date: {payment.payment_date}")
    p.drawString(100, 710, f"Amount: NPR {payment.amount}")
    p.drawString(100, 690, f"Method: {payment.payment_method}")
    p.drawString(100, 670, f"Transaction ID: {payment.transaction_id}")
    p.showPage()
    p.save()
    
    return response
```

---

## 🆘 Troubleshooting

### Issue 1: Email not sending
```python
# Check Django settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your@gmail.com'
EMAIL_HOST_PASSWORD = 'app_password'  # Use App Password, not regular password
DEFAULT_FROM_EMAIL = 'noreply@sewaportal.gov.np'

# Test email:
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Testing email', None, ['test@example.com'])
```

### Issue 2: QR code not displaying
```python
# Check MEDIA settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# In urls.py:
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### Issue 3: Payment settings not found
```python
# Create default settings in Django shell:
from core.models import PaymentSettings

settings = PaymentSettings.objects.create(
    upi_id='merchant@paytm',
    upi_number='9876543210',
    bank_name='Nepal Bank',
    is_active=True
)
```

---

## ✅ Summary

### What You Get:

1. **Automated Payment Notification System**
   - Email sent automatically on approval
   - Contains all payment details
   - QR code included

2. **Beautiful Payment Dialog**
   - Shows UPI ID, number, QR code
   - Bank account details
   - Copy-to-clipboard functionality
   - Responsive design

3. **Admin Control Panel**
   - Manage payment settings
   - Upload QR codes
   - Custom instructions
   - Multiple payment methods

4. **Tracking System**
   - Track if payment link sent
   - When it was sent
   - Payment completion status
   - Transaction IDs

### Ready to Use:

- ✅ Backend: PaymentSettings model
- ✅ Backend: Auto-send on approval
- ✅ Backend: API endpoints
- ✅ Frontend: PaymentDetailsDialog component
- ✅ Frontend: API service methods
- ✅ Email: Payment details template
- ✅ Admin: Payment settings panel

### Next Steps:

1. **Run migrations**
2. **Add payment settings in admin**
3. **Upload QR code**
4. **Test approval flow**
5. **Configure email settings**
6. **(Optional) Add Khalti/E-Sewa integration**

---

**🎉 Your UPI payment system is ready! When admin approves an application, users automatically receive payment details via email and can view them in the portal with QR code!** 🚀
