// Production API URL - ใช้ไฟล์นี้หลังจาก deploy backend
const API_BASE_URL = 'https://your-actual-backend-url.onrender.com/api';

function checkAuth() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function loadUserInfo() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('welcomeText').textContent = `Welcome, ${username}!`;
    }
}

function handleLogout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// ... rest of the functions remain the same
