# Email Feature Implementation Guide

## 📧 Overview

This guide shows you how to configure Django to send real emails when admin approves applications. We'll cover multiple email providers and methods.

---

## 🎯 Current Status

**What's Already Working:**
- ✅ Email sending code is complete in `views.py`
- ✅ Email is triggered when admin approves application
- ✅ Email contains UPI ID, UPI Number, and payment details
- ✅ Currently configured for **console output** (testing mode)

**Current Configuration:**
```python
# sewa_portal/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'Digital Sewa <no-reply@example.com>'
```

This means emails are printed to the console/terminal instead of being sent.

---

## 🚀 Email Provider Options

### Option 1: Gmail (Easiest for Testing) ⭐ RECOMMENDED

**Pros:**
- Free
- Easy to setup
- Reliable
- Good for testing and small scale

**Cons:**
- Daily sending limit (500 emails/day)
- Requires app-specific password
- May be marked as spam

**Setup:**

#### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down → Click **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter name: "Sewa Portal"
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this)

#### Step 2: Update Django Settings

Edit `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/sewa_portal/settings.py`:

```python
# Email Configuration - Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your.email@gmail.com'  # Your Gmail address
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # 16-char app password from step 1
DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@gmail.com>'
```

**Example:**
```python
# Replace these with your actual credentials
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'sewaportal@gmail.com'
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Generated app password
DEFAULT_FROM_EMAIL = 'Sewa Portal <sewaportal@gmail.com>'
```

#### Step 3: Test

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email',
    'This is a test email from Sewa Portal.',
    'sewaportal@gmail.com',
    ['recipient@example.com'],  # Replace with your email
    fail_silently=False,
)
```

If successful, you'll receive the email!

---

### Option 2: SendGrid (Best for Production) ⭐ RECOMMENDED FOR SCALE

**Pros:**
- Free tier: 100 emails/day
- Professional
- High deliverability
- Email analytics
- No spam issues

**Cons:**
- Requires signup
- API key management

**Setup:**

#### Step 1: Create SendGrid Account

1. Go to: https://signup.sendgrid.com/
2. Sign up (free account)
3. Verify your email
4. Complete onboarding

#### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: "Sewa Portal Django"
4. Permissions: **Full Access** (or Mail Send)
5. Click **Create & View**
6. **Copy the API key** (shown only once!)

#### Step 3: Verify Sender Identity

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: Sewa Portal
   - From Email: noreply@yourdomain.com (or your email)
   - Reply To: support@yourdomain.com
4. Click **Create**
5. Check your email and verify

#### Step 4: Install SendGrid Package

```bash
pip install sendgrid
```

#### Step 5: Update Django Settings

```python
# Email Configuration - SendGrid
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'  # This is literally the string 'apikey'
EMAIL_HOST_PASSWORD = 'SG.xxxxxxxxxxxxxxxxxxxxx'  # Your actual API key
DEFAULT_FROM_EMAIL = 'Sewa Portal <noreply@yourdomain.com>'
```

#### Step 6: Test

Same as Gmail test above.

---

### Option 3: Mailgun (Alternative)

**Pros:**
- Free tier: 5,000 emails/month
- Good deliverability
- Simple API

**Setup:**

1. Sign up: https://www.mailgun.com/
2. Get API credentials from dashboard
3. Update settings:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mailgun.org'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'postmaster@your-domain.mailgun.org'
EMAIL_HOST_PASSWORD = 'your-mailgun-smtp-password'
DEFAULT_FROM_EMAIL = 'Sewa Portal <noreply@your-domain.mailgun.org>'
```

---

### Option 4: Outlook/Hotmail

**Setup:**

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp-mail.outlook.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your.email@outlook.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@outlook.com>'
```

---

### Option 5: Yahoo Mail

**Setup:**

1. Generate app password: https://login.yahoo.com/account/security
2. Update settings:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.mail.yahoo.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your.email@yahoo.com'
EMAIL_HOST_PASSWORD = 'generated-app-password'
DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@yahoo.com>'
```

---

## 🔒 Security Best Practices

### Method 1: Environment Variables (RECOMMENDED)

Never hardcode passwords in settings.py!

#### Step 1: Install python-decouple

```bash
pip install python-decouple
```

#### Step 2: Create `.env` file

Create `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/.env`:

```env
# Email Configuration
EMAIL_HOST_USER=sewaportal@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
DEFAULT_FROM_EMAIL=Sewa Portal <sewaportal@gmail.com>
```

#### Step 3: Update settings.py

```python
from decouple import config

# Email Configuration - Using Environment Variables
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL')
```

#### Step 4: Add .env to .gitignore

```bash
echo ".env" >> .gitignore
```

---

## 🧪 Testing Email Feature

### Test 1: Django Shell Test

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python manage.py shell
```

```python
from django.core.mail import send_mail

# Send test email
send_mail(
    subject='Test Email from Sewa Portal',
    message='Hello! This is a test email. If you receive this, email is working!',
    from_email=None,  # Will use DEFAULT_FROM_EMAIL
    recipient_list=['your.email@example.com'],
    fail_silently=False,
)
print("Email sent successfully!")
```

### Test 2: Approve Application Test

1. Start Django server:
   ```bash
   python manage.py runserver
   ```

2. Make sure user has email in database:
   ```bash
   python manage.py shell
   ```
   ```python
   from core.models import User
   user = User.objects.get(username='testuser')
   user.email = 'testuser@example.com'  # Add valid email
   user.save()
   ```

3. Go to admin panel: http://localhost:8000/admin/
4. Find an application
5. Approve it
6. Check recipient's email inbox!

### Test 3: Check Email Logs

If using console backend (testing):
```bash
# Terminal where you ran 'python manage.py runserver' will show:
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: Application Approved - Payment Required
From: Sewa Portal <noreply@example.com>
To: user@example.com

Hello User Name,
...email content...
```

---

## 📨 Email Templates

The current email in `views.py` is plain text. Here's how to improve it:

### Current Email (Plain Text)

```python
email_body = f"""Hello {app.user.full_name},

Your application for {app.service.service_name} has been APPROVED! 🎉

PAYMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount to Pay: NPR {payment.amount}
Payment Method: {payment.payment_method}

📱 UPI ID: {payment_settings.upi_id}
📞 UPI Number: {payment_settings.upi_number}

After completing the payment, please reply with the transaction ID.

Thank you!
Sewa Portal
"""
```

### Enhanced HTML Email (Optional)

To send HTML emails, update the code in `views.py`:

```python
from django.core.mail import EmailMultiAlternatives

# After building email_body...

# Create email with HTML
subject = f"✅ Application Approved - Payment Required for {app.service.service_name}"
text_content = email_body  # Plain text version
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 20px; }}
        .payment-box {{ background: white; border-left: 4px solid #667eea; 
                        padding: 15px; margin: 15px 0; }}
        .upi-info {{ background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }}
        .footer {{ background: #333; color: white; padding: 15px; text-align: center; 
                   border-radius: 0 0 10px 10px; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; 
                   text-decoration: none; border-radius: 5px; display: inline-block; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Application Approved!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{app.user.full_name}</strong>,</p>
            <p>Great news! Your application for <strong>{app.service.service_name}</strong> has been approved!</p>
            
            <div class="payment-box">
                <h3>💰 Payment Details</h3>
                <p><strong>Amount to Pay:</strong> NPR {payment.amount}</p>
                <p><strong>Application ID:</strong> #{app.application_id}</p>
            </div>
            
            <div class="upi-info">
                <h4>📱 UPI Payment Information</h4>
                <p><strong>UPI ID:</strong> {payment_settings.upi_id or 'Not Available'}</p>
                <p><strong>UPI Number:</strong> {payment_settings.upi_number or 'Not Available'}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Make payment using UPI ID or scan QR code in portal</li>
                <li>Save your transaction ID</li>
                <li>Your service will be processed after payment verification</li>
            </ol>
            
            <center>
                <a href="http://localhost:5173/applications" class="button">
                    View in Portal
                </a>
            </center>
        </div>
        <div class="footer">
            <p>Sewa Portal - Digital Government Services</p>
            <p>For support: support@sewaportal.gov.np</p>
        </div>
    </div>
</body>
</html>
"""

# Send email with both plain text and HTML versions
email = EmailMultiAlternatives(subject, text_content, None, [app.user.email])
email.attach_alternative(html_content, "text/html")
email.send()
```

---

## 🐛 Troubleshooting

### Issue 1: "SMTPAuthenticationError"

**Problem:** Wrong username or password

**Solutions:**
- Gmail: Use App Password, not regular password
- Check 2-Step Verification is enabled
- Verify credentials are correct
- Try regenerating app password

### Issue 2: "Connection refused" or "Timeout"

**Problem:** Firewall or network issue

**Solutions:**
```python
# Try alternate ports
EMAIL_PORT = 465
EMAIL_USE_SSL = True  # Instead of TLS
EMAIL_USE_TLS = False
```

### Issue 3: Emails go to spam

**Solutions:**
- Use verified sender email
- Use professional email provider (SendGrid, Mailgun)
- Add SPF, DKIM records to your domain
- Don't use words like "free", "urgent" in subject
- Include unsubscribe link

### Issue 4: "Connection timed out"

**Problem:** Your ISP blocks SMTP ports

**Solutions:**
- Use VPN
- Use cloud hosting (PythonAnywhere, Heroku)
- Use email API instead of SMTP (SendGrid API)

### Issue 5: No error but email not received

**Problem:** Silent failure or wrong recipient

**Solutions:**
```python
# Check user has email
python manage.py shell
>>> from core.models import User
>>> user = User.objects.get(username='testuser')
>>> print(user.email)  # Should not be empty
>>> user.email = 'correct@email.com'
>>> user.save()
```

---

## 📊 Email Monitoring

### Console Backend (Development)

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Emails are printed to terminal. Good for testing.

### File Backend (Testing)

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = os.path.join(BASE_DIR, 'sent_emails')
```

Emails saved to files. Good for debugging.

### SMTP Backend (Production)

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
```

Real emails sent.

---

## 🎯 Complete Setup Example (Gmail)

Here's a complete, working example:

### Step 1: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Generate password for "Sewa Portal"
3. Copy the 16-character code: `abcd efgh ijkl mnop`

### Step 2: Update settings.py

Replace the email section in `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/sewa_portal/settings.py`:

```python
# Email Configuration - Gmail SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your.email@gmail.com'  # Your Gmail
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Your 16-char app password
DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@gmail.com>'

# Optional: Email timeout
EMAIL_TIMEOUT = 10
```

### Step 3: Restart Django Server

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python manage.py runserver
```

### Step 4: Test

1. Create user with valid email
2. User applies for service
3. Admin approves application
4. User receives email! 📧

---

## 📚 Quick Reference

### Gmail Configuration
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your@gmail.com'
EMAIL_HOST_PASSWORD = 'app-specific-password'
DEFAULT_FROM_EMAIL = 'Sewa Portal <your@gmail.com>'
```

### SendGrid Configuration
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = 'SG.your-api-key'
DEFAULT_FROM_EMAIL = 'Sewa Portal <noreply@yourdomain.com>'
```

### Testing (Console Output)
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### Testing Command
```bash
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Testing', None, ['test@example.com'])
```

---

## 🚀 Deployment Recommendations

### Development:
- Use console backend or Gmail

### Production:
- Use SendGrid or Mailgun
- Use environment variables for credentials
- Enable email logging
- Set up error notifications
- Use domain email (@yourdomain.com)
- Configure SPF/DKIM records

---

## ✅ Summary

### To Enable Email Right Now (Gmail - Fastest):

1. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate password
   - Copy 16-character code

2. **Edit settings.py:**
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'smtp.gmail.com'
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = 'your.email@gmail.com'
   EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # Paste app password
   DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@gmail.com>'
   ```

3. **Restart server:**
   ```bash
   python manage.py runserver
   ```

4. **Test:**
   - Approve an application
   - Check email inbox!

**That's it! Emails will now be sent automatically when applications are approved! 📧✅**

---

## 📞 Need Help?

Common commands:
```bash
# Test email in shell
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Message', None, ['recipient@example.com'])

# Check Django mail settings
python manage.py shell
>>> from django.conf import settings
>>> print(settings.EMAIL_HOST)
>>> print(settings.EMAIL_HOST_USER)

# View user emails
python manage.py shell
>>> from core.models import User
>>> for u in User.objects.all():
...     print(f"{u.username}: {u.email}")
```

Your email system is ready! Just add your email credentials to `settings.py` and it will work! 🎉
