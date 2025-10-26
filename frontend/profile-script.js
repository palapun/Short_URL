const API_BASE_URL = 'https://short-url-zxhk.onrender.com/api';
const toastContainer = document.getElementById('toastContainer');

document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const passwordToggles = document.querySelectorAll('.password-toggle');

    if (profileForm) {
        profileForm.addEventListener('submit', handleChangePassword);
    }

    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                targetInput.type = 'password';
                toggle.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });

    loadUserInfo();
});

function loadUserInfo() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').value = username;
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match!', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long!', 'error');
        return;
    }

    const token = localStorage.getItem('userToken');
    console.log('🔐 Token check:', token ? 'exists' : 'missing');
    console.log('🔐 Token value:', token ? token.substring(0, 30) + '...' : 'none');
    
    if (!token) {
        showToast('Please login again', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        console.log('🌐 Making password change request...');
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        console.log('📡 Response status:', response.status);

        const result = await response.json();

        if (response.ok) {
            showToast('Password changed successfully!', 'success');
            document.getElementById('profileForm').reset();
            document.getElementById('username').value = localStorage.getItem('username');
        } else {
            showToast(result.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Connection error', 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}
