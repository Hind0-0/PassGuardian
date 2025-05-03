# 🔐 PassGuardian

**PassGuardian** is a Python-based tool that checks the strength of passwords and determines whether they've been compromised in known data breaches. It's designed to help users ensure they are using secure and unique passwords to protect their online identities.

---

## 🛡️ Features

- ✅ **Password Strength Checker**: Analyzes password complexity (length, character variety, etc.)
- 🔍 **Leak Detection**: Verifies if the password exists in known data breaches (e.g., via HaveIBeenPwned API)
- 📢 **Security Tips**: Provides useful recommendations for improving weak passwords
- 🔒 **Privacy Respecting**: Passwords are never stored or logged

---

## 📦 Installation

Follow these steps to install and run PassGuardian on your system:

```bash
# Clone the repository
git clone https://github.com/Hind0-0/PassGuardian.git

# Navigate to the project directory
cd PassGuardian/

# Install the required dependencies
pip3 install -r requirements.txt
pyhon3 app.py
