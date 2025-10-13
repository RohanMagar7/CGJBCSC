# Email Setup - Quick Start (5 Minutes) ⚡

## 🎯 Goal
Enable email notifications when admin approves applications.

---

## 🚀 Option 1: Gmail (Easiest - Use This First!)

### Step 1: Get Gmail App Password (2 minutes)

1. Open: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. Click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other"** → Type "Sewa Portal"
5. Click **"Generate"**
6. **COPY the 16-character password** (e.g., `abcd efgh ijkl mnop`)

> ⚠️ **Important:** You need 2-Step Verification enabled. If you don't have it:
> - Go to: https://myaccount.google.com/security
> - Click "2-Step Verification" → Follow setup

### Step 2: Update Django Settings (1 minute)

Open: `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/sewa_portal/settings.py`

Find this line:
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**Replace it with:**
```python
# Email Configuration - Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your.email@gmail.com'          # ← Change this
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'       # ← Paste app password here
DEFAULT_FROM_EMAIL = 'Sewa Portal <your.email@gmail.com>'  # ← Change this
```

**Example:**
```python
# Email Configuration - Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'sewaportal@gmail.com'
EMAIL_HOST_PASSWORD = 'abcd efgh ijkl mnop'  # Your generated password
DEFAULT_FROM_EMAIL = 'Sewa Portal <sewaportal@gmail.com>'
```

### Step 3: Restart Server (30 seconds)

```bash
# Stop the server (Ctrl+C)
# Start again
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python manage.py runserver
```

### Step 4: Test (1 minute)

**Test 1: Send test email**
```bash
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email',
    'If you receive this, email is working!',
    None,
    ['your.personal.email@gmail.com'],  # Your email to receive test
)
```

Type `exit()` to exit shell.

**Test 2: Approve application**
1. Go to admin panel: http://localhost:8000/admin/
2. Find a user application
3. Make sure user has email address in their profile
4. Approve the application
5. Check email inbox!

---

## ✅ Done!

When admin approves an application, the user will automatically receive an email with:
- ✅ Approval notification
- ✅ Payment amount
- ✅ UPI ID
- ✅ UPI Number
- ✅ Instructions

---

## 🐛 Problems?

### "Authentication failed"
- Make sure you used **App Password**, not your regular Gmail password
- Enable 2-Step Verification first

### "No email received"
- Check user has email in database:
  ```bash
  python manage.py shell
  >>> from core.models import User
  >>> user = User.objects.get(username='testuser')
  >>> print(user.email)  # Should show email
  >>> user.email = 'correct@email.com'  # Add email
  >>> user.save()
  ```

### "Connection timeout"
- Check your internet connection
- Try using port 465 with SSL:
  ```python
  EMAIL_PORT = 465
  EMAIL_USE_SSL = True
  EMAIL_USE_TLS = False
  ```

### Emails go to spam
- This is normal for first few emails
- Mark as "Not Spam" in Gmail
- For production, use SendGrid (see full guide)

---

## 📚 Full Documentation

For advanced setups (SendGrid, Mailgun, HTML emails, etc.):
- See: `EMAIL_SETUP_COMPLETE_GUIDE.md`

---

## 🎉 That's It!

Your email system is now live! Every time admin approves an application, user gets an email with payment details automatically! 📧

**Total time: ~5 minutes**
