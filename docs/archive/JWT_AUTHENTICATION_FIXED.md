# JWT Authentication Fix - Complete ✅

## Problem Summary
The JWT authentication was failing with:
```
AttributeError: 'User' object has no attribute 'id'
```

**Root Cause:** The User model uses `user_id` as the primary key (AutoField), but SimpleJWT by default expects an `id` field.

## Solution Applied

### 1. **User Model Update** (`core/models.py`)
Added a property to provide backward compatibility:

```python
class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True, editable=False)
    # ... other fields
    
    @property
    def id(self):
        """Alias for user_id to maintain compatibility with Django and JWT"""
        return self.user_id
```

### 2. **SimpleJWT Configuration** (`sewa_portal/settings.py`)
Added configuration to tell SimpleJWT to use `user_id`:

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'USER_ID_FIELD': 'user_id',  # Tell JWT to use user_id instead of id
    'USER_ID_CLAIM': 'user_id',  # JWT token will contain user_id claim
}
```

## Testing Results

### ✅ Backend Tests (All Passing)

#### 1. Registration Test
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username":"finaltest1","password":"test123","full_name":"Final Test User","email":"final@test.com","phone_number":"9876543210"}'
```
**Response:** User created successfully with `user_id: 5`

#### 2. Login Test
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"finaltest1","password":"test123"}'
```
**Response:** 
```json
{
  "refresh": "eyJhbGci...",
  "access": "eyJhbGci..."
}
```
JWT tokens contain `"user_id": "5"` claim ✅

### Token Verification
Decoded JWT payload shows:
```json
{
  "token_type": "access",
  "exp": 1760363994,
  "iat": 1760277594,
  "jti": "e95df3e5c58842...",
  "user_id": "5"  ← Custom claim working!
}
```

## Server Status

### Backend (Django)
- **URL:** http://localhost:8000
- **Status:** ✅ Running (PID: 65393)
- **Log:** `/tmp/django_jwt_test.log`

### Frontend (Vite + React)
- **URL:** http://localhost:5173
- **Status:** ✅ Running (PIDs: 4321, 62741)

## API Endpoints

### Authentication
- `POST /api/token/` - Login (get access + refresh tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/users/` - Register new user (public access)

### Required Fields for Registration
```json
{
  "username": "string (unique)",
  "password": "string (min 6 chars)",
  "full_name": "string",
  "email": "string (optional)",
  "phone_number": "string (required)"
}
```

## Frontend Configuration

The frontend is already correctly configured:

### `authService.js`
- Uses `/api/token/` for login ✅
- Uses `/api/users/` for registration ✅
- Stores JWT tokens in localStorage ✅
- Decodes `user_id` from JWT token ✅

### `Register.jsx`
- Uses `phone_number` field (correct) ✅
- Includes validation ✅
- Error handling implemented ✅

## What Changed

### Files Modified:
1. `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/core/models.py`
   - Added `@property id()` method to User model

2. `/home/rohan/Desktop/projects/CGJBCSC/sewa_portal/sewa_portal/settings.py`
   - Added `SIMPLE_JWT` configuration dictionary

### No Migration Needed
- No database schema changes
- Only added Python property (computed field)
- SimpleJWT configuration is settings-only

## How It Works

1. **User Registers** → POST `/api/users/`
   - Creates User with `user_id` as primary key
   - Password hashed via `set_password()`

2. **User Logs In** → POST `/api/token/`
   - SimpleJWT looks for `USER_ID_FIELD = 'user_id'`
   - Accesses `user.user_id` directly
   - Also can use `user.id` (property alias)
   - Generates JWT with `user_id` claim

3. **Frontend Uses Token**
   - Stores in `localStorage.accessToken`
   - Decodes to get `user_id`
   - Sends in `Authorization: Bearer <token>` header

4. **Protected Endpoints**
   - Django validates JWT token
   - Extracts `user_id` claim
   - Loads User object via `user_id` field

## Testing the Full Flow

### Frontend Test (Manual)
1. Open http://localhost:5173
2. Click "Register" / Go to `/register`
3. Fill form:
   - Username: `testuser123`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `9876543210`
   - Password: `test123`
4. Submit → Should redirect to login
5. Login with same credentials
6. Should redirect to `/dashboard`

### Expected Behavior
- ✅ Registration succeeds
- ✅ Login returns JWT tokens
- ✅ Dashboard loads user data
- ✅ Protected routes accessible
- ✅ Logout clears tokens

## Key Takeaways

### Why Two Approaches?
1. **Property alias (`@property id`)**: 
   - Provides backward compatibility
   - Allows Django admin and other tools to work
   - Minimal code change

2. **SimpleJWT Config (`USER_ID_FIELD`)**: 
   - Explicitly tells SimpleJWT what field to use
   - Proper configuration approach
   - Recommended by SimpleJWT docs

### Both Are Needed Because:
- SimpleJWT needs to know the field name: `USER_ID_FIELD = 'user_id'`
- Other Django components may expect `.id` property
- Property provides seamless compatibility layer

## Maintenance Notes

### If You Add More Models
If you create more models with custom primary keys (not `id`):
- Add `@property id()` if Django expects it
- Or ensure all references use actual field name

### If You Change Primary Key
If you decide to rename `user_id` to something else:
1. Update `USER_ID_FIELD` in settings
2. Update `USER_ID_CLAIM` in settings
3. Update property if needed
4. Update frontend to decode correct claim
5. Run migration if schema changes

## Success! 🎉

All authentication issues resolved:
- ✅ JWT token generation working
- ✅ Login endpoint functional
- ✅ Registration endpoint functional
- ✅ Tokens contain custom `user_id` claim
- ✅ Frontend correctly configured
- ✅ Both servers running

**You can now use the full application!**
