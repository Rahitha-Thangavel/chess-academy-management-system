import os
import sys
import django
from django.core.exceptions import ValidationError

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")
django.setup()

from apps.users.validators import ComplexPasswordValidator

def test_validator():
    validator = ComplexPasswordValidator()
    
    test_cases = [
        ("weak", "password_no_upper"),
        ("WEAK", "password_no_lower"),
        ("WeakPassword", "password_no_symbol"),
        ("WeakPassword1", "password_no_symbol"),
        ("Strong@Password1", None),
    ]

    print("Running Password Validator Tests...\n")
    all_passed = True
    
    for password, expected_error in test_cases:
        try:
            validator.validate(password)
            if expected_error:
                print(f"[FAIL] '{password}' should have failed with {expected_error}, but passed.")
                all_passed = False
            else:
                print(f"[PASS] '{password}' passed as expected.")
        except ValidationError as e:
            if expected_error:
                if e.code == expected_error:
                    print(f"[PASS] '{password}' failed as expected with {e.code}.")
                else:
                    print(f"[FAIL] '{password}' failed with {e.code}, expected {expected_error}.")
                    all_passed = False
            else:
                print(f"[FAIL] '{password}' should have passed, but failed with {e.code}: {e.messages}")
                all_passed = False

    if all_passed:
        print("\nAll tests passed successfully!")
    else:
        print("\nSome tests failed.")

if __name__ == "__main__":
    test_validator()
