
import os
import django
import sys

# Setup Django Environment
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User

def cleanup_users():
    print("--- Cleaning up All Users ---")
    
    count = User.objects.count()
    if count == 0:
        print("No users found to delete.")
        return

    print(f"Found {count} users. Deleting...")
    # Delete all users
    # This will cascade delete profiles, students, etc. if on_delete=CASCADE is set matches
    User.objects.all().delete()
    
    print("All users have been deleted successfully.")
    print("You can now create new accounts and a superuser.")

if __name__ == "__main__":
    cleanup_users()
