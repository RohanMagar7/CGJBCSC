"""
Quick test to check what URLs are being generated for documents
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/home/rohan/Desktop/projects/CGJBCSC/sewa_portal')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sewa_portal.settings')
django.setup()

from core.models import UserDocument
from django.core.files.storage import default_storage

print("=" * 70)
print("DOCUMENT URL TEST")
print("=" * 70)

# Check storage backend
print(f"\n1. Storage Backend: {default_storage.__class__.__name__}")
print(f"   Module: {default_storage.__class__.__module__}")

# Get a document
docs = UserDocument.objects.all()
print(f"\n2. Total Documents: {docs.count()}")

if docs.exists():
    doc = docs.first()
    print(f"\n3. Testing Document ID: {doc.document_id}")
    print(f"   Document Name: {doc.document_name}")
    print(f"   File Path (DB): {doc.file_path.name}")
    
    print(f"\n4. URL Generation Test:")
    try:
        # Test the storage backend url() method directly
        url_from_storage = default_storage.url(doc.file_path.name)
        print(f"   ✓ Storage.url(): {url_from_storage}")
    except Exception as e:
        print(f"   ✗ Storage.url() Error: {e}")
    
    try:
        # Test via the field
        url_from_field = doc.file_path.url
        print(f"   ✓ Field.url: {url_from_field}")
    except Exception as e:
        print(f"   ✗ Field.url Error: {e}")
    
    # Check if file exists in Dropbox
    print(f"\n5. File Existence Check:")
    try:
        exists = default_storage.exists(doc.file_path.name)
        print(f"   File exists in Dropbox: {exists}")
    except Exception as e:
        print(f"   Error checking existence: {e}")
    
    # Try to get the file size
    print(f"\n6. File Size Check:")
    try:
        size = default_storage.size(doc.file_path.name)
        print(f"   File size: {size} bytes")
    except Exception as e:
        print(f"   Error: {e}")

else:
    print("\n   No documents found in database")

print("\n" + "=" * 70)
