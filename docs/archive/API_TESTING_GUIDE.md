# API Testing Guide for Sewa Portal

## Prerequisites
- Server must be running: `./start_server.sh` or `python manage.py runserver`
- Set superuser password: `python manage.py changepassword admin`

---

## 1. Authentication

### Get JWT Token
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token"
  }'
```

**Store the access token for subsequent requests:**
```bash
export TOKEN="your_access_token_here"
```

---

## 2. Services API

### List All Services
```bash
curl http://localhost:8000/api/services/ \
  -H "Authorization: Bearer $TOKEN"
```

### Create Service (Admin only)
```bash
curl -X POST http://localhost:8000/api/services/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Passport Service",
    "description": "Apply for new passport or renewal"
  }'
```

### Get Single Service
```bash
curl http://localhost:8000/api/services/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Update Service (Admin only)
```bash
curl -X PATCH http://localhost:8000/api/services/1/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }'
```

### Delete Service (Admin only)
```bash
curl -X DELETE http://localhost:8000/api/services/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Users API (Admin only)

### List All Users
```bash
curl http://localhost:8000/api/users/ \
  -H "Authorization: Bearer $TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "password": "securepass123",
    "role": "user"
  }'
```

### Get User Details
```bash
curl http://localhost:8000/api/users/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. Applications API

### List My Applications (User sees own, Admin sees all)
```bash
curl http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer $TOKEN"
```

### Create Application
```bash
curl -X POST http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "service": 1,
    "status": "Pending"
  }'
```

### Get Application Details
```bash
curl http://localhost:8000/api/applications/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Update Application Status (Admin only)
```bash
curl -X POST http://localhost:8000/api/applications/1/update_status/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Approved"
  }'
```

### Reject Application (Admin only)
```bash
curl -X POST http://localhost:8000/api/applications/1/update_status/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Rejected",
    "reject_reason": "Incomplete documentation"
  }'
```

---

## 5. Documents API

### Upload Document
```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "application=1" \
  -F "file_path=@/path/to/document.pdf"
```

### List Documents
```bash
curl http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN"
```

### Get Document Details
```bash
curl http://localhost:8000/api/documents/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Document
```bash
curl -X DELETE http://localhost:8000/api/documents/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Final Documents API (Admin uploads)

### Upload Final Document (Admin only)
```bash
curl -X POST http://localhost:8000/api/final_documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "application=1" \
  -F "file_path=@/path/to/final_document.pdf"
```

**Note:** Uploading a final document automatically:
- Changes application status to "Completed"
- Sends email notification to the user

### List Final Documents
```bash
curl http://localhost:8000/api/final_documents/ \
  -H "Authorization: Bearer $TOKEN"
```

### Get Final Document
```bash
curl http://localhost:8000/api/final_documents/1/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. Testing Workflow Example

### Complete Application Flow

```bash
# 1. Get authentication token
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}' \
  | jq -r '.access')

# 2. Create a service
SERVICE_ID=$(curl -s -X POST http://localhost:8000/api/services/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Birth Certificate",
    "description": "Apply for birth certificate"
  }' | jq -r '.service_id')

# 3. Create a user
USER_ID=$(curl -s -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "full_name": "Test User",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "password": "testpass123",
    "role": "user"
  }' | jq -r '.user_id')

# 4. Create application
APP_ID=$(curl -s -X POST http://localhost:8000/api/applications/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user\": $USER_ID,
    \"service\": $SERVICE_ID,
    \"status\": \"Pending\"
  }" | jq -r '.application_id')

# 5. Upload document
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "application=$APP_ID" \
  -F "file_path=@/path/to/id_proof.pdf"

# 6. Approve application
curl -X POST http://localhost:8000/api/applications/$APP_ID/update_status/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'

# 7. Upload final document (completes application)
curl -X POST http://localhost:8000/api/final_documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "application=$APP_ID" \
  -F "file_path=@/path/to/birth_certificate.pdf"

# 8. Check final status
curl http://localhost:8000/api/applications/$APP_ID/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 8. Python Testing (Django Shell)

```bash
python manage.py shell
```

```python
from core.models import User, Service, UserApplication

# Create service
service = Service.objects.create(
    service_name="Driving License",
    description="Apply for driving license"
)

# Create user
user = User.objects.create_user(
    username="testuser2",
    phone_number="9876543210",
    full_name="Test User 2",
    email="test2@example.com",
    password="pass123"
)

# Create application
app = UserApplication.objects.create(
    user=user,
    service=service,
    status="Pending"
)

# Check applications
UserApplication.objects.all()

# Filter by status
UserApplication.objects.filter(status="Pending")

# Get user's applications
UserApplication.objects.filter(user=user)
```

---

## 9. Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "detail": "Authentication credentials were not provided."
}
```
**Solution:** Include Authorization header with valid token

**403 Forbidden**
```json
{
  "detail": "You do not have permission to perform this action."
}
```
**Solution:** Use admin account or access your own resources

**400 Bad Request**
```json
{
  "field_name": ["This field is required."]
}
```
**Solution:** Check request body for missing/invalid fields

---

## 10. Useful Tools

### Install jq (JSON processor)
```bash
sudo apt install jq
```

### Install httpie (Better curl alternative)
```bash
pip install httpie
```

### Using httpie
```bash
# Get token
http POST http://localhost:8000/api/token/ username=admin password=your_password

# List services
http http://localhost:8000/api/services/ "Authorization:Bearer $TOKEN"

# Create service
http POST http://localhost:8000/api/services/ \
  "Authorization:Bearer $TOKEN" \
  service_name="Test" \
  description="Test service"
```

---

## 11. File Upload Requirements

### Accepted File Types
- PDF: `application/pdf`
- JPEG: `image/jpeg`
- PNG: `image/png`

### File Size Limit
- Maximum: 5 MB

### Validation Errors
```json
{
  "file_path": ["File too large. Max size 5MB."]
}
```

```json
{
  "file_path": ["Unsupported file type. Only PDF, JPEG, PNG allowed."]
}
```

---

## 12. Permissions Summary

### Public Endpoints (No authentication required)
- None (all endpoints require authentication)

### User Endpoints (Authenticated users)
- View own profile
- List services (read-only)
- Create/view own applications
- Upload documents for own applications
- View own final documents

### Admin Endpoints (Admin role required)
- All user endpoints
- Create/update/delete services
- View all users
- View/manage all applications
- Update application status
- Upload final documents

---

## Quick Reference

```bash
# Set environment variables
export API_URL="http://localhost:8000/api"
export TOKEN="your_access_token"

# Common requests
curl $API_URL/services/ -H "Authorization: Bearer $TOKEN"
curl $API_URL/applications/ -H "Authorization: Bearer $TOKEN"
curl $API_URL/documents/ -H "Authorization: Bearer $TOKEN"
```

---

**Note:** Replace `your_password` and file paths with actual values when testing.
