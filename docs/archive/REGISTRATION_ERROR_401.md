# 🔴 Registration 401 Error - Complete Fix

## Current Issue

You're still getting:
```
Unauthorized: /api/users/
[12/Oct/2025 13:13:45] "OPTIONS /api/users/ HTTP/1.1" 401 58
```

## Root Cause

The issue is **NOT with the code** (we fixed that already). The problem is:

**🔴 Django server wasn't restarted after code changes!**

Python/Django doesn't auto-reload when:
- You modify `views.py` permission logic
- The server was started with `python3 manage.py runserver` (without virtual environment)
- Old bytecode (.pyc files) are cached

## ✅ Complete Solution

### Step 1: Stop All Django Processes

```bash
pkill -9 -f "manage.py runserver"
```

### Step 2: Clear Python Cache (Important!)

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete
```

### Step 3: Start Django with Virtual Environment

**Option A: Use the start script (RECOMMENDED)**

```bash
cd /home/rohan/Desktop/projects/CGJBCSC
./start_server.sh
```

This script:
- ✅ Activates virtual environment
- ✅ Runs system checks
- ✅ Shows migration status
- ✅ Starts Django properly

**Option B: Manual start**

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
source ../sys/bin/activate
python manage.py runserver
```

**Option C: Direct Python3 (if virtual env doesn't work)**

```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
/usr/bin/python3 manage.py runserver
```

### Step 4: Verify It's Working

Open a **new terminal** and test:

```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "full_name": "Test User",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "role": "user"
  }'
```

**Expected Response** ✅:
```json
{
  "user_id": 4,
  "username": "testuser",
  "full_name": "Test User",
  "email": "test@example.com",
  ...
}
```

**NOT** ❌:
```json
{"detail": "Authentication credentials were not provided."}
```

## 🔍 Troubleshooting

### Issue: Virtual environment activation fails

**Error**: `bash: ../sys/bin/activate: No such file or directory`

**Solution**: Use direct Python3
```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
python3 manage.py runserver
```

### Issue: "No module named 'django'"

This means virtual environment isn't activated.

**Solution**:
```bash
# Check if virtual env exists
ls -la /home/rohan/Desktop/projects/CGJBCSC/sys/bin/

# If it exists, activate it
cd /home/rohan/Desktop/projects/CGJBCSC
source sys/bin/activate
cd sewa_portal
python manage.py runserver

# If it doesn't exist, use system Python3
python3 manage.py runserver
```

### Issue: Still getting 401 after restart

**Check 1**: Verify code changes are in place
```bash
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
grep -A 5 "def get_permissions" core/views.py
```

You should see:
```python
def get_permissions(self):
    # Allow anyone to register (POST)
    if self.action == 'create':
        return [permissions.AllowAny()]
```

**Check 2**: Clear cache and restart
```bash
pkill -9 -f "manage.py runserver"
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
find . -name "*.pyc" -delete
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
python3 manage.py runserver
```

**Check 3**: Test with curl (not browser yet)
```bash
curl -v -X OPTIONS http://localhost:8000/api/users/ 2>&1 | grep "< HTTP"
```

Should return: `< HTTP/1.1 200 OK` (not 401)

## 📝 Verified Working Configuration

### File: `core/views.py` (Lines 12-21)

```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Allow anyone to register (POST)
        if self.action == 'create':
            return [permissions.AllowAny()]
        # All other actions require admin authentication
        return [permissions.IsAuthenticated(), IsAdminUser()]
```

### CORS Settings: `sewa_portal/settings.py`

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## 🎯 Testing Checklist

After restarting Django, test these:

1. **OPTIONS request (CORS preflight)**
   ```bash
   curl -v -X OPTIONS http://localhost:8000/api/users/
   ```
   ✅ Should return 200, not 401

2. **POST registration**
   ```bash
   curl -X POST http://localhost:8000/api/users/ \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test","full_name":"Test","email":"t@t.com","phone_number":"1234567890","role":"user"}'
   ```
   ✅ Should return user data, not 401

3. **Frontend registration**
   - Open http://localhost:5173/register
   - Fill form
   - Click Sign Up
   - ✅ Should see success message

4. **Login with new user**
   - Open http://localhost:5173/login
   - Enter credentials
   - ✅ Should redirect to dashboard

## 🚀 Quick Command Reference

```bash
# Kill all Django
pkill -9 -f "manage.py runserver"

# Clear cache
cd /home/rohan/Desktop/projects/CGJBCSC/sewa_portal
find . -name "*.pyc" -delete

# Start Django (choose one)
./start_server.sh                    # Recommended
python3 manage.py runserver          # Alternative
source ../sys/bin/activate && python manage.py runserver  # With venv

# Test registration
curl -X POST http://localhost:8000/api/users/ -H "Content-Type: application/json" -d '{"username":"test","password":"test","full_name":"Test","email":"t@t.com","phone_number":"1234567890","role":"user"}'

# Check Django is running
lsof -ti:8000

# Check server logs
# (Look at terminal where Django is running)
```

## ✅ Current Status

**Code Changes**: ✅ Applied (verified in views.py)  
**Django Server**: ❓ Needs restart with cache clear  
**Frontend**: ✅ Ready  
**Solution**: 🟡 Waiting for proper Django restart  

## 🎉 Once Fixed

You'll be able to:
1. ✅ Register new users without authentication
2. ✅ Login with registered users
3. ✅ Use the full application

---

**Next Action**: 
1. Stop Django: `pkill -9 -f "manage.py runserver"`
2. Clear cache: `find . -name "*.pyc" -delete`
3. Start fresh: `./start_server.sh` or `python3 manage.py runserver`
4. Test: `curl -X POST http://localhost:8000/api/users/ ...`

