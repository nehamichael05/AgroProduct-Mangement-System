// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('fms_current_user') || '{}');
    
    if (!currentUser.isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize dashboard
    initializeDashboard();
});

// Global Variables
let currentUser;
let products = [];
let farmingRecords = [];
let activities = [];
let notifications = [];

// Initialize Dashboard
function initializeDashboard() {
    // Get current user
    currentUser = JSON.parse(localStorage.getItem('fms_current_user'));
    
    // Load user data
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI elements
    updateUI();
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
}

// Load User Data from localStorage
function loadUserData() {
    const userId = currentUser.userId;
    
    // Load products
    products = JSON.parse(localStorage.getItem(`fms_products_${userId}`) || '[]');
    
    // Load farming records
    farmingRecords = JSON.parse(localStorage.getItem(`fms_records_${userId}`) || '[]');
    
    // Load activities
    activities = JSON.parse(localStorage.getItem(`fms_activities_${userId}`) || '[]');
    
    // Load notifications
    notifications = JSON.parse(localStorage.getItem(`fms_notifications_${userId}`) || '[]');
    
    // Load user profile
    const users = JSON.parse(localStorage.getItem('fms_users') || '[]');
    const userProfile = users.find(user => user.id === userId);
    
    if (userProfile) {
        // Update profile fields
        document.getElementById('user-name').textContent = userProfile.name;
        document.getElementById('profile-name').textContent = userProfile.name;
        document.getElementById('profile-email').textContent = userProfile.email;
        document.getElementById('profile-fullname').value = userProfile.name;
        document.getElementById('profile-phone').value = userProfile.phone;
        document.getElementById('profile-address').value = userProfile.address;
    }
}

// Set up Event Listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            document.getElementById(targetSection).classList.add('active');
            
            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });
    
    // Mobile Menu Toggle
    document.getElementById('menu-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Logout Button
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Add logout activity
        addActivity(currentUser.userId, 'Logged out from the system', 'logout');
        
        // Clear current user session
        localStorage.removeItem('fms_current_user');
        
        // Redirect to login page
        window.location.href = 'index.html';
    });
    
    // Profile Form
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Product Management
    document.getElementById('add-product-btn').addEventListener('click', function() {
        openProductModal();
    });
    
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    document.getElementById('cancel-product').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Close product modal when clicking on X
    document.querySelector('#product-modal .close').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Farming Records
    document.getElementById('add-record-btn').addEventListener('click', function() {
        openRecordModal();
    });
    
    document.getElementById('record-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRecord();
    });
    
    document.getElementById('cancel-record').addEventListener('click', function() {
        closeRecordModal();
    });
    
    // Close record modal when clicking on X
    document.querySelector('#record-modal .close').addEventListener('click', function() {
        closeRecordModal();
    });
    
    // Feedback Form
    document.getElementById('feedback-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedback();
    });
}

// Update UI Elements
function updateUI() {
    // Update dashboard stats
    updateDashboardStats();
    
    // Update activity list
    renderActivities();
    
    // Update product list
    renderProducts();
    
    // Update farming records
    renderFarmingRecords();
    
    // Update notifications
    renderNotifications();
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    document.getElementById('date-time').textContent = formattedDate;
}

// Update Dashboard Stats
function updateDashboardStats() {
    // Total products
    document.getElementById('total-products').textContent = products.length;
    
    // Active crops (farming records with status not "Harvested")
    const activeCrops = farmingRecords.filter(record => record.status !== 'Harvested').length;
    document.getElementById('active-crops').textContent = activeCrops;
    
    // Total value of inventory
    const totalValue = products.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
    }, 0);
    document.getElementById('total-value').textContent = '$' + totalValue.toFixed(2);
}

// Render Activities
function renderActivities() {
    const activityList = document.getElementById('activity-list');
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No recent activities to display.</p>';
        return;
    }
    
    activityList.innerHTML = '';
    
    // Display only the 5 most recent activities
    const recentActivities = activities.slice(0, 5);
    
    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let iconClass = 'fas fa-info-circle';
        
        switch (activity.type) {
            case 'login':
                iconClass = 'fas fa-sign-in-alt';
                break;
            case 'logout':
                iconClass = 'fas fa-sign-out-alt';
                break;
            case 'product':
                iconClass = 'fas fa-box';
                break;
            case 'record':
                iconClass = 'fas fa-seedling';
                break;
            case 'profile':
                iconClass = 'fas fa-user-edit';
                break;
        }
        
        const date = new Date(activity.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.description}</h4>
                <div class="activity-time">${formattedDate}</div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Render Products
function renderProducts() {
    const productList = document.getElementById('product-list');
    const noProductsMsg = document.getElementById('no-products');
    
    if (products.length === 0) {
        productList.innerHTML = '';
        noProductsMsg.style.display = 'block';
        return;
    }
    
    noProductsMsg.style.display = 'none';
    productList.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${product.unit}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        productList.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Render Farming Records
function renderFarmingRecords() {
    const recordList = document.getElementById('record-list');
    const noRecordsMsg = document.getElementById('no-records');
    
    if (farmingRecords.length === 0) {
        recordList.innerHTML = '';
        noRecordsMsg.style.display = 'block';
        return;
    }
    
    noRecordsMsg.style.display = 'none';
    recordList.innerHTML = '';
    
    farmingRecords.forEach(record => {
        const row = document.createElement('tr');
        
        // Format dates
        const plantingDate = new Date(record.plantingDate).toLocaleDateString();
        const harvestDate = new Date(record.expectedHarvest).toLocaleDateString();
        
        // Status color
        let statusClass = '';
        switch (record.status) {
            case 'Planted':
                statusClass = 'text-info';
                break;
            case 'Growing':
                statusClass = 'text-primary';
                break;
            case 'Ready to Harvest':
                statusClass = 'text-warning';
                break;
            case 'Harvested':
                statusClass = 'text-success';
                break;
        }
        
        row.innerHTML = `
            <td>${record.cropType}</td>
            <td>${record.area}</td>
            <td>${plantingDate}</td>
            <td>${harvestDate}</td>
            <td class="${statusClass}">${record.status}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary edit-record" data-id="${record.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger delete-record" data-id="${record.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        recordList.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-record').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-id');
            editRecord(recordId);
        });
    });
    
    document.querySelectorAll('.delete-record').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-id');
            deleteRecord(recordId);
        });
    });
}

// Render Notifications
function renderNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="empty-state">No notifications to display.</p>';
        return;
    }
    
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        
        let iconClass = 'fas fa-info-circle';
        
        switch (notification.type) {
            case 'info':
                iconClass = 'fas fa-info-circle';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                break;
            case 'success':
                iconClass = 'fas fa-check-circle';
                break;
        }
        
        const date = new Date(notification.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notificationItem.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="${iconClass}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <div class="notification-time">${formattedDate}</div>
            </div>
        `;
        
        notificationsList.appendChild(notificationItem);
    });
}

// Update Profile
function updateProfile() {
    const name = document.getElementById('profile-fullname').value;
    const phone = document.getElementById('profile-phone').value;
    const address = document.getElementById('profile-address').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('fms_users') || '[]');
    
    // Find and update user
    const userIndex = users.findIndex(user => user.id === currentUser.userId);
    
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].phone = phone;
        users[userIndex].address = address;
        
        // Update localStorage
        localStorage.setItem('fms_users', JSON.stringify(users));
        
        // Update current user session
        currentUser.name = name;
        localStorage.setItem('fms_current_user', JSON.stringify(currentUser));
        
        // Update UI
        document.getElementById('user-name').textContent = name;
        document.getElementById('profile-name').textContent = name;
        
        // Add activity
        addActivity(currentUser.userId, 'Updated profile information', 'profile');
        
        // Show success message
        showToast('Profile updated successfully!', 'success');
    }
}

// Product Modal Functions
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    // Reset form
    form.reset();
    
    if (productId) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        
        // Find product
        const product = products.find(p => p.id === productId);
        
        if (product) {
            // Fill form with product data
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-quantity').value = product.quantity;
            document.getElementById('product-unit').value = product.unit;
            document.getElementById('product-price').value = product.price;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        document.getElementById('product-id').value = '';
    }
    
    // Show modal
    modal.style.display = 'block';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const quantity = parseFloat(document.getElementById('product-quantity').value);
    const unit = document.getElementById('product-unit').value;
    const price = parseFloat(document.getElementById('product-price').value);
    
    if (productId) {
        // Update existing product
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                name,
                category,
                quantity,
                unit,
                price,
                updatedAt: new Date().toISOString()
            };
            
            // Add activity
            addActivity(currentUser.userId, `Updated product: ${name}`, 'product');
        }
    } else {
        // Add new product
        const newProduct = {
            id: generateId(),
            name,
            category,
            quantity,
            unit,
            price,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        
        // Add activity
        addActivity(currentUser.userId, `Added new product: ${name}`, 'product');
    }
    
    // Save to localStorage
    localStorage.setItem(`fms_products_${currentUser.userId}`, JSON.stringify(products));
    
    // Close modal
    closeProductModal();
    
    // Update UI
    updateUI();
    
    // Show success message
    showToast('Product saved successfully!', 'success');
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Find product
        const product = products.find(p => p.id === productId);
        
        if (product) {
            // Remove product
            products = products.filter(p => p.id !== productId);
            
            // Save to localStorage
            localStorage.setItem(`fms_products_${currentUser.userId}`, JSON.stringify(products));
            
            // Add activity
            addActivity(currentUser.userId, `Deleted product: ${product.name}`, 'product');
            
            // Update UI
            updateUI();
            
            // Show success message
            showToast('Product deleted successfully!', 'success');
        }
    }
}

// Farming Record Modal Functions
function openRecordModal(recordId = null) {
    const modal = document.getElementById('record-modal');
    const modalTitle = document.getElementById('record-modal-title');
    const form = document.getElementById('record-form');
    
    // Reset form
    form.reset();
    
    if (recordId) {
        // Edit mode
        modalTitle.textContent = 'Edit Farming Record';
        
        // Find record
        const record = farmingRecords.find(r => r.id === recordId);
        
        if (record) {
            // Fill form with record data
            document.getElementById('record-id').value = record.id;
            document.getElementById('crop-type').value = record.cropType;
            document.getElementById('crop-area').value = record.area;
            document.getElementById('planting-date').value = formatDateForInput(record.plantingDate);
            document.getElementById('expected-harvest').value = formatDateForInput(record.expectedHarvest);
            document.getElementById('crop-status').value = record.status;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Farming Record';
        document.getElementById('record-id').value = '';
    }
    
    // Show modal
    modal.style.display = 'block';
}

function closeRecordModal() {
    const modal = document.getElementById('record-modal');
    modal.style.display = 'none';
}

function saveRecord() {
    const recordId = document.getElementById('record-id').value;
    const cropType = document.getElementById('crop-type').value;
    const area = parseFloat(document.getElementById('crop-area').value);
    const plantingDate = document.getElementById('planting-date').value;
    const expectedHarvest = document.getElementById('expected-harvest').value;
    const status = document.getElementById('crop-status').value;
    
    if (recordId) {
        // Update existing record
        const recordIndex = farmingRecords.findIndex(r => r.id === recordId);
        
        if (recordIndex !== -1) {
            farmingRecords[recordIndex] = {
                ...farmingRecords[recordIndex],
                cropType,
                area,
                plantingDate,
                expectedHarvest,
                status,
                updatedAt: new Date().toISOString()
            };
            
            // Add activity
            addActivity(currentUser.userId, `Updated farming record: ${cropType}`, 'record');
        }
    } else {
        // Add new record
        const newRecord = {
            id: generateId(),
            cropType,
            area,
            plantingDate,
            expectedHarvest,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        farmingRecords.push(newRecord);
        
        // Add activity
        addActivity(currentUser.userId, `Added new farming record: ${cropType}`, 'record');
    }
    
    // Save to localStorage
    localStorage.setItem(`fms_records_${currentUser.userId}`, JSON.stringify(farmingRecords));
    
    // Close modal
    closeRecordModal();
    
    // Update UI
    updateUI();
    
    // Show success message
    showToast('Farming record saved successfully!', 'success');
}

function editRecord(recordId) {
    openRecordModal(recordId);
}

function deleteRecord(recordId) {
    if (confirm('Are you sure you want to delete this farming record?')) {
        // Find record
        const record = farmingRecords.find(r => r.id === recordId);
        
        if (record) {
            // Remove record
            farmingRecords = farmingRecords.filter(r => r.id !== recordId);
            
            // Save to localStorage
            localStorage.setItem(`fms_records_${currentUser.userId}`, JSON.stringify(farmingRecords));
            
            // Add activity
            addActivity(currentUser.userId, `Deleted farming record: ${record.cropType}`, 'record');
            
            // Update UI
            updateUI();
            
            // Show success message
            showToast('Farming record deleted successfully!', 'success');
        }
    }
}

// Submit Feedback
function submitFeedback() {
    const subject = document.getElementById('feedback-subject').value;
    const message = document.getElementById('feedback-message').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value || '0';
    
    // In a real app, this would be sent to a server
    // For this demo, we'll just show a success message and clear the form
    
    // Add activity
    addActivity(currentUser.userId, 'Submitted feedback', 'feedback');
    
    // Reset form
    document.getElementById('feedback-form').reset();
    
    // Show success message
    showToast('Thank you for your feedback!', 'success');
}

// Helper Functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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
    
    // Update global activities array
    this.activities = activities;
}

function showToast(message, type) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
