// Development API URL - เปลี่ยนเป็น production URL หลังจาก deploy
const API_BASE_URL = 'http://localhost:8080/api';

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
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}

let currentShortCode = '';
let historyData = [];
const urlForm = document.getElementById('urlForm');
const resultSection = document.getElementById('resultSection');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const qrBtn = document.getElementById('qrBtn');
const statsBtn = document.getElementById('statsBtn');
const qrModal = document.getElementById('qrModal');
const qrCodeImage = document.getElementById('qrCodeImage');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const toastContainer = document.getElementById('toastContainer');

const tabBtns = document.querySelectorAll('.tab-btn');
const shortenTab = document.querySelector('[data-tab="shorten"]');
const historyTab = document.querySelector('[data-tab="history"]');

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }
    
    loadUserInfo();
    
    initializeApp();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

urlForm.addEventListener('submit', handleUrlSubmit);
copyBtn.addEventListener('click', handleCopyUrl);
qrBtn.addEventListener('click', handleShowQrCode);
statsBtn.addEventListener('click', handleShowStats);
downloadQrBtn.addEventListener('click', handleDownloadQr);
refreshHistoryBtn.addEventListener('click', loadHistory);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.querySelector('.close').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === qrModal) closeModal();
});

function initializeApp() {
    
    historySection.style.display = 'block';
    
    setTimeout(() => {
        loadHistory();
    }, 100);
    
    setDefaultExpireDate();
    
    const historyTab = document.querySelector('[data-tab="history"]');
    if (historyTab) {
        historyTab.addEventListener('click', () => {
            setTimeout(() => {
                loadHistory();
            }, 100);
        });
    }
    
    setInterval(() => {
        if (historySection.style.display !== 'none') {
            loadHistory();
        }
    }, 5000);
}

function setDefaultExpireDate() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const dateTimeLocal = thirtyDaysFromNow.toISOString().slice(0, 16);
    document.getElementById('expiresAt').value = dateTimeLocal;
}

async function handleUrlSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(urlForm);
    const data = {
        originalUrl: formData.get('originalUrl'),
        customAlias: formData.get('customAlias') || null,
        expiresAt: formData.get('expiresAt') || null
    };

    showLoading(true);
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/urls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showResult(result);
            showToast('Short link created successfully!', 'success');
            
            urlForm.reset();
            setDefaultExpireDate();
            
            setTimeout(() => {
('Calling loadHistory after delay...');
('Current history data before refresh:', historyData.length, 'items');
                
                loadHistory();
                
                setTimeout(() => {
('Switching to history tab...');
                    switchTab('history');
                }, 200);
            }, 1000); // Increased delay to ensure backend has processed the request
        } else {
            console.error('Failed to create URL:', result);
            let errorMessage = result.error || 'An error occurred';
            
            if (result.error === 'Custom alias already exists') {
                errorMessage = 'This alias is already taken. Please use a different one or leave it empty.';
            } else if (result.error === 'Invalid URL format') {
                errorMessage = 'Invalid URL format. Please enter a URL that starts with http:// or https://';
            }
            
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Connection error', 'error');
    } finally {
        showLoading(false);
    }
}

function showResult(result) {
    currentShortCode = result.shortCode;
    shortUrlInput.value = result.shortUrl;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

async function handleCopyUrl() {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);
        showToast('Link copied successfully!', 'success');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    } catch (error) {
        showToast('Unable to copy', 'error');
    }
}

async function handleShowQrCode() {
    try {
        const response = await fetch(`${API_BASE_URL}/urls/${currentShortCode}/qr-data`);
        const result = await response.json();
        
        if (response.ok) {
            qrCodeImage.src = result.qrCodeDataUrl;
            qrModal.style.display = 'block';
        } else {
            showToast('Unable to generate QR Code', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error generating QR Code', 'error');
    }
}

async function handleDownloadQr() {
    try {
        const response = await fetch(`${API_BASE_URL}/urls/${currentShortCode}/qr`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-code-${currentShortCode}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('QR Code downloaded successfully!', 'success');
        } else {
            showToast('Unable to download QR Code', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Download error', 'error');
    }
}

function handleShowStats() {
    showToast('Loading statistics...', 'info');
}

async function loadHistory() {
('🔍 ===== LOAD HISTORY START =====');
    try {
        const token = localStorage.getItem('userToken');
('🔑 Token check:', token ? 'Present' : 'Missing');
('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'None');
        
        if (!token) {
            console.error('❌ No token found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
('🌐 Making API call to:', `${API_BASE_URL}/urls`);
('🔑 Authorization header:', `Bearer ${token.substring(0, 20)}...`);
        
        const response = await fetch(`${API_BASE_URL}/urls`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
('📡 API response status:', response.status);
('📡 API response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
('📊 API response data:', data);
('📊 Data type:', typeof data);
('📊 Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        if (response.ok) {
            historyData = data;
('✅ History data loaded:', historyData.length, 'items');
('📋 Full history data:', JSON.stringify(historyData, null, 2));
            
            historySection.style.display = 'block';
('👁️ History section display set to block');
            
('🎨 Calling renderHistory...');
            renderHistory();
('✅ renderHistory completed');
            
            if (historyData.length > 0) {
('🎉 History loaded successfully with', historyData.length, 'items');
                showToast(`History loaded successfully! Found ${historyData.length} links`, 'success');
            } else {
('📭 No history data found');
                showToast('No short link history yet', 'info');
            }
        } else {
            console.error('❌ History API error:', data);
            showToast(`Unable to load history: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error loading history:', error);
        showToast(`Error loading history: ${error.message}`, 'error');
    }
('🔍 ===== LOAD HISTORY END =====');
}

function renderHistory() {
('🎨 ===== RENDER HISTORY START =====');
('📊 Rendering history with', historyData.length, 'items');
('📋 History data:', historyData);
('🎯 History list element:', historyList);
('🎯 History list element exists:', !!historyList);

    if (!historyData || historyData.length === 0) {
('📭 No history data, showing empty state');
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p>No short link history yet</p>
                <p style="color: #666; font-size: 0.9em;">Try creating a short link!</p>
            </div>
        `;
('📭 Empty state HTML set');
        return;
    }

('Rendering', historyData.length, 'history items');
('History data to render:', historyData);

    const historyHTML = historyData.map((url, index) => `
        <div class="history-item" style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; background: #f9f9f9;">
            <div class="history-item-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #333;">Link #${index + 1}</h4>
                <div class="history-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('${url.shortUrl}')" style="margin: 2px;">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-success btn-sm" onclick="showQrForUrl('${url.shortCode}')" style="margin: 2px;">
                        <i class="fas fa-qrcode"></i> QR
                    </button>
                    <button class="btn btn-info btn-sm" onclick="showUrlStats('${url.id}')" style="margin: 2px;">
                        <i class="fas fa-chart-bar"></i> Stats
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUrl('${url.id}')" style="margin: 2px;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="history-item-content">
                <div class="url-info" style="margin-bottom: 10px;">
                    <div class="url-info-item" style="margin-bottom: 8px;">
                        <label style="font-weight: bold; color: #666;">Original URL:</label>
                        <div class="value" style="word-break: break-all; color: #007bff;">${url.originalUrl}</div>
                    </div>
                    <div class="url-info-item" style="margin-bottom: 8px;">
                        <label style="font-weight: bold; color: #666;">Short Link:</label>
                        <div class="value" style="word-break: break-all; color: #28a745; font-weight: bold;">${url.shortUrl}</div>
                    </div>
                </div>
                <div class="stats-info" style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="number" style="font-size: 1.2em; font-weight: bold; color: #dc3545;">${url.clickCount || 0}</div>
                        <div class="label" style="font-size: 0.9em; color: #666;">Click Count</div>
                    </div>
                    <div class="stat-item" style="text-align: center;">
                        <div class="number" style="font-size: 1.2em; font-weight: bold; color: #6c757d;">${formatDate(url.createdAt)}</div>
                        <div class="label" style="font-size: 0.9em; color: #666;">Created Date</div>
                    </div>
                    ${url.expiresAt ? `<div class="stat-item" style="text-align: center;">
                        <div class="number" style="font-size: 1.2em; font-weight: bold; color: #fd7e14;">${formatDate(url.expiresAt)}</div>
                        <div class="label" style="font-size: 0.9em; color: #666;">Expiry Date</div>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    historyList.innerHTML = historyHTML;
('✅ History HTML rendered:', historyHTML.length, 'characters');
('🎨 ===== RENDER HISTORY END =====');
}

function switchTab(tabName) {
('Switching to tab:', tabName);
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    if (tabName === 'shorten') {
        resultSection.style.display = 'block';
        historySection.style.display = 'none';
('Showing shorten section, hiding history');
    } else if (tabName === 'history') {
        resultSection.style.display = 'none';
        historySection.style.display = 'block';
('Showing history section, hiding shorten');
('Loading history for history tab...');
        
        setTimeout(() => {
('Force loading history for history tab...');
            loadHistory();
        }, 100);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied successfully!', 'success');
    }).catch(() => {
        showToast('Unable to copy', 'error');
    });
}

async function showQrForUrl(shortCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/urls/${shortCode}/qr-data`);
        const result = await response.json();
        
        if (response.ok) {
            qrCodeImage.src = result.qrCodeDataUrl;
            qrModal.style.display = 'block';
        } else {
            showToast('Unable to generate QR Code', 'error');
        }
    } catch (error) {
        showToast('Error generating QR Code', 'error');
    }
}

async function showUrlStats(urlId) {
    try {
        const response = await fetch(`${API_BASE_URL}/urls/${urlId}/stats`);
        const stats = await response.json();
        
        if (response.ok) {
            showToast(`Statistics: ${stats.length} clicks`, 'info');
        } else {
            showToast('Unable to load statistics', 'error');
        }
    } catch (error) {
        showToast('Error loading statistics', 'error');
    }
}

async function deleteUrl(urlId) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/urls/${urlId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showToast('Link deleted successfully!', 'success');
            loadHistory();
        } else {
            showToast('Unable to delete link', 'error');
        }
    } catch (error) {
        showToast('Error deleting link', 'error');
    }
}

function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Unable to copy', 'error');
    });
}

function closeModal() {
    qrModal.style.display = 'none';
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
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
    }, 3000);
}
