# Payment System Implementation Guide

## Overview
A comprehensive payment system has been added to track and manage payments for government services.

## Backend Changes

### 1. Payment Model (`sewa_portal/core/models.py`)

New `Payment` model with the following fields:

```python
class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    application = models.OneToOneField(UserApplication, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=[
        ('Cash', 'Cash'),
        ('E-Sewa', 'E-Sewa'),
        ('Khalti', 'Khalti'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Credit/Debit Card', 'Credit/Debit Card'),
    ])
    payment_status = models.CharField(max_length=10, choices=[
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    ])
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
```

### 2. API Endpoints

**Base URL:** `http://localhost:8000/api/payments/`

#### Available Endpoints:

1. **List Payments**
   - GET `/api/payments/`
   - Returns all payments (admin) or user's payments (regular users)

2. **Get Payment Details**
   - GET `/api/payments/{payment_id}/`
   - Returns specific payment details

3. **Create Payment**
   - POST `/api/payments/`
   - Body:
     ```json
     {
       "application": 1,
       "amount": "500.00",
       "payment_method": "Cash",
       "payment_status": "Pending",
       "transaction_id": "TXN123456",
       "notes": "Payment via cash at office"
     }
     ```

4. **Update Payment**
   - PUT/PATCH `/api/payments/{payment_id}/`

5. **Mark Payment as Completed** (Admin only)
   - POST `/api/payments/{payment_id}/mark_completed/`
   - Automatically sends email notification

6. **Get Payment Statistics** (Admin only)
   - GET `/api/payments/statistics/`
   - Returns:
     ```json
     {
       "total_payments": 100,
       "completed_payments": 85,
       "pending_payments": 15,
       "total_revenue": 125000.00
     }
     ```

### 3. Payment Serializer

Includes additional fields:
- `service_name`: Name of the service
- `user_name`: Full name of the user

### 4. Admin Interface

Enhanced Django admin for Payment management:
- List display: payment_id, user, service, amount, method, status, date
- Filters: payment_status, payment_method, payment_date
- Search: transaction_id, user name, service name

## Database Migration Steps

**IMPORTANT:** You need to run the migration to create the Payment table.

```bash
# Navigate to sewa_portal directory
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal

# Create migration
python3 manage.py makemigrations core

# Apply migration
python3 manage.py migrate

# Verify migration
python3 manage.py showmigrations core
```

Expected migration output:
```
Migrations for 'core':
  core/migrations/0004_payment.py
    - Create model Payment
```

## Frontend Integration

### API Service Methods to Add

Add to `frontend/src/services/apiService.js`:

```javascript
// Payment APIs
const getPayments = () => api.get('/payments/');

const getPayment = (id) => api.get(`/payments/${id}/`);

const createPayment = (paymentData) => api.post('/payments/', paymentData);

const updatePayment = (id, paymentData) => api.put(`/payments/${id}/`, paymentData);

const markPaymentCompleted = (id) => api.post(`/payments/${id}/mark_completed/`);

const getPaymentStatistics = () => api.get('/payments/statistics/');

export default {
  // ... existing exports
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  markPaymentCompleted,
  getPaymentStatistics,
};
```

### Payment Components to Create

1. **AdminPayments.jsx** - Payment management page for admins
   - View all payments
   - Filter by status, method, date
   - Mark payments as completed
   - View payment statistics

2. **PaymentModal.jsx** - Payment creation/update modal
   - Payment method selection
   - Amount input
   - Transaction ID
   - Notes

3. **UserPayments.jsx** - User's payment history
   - View own payments
   - Payment status
   - Receipt download

### Example: Payment Status Badge

```jsx
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'error';
    case 'Refunded': return 'info';
    default: return 'default';
  }
};

<Chip 
  label={payment.payment_status} 
  color={getStatusColor(payment.payment_status)}
  size="small"
/>
```

### Integration with UserApplication

The `UserApplication` serializer now includes payment information:

```javascript
// When fetching applications
const application = {
  application_id: 1,
  service: {...},
  status: 'Approved',
  payment: {
    payment_id: 1,
    amount: '500.00',
    payment_method: 'Cash',
    payment_status: 'Completed',
    transaction_id: 'TXN123',
    payment_date: '2025-10-13T10:30:00Z'
  }
}
```

## Payment Flow

### 1. User Submits Application
```
User applies for service → Application created with status 'Pending'
```

### 2. Admin Creates Payment
```javascript
// After reviewing application
const paymentData = {
  application: applicationId,
  amount: service.price, // Auto-filled from service price
  payment_method: 'Cash',
  payment_status: 'Pending'
};

await apiService.createPayment(paymentData);
```

### 3. User Makes Payment
```
User pays at office/online → Admin updates payment status
```

### 4. Admin Confirms Payment
```javascript
// Mark payment as completed
await apiService.markPaymentCompleted(paymentId);
// Automatically sends email to user
```

### 5. Application Processed
```
Payment completed → Application approved → Final document uploaded → Status: Completed
```

## Payment Methods

The system supports multiple payment methods:

1. **Cash** - Traditional cash payment at office
2. **E-Sewa** - Popular digital wallet in Nepal
3. **Khalti** - Digital payment platform
4. **Bank Transfer** - Direct bank transfers
5. **Credit/Debit Card** - Card payments

## Payment Statistics Dashboard

For admin dashboard, you can display:

```javascript
const stats = await apiService.getPaymentStatistics();

// Display cards:
- Total Payments: stats.total_payments
- Completed: stats.completed_payments
- Pending: stats.pending_payments
- Total Revenue: NPR stats.total_revenue
```

## Email Notifications

When payment is marked as completed, an automatic email is sent:

```
Subject: Payment Confirmed - [Service Name]

Hello [User Name],

Your payment of NPR [Amount] has been confirmed.
Payment Method: [Method]
Transaction ID: [Transaction ID]

Thank you!
```

## Security Considerations

1. **Permissions**:
   - Users can only view their own payments
   - Only admins can create/update/delete payments
   - Only admins can mark payments as completed

2. **Validation**:
   - Amount must be positive
   - Payment method must be from predefined choices
   - Transaction ID is optional but recommended

3. **OneToOne Relationship**:
   - Each application can have only one payment
   - Prevents duplicate payments

## Testing the Payment System

### 1. Create a Service with Price
```bash
# In Django Admin
http://localhost:8000/admin/core/service/
Add service with price (e.g., NPR 500.00)
```

### 2. User Creates Application
```bash
# User submits application
POST /api/applications/
```

### 3. Admin Creates Payment
```bash
# Admin creates payment for application
POST /api/payments/
{
  "application": 1,
  "amount": "500.00",
  "payment_method": "Cash",
  "payment_status": "Pending"
}
```

### 4. Verify Payment
```bash
# Check payment was created
GET /api/payments/1/

# Check application includes payment
GET /api/applications/1/
```

## Next Steps

1. ✅ Run database migration
2. ⏳ Test Payment API endpoints in Django Admin or Postman
3. ⏳ Create frontend payment management components
4. ⏳ Integrate payment info in application review workflow
5. ⏳ Add payment receipt generation (PDF)
6. ⏳ Integrate with actual payment gateways (E-Sewa, Khalti)

## Payment Gateway Integration (Future)

For online payments, you can integrate:

### E-Sewa Integration
```javascript
// Initialize E-Sewa payment
const esewaConfig = {
  amt: payment.amount,
  psc: 0,
  pdc: 0,
  txAmt: 0,
  tAmt: payment.amount,
  pid: payment.payment_id,
  scd: "ESEWA_SCD",
  su: "http://yoursite.com/payment/success",
  fu: "http://yoursite.com/payment/failed"
};
```

### Khalti Integration
```javascript
// Khalti payment config
const khaltiConfig = {
  publicKey: "your_khalti_public_key",
  productIdentity: payment.payment_id,
  productName: payment.service_name,
  amount: payment.amount * 100, // Khalti uses paisa
  eventHandler: {
    onSuccess: (payload) => {
      // Update payment with transaction_id
    },
    onError: (error) => {
      // Handle error
    }
  }
};
```

## Support

For issues or questions:
1. Check Django admin at `http://localhost:8000/admin/`
2. Check API responses in browser developer tools
3. Review server logs: `sewa_portal/debug.log`
4. Verify migration applied: `python3 manage.py showmigrations core`

## Summary

The payment system is now ready for:
- ✅ Backend models and API endpoints
- ✅ Payment tracking and status management
- ✅ Admin interface for payment management
- ✅ Email notifications
- ✅ Payment statistics
- ⏳ Frontend UI components (next step)
- ⏳ Payment gateway integration (optional)
