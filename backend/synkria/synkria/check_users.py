import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'synkria.settings')
django.setup()

from kria.models import User
from django.contrib.auth import authenticate

# Check users
users = User.objects.all()
print(f"\n=== Total users in database: {users.count()} ===\n")
for user in users:
    print(f"Email: {user.email}")
    print(f"  Name: {user.name}")
    print(f"  Age: {user.age}")
    print(f"  Active: {user.is_active}")
    print()

# If users exist, test authentication
if users.exists():
    print("=== Testing Authentication ===\n")
    first_user = users.first()
    # Try with a test password
    print(f"Testing with user: {first_user.email}")
    print(f"Password hashed: {first_user.password}")
    
    # Test with known password (won't work unless we know it)
    result = authenticate(email=first_user.email, password="testpass123")
    print(f"Auth test (testpass123): {result}")
else:
    print("\n⚠️  No users in database! Create one first with:")
    print("python manage.py create_test_user --email test@example.com --password testpass123")
