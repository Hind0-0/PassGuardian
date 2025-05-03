from flask import Flask, render_template, request, jsonify
import os
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# Path to rockyou.txt (create a smaller version for demo purposes)
ROCKYOU_PATH = os.path.join(os.path.dirname(__file__), 'static', 'data', 'rockyou-sample.txt')

# Create sample rockyou file if not exists
def create_sample_rockyou():
    os.makedirs(os.path.dirname(ROCKYOU_PATH), exist_ok=True)
    
    # If file doesn't exist, create a small sample with common passwords
    if not os.path.exists(ROCKYOU_PATH):
        common_passwords = [
            "password", "123456", "qwerty", "admin", "welcome", 
            "123456789", "12345678", "abc123", "password1", "1234567",
            "12345", "1234567890", "123123", "000000", "iloveyou",
            "1234", "1q2w3e4r", "qwertyuiop", "monkey", "dragon",
            "letmein", "baseball", "trustno1", "sunshine", "master"
        ]
        
        with open(ROCKYOU_PATH, 'w') as f:
            for password in common_passwords:
                f.write(f"{password}\n")

create_sample_rockyou()

def check_password_strength(password):
    """
    Evaluate password strength based on various criteria
    Returns strength level (1-3) and reasons for the evaluation
    """
    strength = 0
    feedback = []
    
    # Check for minimum length
    if len(password) > 8:
        strength += 1
        feedback.append("Good length")
    else:
        feedback.append("Too short (should be >8 characters)")
    
    # Check for uppercase
    if re.search(r'[A-Z]', password):
        strength += 1
        feedback.append("Has uppercase")
    else:
        feedback.append("Missing uppercase letter")
    
    # Check for lowercase
    if re.search(r'[a-z]', password):
        strength += 1
        feedback.append("Has lowercase")
    else:
        feedback.append("Missing lowercase letter")
    
    # Check for special characters
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        strength += 1
        feedback.append("Has special character")
    else:
        feedback.append("Missing special character")
    
    # Check for digits
    if re.search(r'\d', password):
        strength += 1
        feedback.append("Has digit")
    else:
        feedback.append("Consider adding a digit")
    
    # Check for spaces (negative)
    if ' ' in password:
        strength -= 1
        feedback.append("Contains spaces (not recommended)")
    
    # Normalize strength to 1-3 range
    if strength <= 2:
        level = 1  # Weak
    elif strength <= 4:
        level = 2  # Medium
    else:
        level = 3  # Strong
    
    return level, feedback

def is_password_leaked(password):
    """Check if password exists in rockyou.txt"""
    if not password:
        return False
        
    with open(ROCKYOU_PATH, 'r', errors='ignore') as f:
        return password.lower() in (line.strip().lower() for line in f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password', '')
    
    # If password is empty, return neutral result
    if not password:
        return jsonify({
            'strength': 0,
            'feedback': ['Enter a password'],
            'leaked': False,
            'level': 'Empty'
        })
    
    # Check password strength
    strength_level, feedback = check_password_strength(password)
    
    # Check if password is in leaked database
    leaked = is_password_leaked(password)
    if leaked:
        feedback.append("WARNING: This password has been found in data breaches!")
        strength_level = 1  # Force to weak if leaked
    
    # Map strength level to text
    level_text = ['Empty', 'Weak', 'Medium', 'Strong'][strength_level]
    
    return jsonify({
        'strength': strength_level,
        'feedback': feedback,
        'leaked': leaked,
        'level': level_text
    })

if __name__ == '__main__':
    app.run(debug=True)