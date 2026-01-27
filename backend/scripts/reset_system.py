import os
import glob
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS_DIR = os.path.join(BASE_DIR, 'apps')

def run_command(command):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, cwd=BASE_DIR)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        # Don't exit, try to continue
        
def delete_migrations():
    print("Deleting migration files...")
    for root, dirs, files in os.walk(APPS_DIR):
        if 'migrations' in dirs:
            mig_dir = os.path.join(root, 'migrations')
            for f in os.listdir(mig_dir):
                if f != '__init__.py' and f.endswith('.py') and f != '__pycache__':
                    file_path = os.path.join(mig_dir, f)
                    try:
                        os.remove(file_path)
                        print(f"Deleted: {file_path}")
                    except Exception as e:
                        print(f"Failed to delete {file_path}: {e}")
            
            # Clean pycache
            pycache = os.path.join(mig_dir, '__pycache__')
            if os.path.exists(pycache):
                shutil.rmtree(pycache)

def reset_database():
    print("Resetting Database...")
    # Using mysql command line
    # Credentials from settings (hardcoded here for script simplicity, assume they match)
    # USER: chess_admin, PASS: SecurePass123!
    
    commands = [
        "DROP DATABASE IF EXISTS chess_academy_db;",
        "CREATE DATABASE chess_academy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    ]
    
    sql = "".join(commands)
    # Note: Using -pPASSWORD directly (no space)
    cmd = 'mysql -u chess_admin -pSecurePass123! -e "{}"'.format(sql)
    run_command(cmd)

def main():
    delete_migrations()
    reset_database()
    
    print("Making migrations...")
    run_command("python manage.py makemigrations")
    
    print("Migrating...")
    run_command("python manage.py migrate")
    
    print("Done!")

if __name__ == "__main__":
    main()
