from flask import Flask, render_template, jsonify, request
from models import db, Streak, JournalEntry
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nofap.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'super_secret_key_for_dev'

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/streak', methods=['GET'])
def get_streak():
    streak = Streak.query.filter_by(is_active=True).first()
    if not streak:
        # Create a default new streak if none exists
        streak = Streak()
        db.session.add(streak)
        db.session.commit()
    
    # Calculate days dynamically
    delta = datetime.utcnow() - streak.start_date
    streak.current_streak_days = delta.days
    db.session.commit()
    
    return jsonify(streak.to_dict())

@app.route('/api/start', methods=['POST'])
def start_streak():
    # Reset or Start
    # Deactivate old active streaks
    old_streaks = Streak.query.filter_by(is_active=True).all()
    for s in old_streaks:
        s.is_active = False
        s.end_date = datetime.utcnow() # Assuming we add end_date to model or just use is_active
    
    new_streak = Streak(start_date=datetime.utcnow(), is_active=True)
    db.session.add(new_streak)
    db.session.commit()
    return jsonify(new_streak.to_dict())

@app.route('/api/journal', methods=['GET', 'POST'])
def journal():
    if request.method == 'POST':
        data = request.json
        entry = JournalEntry(
            mood=data.get('mood'),
            note=data.get('note')
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify(entry.to_dict())
    else:
        entries = JournalEntry.query.order_by(JournalEntry.date.desc()).all()
        return jsonify([e.to_dict() for e in entries])

@app.route('/api/journal/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    entry = JournalEntry.query.get_or_404(entry_id)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Entry deleted'})

@app.route('/api/history', methods=['GET'])
def history():
    # Return past streaks (inactive ones)
    streaks = Streak.query.filter_by(is_active=False).order_by(Streak.start_date.desc()).all()
    return jsonify([s.to_dict() for s in streaks])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
