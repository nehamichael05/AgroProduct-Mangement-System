// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Switch between login and register tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none');
        
        // Add active class to clicked tab
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';
    });
});

// Handle Registration
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    // Validate form
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('fms_users') || '[]');
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
        showAlert('Email already registered!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        email,
        phone,
        address,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    // Add user to localStorage
    users.push(newUser);
    localStorage.setItem('fms_users', JSON.stringify(users));
    
    // Show success message
    showAlert('Registration successful! You can now login.', 'success');
    
    // Reset form and switch to login tab
    registerForm.reset();
    document.querySelector('[data-tab="login"]').click();
});

// Handle Login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('fms_users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showAlert('Invalid email or password!', 'error');
        return;
    }
    
    // Set user session
    const session = {
        userId: user.id,
        name: user.name,
        email: user.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString()
    };
    
    // Store session in localStorage
    localStorage.setItem('fms_current_user', JSON.stringify(session));
    
    // Create initial data structures if they don't exist
    initializeDataStructures(user.id);
    
    // Add login activity
    addActivity(user.id, 'Logged in to the system', 'login');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
});

// Helper Functions
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Add to DOM
    document.querySelector('.auth-container').insertBefore(alertDiv, document.querySelector('.tabs'));
    
    // Remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function initializeDataStructures(userId) {
    // Initialize products if not exists
    if (!localStorage.getItem(`fms_products_${userId}`)) {
        localStorage.setItem(`fms_products_${userId}`, JSON.stringify([]));
    }
    
    // Initialize farming records if not exists
    if (!localStorage.getItem(`fms_records_${userId}`)) {
        localStorage.setItem(`fms_records_${userId}`, JSON.stringify([]));
    }
    
    // Initialize activities if not exists
    if (!localStorage.getItem(`fms_activities_${userId}`)) {
        localStorage.setItem(`fms_activities_${userId}`, JSON.stringify([]));
    }
    
    // Initialize notifications if not exists
    if (!localStorage.getItem(`fms_notifications_${userId}`)) {
        // Create some dummy notifications
        const notifications = [
            {
                id: generateId(),
                title: 'Welcome to Farmer Management System',
                message: 'Thank you for joining our platform. Start by adding your products and farming records.',
                type: 'info',
                isRead: false,
                createdAt: new Date().toISOString()
            },
            {
                id: generateId(),
                title: 'Complete Your Profile',
                message: 'Make sure to complete your profile information for a better experience.',
                type: 'info',
                isRead: false,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(`fms_notifications_${userId}`, JSON.stringify(notifications));
    }
}

function addActivity(userId, description, type) {
    const activities = JSON.parse(localStorage.getItem(`fms_activities_${userId}`) || '[]');
    
    const activity = {
        id: generateId(),
        description,
        type,
        createdAt: new Date().toISOString()
    };
    
    activities.unshift(activity); // Add to beginning of array
    
    // Keep only the latest 20 activities
    if (activities.length > 20) {
        activities.pop();
    }
    
    localStorage.setItem(`fms_activities_${userId}`, JSON.stringify(activities));
}
