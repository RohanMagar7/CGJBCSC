# 🔍 Login Issue Diagnostic Guide

**Issue:** Frontend shows "Login failed. Please check your credentials."  
**Backend Log:** Only shows OPTIONS request, no POST request

---

## ✅ What We Know

1. **Django IS running** - Confirmed on port 8000
2. **Backend API works** - curl test returned JWT tokens successfully
3. **Frontend sends OPTIONS** - CORS preflight succeeds
4. **POST never arrives** - Django doesn't see the actual login request

---

## 🔧 Diagnosis Steps

### Step 1: Test Backend Directly
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**Expected:** JWT tokens returned  
**Status:** ✅ WORKS

### Step 2: Check Browser Console
1. Open http://localhost:5173/login
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Try to login with: testuser / test123
5. Look for error messages

**What to look for:**
- Network errors
- CORS errors
- Console.log output from authService
- Any red error messages

### Step 3: Check Network Tab
1. Browser DevTools → Network tab
2. Try login again
3. Look for `/api/token/` request

**Check:**
- Is there a POST request or only OPTIONS?
- What's the status code?
- What's the response?
- Any error messages?

### Step 4: Test with Simple HTML
Open: http://localhost:5173/test-login.html

Click "Test Login" button

**Expected:** Should show JWT tokens  
**If fails:** Check error message

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Headers Missing

**Symptom:** Browser console shows CORS error

**Fix:** Check Django settings.py
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Issue 2: Wrong API URL

**Symptom:** 404 Not Found

**Check:** frontend/src/config/api.js
```javascript
export const API_BASE_URL = 'http://localhost:8000';
export const API_ENDPOINTS = {
  TOKEN: '/api/token/',  // Should be /api/token/
```

### Issue 3: Axios Timeout

**Symptom:** Request hangs, then times out

**Fix:** Add timeout to axios request
```javascript
const response = await axios.post(url, data, {
  timeout: 10000  // 10 seconds
});
```

### Issue 4: Invalid Credentials

**Symptom:** 401 Unauthorized

**Fix:** Reset test users
```bash
cd sewa_portal
python ../create_test_users.py
```

### Issue 5: Django Not Running

**Symptom:** Connection refused

**Check:**
```bash
curl http://localhost:8000/api/
```

**Fix:**
```bash
cd sewa_portal
/home/rohan/Desktop/projects/CGJBCSC/sys/bin/python manage.py runserver
```

### Issue 6: Browser Caching Old Code

**Symptom:** Changes don't take effect

**Fix:**
1. Hard refresh: Ctrl + Shift + R (Linux/Windows)
2. Clear cache and reload
3. Or restart Vite dev server

### Issue 7: Vite Proxy Not Configured

**Symptom:** API calls fail in development

**Check:** frontend/vite.config.js for proxy settings

---

## 🧪 Testing Checklist

- [ ] Django running on port 8000
  ```bash
  ps aux | grep "manage.py runserver"
  ```

- [ ] Frontend running on port 5173
  ```bash
  lsof -ti:5173
  ```

- [ ] Backend responds to curl
  ```bash
  curl http://localhost:8000/api/
  ```

- [ ] Test user exists
  ```bash
  python create_test_users.py
  ```

- [ ] Browser console shows no errors

- [ ] Network tab shows POST request (not just OPTIONS)

---

## 📋 Debug Commands

### Check Django Status
```bash
# Is Django running?
ps aux | grep "manage.py runserver"

# Is port 8000 open?
lsof -ti:8000

# Test API directly
curl http://localhost:8000/api/token/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### Check Frontend Status
```bash
# Is Vite running?
lsof -ti:5173

# Check for JS errors
# Open browser console and look for red errors
```

### View Logs
```bash
# Django logs (if using startup script)
tail -f /tmp/django_server.log

# Or watch Django console output directly
cd sewa_portal
python manage.py runserver
```

---

## 🔍 What to Check in Browser

### Console Tab
Look for:
```
Attempting login to: http://localhost:8000/api/token/
Login response received: 200
Fetching user profile for ID: 6
User profile received: testuser
```

Or errors:
```
Login error: [error details]
Error response: [API response]
Error status: [HTTP status code]
```

### Network Tab
Find the POST request to `/api/token/`:
- **Status:** Should be 200
- **Response:** Should contain `access` and `refresh` tokens
- **Headers:** Check Content-Type is application/json

---

## ✅ Expected Behavior

### Success Flow:
1. User enters credentials
2. Frontend sends OPTIONS request → 200 OK
3. Frontend sends POST request → 200 OK
4. Backend returns JWT tokens
5. Frontend fetches user profile → 200 OK
6. User redirected to dashboard

### Current Issue:
1. User enters credentials
2. Frontend sends OPTIONS request → 200 OK ✅
3. **POST request never sent** ❌
4. Error: "Login failed. Please check your credentials."

---

## 🎯 Next Steps

1. **Open browser console** and try login
2. **Check what error appears** in console
3. **Share the console output** for further diagnosis

The console.log statements I added will show exactly where the request is failing.

---

## 📞 Quick Test

**Open browser, try this in console:**
```javascript
fetch('http://localhost:8000/api/token/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'testuser', password: 'test123'})
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

This will show if the browser can reach Django directly.

---

**Status:** Waiting for browser console output  
**Last Updated:** October 12, 2025
