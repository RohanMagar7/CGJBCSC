#!/usr/bin/env python
"""
Create test users for debugging and testing
Usage: cd sewa_portal && python ../create_test_users.py
"""
import os
import sys
import django

# Add sewa_portal to path and setup Django
sys.path.insert(0, '/home/rohan/Desktop/projects/CGJBCSC/sewa_portal')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sewa_portal.settings')
django.setup()

from core.models import User

def create_or_update_user(username, password, full_name, email, phone, role='user', is_staff=False):
    """Create or update a user"""
    try:
        user = User.objects.get(username=username)
        print(f"ℹ️  User '{username}' already exists (ID: {user.user_id})")
        # Update password in case it was forgotten
        user.set_password(password)
        user.save()
        print(f"   Password updated for '{username}'")
        return user
    except User.DoesNotExist:
        user = User.objects.create(
            username=username,
            full_name=full_name,
            email=email,
            phone_number=phone,
            role=role,
            is_staff=is_staff,
            is_superuser=(role == 'admin')
        )
        user.set_password(password)
        user.save()
        print(f"✅ Created {role}: {username} / {password} (ID: {user.user_id})")
        return user

def main():
    print("=" * 60)
    print("Creating Test Users for CGJBCSC Sewa Portal")
    print("=" * 60)
    
    # Regular test user
    create_or_update_user(
        username='testuser',
        password='test123',
        full_name='Test User',
        email='test@example.com',
        phone='1234567890',
        role='user'
    )
    
    # Admin user
    create_or_update_user(
        username='admin',
        password='admin123',
        full_name='Admin User',
        email='admin@example.com',
        phone='9876543210',
        role='admin',
        is_staff=True
    )
    
    # Additional test user
    create_or_update_user(
        username='demo',
        password='demo123',
        full_name='Demo User',
        email='demo@example.com',
        phone='5555555555',
        role='user'
    )
    
    print("\n" + "=" * 60)
    print("All Users in Database:")
    print("=" * 60)
    print(f"{'ID':<5} {'Username':<15} {'Full Name':<20} {'Role':<10} {'Email':<25}")
    print("-" * 80)
    
    for user in User.objects.all().order_by('user_id'):
        print(f"{user.user_id:<5} {user.username:<15} {user.full_name:<20} {user.role:<10} {user.email or 'N/A':<25}")
    
    print("\n" + "=" * 60)
    print("Test Credentials:")
    print("=" * 60)
    print("Regular User: testuser / test123")
    print("Admin User:   admin / admin123")
    print("Demo User:    demo / demo123")
    print("\n✅ All users ready for testing!")

if __name__ == '__main__':
    main()
