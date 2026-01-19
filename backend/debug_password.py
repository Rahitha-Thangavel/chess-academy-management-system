import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
import inspect

print("=== DEBUGGING PASSWORD ISSUE ===")

# 1. First check the create_user method signature
print("\n1. Checking create_user method signature:")
print(inspect.getsource(User.objects.create_user))

# 2. Test direct call
print("\n2. Testing direct create_user call:")
try:
    User.objects.filter(email="debug1@example.com").delete()
    
    user = User.objects.create_user(
        email="debug1@example.com",
        password="TestPassword123",  # Explicitly pass password
        first_name="Debug",
        last_name="One",
        role="PARENT"
    )
    
    print(f"User created: {user.email}")
    print(f"Password in DB: {'SET' if user.password else 'EMPTY'}")
    if user.password:
        print(f"Password hash: {user.password[:50]}...")
        print(f"Check password works: {user.check_password('TestPassword123')}")
    else:
        print("ERROR: Password is empty!")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

# 3. Check if AbstractUser is interfering
print("\n3. Checking User model inheritance:")
print(f"User MRO: {[cls.__name__ for cls in User.__mro__]}")

# 4. Check what happens if we create user manually
print("\n4. Testing manual user creation:")
try:
    User.objects.filter(email="debug2@example.com").delete()
    
    user = User(
        email="debug2@example.com",
        first_name="Debug",
        last_name="Two",
        role="PARENT",
        is_active=True
    )
    user.set_password("ManualPassword123")
    user.save()
    
    print(f"User created manually: {user.email}")
    print(f"Password: {'SET' if user.password else 'EMPTY'}")
    print(f"Check password: {user.check_password('ManualPassword123')}")
    
except Exception as e:
    print(f"Error: {e}")