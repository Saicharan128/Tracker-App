from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    # For a simple local app, we might just use one user or default
    
class Streak(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    current_streak_days = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'start_date': self.start_date.isoformat() + 'Z',
            'current_streak_days': self.current_streak_days,
            'is_active': self.is_active
        }

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    mood = db.Column(db.String(50))
    note = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() + 'Z',
            'mood': self.mood,
            'note': self.note
        }
