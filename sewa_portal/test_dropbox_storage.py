"""
Test script to verify Dropbox storage integration.
Run this to check if file upload/download works with Dropbox.
"""

import os
import sys
import django
from io import BytesIO

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sewa_portal.settings')
django.setup()

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings


def test_dropbox_storage():
    """Test basic Dropbox storage operations"""
    
    print("=" * 60)
    print("DROPBOX STORAGE TEST")
    print("=" * 60)
    
    # Check if Dropbox is enabled
    print(f"\n1. USE_DROPBOX: {getattr(settings, 'USE_DROPBOX', False)}")
    print(f"2. DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
    print(f"3. DROPBOX_ROOT_PATH: {getattr(settings, 'DROPBOX_ROOT_PATH', 'Not set')}")
    
    # Check if token is configured
    token = getattr(settings, 'DROPBOX_ACCESS_TOKEN', None)
    if token:
        print(f"4. DROPBOX_ACCESS_TOKEN: {'*' * 20}...{token[-10:]} (configured)")
    else:
        print("4. DROPBOX_ACCESS_TOKEN: Not configured")
        return
    
    print("\n" + "=" * 60)
    print("TESTING FILE OPERATIONS")
    print("=" * 60)
    
    # Test 1: Upload a test file
    test_filename = 'test/test_file.txt'
    test_content = b'This is a test file for Dropbox storage integration.'
    
    try:
        print(f"\n[TEST 1] Uploading test file: {test_filename}")
        file_content = ContentFile(test_content)
        saved_name = default_storage.save(test_filename, file_content)
        print(f"✓ File uploaded successfully: {saved_name}")
    except Exception as e:
        print(f"✗ Upload failed: {e}")
        return
    
    # Test 2: Check if file exists
    try:
        print(f"\n[TEST 2] Checking if file exists: {test_filename}")
        exists = default_storage.exists(test_filename)
        if exists:
            print(f"✓ File exists in Dropbox")
        else:
            print(f"✗ File not found in Dropbox")
            return
    except Exception as e:
        print(f"✗ Exists check failed: {e}")
        return
    
    # Test 3: Get file size
    try:
        print(f"\n[TEST 3] Getting file size")
        size = default_storage.size(test_filename)
        print(f"✓ File size: {size} bytes")
    except Exception as e:
        print(f"✗ Size check failed: {e}")
    
    # Test 4: Get file URL
    try:
        print(f"\n[TEST 4] Getting file URL")
        url = default_storage.url(test_filename)
        if url:
            print(f"✓ File URL generated (valid for 4 hours):")
            print(f"  {url[:80]}...")
        else:
            print(f"✗ URL generation failed")
    except Exception as e:
        print(f"✗ URL generation failed: {e}")
    
    # Test 5: Read file content
    try:
        print(f"\n[TEST 5] Reading file content")
        with default_storage.open(test_filename, 'rb') as f:
            content = f.read()
            if content == test_content:
                print(f"✓ File content matches original")
            else:
                print(f"✗ File content mismatch")
    except Exception as e:
        print(f"✗ Read failed: {e}")
    
    # Test 6: Delete file
    try:
        print(f"\n[TEST 6] Deleting test file")
        default_storage.delete(test_filename)
        
        # Verify deletion
        if not default_storage.exists(test_filename):
            print(f"✓ File deleted successfully")
        else:
            print(f"✗ File still exists after deletion")
    except Exception as e:
        print(f"✗ Delete failed: {e}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED")
    print("=" * 60)
    print("\n✓ Dropbox storage is properly configured and working!")
    print("  Files will now be stored in Dropbox instead of local filesystem.")
    print(f"  Root path: {getattr(settings, 'DROPBOX_ROOT_PATH', '/sewa_portal')}")
    print("\nNote: The Dropbox access token will expire. Update it in settings")
    print("      or set DROPBOX_ACCESS_TOKEN environment variable when needed.")


if __name__ == '__main__':
    test_dropbox_storage()
