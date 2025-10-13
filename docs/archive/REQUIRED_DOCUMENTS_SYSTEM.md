# Required Documents System - Complete Implementation

## 🎯 Overview
System where admins define required documents for each service, and users must upload those specific documents when applying.

## ✅ What's Been Implemented

### Backend (Django)

1. **Models** (`sewa_portal/core/models.py`):
   - `RequiredDocument` model with fields:
     - `service` (ForeignKey to Service)
     - `document_name` (e.g., "Citizenship Certificate")
     - `description` (instructions for users)
     - `is_mandatory` (required or optional)
   - Updated `UserDocument` model with:
     - `required_document` (link to RequiredDocument)
     - `document_name` (document name)
     - `default="Document"` (for existing records)

2. **Serializers** (`sewa_portal/core/serializers.py`):
   - `RequiredDocumentSerializer`
   - Updated `ServiceSerializer` to include `required_documents`
   - Updated `UserDocumentSerializer` to include document names

3. **Views** (`sewa_portal/core/views.py`):
   - `RequiredDocumentViewSet` with CRUD operations
   - Filter by service ID: `/api/required-documents/?service_id=1`
   - Updated `PaymentViewSet` to allow users to create payments

4. **URLs** (`sewa_portal/core/urls.py`):
   - `/api/required-documents/` endpoint added

5. **Admin** (`sewa_portal/core/admin.py`):
   - Inline admin for managing required documents within service admin
   - Separate RequiredDocument admin page

### Frontend (React)

1. **API Configuration**:
   - Added required documents endpoints in `api.js`
   - Added methods in `apiService.js`:
     - `getRequiredDocuments()`
     - `getRequiredDocumentsByService(serviceId)`
     - `createRequiredDocument(data)`
     - `updateRequiredDocument(id, data)`
     - `deleteRequiredDocument(id)`
   - Updated `uploadDocument()` to accept document name and required doc ID

2. **Admin Pages**:
   - **AdminRequiredDocuments.jsx** (`/admin/required-documents`):
     - View all required documents for all services
     - Create new required documents
     - Edit existing required documents
     - Delete required documents
     - Mark documents as mandatory or optional
     - Add descriptions/instructions

3. **User Pages**:
   - **Services.jsx** - Updated application wizard:
     - **Step 1**: Service overview (unchanged)
     - **Step 2**: Shows list of required documents
       - Each document has its own upload button
       - Shows "Required" or "Optional" badge
       - Shows description/instructions
       - Visual indication when uploaded (green border)
       - Validates all mandatory documents are uploaded
     - **Step 3**: Confirmation shows uploaded documents list

4. **Navigation**:
   - Added "Required Documents" link to admin navigation
   - Route: `/admin/required-documents`

## 📋 How It Works

### Admin Workflow:

1. Admin goes to **Services** page and creates a service (e.g., "Birth Certificate")
2. Admin goes to **Required Documents** page
3. Admin clicks "Add Required Document"
4. Admin fills in:
   - Service: "Birth Certificate"
   - Document Name: "Citizenship Certificate"
   - Description: "Copy of your citizenship certificate (both sides)"
   - Mandatory: ✓ Yes
5. Admin repeats for all required documents:
   - "Photo" (3.5x4.5 cm passport size)
   - "Signature" (on white paper)
   - etc.

### User Workflow:

1. User browses services and clicks "Apply Now"
2. **Step 1**: User sees service details
3. **Step 2**: User sees list of required documents:
   ```
   ┌─ Citizenship Certificate [Required] ─────────────┐
   │ Copy of your citizenship certificate (both sides) │
   │ [Choose File] ────────────────────────────────── │
   └──────────────────────────────────────────────────┘
   
   ┌─ Passport Photo [Required] ──────────────────────┐
   │ 3.5x4.5 cm passport size photo                    │
   │ [Choose File] ────────────────────────────────── │
   └──────────────────────────────────────────────────┘
   
   ┌─ Signature [Optional] ───────────────────────────┐
   │ Your signature on white paper                     │
   │ [Choose File] ────────────────────────────────── │
   └──────────────────────────────────────────────────┘
   ```
4. User uploads each document individually
5. System validates all mandatory documents are uploaded
6. **Step 3**: User confirms and submits
7. Documents are uploaded with proper names and links

## 🚀 Testing Steps

### 1. Test Admin Document Management:

```bash
# Start servers
cd sewa_portal && python manage.py runserver
cd frontend && npm run dev
```

1. Login as admin
2. Go to "Required Documents" in navigation
3. Click "Add Required Document"
4. Select a service
5. Add document name: "Citizenship Certificate"
6. Add description: "Copy of citizenship (both sides)"
7. Check "Mandatory"
8. Click "Create"
9. Verify it appears in the table

### 2. Test User Application with Required Documents:

1. Logout and login as regular user
2. Go to "Services"
3. Click "Apply Now" on a service
4. In Step 2, verify you see the list of required documents
5. Upload a file for each required document
6. Verify you cannot proceed without uploading mandatory documents
7. Verify optional documents can be skipped
8. In Step 3, verify all uploaded documents are listed
9. Submit application
10. Verify application created successfully

### 3. Test Backend API:

```bash
# Get all required documents
curl http://localhost:8000/api/required-documents/

# Get required documents for service ID 1
curl http://localhost:8000/api/required-documents/?service_id=1

# Get service with required documents
curl http://localhost:8000/api/services/1/
```

## 📝 Database Changes

**Migration Created**: `0006_requireddocument_userdocument_required_document_and_more`

**To apply**:
```bash
cd sewa_portal
python manage.py migrate
```

## 🎨 UI Features

### AdminRequiredDocuments Page:
- ✅ Table with service name, document name, description, mandatory status
- ✅ Color-coded chips for mandatory/optional
- ✅ Create/Edit/Delete dialogs
- ✅ Form validation
- ✅ Success/error messages

### Services Page (User):
- ✅ Individual upload buttons for each required document
- ✅ Green border when document uploaded
- ✅ File name and size display
- ✅ Mandatory/Optional badges
- ✅ Description text for guidance
- ✅ Validation before proceeding
- ✅ Confirmation list in Step 3

## 🔐 Permissions

- **Admins**:
  - ✅ Can create/edit/delete required documents
  - ✅ Can view all uploaded documents
  
- **Users**:
  - ✅ Can view required documents for services
  - ✅ Can upload documents for their own applications
  - ✅ Can create payment records
  - ✅ Cannot modify required documents definitions

## 📊 Data Flow

```
Admin Creates Required Document
         ↓
Service includes required_documents array
         ↓
User views service → sees required documents list
         ↓
User uploads each document individually
         ↓
Backend saves with document_name and required_document link
         ↓
Admin reviews application → sees which documents uploaded
         ↓
Admin approves → User pays → Admin uploads final document
```

## ✨ Benefits

1. **Clear Requirements**: Users know exactly what to upload
2. **Validation**: System ensures all mandatory documents provided
3. **Organization**: Documents properly named and categorized
4. **Flexibility**: Admin can easily add/remove required documents
5. **Tracking**: Admin can see which documents were uploaded
6. **Instructions**: Users get guidance through descriptions

## 🎯 Complete!

The required documents system is fully implemented and ready for use!

**Admin URL**: http://localhost:5173/admin/required-documents  
**User Application**: http://localhost:5173/services
