// DOM Elements
const passwordInput = document.getElementById('password');
const toggleVisibilityBtn = document.getElementById('toggle-visibility');
const checkButton = document.getElementById('check-button');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const feedbackList = document.getElementById('feedback-list');
const resultsContainer = document.getElementById('results');
const themeButton = document.getElementById('theme-button');

// Theme toggling
function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Change the icon based on theme
    const themeIcon = themeButton.querySelector('i');
    if (newTheme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
}

// Check for saved theme preference
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Set correct icon
        const themeIcon = themeButton.querySelector('i');
        if (savedTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    // Change icon based on visibility
    const visibilityIcon = toggleVisibilityBtn.querySelector('i');
    if (type === 'text') {
        visibilityIcon.className = 'fas fa-eye-slash';
    } else {
        visibilityIcon.className = 'fas fa-eye';
    }
}

// Prevent spaces in password
function preventSpaces(event) {
    if (event.key === ' ') {
        event.preventDefault();
        
        // Show brief animation/feedback
        passwordInput.classList.add('shake');
        setTimeout(() => {
            passwordInput.classList.remove('shake');
        }, 500);
    }
}

// Update strength meter UI
function updateStrengthMeter(strength) {
    let width, color;
    
    switch(strength) {
        case 0: // Empty
            width = '0%';
            color = '#e9ecef';
            strengthText.textContent = 'Enter a password';
            break;
        case 1: // Weak
            width = '33%';
            color = 'var(--meter-weak)';
            strengthText.textContent = 'Weak';
            break;
        case 2: // Medium
            width = '66%';
            color = 'var(--meter-medium)';
            strengthText.textContent = 'Medium';
            break;
        case 3: // Strong
            width = '100%';
            color = 'var(--meter-strong)';
            strengthText.textContent = 'Strong';
            break;
    }
    
    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    
    // Add animation
    strengthBar.classList.add('pulse');
    setTimeout(() => {
        strengthBar.classList.remove('pulse');
    }, 500);
}

// Update feedback list
function updateFeedback(feedback) {
    feedbackList.innerHTML = '';
    
    feedback.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        
        // Style based on feedback type
        if (item.startsWith('Missing') || item.startsWith('Too short') || 
            item.startsWith('Contains spaces') || item.startsWith('WARNING')) {
            li.classList.add('negative');
        } else if (item.startsWith('Good') || item.startsWith('Has')) {
            li.classList.add('positive');
        }
        
        feedbackList.appendChild(li);
    });
}

// Check password strength via API
async function checkPasswordStrength() {
    const password = passwordInput.value;
    
    try {
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Update UI with results
        updateStrengthMeter(data.strength);
        updateFeedback(data.feedback);
        
        // Display detailed results
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <h3>Password Analysis:</h3>
            <p><strong>Strength:</strong> ${data.level}</p>
            <p><strong>Found in breaches:</strong> ${data.leaked ? 'Yes (not secure)' : 'No'}</p>
        `;
        
        // Add additional styling based on result
        if (data.leaked) {
            resultsContainer.style.borderLeft = '4px solid var(--meter-weak)';
        } else if (data.strength === 3) {
            resultsContainer.style.borderLeft = '4px solid var(--meter-strong)';
        } else {
            resultsContainer.style.borderLeft = '4px solid var(--meter-medium)';
        }
        
    } catch (error) {
        console.error('Error:', error);
        feedbackList.innerHTML = '<li class="negative">Error checking password strength</li>';
    }
}

// Real-time strength checking as user types
async function checkPasswordOnType() {
    // Only check if there's at least 1 character
    if (passwordInput.value.length > 0) {
        await checkPasswordStrength();
    } else {
        // Reset for empty input
        updateStrengthMeter(0);
        feedbackList.innerHTML = '';
        resultsContainer.style.display = 'none';
    }
}

// Initialize
function init() {
    // Load saved theme
    loadSavedTheme();
    
    // Event listeners
    themeButton.addEventListener('click', toggleTheme);
    toggleVisibilityBtn.addEventListener('click', togglePasswordVisibility);
    passwordInput.addEventListener('keydown', preventSpaces);
    checkButton.addEventListener('click', checkPasswordStrength);
    
    // Debounced input handler for real-time feedback
    let typingTimer;
    const doneTypingInterval = 500; // ms
    
    passwordInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(checkPasswordOnType, doneTypingInterval);
    });
    
    passwordInput.addEventListener('keydown', () => {
        clearTimeout(typingTimer);
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);