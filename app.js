// TermResult Investment Tracker - JavaScript

// Real Investor Data
const investorsData = {
    'marvyteach@termresult.com': {
        password: 'password',
        name: 'Marvy Teach',
        email: 'marvyteach@termresult.com',
        joinDate: '2025-09-29',
        investments: [
            {
                id: 1,
                date: '2025-09-29',
                description: 'Seed Investment - Round 1',
                amountUSD: 300,
                amountNGN: 436875,
                currency: 'USD',
                valuationAtInvestment: 500000,
                currentValuation: 1000000,
                sharePercentage: 0.06,
                schoolsAtTime: 0,
                status: 'active',
                receipt: 'receipt-investment-1.jpeg',
                receiptDate: '2025-10-01'
            },
            {
                id: 2,
                date: '2025-11-28',
                description: 'Follow-on Investment - Round 2',
                amountUSD: 300,
                amountNGN: 433785,
                currency: 'USD',
                valuationAtInvestment: 500000,
                currentValuation: 1000000,
                sharePercentage: 0.06,
                schoolsAtTime: 1,
                status: 'active',
                receipt: 'receipt-investment-2.jpeg',
                receiptDate: '2025-11-28'
            },
            {
                id: 3,
                date: '2025-12-22',
                description: 'Strategic Investment - Round 3',
                amountUSD: 1000,
                amountNGN: 1448450,
                currency: 'USD',
                valuationAtInvestment: 1000000,
                currentValuation: 1000000,
                sharePercentage: 0.10,
                schoolsAtTime: 5,
                status: 'active',
                receipt: 'receipt-investment-3.jpeg',
                receiptDate: '2025-12-22'
            }
        ]
    }
};

// Current company valuation and schools
const CURRENT_VALUATION_USD = 1000000;
const CURRENT_SCHOOLS = 5;

// Exchange rate
const exchangeRate = 1550;

// Current state
let currentUser = null;
let currentCurrency = 'USD';
let growthChart = null;
let currencyChart = null;
let distributionChart = null;
let growthAnalysisChart = null;
let currentReceiptFile = null;
let currentReceiptId = null;

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setCurrentDate();
    
    const savedUser = localStorage.getItem('termresult_user');
    if (savedUser) {
        currentUser = investorsData[savedUser];
        if (currentUser) {
            showDashboard();
        }
    }
});

// Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCurrency = btn.dataset.currency;
            updateDashboard();
        });
    });
    
    document.getElementById('searchInvestments')?.addEventListener('input', filterInvestments);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeReceiptModal();
        }
    });
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('toggleIcon');
    const text = document.getElementById('toggleText');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        text.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        text.textContent = 'Show';
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.toLowerCase();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    const investor = investorsData[email];
    
    if (investor && investor.password === password) {
        currentUser = investor;
        
        if (remember) {
            localStorage.setItem('termresult_user', email);
        }
        
        showDashboard();
    } else {
        showLoginError();
    }
}

// Show login error
function showLoginError() {
    const form = document.querySelector('.login-form');
    const existingError = form.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'color: #EF4444; background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;';
    errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid email or password. Please try again.';
    
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

// Show dashboard
function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'flex';
    document.body.classList.remove('login-page');
    
    updateDashboard();
    initializeCharts();
    renderInvestmentCards();
    renderTimeline();
    renderAnalytics();
}

// Show section
function showSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Logout
function logout() {
    localStorage.removeItem('termresult_user');
    currentUser = null;
    loginPage.style.display = 'flex';
    dashboardPage.style.display = 'none';
    document.body.classList.add('login-page');
    loginForm.reset();
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Set current date
function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Format currency
function formatCurrency(amount, currency = currentCurrency) {
    if (currency === 'NGN') {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Calculate totals
function calculateTotals() {
    if (!currentUser) return {};
    
    const investments = currentUser.investments;
    
    let totalInvestedUSD = 0;
    let totalInvestedNGN = 0;
    let totalSharePercentage = 0;
    
    investments.forEach(inv => {
        totalInvestedUSD += inv.amountUSD;
        totalInvestedNGN += inv.amountNGN;
        totalSharePercentage += inv.sharePercentage;
    });
    
    const currentValueUSD = (totalSharePercentage / 100) * CURRENT_VALUATION_USD;
    const currentValueNGN = currentValueUSD * exchangeRate;
    
    return {
        totalInvestedUSD,
        totalInvestedNGN,
        currentValueUSD,
        currentValueNGN,
        totalSharePercentage,
        investmentCount: investments.length,
        companyValuationUSD: CURRENT_VALUATION_USD,
        companyValuationNGN: CURRENT_VALUATION_USD * exchangeRate
    };
}

// Update dashboard
function updateDashboard() {
    if (!currentUser) return;
    
    // Update user info
    document.getElementById('investorName').textContent = currentUser.name.split(' ')[0];
    document.getElementById('userFullName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.split(' ').map(n => n[0]).join('');
    
    const mobileAvatar = document.getElementById('mobileUserAvatar');
    if (mobileAvatar) {
        mobileAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('');
    }
    
    const totals = calculateTotals();
    
    // Update stats
    if (currentCurrency === 'USD') {
        document.getElementById('totalInvested').textContent = formatCurrency(totals.totalInvestedUSD, 'USD');
        document.getElementById('companyValuation').textContent = formatCurrency(CURRENT_VALUATION_USD, 'USD');
        document.getElementById('shareValue').innerHTML = `<i class="fas fa-coins"></i> ${formatCurrency(totals.currentValueUSD, 'USD')} value`;
    } else {
        document.getElementById('totalInvested').textContent = formatCurrency(totals.totalInvestedNGN, 'NGN');
        document.getElementById('companyValuation').textContent = formatCurrency(CURRENT_VALUATION_USD * exchangeRate, 'NGN');
        document.getElementById('shareValue').innerHTML = `<i class="fas fa-coins"></i> ${formatCurrency(totals.currentValueNGN, 'NGN')} value`;
    }
    
    document.getElementById('ownershipPercent').textContent = totals.totalSharePercentage.toFixed(2) + '%';
    document.getElementById('schoolCount').innerHTML = `<i class="fas fa-school"></i> ${CURRENT_SCHOOLS} schools`;
    document.getElementById('investmentCount').textContent = totals.investmentCount;
    
    updateInvestmentTable();
    updateCurrencyBreakdown(totals);
    updateActivityList();
    updateSummary(totals);
    
    if (growthChart && currencyChart) {
        updateCharts();
    }
}

// Update investment table
function updateInvestmentTable(filterText = '') {
    const tbody = document.getElementById('investmentTableBody');
    if (!tbody || !currentUser) return;
    
    let investments = [...currentUser.investments].reverse();
    
    if (filterText) {
        investments = investments.filter(inv => 
            inv.description.toLowerCase().includes(filterText.toLowerCase())
        );
    }
    
    tbody.innerHTML = investments.map(inv => {
        const currentValueUSD = (inv.sharePercentage / 100) * CURRENT_VALUATION_USD;
        const currentValueNGN = currentValueUSD * exchangeRate;
        const growth = ((currentValueUSD - inv.amountUSD) / inv.amountUSD) * 100;
        
        return `
            <tr>
                <td>${formatDate(inv.date)}</td>
                <td>
                    <div class="investment-desc">
                        <strong>${inv.description}</strong>
                        <span class="schools-info">${inv.schoolsAtTime} school${inv.schoolsAtTime !== 1 ? 's' : ''} at time</span>
                    </div>
                </td>
                <td>
                    <div class="amount-info">
                        <strong>${formatCurrency(inv.amountUSD, 'USD')}</strong>
                        <span class="amount-secondary">${formatCurrency(inv.amountNGN, 'NGN')}</span>
                    </div>
                </td>
                <td>
                    <span class="share-badge">${inv.sharePercentage.toFixed(2)}%</span>
                </td>
                <td>${formatCurrency(inv.valuationAtInvestment, 'USD')}</td>
                <td>
                    <div class="amount-info">
                        <strong>${formatCurrency(currentValueUSD, 'USD')}</strong>
                        <span class="amount-secondary">${formatCurrency(currentValueNGN, 'NGN')}</span>
                    </div>
                </td>
                <td>
                    <span class="growth-badge ${growth >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${growth >= 0 ? 'up' : 'down'}"></i>
                        ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                    </span>
                </td>
                <td>
                    <button class="receipt-btn" onclick="viewReceipt('${inv.receipt}', ${inv.id})">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Render Investment Cards
function renderInvestmentCards() {
    const container = document.getElementById('investmentCards');
    if (!container || !currentUser) return;
    
    container.innerHTML = currentUser.investments.map(inv => {
        const currentValueUSD = (inv.sharePercentage / 100) * CURRENT_VALUATION_USD;
        const growth = ((currentValueUSD - inv.amountUSD) / inv.amountUSD) * 100;
        
        return `
            <div class="investment-card">
                <div class="investment-card-header">
                    <div class="investment-card-title">
                        <h4>${inv.description}</h4>
                        <span>${formatDate(inv.date)}</span>
                    </div>
                    <span class="investment-card-badge">${inv.status}</span>
                </div>
                <div class="investment-card-body">
                    <div class="investment-card-stat">
                        <label>Invested</label>
                        <strong>${formatCurrency(inv.amountUSD, 'USD')}</strong>
                    </div>
                    <div class="investment-card-stat">
                        <label>Current Value</label>
                        <strong>${formatCurrency(currentValueUSD, 'USD')}</strong>
                    </div>
                    <div class="investment-card-stat">
                        <label>Share</label>
                        <strong>${inv.sharePercentage.toFixed(2)}%</strong>
                    </div>
                    <div class="investment-card-stat">
                        <label>Growth</label>
                        <strong style="color: ${growth >= 0 ? '#10B981' : '#EF4444'}">
                            ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                        </strong>
                    </div>
                </div>
                <div class="investment-card-footer">
                    <button class="receipt-btn" onclick="viewReceipt('${inv.receipt}', ${inv.id})">
                        <i class="fas fa-eye"></i> View Receipt
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Timeline
function renderTimeline() {
    const container = document.getElementById('transactionTimeline');
    if (!container || !currentUser) return;
    
    const investments = [...currentUser.investments].reverse();
    
    container.innerHTML = investments.map((inv, index) => {
        const currentValueUSD = (inv.sharePercentage / 100) * CURRENT_VALUATION_USD;
        const growth = ((currentValueUSD - inv.amountUSD) / inv.amountUSD) * 100;
        
        return `
            <div class="timeline-item">
                <div class="timeline-dot">
                    <i class="fas fa-arrow-trend-up"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-title">
                            <h4>${inv.description}</h4>
                            <span>${formatDate(inv.date)} • ${inv.schoolsAtTime} school${inv.schoolsAtTime !== 1 ? 's' : ''} at time</span>
                        </div>
                        <div class="timeline-amount">
                            <strong>${formatCurrency(inv.amountUSD, 'USD')}</strong>
                            <span>${formatCurrency(inv.amountNGN, 'NGN')}</span>
                        </div>
                    </div>
                    <div class="timeline-details">
                        <div class="timeline-detail">
                            <label>Share Acquired</label>
                            <strong>${inv.sharePercentage.toFixed(2)}%</strong>
                        </div>
                        <div class="timeline-detail">
                            <label>Valuation Then</label>
                            <strong>${formatCurrency(inv.valuationAtInvestment, 'USD')}</strong>
                        </div>
                        <div class="timeline-detail">
                            <label>Current Value</label>
                            <strong style="color: ${growth >= 0 ? '#10B981' : '#EF4444'}">
                                ${formatCurrency(currentValueUSD, 'USD')} (${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%)
                            </strong>
                        </div>
                    </div>
                    <div class="timeline-actions">
                        <button class="receipt-btn" onclick="viewReceipt('${inv.receipt}', ${inv.id})">
                            <i class="fas fa-download"></i> Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render Analytics
function renderAnalytics() {
    if (!currentUser) return;
    
    const totals = calculateTotals();
    
    // Render metrics
    const metricsContainer = document.getElementById('metricsGrid');
    if (metricsContainer) {
        const avgInvestment = totals.totalInvestedUSD / totals.investmentCount;
        const roi = ((totals.currentValueUSD - totals.totalInvestedUSD) / totals.totalInvestedUSD) * 100;
        
        metricsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon blue">
                    <i class="fas fa-sack-dollar"></i>
                </div>
                <h4>${formatCurrency(totals.totalInvestedUSD, 'USD')}</h4>
                <p>Total Invested</p>
            </div>
            <div class="metric-card">
                <div class="metric-icon green">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h4>${formatCurrency(totals.currentValueUSD, 'USD')}</h4>
                <p>Current Portfolio Value</p>
            </div>
            <div class="metric-card">
                <div class="metric-icon orange">
                    <i class="fas fa-percentage"></i>
                </div>
                <h4>${totals.totalSharePercentage.toFixed(2)}%</h4>
                <p>Total Ownership</p>
            </div>
            <div class="metric-card">
                <div class="metric-icon cyan">
                    <i class="fas fa-arrow-trend-up"></i>
                </div>
                <h4>${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%</h4>
                <p>Overall ROI</p>
            </div>
        `;
    }
    
    // Render breakdown cards
    const breakdownContainer = document.getElementById('breakdownCards');
    if (breakdownContainer) {
        breakdownContainer.innerHTML = currentUser.investments.map(inv => {
            const currentValueUSD = (inv.sharePercentage / 100) * CURRENT_VALUATION_USD;
            const growth = ((currentValueUSD - inv.amountUSD) / inv.amountUSD) * 100;
            
            return `
                <div class="breakdown-card">
                    <h5>${inv.description}</h5>
                    <div class="breakdown-card-stats">
                        <div class="breakdown-stat">
                            <label>Invested</label>
                            <strong>${formatCurrency(inv.amountUSD, 'USD')}</strong>
                        </div>
                        <div class="breakdown-stat">
                            <label>Current Value</label>
                            <strong>${formatCurrency(currentValueUSD, 'USD')}</strong>
                        </div>
                        <div class="breakdown-stat">
                            <label>Share</label>
                            <strong>${inv.sharePercentage.toFixed(2)}%</strong>
                        </div>
                        <div class="breakdown-stat">
                            <label>Growth</label>
                            <strong style="color: ${growth >= 0 ? '#10B981' : '#EF4444'}">
                                ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                            </strong>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Initialize analytics charts
    initDistributionChart();
    initGrowthAnalysisChart();
}

// Init Distribution Chart
function initDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx || !currentUser) return;
    
    if (distributionChart) {
        distributionChart.destroy();
    }
    
    const data = currentUser.investments.map(inv => inv.amountUSD);
    const labels = currentUser.investments.map(inv => `Round ${inv.id}`);
    
    distributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#0077C8', '#10B981', '#F59E0B'],
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `$${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Init Growth Analysis Chart
function initGrowthAnalysisChart() {
    const ctx = document.getElementById('growthAnalysisChart');
    if (!ctx || !currentUser) return;
    
    if (growthAnalysisChart) {
        growthAnalysisChart.destroy();
    }
    
    const labels = currentUser.investments.map(inv => `Round ${inv.id}`);
    const investedData = currentUser.investments.map(inv => inv.amountUSD);
    const currentValueData = currentUser.investments.map(inv => 
        (inv.sharePercentage / 100) * CURRENT_VALUATION_USD
    );
    
    growthAnalysisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Invested',
                    data: investedData,
                    backgroundColor: '#0077C8',
                    borderRadius: 6
                },
                {
                    label: 'Current Value',
                    data: currentValueData,
                    backgroundColor: '#10B981',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// View receipt in modal
function viewReceipt(filename, investmentId) {
    currentReceiptFile = filename;
    currentReceiptId = investmentId;
    
    const modal = document.getElementById('receiptModal');
    const image = document.getElementById('receiptImage');
    
    image.src = filename;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close receipt modal
function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentReceiptFile = null;
    currentReceiptId = null;
}

// Download current receipt
function downloadCurrentReceipt() {
    if (!currentReceiptFile || !currentReceiptId) return;
    
    fetch(currentReceiptFile)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TermResult-Investment-${currentReceiptId}-Receipt.jpeg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            window.open(currentReceiptFile, '_blank');
        });
}

// Filter investments
function filterInvestments() {
    const searchText = document.getElementById('searchInvestments').value;
    updateInvestmentTable(searchText);
}

// Update currency breakdown
function updateCurrencyBreakdown(totals) {
    const container = document.getElementById('currencyBreakdown');
    if (!container) return;
    
    container.innerHTML = `
        <div class="breakdown-item">
            <div class="currency-label">
                <span class="currency-icon usd">$</span>
                <span>Total Invested (USD)</span>
            </div>
            <span class="currency-value">${formatCurrency(totals.totalInvestedUSD, 'USD')}</span>
        </div>
        <div class="breakdown-item">
            <div class="currency-label">
                <span class="currency-icon ngn">₦</span>
                <span>Total Invested (NGN)</span>
            </div>
            <span class="currency-value">${formatCurrency(totals.totalInvestedNGN, 'NGN')}</span>
        </div>
        <div class="breakdown-item highlight">
            <div class="currency-label">
                <span class="currency-icon share">%</span>
                <span>Total Ownership</span>
            </div>
            <span class="currency-value highlight">${totals.totalSharePercentage.toFixed(2)}%</span>
        </div>
    `;
}

// Update activity list
function updateActivityList() {
    const container = document.getElementById('activityList');
    if (!container || !currentUser) return;
    
    const recentInvestments = [...currentUser.investments].reverse();
    
    container.innerHTML = recentInvestments.map(inv => {
        return `
            <div class="activity-item">
                <div class="activity-icon investment">
                    <i class="fas fa-arrow-trend-up"></i>
                </div>
                <div class="activity-details">
                    <h4>${inv.description}</h4>
                    <p>${formatDate(inv.date)} • ${inv.sharePercentage.toFixed(2)}% share</p>
                </div>
                <div class="activity-right">
                    <span class="activity-amount">${formatCurrency(inv.amountUSD, 'USD')}</span>
                    <button class="mini-receipt-btn" onclick="viewReceipt('${inv.receipt}', ${inv.id})" title="View Receipt">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update summary
function updateSummary(totals) {
    const container = document.getElementById('summaryContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="summary-item">
            <span class="label">Total Investments</span>
            <span class="value">${totals.investmentCount}</span>
        </div>
        <div class="summary-item">
            <span class="label">Total Invested</span>
            <span class="value">${formatCurrency(totals.totalInvestedUSD, 'USD')}</span>
        </div>
        <div class="summary-item highlight">
            <span class="label">Your Ownership</span>
            <span class="value ownership">${totals.totalSharePercentage.toFixed(2)}%</span>
        </div>
        <div class="summary-item">
            <span class="label">Company Valuation</span>
            <span class="value">${formatCurrency(CURRENT_VALUATION_USD, 'USD')}</span>
        </div>
        <div class="summary-item">
            <span class="label">Your Share Value</span>
            <span class="value">${formatCurrency(totals.currentValueUSD, 'USD')}</span>
        </div>
        <div class="summary-item">
            <span class="label">Active Schools</span>
            <span class="value">${CURRENT_SCHOOLS}</span>
        </div>
        <div class="summary-item">
            <span class="label">Member Since</span>
            <span class="value">${formatDate(currentUser.joinDate)}</span>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize charts
function initializeCharts() {
    initGrowthChart();
    initCurrencyChart();
}

// Growth chart
function initGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx || !currentUser) return;
    
    const investments = [...currentUser.investments].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    let cumulativeInvested = 0;
    let cumulativeShare = 0;
    
    const labels = [];
    const investedData = [];
    const valueData = [];
    
    investments.forEach(inv => {
        cumulativeInvested += inv.amountUSD;
        cumulativeShare += inv.sharePercentage;
        
        const currentValue = (cumulativeShare / 100) * CURRENT_VALUATION_USD;
        
        labels.push(formatDate(inv.date));
        investedData.push(cumulativeInvested);
        valueData.push(currentValue);
    });
    
    labels.push('Today');
    investedData.push(cumulativeInvested);
    valueData.push((cumulativeShare / 100) * CURRENT_VALUATION_USD);
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Invested',
                    data: investedData,
                    borderColor: '#0077C8',
                    backgroundColor: 'rgba(0, 119, 200, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#0077C8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Current Value',
                    data: valueData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0D2137',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748B',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#64748B',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Ownership chart
function initCurrencyChart() {
    const ctx = document.getElementById('currencyChart');
    if (!ctx || !currentUser) return;
    
    const totals = calculateTotals();
    const otherOwnership = 100 - totals.totalSharePercentage;
    
    currencyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Your Ownership', 'Other Shareholders'],
            datasets: [{
                data: [totals.totalSharePercentage, otherOwnership],
                backgroundColor: ['#0077C8', '#E2E8F0'],
                borderColor: '#fff',
                borderWidth: 4,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0D2137',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    if (!currentUser) return;
}

// Make functions globally available
window.togglePassword = togglePassword;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.viewReceipt = viewReceipt;
window.closeReceiptModal = closeReceiptModal;
window.downloadCurrentReceipt = downloadCurrentReceipt;
