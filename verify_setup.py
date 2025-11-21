from app import app, db, Streak
import os

def verify():
    print("Verifying setup...")
    
    # Check if database file exists (it might not yet)
    if os.path.exists('nofap.db'):
        print("Database file exists.")
    else:
        print("Database file does not exist yet. Creating...")

    with app.app_context():
        try:
            db.create_all()
            print("Tables created successfully.")
            
            # Check if we can query
            streak = Streak.query.first()
            print(f"Current streak query result: {streak}")
            
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")

if __name__ == "__main__":
    verify()
