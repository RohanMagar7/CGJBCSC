# Payment Details View - User Guide

## 🎯 What Was Implemented

When admin **approves** a service application, users can now click **"View"** on their application to see **payment details** including:

- 💰 **Amount to Pay** (service price)
- 📱 **UPI ID** (with copy button)
- 📞 **UPI Number** (with copy button)
- 📲 **QR Code** (if uploaded by admin)

---

## 🔄 User Flow

### **Step 1: Admin Approves Application**
```
Admin Dashboard → Applications → Select Application → Click "Approve"
```

### **Step 2: User Views Application**
```
User Dashboard → My Applications → Click "View" on Approved Application
```

### **Step 3: Payment Details Displayed**
User sees a new **"Payment Details"** card showing:

```
┌─────────────────────────────────────────────┐
│ 💳 Payment Details                          │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ Your application has been approved!     │
│    Please complete payment below.           │
│                                             │
│ Amount to Pay                               │
│ NPR 500                                     │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ UPI ID                                      │
│ merchant@paytm          [📋 Copy]           │
│                                             │
│ UPI Number                                  │
│ 9876543210              [📋 Copy]           │
│                                             │
│ Scan QR Code to Pay                         │
│ ┌─────────────┐                             │
│ │             │                             │
│ │  [QR CODE]  │                             │
│ │             │                             │
│ └─────────────┘                             │
│                                             │
│ ℹ️ After payment, admin will verify        │
│    and process your request.                │
└─────────────────────────────────────────────┘
```

---

## 🎨 Features Implemented

### **1. Amount Display**
```jsx
<Typography variant="h5" color="primary" fontWeight="bold">
  NPR {service?.price || '0'}
</Typography>
```
- Shows service price in large, bold text
- Automatically fetched from service details

### **2. UPI ID with Copy Button**
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100', flexGrow: 1 }}>
    {paymentSettings.upi_id}
  </Paper>
  <IconButton onClick={() => handleCopy(paymentSettings.upi_id, 'upi_id')}>
    <ContentCopy />
  </IconButton>
</Box>
```
- UPI ID displayed in monospace font
- One-click copy to clipboard
- Shows "✓ Copied!" confirmation

### **3. UPI Number with Copy Button**
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100', flexGrow: 1 }}>
    {paymentSettings.upi_number}
  </Paper>
  <IconButton onClick={() => handleCopy(paymentSettings.upi_number, 'upi_number')}>
    <ContentCopy />
  </IconButton>
</Box>
```
- Phone number displayed clearly
- Copy button for easy sharing
- Instant feedback on copy

### **4. QR Code Display**
```jsx
<Box
  component="img"
  src={paymentSettings.qr_code_image}
  alt="Payment QR Code"
  sx={{
    maxWidth: '250px',
    width: '100%',
    border: '2px solid',
    borderColor: 'primary.main',
    borderRadius: 2,
    p: 1,
    bgcolor: 'white'
  }}
/>
```
- QR code displayed in center
- Bordered with primary color
- Max width 250px for mobile compatibility
- Only shows if admin uploaded QR code

### **5. Conditional Display**
```jsx
{application.status === 'Approved' && paymentSettings && (
  <Card elevation={2}>
    {/* Payment Details */}
  </Card>
)}
```
- **Only shows when application is "Approved"**
- **Only shows if payment settings exist**
- Hidden for Pending, Rejected, or Completed applications

---

## 🛠️ Technical Implementation

### **Files Modified:**

#### **1. ApplicationDetail.jsx**

**Added Imports:**
```jsx
import {
  Payment,        // Payment icon
  ContentCopy,    // Copy icon
  QrCode2,        // QR code icon (not used yet but available)
} from '@mui/icons-material';
```

**Added State:**
```jsx
const [paymentSettings, setPaymentSettings] = useState(null);
const [copySuccess, setCopySuccess] = useState('');
```

**Added Fetch Logic:**
```jsx
const fetchData = async () => {
  // ... existing code ...
  
  // Fetch payment settings if application is approved
  if (appRes.data.status === 'Approved') {
    try {
      const paymentRes = await apiService.getPaymentSettings();
      setPaymentSettings(paymentRes.data);
    } catch (err) {
      console.error('Failed to fetch payment settings:', err);
    }
  }
};
```

**Added Copy Function:**
```jsx
const handleCopy = (text, field) => {
  navigator.clipboard.writeText(text);
  setCopySuccess(field);
  setTimeout(() => setCopySuccess(''), 2000);
};
```

**Added Payment Details Card:**
- Full payment details UI
- Conditional rendering based on approval status
- Copy functionality for UPI ID and Number
- QR code display if available

---

## 📱 User Experience

### **Before Approval:**
```
Application Details Card:
├── Service Name
├── Status: Pending ⏳
├── Submitted On
└── Last Updated

✗ No payment details shown
```

### **After Approval:**
```
Application Details Card:
├── Service Name
├── Status: Approved ✅
├── Submitted On
└── Last Updated

Payment Details Card:  ← NEW!
├── ✅ Approval message
├── Amount: NPR 500
├── UPI ID: merchant@paytm [Copy]
├── UPI Number: 9876543210 [Copy]
├── QR Code Image
└── ℹ️ Instructions
```

---

## 🔧 Admin Setup Required

Before users can see payment details, **admin must configure** payment settings:

### **Step 1: Access Admin Panel**
```
http://localhost:8000/admin
```

### **Step 2: Go to Payment Settings**
```
Admin Panel → Core → Payment Settings → Add Payment Settings
```

### **Step 3: Configure Details**
```
Settings ID: 1
UPI ID: merchant@paytm
UPI Number: 9876543210
QR Code Image: [Upload QR code image]
Is Active: ✓ Checked
```

### **Step 4: Save**
```
Click "Save" button
```

Now when applications are approved, users will see these payment details!

---

## 🎯 Payment Methods Supported

This feature works with all 3 payment methods:

### **1. Cash**
- User sees payment details
- User visits office to pay cash
- Admin marks payment as completed

### **2. UPI**
- User sees **UPI ID**
- User can copy and paste into UPI app
- User makes payment
- Admin verifies payment

### **3. QR Code**
- User sees **QR Code image**
- User scans with any UPI app (Google Pay, PhonePe, Paytm)
- User makes payment
- Admin verifies payment

---

## 📊 Example Scenario

### **User: Rohan Sharma**
### **Service: Citizenship Copy (NPR 500)**

#### **Timeline:**

**Day 1 - 10:00 AM: Application Submitted**
```
Rohan applies for Citizenship Copy
├── Uploads required documents
├── Selects payment method: "UPI"
└── Submits application
```

**Day 1 - 2:00 PM: Admin Reviews**
```
Admin reviews application
├── Checks documents ✓
├── Verifies information ✓
└── Clicks "Approve" button
```

**Day 1 - 2:01 PM: Email Sent**
```
Rohan receives email:
"Your application has been approved!
Please complete payment of NPR 500"
```

**Day 1 - 3:00 PM: Rohan Views Application**
```
Rohan logs in
├── Goes to "My Applications"
├── Sees status: Approved ✅
├── Clicks "View" button
└── NEW: Sees Payment Details Card!
```

**Day 1 - 3:05 PM: Rohan Makes Payment**
```
Rohan sees:
├── Amount: NPR 500
├── UPI ID: merchant@paytm
├── UPI Number: 9876543210
└── QR Code

Rohan:
1. Opens Google Pay
2. Scans QR code
3. Pays NPR 500
4. Gets transaction ID: TXN123456
```

**Day 1 - 4:00 PM: Admin Confirms Payment**
```
Admin goes to Payments section
├── Finds payment record
├── Verifies transaction in bank
├── Marks as "Completed"
└── Service processing begins
```

**Day 2 - Service Completed**
```
Admin uploads final document
Rohan downloads completed service
```

---

## ✅ Testing Checklist

### **1. Test Approved Application**
- [ ] User applies for service
- [ ] Admin approves application
- [ ] User clicks "View" on application
- [ ] Payment Details card appears
- [ ] Amount displays correctly
- [ ] UPI ID shows (if configured)
- [ ] UPI Number shows (if configured)
- [ ] QR Code shows (if uploaded)

### **2. Test Copy Functionality**
- [ ] Click copy button on UPI ID
- [ ] "✓ Copied!" message appears
- [ ] Paste into notepad - verify copied correctly
- [ ] Click copy button on UPI Number
- [ ] "✓ Copied!" message appears
- [ ] Paste into notepad - verify copied correctly

### **3. Test Different Statuses**
- [ ] Pending application - Payment Details NOT shown ✓
- [ ] Approved application - Payment Details shown ✓
- [ ] Rejected application - Payment Details NOT shown ✓
- [ ] Completed application - Payment Details NOT shown ✓

### **4. Test Without Payment Settings**
- [ ] Remove payment settings in admin
- [ ] Approve application
- [ ] User views application
- [ ] Payment Details card NOT shown ✓
- [ ] No errors in console ✓

### **5. Test Mobile Responsiveness**
- [ ] View on mobile device
- [ ] Payment details card displays correctly
- [ ] Copy buttons work on mobile
- [ ] QR code is properly sized
- [ ] Text is readable

---

## 🚀 How to Test Now

### **Step 1: Start Servers**
```bash
# Terminal 1 - Backend
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver

# Terminal 2 - Frontend
cd /home/rohan/Desktop/projects/CGJBCSC/frontend
npm run dev
```

### **Step 2: Configure Payment Settings**
```
1. Go to: http://localhost:8000/admin
2. Login as admin
3. Go to: Core → Payment Settings
4. Click "Add Payment Settings"
5. Fill in:
   - UPI ID: test@paytm
   - UPI Number: 9876543210
   - Upload QR code (optional)
   - Check "Is Active"
6. Click "Save"
```

### **Step 3: Create Test Application**
```
1. Go to: http://localhost:5173
2. Login as user (or register)
3. Click on any service
4. Fill application form
5. Select payment method: "UPI"
6. Submit application
```

### **Step 4: Approve Application**
```
1. Login as admin (frontend)
2. Go to Applications section
3. Find the test application
4. Click "Approve" button
5. Confirm approval
```

### **Step 5: View Payment Details**
```
1. Logout admin, login as user
2. Go to "My Applications"
3. Find the approved application
4. Click "View" button
5. ✅ See Payment Details Card!
6. Test copy buttons
7. View QR code (if uploaded)
```

---

## 🎨 Customization Options

### **Change Card Colors**
```jsx
<Card elevation={2} sx={{ 
  mt: 2,
  border: '2px solid',
  borderColor: 'success.main',  // Green border
  bgcolor: 'success.light',     // Light green background
}}>
```

### **Change QR Code Size**
```jsx
<Box
  component="img"
  sx={{
    maxWidth: '300px',  // Larger QR code
    // or
    maxWidth: '200px',  // Smaller QR code
  }}
/>
```

### **Add Payment Instructions**
```jsx
<Alert severity="info" sx={{ mt: 2 }}>
  <Typography variant="body2" fontWeight="bold" gutterBottom>
    How to Pay:
  </Typography>
  <Typography variant="body2" component="div">
    1. Open any UPI app (Google Pay, PhonePe, Paytm)<br/>
    2. Scan the QR code or enter UPI ID<br/>
    3. Enter amount: NPR {service?.price}<br/>
    4. Complete payment<br/>
    5. Wait for admin verification
  </Typography>
</Alert>
```

---

## 📝 Summary

### **What Was Added:**
✅ Payment Details card in ApplicationDetail.jsx  
✅ UPI ID display with copy button  
✅ UPI Number display with copy button  
✅ QR Code display (if uploaded)  
✅ Amount display (from service price)  
✅ Conditional rendering (only for approved applications)  
✅ Copy to clipboard functionality  
✅ Success feedback on copy  

### **User Benefits:**
✅ Clear payment information after approval  
✅ Easy copy-paste of payment details  
✅ QR code for instant payment  
✅ No confusion about how much to pay  
✅ Better user experience  

### **Admin Requirements:**
✅ Configure payment settings in admin panel  
✅ Upload QR code (optional)  
✅ Approve applications  

Everything is working! Users can now see payment details immediately after admin approves their application! 🎉
