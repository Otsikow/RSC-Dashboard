/**
 * =====================================
 * REAM CLEANING SERVICES - DASHBOARD
 * Operations Management System
 * =====================================
 */

// =====================================
// Global State Management
// =====================================

const AppState = {
    staff: [],
    sites: [],
    shifts: [],
    payrollRecords: [],
    notes: [],
    settings: {},
    currentUser: 'Admin',
    currentStaffId: null,
    darkMode: false,
    sidebarCollapsed: false
};

// =====================================
// Utility Functions
// =====================================

// Format currency to UK standard
function formatCurrency(amount) {
    return `£${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Format decimal to 2 places
function formatDecimal(value) {
    return parseFloat(value).toFixed(2);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Format time
function formatTime(time) {
    if (!time) return '';
    return time.substring(0, 5);
}

// Calculate shift hours
function calculateShiftHours(startTime, endTime, breakMinutes) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const totalMinutes = (end - start) - breakMinutes;
    return formatDecimal(totalMinutes / 60);
}

// Parse time to minutes
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Get date range for current week
function getCurrentWeek() {
    const now = new Date();
    const first = now.getDate() - now.getDay() + 1;
    const start = new Date(now.setDate(first));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
}

// Get date range for current month
function getCurrentMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
}

// Check if date is in range
function isDateInRange(date, start, end) {
    const d = new Date(date);
    return d >= start && d <= end;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: ${document.querySelector('.header').offsetHeight + 20}px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Dropdown toggle function
function toggleDropdown(event, id) {
    event.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${id}`);
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${id}`) {
            menu.style.display = 'none';
        }
    });
    
    // Toggle current dropdown
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// =====================================
// Data Loading Functions
// =====================================

async function loadAllData() {
    try {
        await Promise.all([
            loadStaff(),
            loadSites(),
            loadShifts(),
            loadSettings(),
            loadNotes()
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data', 'error');
    }
}

async function loadStaff() {
    try {
        const response = await fetch('tables/staff?limit=1000');
        const result = await response.json();
        AppState.staff = result.data || [];
    } catch (error) {
        console.error('Error loading staff:', error);
        AppState.staff = [];
    }
}

async function loadSites() {
    try {
        const response = await fetch('tables/sites?limit=1000');
        const result = await response.json();
        AppState.sites = result.data || [];
    } catch (error) {
        console.error('Error loading sites:', error);
        AppState.sites = [];
    }
}

async function loadShifts() {
    try {
        const response = await fetch('tables/shifts?limit=1000');
        const result = await response.json();
        AppState.shifts = result.data || [];
    } catch (error) {
        console.error('Error loading shifts:', error);
        AppState.shifts = [];
    }
}

async function loadSettings() {
    try {
        const response = await fetch('tables/settings?limit=100');
        const result = await response.json();
        const settingsArray = result.data || [];
        AppState.settings = {};
        settingsArray.forEach(setting => {
            if (!AppState.settings[setting.category]) {
                AppState.settings[setting.category] = {};
            }
            AppState.settings[setting.category][setting.key] = setting.value;
        });
    } catch (error) {
        console.error('Error loading settings:', error);
        AppState.settings = {};
    }
}

async function loadNotes() {
    try {
        const response = await fetch('tables/notes?limit=1000');
        const result = await response.json();
        AppState.notes = result.data || [];
    } catch (error) {
        console.error('Error loading notes:', error);
        AppState.notes = [];
    }
}

// =====================================
// Navigation & UI
// =====================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('data-page');

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active page
            pages.forEach(page => page.classList.remove('active'));
            const targetPageElement = document.getElementById(`${targetPage}-page`);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
                
                // Close sidebar on mobile
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('active');
                }
                
                // Refresh page data
                switch(targetPage) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'staff':
                        loadStaffTable();
                        break;
                    case 'scheduling':
                        loadScheduling();
                        break;
                    case 'time-tracking':
                        loadTimeTracking();
                        break;
                    case 'payroll':
                        loadPayroll();
                        break;
                    case 'sites':
                        loadSitesTable();
                        break;
                    case 'settings':
                        loadSettingsPage();
                        break;
                }
            }
        });
    });

    // Menu toggle for mobile
    document.getElementById('menuToggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        AppState.darkMode = true;
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        AppState.darkMode = !AppState.darkMode;
        
        if (AppState.darkMode) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }

        // Reload charts with new theme
        if (document.getElementById('dashboard-page').classList.contains('active')) {
            loadDashboard();
        }
    });
}

// =====================================
// Modal Functions
// =====================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// =====================================
// Dashboard Module
// =====================================

function loadDashboard() {
    updateDashboardSummary();
    loadDashboardCharts();
    loadRecentShifts();
}

function updateDashboardSummary() {
    // Active Staff
    const activeStaff = AppState.staff.filter(s => s.status === 'Active').length;
    const activeStaffCard = document.getElementById('activeStaffCount');
    if (activeStaffCard) {
        activeStaffCard.textContent = activeStaff;
        activeStaffCard.parentElement.parentElement.style.cursor = 'pointer';
        activeStaffCard.parentElement.parentElement.onclick = () => navigateToPage('staff');
    }

    // Hours This Week
    const week = getCurrentWeek();
    const weekShifts = AppState.shifts.filter(s => 
        s.actual_hours && isDateInRange(s.shift_date, week.start, week.end)
    );
    const weekHours = weekShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
    const weekHoursCard = document.getElementById('hoursThisWeek');
    if (weekHoursCard) {
        weekHoursCard.textContent = formatDecimal(weekHours);
        weekHoursCard.parentElement.parentElement.style.cursor = 'pointer';
        weekHoursCard.parentElement.parentElement.onclick = () => navigateToPage('time-tracking');
    }

    // Hours This Month
    const month = getCurrentMonth();
    const monthShifts = AppState.shifts.filter(s => 
        s.actual_hours && isDateInRange(s.shift_date, month.start, month.end)
    );
    const monthHours = monthShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
    const monthHoursCard = document.getElementById('hoursThisMonth');
    if (monthHoursCard) {
        monthHoursCard.textContent = formatDecimal(monthHours);
        monthHoursCard.parentElement.parentElement.style.cursor = 'pointer';
        monthHoursCard.parentElement.parentElement.onclick = () => navigateToPage('time-tracking');
    }

    // Payroll Due
    let totalPayroll = 0;
    AppState.staff.forEach(staff => {
        const staffShifts = monthShifts.filter(s => s.staff_id === staff.id);
        const staffHours = staffShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
        totalPayroll += staffHours * staff.hourly_rate;
    });
    const payrollCard = document.getElementById('payrollDue');
    if (payrollCard) {
        payrollCard.textContent = formatCurrency(totalPayroll);
        payrollCard.parentElement.parentElement.style.cursor = 'pointer';
        payrollCard.parentElement.parentElement.onclick = () => navigateToPage('payroll');
    }

    // Shifts Today
    const today = new Date().toISOString().split('T')[0];
    const todayShifts = AppState.shifts.filter(s => s.shift_date === today);
    const shiftsCard = document.getElementById('shiftsToday');
    if (shiftsCard) {
        shiftsCard.textContent = todayShifts.length;
        shiftsCard.parentElement.parentElement.style.cursor = 'pointer';
        shiftsCard.parentElement.parentElement.onclick = () => navigateToPage('scheduling');
    }

    // Missed Shifts
    const missedShifts = weekShifts.filter(s => s.status === 'Missed').length;
    const missedCard = document.getElementById('missedShifts');
    if (missedCard) {
        missedCard.textContent = missedShifts;
        missedCard.parentElement.parentElement.style.cursor = 'pointer';
        missedCard.parentElement.parentElement.onclick = () => navigateToPage('time-tracking');
    }
}

// Helper function to navigate to pages
function navigateToPage(pageName) {
    const navItem = document.querySelector(`[data-page="${pageName}"]`);
    if (navItem) {
        navItem.click();
    }
}

function loadDashboardCharts() {
    loadWeeklyHoursChart();
    loadPayrollTrendChart();
}

function loadWeeklyHoursChart() {
    const ctx = document.getElementById('weeklyHoursChart');
    if (!ctx) return;

    const week = getCurrentWeek();
    const weekShifts = AppState.shifts.filter(s => 
        s.actual_hours && isDateInRange(s.shift_date, week.start, week.end)
    );

    // Group by staff
    const staffHours = {};
    weekShifts.forEach(shift => {
        if (!staffHours[shift.staff_id]) {
            staffHours[shift.staff_id] = 0;
        }
        staffHours[shift.staff_id] += shift.actual_hours;
    });

    const labels = [];
    const data = [];
    Object.entries(staffHours).forEach(([staffId, hours]) => {
        const staff = AppState.staff.find(s => s.id === staffId);
        if (staff) {
            labels.push(staff.full_name);
            data.push(parseFloat(formatDecimal(hours)));
        }
    });

    const isDark = document.body.classList.contains('dark-mode');
    
    if (window.weeklyHoursChartInstance) {
        window.weeklyHoursChartInstance.destroy();
    }

    window.weeklyHoursChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hours Worked',
                data: data,
                backgroundColor: 'rgba(66, 133, 244, 0.8)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDark ? '#9aa0a6' : '#6c757d'
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? '#9aa0a6' : '#6c757d'
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function loadPayrollTrendChart() {
    const ctx = document.getElementById('payrollTrendChart');
    if (!ctx) return;

    // Get last 6 months
    const labels = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        labels.push(date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }));
        
        const monthShifts = AppState.shifts.filter(s => 
            s.actual_hours && isDateInRange(s.shift_date, monthStart, monthEnd)
        );
        
        let monthlyPayroll = 0;
        AppState.staff.forEach(staff => {
            const staffShifts = monthShifts.filter(s => s.staff_id === staff.id);
            const staffHours = staffShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
            monthlyPayroll += staffHours * staff.hourly_rate;
        });
        
        data.push(parseFloat(monthlyPayroll.toFixed(2)));
    }

    const isDark = document.body.classList.contains('dark-mode');
    
    if (window.payrollTrendChartInstance) {
        window.payrollTrendChartInstance.destroy();
    }

    window.payrollTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Payroll (£)',
                data: data,
                borderColor: 'rgba(52, 168, 83, 1)',
                backgroundColor: 'rgba(52, 168, 83, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDark ? '#9aa0a6' : '#6c757d',
                        callback: function(value) {
                            return '£' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? '#9aa0a6' : '#6c757d'
                    },
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function loadRecentShifts() {
    const tbody = document.getElementById('recentShiftsTable');
    if (!tbody) return;

    const recentShifts = [...AppState.shifts]
        .sort((a, b) => new Date(b.shift_date) - new Date(a.shift_date))
        .slice(0, 10);

    tbody.innerHTML = recentShifts.map(shift => {
        const staff = AppState.staff.find(s => s.id === shift.staff_id);
        const site = AppState.sites.find(s => s.id === shift.site_id);
        
        let statusClass = 'secondary';
        if (shift.status === 'Completed') statusClass = 'success';
        if (shift.status === 'In Progress') statusClass = 'info';
        if (shift.status === 'Missed') statusClass = 'danger';
        
        return `
            <tr>
                <td>${formatDate(shift.shift_date)}</td>
                <td>${staff ? staff.full_name : 'Unknown'}</td>
                <td>${site ? site.site_name : 'Unknown'}</td>
                <td>${shift.actual_hours ? formatDecimal(shift.actual_hours) : shift.shift_hours} hrs</td>
                <td><span class="badge badge-${statusClass}">${shift.status}</span></td>
            </tr>
        `;
    }).join('');
}

// =====================================
// Staff Management Module
// =====================================

function loadStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;

    // Get filter values
    const searchTerm = document.getElementById('staffSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('staffStatusFilter')?.value || '';
    const typeFilter = document.getElementById('staffTypeFilter')?.value || '';

    // Filter staff
    let filteredStaff = AppState.staff.filter(staff => {
        const matchesSearch = staff.full_name.toLowerCase().includes(searchTerm) ||
                            staff.email.toLowerCase().includes(searchTerm) ||
                            staff.phone.includes(searchTerm);
        const matchesStatus = !statusFilter || staff.status === statusFilter;
        const matchesType = !typeFilter || staff.employment_type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    tbody.innerHTML = filteredStaff.map(staff => `
        <tr>
            <td><strong>${staff.full_name}</strong></td>
            <td>${staff.phone}</td>
            <td>${staff.email}</td>
            <td>${staff.employment_type}</td>
            <td>${formatCurrency(staff.hourly_rate)}/hr</td>
            <td>
                <span class="badge badge-${staff.status === 'Active' ? 'success' : 'secondary'}">
                    ${staff.status}
                </span>
            </td>
            <td>
                <div class="dropdown-container" style="position: relative;">
                    <button class="btn btn-sm btn-secondary" onclick="toggleDropdown(event, '${staff.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu" id="dropdown-${staff.id}" style="display: none;">
                        <button class="dropdown-item" onclick="viewStaffProfile('${staff.id}')">
                            <i class="fas fa-eye"></i> View Profile
                        </button>
                        <button class="dropdown-item" onclick="editStaff('${staff.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="dropdown-item text-danger" onclick="deleteStaff('${staff.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

function initStaffManagement() {
    // Add Staff button
    document.getElementById('addStaffBtn')?.addEventListener('click', () => {
        document.getElementById('staffModalTitle').textContent = 'Add Staff';
        document.getElementById('staffForm').reset();
        document.getElementById('staffId').value = '';
        populateSiteOptions('staffDefaultSite');
        openModal('staffModal');
    });

    // Save Staff button
    document.getElementById('saveStaffBtn')?.addEventListener('click', saveStaff);

    // Search and filter
    document.getElementById('staffSearch')?.addEventListener('input', loadStaffTable);
    document.getElementById('staffStatusFilter')?.addEventListener('change', loadStaffTable);
    document.getElementById('staffTypeFilter')?.addEventListener('change', loadStaffTable);

    // Sort code formatting
    document.getElementById('staffSortCode')?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
        if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
        if (value.length > 8) value = value.slice(0, 8);
        e.target.value = value;
    });
}

async function saveStaff() {
    const staffId = document.getElementById('staffId').value;
    
    // Validate required fields
    const fullName = document.getElementById('staffFullName').value;
    const phone = document.getElementById('staffPhone').value;
    const email = document.getElementById('staffEmail').value;
    const niNumber = document.getElementById('staffNI').value;
    const address = document.getElementById('staffAddress').value;
    const employmentType = document.getElementById('staffEmploymentType').value;
    const hourlyRate = document.getElementById('staffHourlyRate').value;
    
    if (!fullName || !phone || !email || !niNumber || !address || !employmentType || !hourlyRate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const staffData = {
        id: staffId || `staff-${Date.now()}`,
        full_name: fullName,
        phone: phone,
        email: email,
        ni_number: niNumber,
        address: address,
        employment_type: employmentType,
        hourly_rate: parseFloat(hourlyRate),
        default_site_id: document.getElementById('staffDefaultSite').value,
        status: document.getElementById('staffStatus').value,
        account_name: document.getElementById('staffAccountName').value,
        sort_code: document.getElementById('staffSortCode').value,
        account_number: document.getElementById('staffAccountNumber').value,
        bank_reference: document.getElementById('staffBankReference').value
    };

    try {
        let response;
        if (staffId) {
            // Update existing
            response = await fetch(`tables/staff/${staffId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData)
            });
        } else {
            // Create new
            response = await fetch('tables/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData)
            });
        }

        if (response.ok) {
            await loadStaff();
            loadStaffTable();
            
            // Refresh all staff dropdowns
            populateStaffOptions('shiftStaff');
            populateStaffOptions('payrollStaffFilter');
            populateStaffOptions('scheduleStaffFilter');
            
            // Refresh bulk assign list
            populateBulkStaffList();
            
            closeModal('staffModal');
            showToast(staffId ? 'Staff updated successfully' : 'Staff added successfully - Now you can assign shifts!');
        } else {
            showToast('Error saving staff', 'error');
        }
    } catch (error) {
        console.error('Error saving staff:', error);
        showToast('Error saving staff', 'error');
    }
}

function editStaff(staffId) {
    const staff = AppState.staff.find(s => s.id === staffId);
    if (!staff) return;

    document.getElementById('staffModalTitle').textContent = 'Edit Staff';
    document.getElementById('staffId').value = staff.id;
    document.getElementById('staffFullName').value = staff.full_name;
    document.getElementById('staffPhone').value = staff.phone;
    document.getElementById('staffEmail').value = staff.email;
    document.getElementById('staffNI').value = staff.ni_number;
    document.getElementById('staffAddress').value = staff.address;
    document.getElementById('staffEmploymentType').value = staff.employment_type;
    document.getElementById('staffHourlyRate').value = staff.hourly_rate;
    populateSiteOptions('staffDefaultSite');
    document.getElementById('staffDefaultSite').value = staff.default_site_id;
    document.getElementById('staffStatus').value = staff.status;
    document.getElementById('staffAccountName').value = staff.account_name || '';
    document.getElementById('staffSortCode').value = staff.sort_code || '';
    document.getElementById('staffAccountNumber').value = staff.account_number || '';
    document.getElementById('staffBankReference').value = staff.bank_reference || '';

    openModal('staffModal');
}

async function deleteStaff(staffId) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
        const response = await fetch(`tables/staff/${staffId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadStaff();
            loadStaffTable();
            showToast('Staff deleted successfully');
        } else {
            showToast('Error deleting staff', 'error');
        }
    } catch (error) {
        console.error('Error deleting staff:', error);
        showToast('Error deleting staff', 'error');
    }
}

// Staff Profile Functions

function viewStaffProfile(staffId) {
    AppState.currentStaffId = staffId;
    const staff = AppState.staff.find(s => s.id === staffId);
    if (!staff) return;

    // Hide main staff page, show profile page
    document.getElementById('staff-page').classList.remove('active');
    document.getElementById('staff-profile-page').style.display = 'block';
    document.getElementById('staff-profile-page').classList.add('active');

    // Update profile header
    document.getElementById('staffProfileName').textContent = staff.full_name;

    // Load profile data
    loadStaffProfileSummary(staffId);
    loadStaffProfileInfo(staff);
    loadStaffProfileShifts(staffId);
    loadStaffProfileNotes(staffId);
}

document.getElementById('backToStaffBtn')?.addEventListener('click', () => {
    document.getElementById('staff-profile-page').style.display = 'none';
    document.getElementById('staff-profile-page').classList.remove('active');
    document.getElementById('staff-page').classList.add('active');
    AppState.currentStaffId = null;
});

document.getElementById('editStaffProfileBtn')?.addEventListener('click', () => {
    if (AppState.currentStaffId) {
        editStaff(AppState.currentStaffId);
    }
});

document.getElementById('deleteStaffProfileBtn')?.addEventListener('click', async () => {
    if (AppState.currentStaffId) {
        await deleteStaff(AppState.currentStaffId);
        document.getElementById('backToStaffBtn').click();
    }
});

function loadStaffProfileSummary(staffId) {
    const today = new Date().toISOString().split('T')[0];
    const week = getCurrentWeek();
    const month = getCurrentMonth();

    const staff = AppState.staff.find(s => s.id === staffId);
    if (!staff) return;

    // Calculate hours
    const todayShifts = AppState.shifts.filter(s => s.staff_id === staffId && s.shift_date === today);
    const weekShifts = AppState.shifts.filter(s => s.staff_id === staffId && isDateInRange(s.shift_date, week.start, week.end));
    const monthShifts = AppState.shifts.filter(s => s.staff_id === staffId && isDateInRange(s.shift_date, month.start, month.end));

    const hoursToday = todayShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
    const hoursWeek = weekShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
    const hoursMonth = monthShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);

    document.getElementById('profileHoursToday').textContent = formatDecimal(hoursToday);
    document.getElementById('profileHoursWeek').textContent = formatDecimal(hoursWeek);
    document.getElementById('profileHoursMonth').textContent = formatDecimal(hoursMonth);
    document.getElementById('profileEarnings').textContent = formatCurrency(hoursMonth * staff.hourly_rate);
}

function loadStaffProfileInfo(staff) {
    document.getElementById('infoFullName').textContent = staff.full_name;
    document.getElementById('infoPhone').textContent = staff.phone;
    document.getElementById('infoEmail').textContent = staff.email;
    document.getElementById('infoAddress').textContent = staff.address;
    document.getElementById('infoNI').textContent = staff.ni_number;
    document.getElementById('infoEmploymentType').textContent = staff.employment_type;
    document.getElementById('infoHourlyRate').textContent = formatCurrency(staff.hourly_rate) + '/hr';
    document.getElementById('infoStatus').textContent = staff.status;
    
    const site = AppState.sites.find(s => s.id === staff.default_site_id);
    document.getElementById('infoDefaultSite').textContent = site ? site.site_name : 'None';

    document.getElementById('infoAccountName').textContent = staff.account_name || 'Not provided';
    document.getElementById('infoSortCode').textContent = staff.sort_code || 'Not provided';
    document.getElementById('infoAccountNumber').textContent = staff.account_number ? '****' + staff.account_number.slice(-4) : 'Not provided';
    document.getElementById('infoBankReference').textContent = staff.bank_reference || 'Not provided';
}

function loadStaffProfileShifts(staffId) {
    const tbody = document.getElementById('profileShiftsTable');
    if (!tbody) return;

    const staffShifts = AppState.shifts
        .filter(s => s.staff_id === staffId)
        .sort((a, b) => new Date(b.shift_date) - new Date(a.shift_date))
        .slice(0, 20);

    tbody.innerHTML = staffShifts.map(shift => {
        const site = AppState.sites.find(s => s.id === shift.site_id);
        let statusClass = 'secondary';
        if (shift.status === 'Completed') statusClass = 'success';
        if (shift.status === 'In Progress') statusClass = 'info';
        if (shift.status === 'Missed') statusClass = 'danger';

        return `
            <tr>
                <td>${formatDate(shift.shift_date)}</td>
                <td>${site ? site.site_name : 'Unknown'}</td>
                <td>${formatTime(shift.start_time)}</td>
                <td>${formatTime(shift.end_time)}</td>
                <td>${shift.actual_hours ? formatDecimal(shift.actual_hours) : formatDecimal(shift.shift_hours)} hrs</td>
                <td><span class="badge badge-${statusClass}">${shift.status}</span></td>
            </tr>
        `;
    }).join('');
}

function loadStaffProfileNotes(staffId) {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    const staffNotes = AppState.notes
        .filter(n => n.staff_id === staffId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (staffNotes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No notes yet.</p>';
        return;
    }

    container.innerHTML = staffNotes.map(note => `
        <div class="note-card">
            <div class="note-header">
                <div class="note-meta">
                    <span><i class="fas fa-user"></i> ${note.author}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(note.timestamp)}</span>
                    ${note.is_internal ? '<span class="badge badge-warning">Internal</span>' : ''}
                </div>
                <div class="note-actions">
                    <button onclick="editNote('${note.id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteNote('${note.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="note-content">${note.note_text}</div>
        </div>
    `).join('');
}

// Profile tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// Notes Management
document.getElementById('addNoteBtn')?.addEventListener('click', () => {
    document.getElementById('noteModalTitle').textContent = 'Add Note';
    document.getElementById('noteForm').reset();
    document.getElementById('noteId').value = '';
    document.getElementById('noteStaffId').value = AppState.currentStaffId;
    openModal('noteModal');
});

document.getElementById('saveNoteBtn')?.addEventListener('click', async () => {
    const noteId = document.getElementById('noteId').value;
    const noteData = {
        id: noteId || `note-${Date.now()}`,
        staff_id: document.getElementById('noteStaffId').value,
        note_text: document.getElementById('noteText').value,
        author: AppState.currentUser,
        is_internal: document.getElementById('noteInternal').checked,
        timestamp: new Date().toISOString()
    };

    try {
        let response;
        if (noteId) {
            response = await fetch(`tables/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
        } else {
            response = await fetch('tables/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
        }

        if (response.ok) {
            await loadNotes();
            loadStaffProfileNotes(AppState.currentStaffId);
            closeModal('noteModal');
            showToast(noteId ? 'Note updated successfully' : 'Note added successfully');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        showToast('Error saving note', 'error');
    }
});

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await fetch(`tables/notes/${noteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadNotes();
            loadStaffProfileNotes(AppState.currentStaffId);
            showToast('Note deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Error deleting note', 'error');
    }
}

// =====================================
// Scheduling Module (Part 1)
// =====================================

function loadScheduling() {
    populateScheduleFilters();
    loadShiftsTable();
}

function populateScheduleFilters() {
    // Populate staff filter
    const staffFilter = document.getElementById('scheduleStaffFilter');
    if (staffFilter) {
        staffFilter.innerHTML = '<option value="">All Staff</option>' +
            AppState.staff.map(s => `<option value="${s.id}">${s.full_name}</option>`).join('');
    }

    // Populate site filter
    const siteFilter = document.getElementById('scheduleSiteFilter');
    if (siteFilter) {
        siteFilter.innerHTML = '<option value="">All Sites</option>' +
            AppState.sites.map(s => `<option value="${s.id}">${s.site_name}</option>`).join('');
    }
}

function loadShiftsTable() {
    const tbody = document.getElementById('shiftsTableBody');
    if (!tbody) return;

    // Get filter values
    const staffFilter = document.getElementById('scheduleStaffFilter')?.value || '';
    const siteFilter = document.getElementById('scheduleSiteFilter')?.value || '';

    // Filter shifts - show upcoming shifts
    const today = new Date();
    let filteredShifts = AppState.shifts.filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        const matchesStaff = !staffFilter || shift.staff_id === staffFilter;
        const matchesSite = !siteFilter || shift.site_id === siteFilter;
        const isUpcoming = shiftDate >= today || shift.shift_date === today.toISOString().split('T')[0];
        
        return matchesStaff && matchesSite && isUpcoming;
    });

    // Sort by date
    filteredShifts.sort((a, b) => new Date(a.shift_date) - new Date(b.shift_date));

    tbody.innerHTML = filteredShifts.map(shift => {
        const staff = AppState.staff.find(s => s.id === shift.staff_id);
        const site = AppState.sites.find(s => s.id === shift.site_id);
        
        let statusClass = 'secondary';
        if (shift.status === 'Completed') statusClass = 'success';
        if (shift.status === 'In Progress') statusClass = 'info';
        if (shift.status === 'Scheduled') statusClass = 'warning';
        if (shift.status === 'Missed') statusClass = 'danger';

        return `
            <tr>
                <td>${formatDate(shift.shift_date)}</td>
                <td>${staff ? staff.full_name : 'Unknown'}</td>
                <td>${site ? site.site_name : 'Unknown'}</td>
                <td>${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}</td>
                <td>${formatDecimal(shift.shift_hours)} hrs</td>
                <td><span class="badge badge-${statusClass}">${shift.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editShift('${shift.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteShift('${shift.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function initScheduling() {
    // Add Shift button
    document.getElementById('addShiftBtn')?.addEventListener('click', () => {
        document.getElementById('shiftModalTitle').textContent = 'Add Shift';
        document.getElementById('shiftForm').reset();
        document.getElementById('shiftId').value = '';
        document.getElementById('singleDayFields').style.display = 'block';
        document.getElementById('multiDayFields').style.display = 'none';
        document.getElementById('recurringFields').style.display = 'none';
        populateStaffOptions('shiftStaff');
        populateSiteOptions('shiftSite');
        openModal('shiftModal');
    });

    // Bulk Assign button
    document.getElementById('bulkAssignBtn')?.addEventListener('click', () => {
        populateBulkStaffList();
        populateSiteOptions('bulkSite');
        openModal('bulkAssignModal');
    });

    // Save Shift button
    document.getElementById('saveShiftBtn')?.addEventListener('click', saveShift);

    // Save Bulk Assign button
    document.getElementById('saveBulkAssignBtn')?.addEventListener('click', saveBulkAssign);

    // Recurring checkbox
    document.getElementById('shiftRecurring')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.getElementById('singleDayFields').style.display = 'none';
            document.getElementById('multiDayFields').style.display = 'none';
            document.getElementById('recurringFields').style.display = 'block';
        } else {
            document.getElementById('singleDayFields').style.display = 'block';
            document.getElementById('multiDayFields').style.display = 'none';
            document.getElementById('recurringFields').style.display = 'none';
        }
    });

    // Multi-day checkbox
    document.getElementById('multiDayMode')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.getElementById('singleDayFields').style.display = 'none';
            document.getElementById('multiDayFields').style.display = 'block';
            generateMultiDayCalendar();
        } else {
            document.getElementById('singleDayFields').style.display = 'block';
            document.getElementById('multiDayFields').style.display = 'none';
        }
    });

    // Filters
    document.getElementById('scheduleStaffFilter')?.addEventListener('change', loadShiftsTable);
    document.getElementById('scheduleSiteFilter')?.addEventListener('change', loadShiftsTable);
}

function generateMultiDayCalendar() {
    const calendar = document.getElementById('multiDayCalendar');
    if (!calendar) return;

    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    calendar.innerHTML = '';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        dayEl.dataset.date = dateStr;
        
        if (date < today) {
            dayEl.classList.add('disabled');
        } else {
            dayEl.addEventListener('click', () => {
                dayEl.classList.toggle('selected');
            });
        }
        
        calendar.appendChild(dayEl);
    }
}

async function saveShift() {
    const isRecurring = document.getElementById('shiftRecurring').checked;
    const isMultiDay = document.getElementById('multiDayMode').checked;
    const shiftId = document.getElementById('shiftId').value;

    // Validate required fields
    const staffId = document.getElementById('shiftStaff').value;
    const siteId = document.getElementById('shiftSite').value;
    const startTime = document.getElementById('shiftStartTime').value;
    const endTime = document.getElementById('shiftEndTime').value;
    const breakDuration = document.getElementById('shiftBreak').value;

    if (!staffId || !siteId || !startTime || !endTime || !breakDuration) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const baseShiftData = {
        staff_id: staffId,
        site_id: siteId,
        start_time: startTime,
        end_time: endTime,
        break_duration: parseInt(breakDuration),
        notes: document.getElementById('shiftNotes').value,
        status: 'Scheduled',
        clock_in: null,
        clock_out: null,
        actual_hours: null
    };

    // Calculate shift hours
    const shiftHours = calculateShiftHours(
        baseShiftData.start_time,
        baseShiftData.end_time,
        baseShiftData.break_duration
    );
    baseShiftData.shift_hours = parseFloat(shiftHours);

    try {
        if (shiftId) {
            // Update existing shift
            const shiftDate = document.getElementById('shiftDate').value;
            if (!shiftDate) {
                showToast('Please select a date', 'error');
                return;
            }
            
            const shiftData = {
                ...baseShiftData,
                id: shiftId,
                shift_date: shiftDate
            };
            
            const response = await fetch(`tables/shifts/${shiftId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftData)
            });

            if (response.ok) {
                await loadShifts();
                loadShiftsTable();
                closeModal('shiftModal');
                showToast('Shift updated successfully');
            }
        } else if (isRecurring) {
            // Create recurring shifts
            const dayOfWeek = parseInt(document.getElementById('shiftDayOfWeek').value);
            const startDateStr = document.getElementById('shiftRecurringStart').value;
            const endDateStr = document.getElementById('shiftRecurringEnd').value;
            
            if (!startDateStr || !endDateStr) {
                showToast('Please select start and end dates', 'error');
                return;
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            const shifts = [];
            let currentDate = new Date(startDate);

            // Adjust to first occurrence of day of week
            while (currentDate.getDay() !== dayOfWeek) {
                currentDate.setDate(currentDate.getDate() + 1);
            }

            while (currentDate <= endDate) {
                shifts.push({
                    ...baseShiftData,
                    id: `shift-${Date.now()}-${shifts.length}`,
                    shift_date: currentDate.toISOString().split('T')[0]
                });
                currentDate.setDate(currentDate.getDate() + 7);
            }

            // Create all shifts
            for (const shift of shifts) {
                await fetch('tables/shifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shift)
                });
            }

            await loadShifts();
            loadShiftsTable();
            closeModal('shiftModal');
            showToast(`${shifts.length} recurring shifts created successfully`);
        } else if (isMultiDay) {
            // Create shifts for selected days
            const selectedDays = document.querySelectorAll('.calendar-day.selected');
            
            if (selectedDays.length === 0) {
                showToast('Please select at least one day', 'error');
                return;
            }
            
            const shifts = [];

            selectedDays.forEach((dayEl, index) => {
                shifts.push({
                    ...baseShiftData,
                    id: `shift-${Date.now()}-${index}`,
                    shift_date: dayEl.dataset.date
                });
            });

            // Create all shifts
            for (const shift of shifts) {
                await fetch('tables/shifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shift)
                });
            }

            await loadShifts();
            loadShiftsTable();
            closeModal('shiftModal');
            showToast(`${shifts.length} shifts created successfully`);
        } else {
            // Create single shift
            const shiftDate = document.getElementById('shiftDate').value;
            
            if (!shiftDate) {
                showToast('Please select a date', 'error');
                return;
            }
            
            const shiftData = {
                ...baseShiftData,
                id: `shift-${Date.now()}`,
                shift_date: shiftDate
            };

            const response = await fetch('tables/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shiftData)
            });

            if (response.ok) {
                await loadShifts();
                loadShiftsTable();
                loadTimeTracking(); // Refresh time tracking if open
                closeModal('shiftModal');
                showToast('Shift created successfully');
            }
        }
    } catch (error) {
        console.error('Error saving shift:', error);
        showToast('Error saving shift', 'error');
    }
}

function editShift(shiftId) {
    const shift = AppState.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    document.getElementById('shiftModalTitle').textContent = 'Edit Shift';
    document.getElementById('shiftId').value = shift.id;
    populateStaffOptions('shiftStaff');
    document.getElementById('shiftStaff').value = shift.staff_id;
    populateSiteOptions('shiftSite');
    document.getElementById('shiftSite').value = shift.site_id;
    document.getElementById('shiftDate').value = shift.shift_date;
    document.getElementById('shiftStartTime').value = shift.start_time;
    document.getElementById('shiftEndTime').value = shift.end_time;
    document.getElementById('shiftBreak').value = shift.break_duration;
    document.getElementById('shiftNotes').value = shift.notes || '';

    document.getElementById('singleDayFields').style.display = 'block';
    document.getElementById('multiDayFields').style.display = 'none';
    document.getElementById('recurringFields').style.display = 'none';
    document.getElementById('multiDayMode').checked = false;
    document.getElementById('shiftRecurring').checked = false;

    openModal('shiftModal');
}

async function deleteShift(shiftId) {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
        const response = await fetch(`tables/shifts/${shiftId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadShifts();
            loadShiftsTable();
            showToast('Shift deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting shift:', error);
        showToast('Error deleting shift', 'error');
    }
}

function populateBulkStaffList() {
    const container = document.getElementById('bulkStaffList');
    if (!container) return;

    container.innerHTML = AppState.staff
        .filter(s => s.status === 'Active')
        .map(staff => `
            <div class="checkbox-item">
                <input type="checkbox" id="bulk-${staff.id}" value="${staff.id}">
                <label for="bulk-${staff.id}">${staff.full_name} (${staff.employment_type})</label>
            </div>
        `).join('');
}

async function saveBulkAssign() {
    const selectedStaff = [];
    document.querySelectorAll('#bulkStaffList input:checked').forEach(cb => {
        selectedStaff.push(cb.value);
    });

    if (selectedStaff.length === 0) {
        showToast('Please select at least one staff member', 'error');
        return;
    }

    const shiftData = {
        site_id: document.getElementById('bulkSite').value,
        shift_date: document.getElementById('bulkDate').value,
        start_time: document.getElementById('bulkStartTime').value,
        end_time: document.getElementById('bulkEndTime').value,
        break_duration: parseInt(document.getElementById('bulkBreak').value),
        status: 'Scheduled',
        clock_in: null,
        clock_out: null,
        actual_hours: null,
        notes: 'Bulk assigned'
    };

    const shiftHours = calculateShiftHours(
        shiftData.start_time,
        shiftData.end_time,
        shiftData.break_duration
    );
    shiftData.shift_hours = parseFloat(shiftHours);

    try {
        for (const staffId of selectedStaff) {
            const shift = {
                ...shiftData,
                id: `shift-${Date.now()}-${Math.random()}`,
                staff_id: staffId
            };

            await fetch('tables/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shift)
            });
        }

        await loadShifts();
        loadShiftsTable();
        closeModal('bulkAssignModal');
        showToast(`${selectedStaff.length} shifts assigned successfully`);
    } catch (error) {
        console.error('Error bulk assigning shifts:', error);
        showToast('Error assigning shifts', 'error');
    }
}

// =====================================
// Time Tracking Module
// =====================================

function loadTimeTracking() {
    loadActiveShifts();
    loadTodayShifts();
}

function loadActiveShifts() {
    const tbody = document.getElementById('activeShiftsTable');
    if (!tbody) return;

    const activeShifts = AppState.shifts.filter(s => s.status === 'In Progress');

    if (activeShifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No active shifts</td></tr>';
        return;
    }

    tbody.innerHTML = activeShifts.map(shift => {
        const staff = AppState.staff.find(s => s.id === shift.staff_id);
        const site = AppState.sites.find(s => s.id === shift.site_id);
        
        const clockInTime = new Date(shift.clock_in);
        const now = new Date();
        const durationMinutes = Math.floor((now - clockInTime) / 1000 / 60);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const duration = `${hours}h ${minutes}m`;

        return `
            <tr>
                <td><strong>${staff ? staff.full_name : 'Unknown'}</strong></td>
                <td>${site ? site.site_name : 'Unknown'}</td>
                <td>${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}</td>
                <td>${new Date(shift.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                <td><strong>${duration}</strong></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="clockOut('${shift.id}')">
                        <i class="fas fa-sign-out-alt"></i> Clock Out
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadTodayShifts() {
    const tbody = document.getElementById('todayShiftsTable');
    if (!tbody) return;

    const today = new Date().toISOString().split('T')[0];
    const todayShifts = AppState.shifts.filter(s => s.shift_date === today);

    if (todayShifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No shifts scheduled for today</td></tr>';
        return;
    }

    tbody.innerHTML = todayShifts.map(shift => {
        const staff = AppState.staff.find(s => s.id === shift.staff_id);
        const site = AppState.sites.find(s => s.id === shift.site_id);
        
        let statusClass = 'secondary';
        if (shift.status === 'Completed') statusClass = 'success';
        if (shift.status === 'In Progress') statusClass = 'info';
        if (shift.status === 'Scheduled') statusClass = 'warning';

        const scheduledTime = `${formatTime(shift.start_time)} - ${formatTime(shift.end_time)}`;
        const actualTime = shift.clock_in && shift.clock_out ? 
            `${new Date(shift.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${new Date(shift.clock_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` :
            shift.clock_in ? 
            `${new Date(shift.clock_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - In Progress` :
            'Not started';

        return `
            <tr>
                <td><strong>${staff ? staff.full_name : 'Unknown'}</strong></td>
                <td>${site ? site.site_name : 'Unknown'}</td>
                <td>${scheduledTime}</td>
                <td>${actualTime}</td>
                <td>${shift.actual_hours ? formatDecimal(shift.actual_hours) + ' hrs' : '-'}</td>
                <td><span class="badge badge-${statusClass}">${shift.status}</span></td>
                <td>
                    ${shift.status === 'Scheduled' ? 
                        `<button class="btn btn-sm btn-success" onclick="clockIn('${shift.id}')">
                            <i class="fas fa-sign-in-alt"></i> Clock In
                        </button>` :
                        shift.status === 'In Progress' ?
                        `<button class="btn btn-sm btn-danger" onclick="clockOut('${shift.id}')">
                            <i class="fas fa-sign-out-alt"></i> Clock Out
                        </button>` :
                        '-'
                    }
                </td>
            </tr>
        `;
    }).join('');
}

async function clockIn(shiftId) {
    const shift = AppState.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const updatedShift = {
        ...shift,
        status: 'In Progress',
        clock_in: new Date().toISOString()
    };

    try {
        const response = await fetch(`tables/shifts/${shiftId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedShift)
        });

        if (response.ok) {
            await loadShifts();
            loadTimeTracking();
            showToast('Clocked in successfully');
        }
    } catch (error) {
        console.error('Error clocking in:', error);
        showToast('Error clocking in', 'error');
    }
}

async function clockOut(shiftId) {
    const shift = AppState.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const clockOutTime = new Date();
    const clockInTime = new Date(shift.clock_in);
    
    // Calculate actual hours
    const totalMinutes = (clockOutTime - clockInTime) / 1000 / 60;
    const actualHours = (totalMinutes - shift.break_duration) / 60;

    const updatedShift = {
        ...shift,
        status: 'Completed',
        clock_out: clockOutTime.toISOString(),
        actual_hours: parseFloat(formatDecimal(actualHours))
    };

    try {
        const response = await fetch(`tables/shifts/${shiftId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedShift)
        });

        if (response.ok) {
            await loadShifts();
            loadTimeTracking();
            showToast('Clocked out successfully');
        }
    } catch (error) {
        console.error('Error clocking out:', error);
        showToast('Error clocking out', 'error');
    }
}

// =====================================
// Payroll Module
// =====================================

function loadPayroll() {
    updatePayrollSummary();
    loadPayrollTable();
    populatePayrollFilters();
}

function populatePayrollFilters() {
    const staffFilter = document.getElementById('payrollStaffFilter');
    if (staffFilter) {
        staffFilter.innerHTML = '<option value="">All Staff</option>' +
            AppState.staff.map(s => `<option value="${s.id}">${s.full_name}</option>`).join('');
    }
}

function initPayroll() {
    // Generate Payroll button
    document.getElementById('generatePayrollBtn')?.addEventListener('click', generatePayrollRecords);
    
    // Period filter
    document.getElementById('payrollPeriodFilter')?.addEventListener('change', loadPayrollTable);
    
    // Staff filter
    document.getElementById('payrollStaffFilter')?.addEventListener('change', loadPayrollTable);
}

// Generate payroll records
async function generatePayrollRecords() {
    const periodFilter = document.getElementById('payrollPeriodFilter')?.value || 'month';
    
    let dateRange;
    if (periodFilter === 'week') {
        dateRange = getCurrentWeek();
    } else {
        dateRange = getCurrentMonth();
    }

    const payrollRecords = [];

    for (const staff of AppState.staff) {
        const staffShifts = AppState.shifts.filter(s => 
            s.staff_id === staff.id && 
            s.actual_hours && 
            isDateInRange(s.shift_date, dateRange.start, dateRange.end)
        );

        if (staffShifts.length > 0) {
            const totalHours = staffShifts.reduce((sum, s) => sum + s.actual_hours, 0);
            const overtimeThreshold = parseFloat(AppState.settings.payroll?.overtime_threshold || 40) * (periodFilter === 'month' ? 4 : 1);
            const regularHours = Math.min(totalHours, overtimeThreshold);
            const overtimeHours = Math.max(0, totalHours - overtimeThreshold);
            const grossPay = (regularHours * staff.hourly_rate) + 
                           (overtimeHours * staff.hourly_rate * parseFloat(AppState.settings.payroll?.overtime_multiplier || 1.5));

            const payrollRecord = {
                id: `payroll-${Date.now()}-${staff.id}`,
                staff_id: staff.id,
                period_start: dateRange.start.toISOString().split('T')[0],
                period_end: dateRange.end.toISOString().split('T')[0],
                total_hours: parseFloat(formatDecimal(totalHours)),
                regular_hours: parseFloat(formatDecimal(regularHours)),
                overtime_hours: parseFloat(formatDecimal(overtimeHours)),
                gross_pay: parseFloat(grossPay.toFixed(2)),
                tax: 0,
                pension: 0,
                advance: 0,
                other_deductions: 0,
                net_pay: parseFloat(grossPay.toFixed(2)),
                payment_date: null,
                payment_method: 'Bank',
                payment_notes: '',
                is_paid: false
            };

            payrollRecords.push(payrollRecord);

            // Save to database
            try {
                await fetch('tables/payroll_records', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payrollRecord)
                });
            } catch (error) {
                console.error('Error creating payroll record:', error);
            }
        }
    }

    if (payrollRecords.length > 0) {
        showToast(`Generated ${payrollRecords.length} payroll records successfully`);
        // Reload payroll records
        await loadPayrollRecords();
        loadPayrollTable();
    } else {
        showToast('No shifts found for the selected period', 'error');
    }
}

async function loadPayrollRecords() {
    try {
        const response = await fetch('tables/payroll_records?limit=1000');
        const result = await response.json();
        AppState.payrollRecords = result.data || [];
    } catch (error) {
        console.error('Error loading payroll records:', error);
        AppState.payrollRecords = [];
    }
}

function loadPayroll() {
    updatePayrollSummary();
    loadPayrollTable();
    populatePayrollFilters();
}

function populatePayrollFilters() {
    const staffFilter = document.getElementById('payrollStaffFilter');
    if (staffFilter) {
        staffFilter.innerHTML = '<option value="">All Staff</option>' +
            AppState.staff.map(s => `<option value="${s.id}">${s.full_name}</option>`).join('');
    }
}

function updatePayrollSummary() {
    const week = getCurrentWeek();
    const month = getCurrentMonth();

    // Calculate weekly payroll
    const weekShifts = AppState.shifts.filter(s => 
        s.actual_hours && isDateInRange(s.shift_date, week.start, week.end)
    );
    let weeklyPayroll = 0;
    AppState.staff.forEach(staff => {
        const staffShifts = weekShifts.filter(s => s.staff_id === staff.id);
        const staffHours = staffShifts.reduce((sum, s) => sum + s.actual_hours, 0);
        weeklyPayroll += staffHours * staff.hourly_rate;
    });

    // Calculate monthly payroll
    const monthShifts = AppState.shifts.filter(s => 
        s.actual_hours && isDateInRange(s.shift_date, month.start, month.end)
    );
    let monthlyPayroll = 0;
    AppState.staff.forEach(staff => {
        const staffShifts = monthShifts.filter(s => s.staff_id === staff.id);
        const staffHours = staffShifts.reduce((sum, s) => sum + s.actual_hours, 0);
        monthlyPayroll += staffHours * staff.hourly_rate;
    });

    const weeklyCard = document.getElementById('payrollWeekly');
    if (weeklyCard) {
        weeklyCard.textContent = formatCurrency(weeklyPayroll);
        weeklyCard.parentElement.parentElement.style.cursor = 'pointer';
        weeklyCard.parentElement.parentElement.onclick = () => {
            document.getElementById('payrollPeriodFilter').value = 'week';
            loadPayrollTable();
        };
    }

    const monthlyCard = document.getElementById('payrollMonthly');
    if (monthlyCard) {
        monthlyCard.textContent = formatCurrency(monthlyPayroll);
        monthlyCard.parentElement.parentElement.style.cursor = 'pointer';
        monthlyCard.parentElement.parentElement.onclick = () => {
            document.getElementById('payrollPeriodFilter').value = 'month';
            loadPayrollTable();
        };
    }

    const paidCard = document.getElementById('payrollPaid');
    if (paidCard) {
        paidCard.textContent = formatCurrency(0);
        paidCard.parentElement.parentElement.style.cursor = 'pointer';
        paidCard.parentElement.parentElement.onclick = () => loadPayrollTable();
    }

    const pendingCard = document.getElementById('payrollPending');
    if (pendingCard) {
        pendingCard.textContent = formatCurrency(monthlyPayroll);
        pendingCard.parentElement.parentElement.style.cursor = 'pointer';
        pendingCard.parentElement.parentElement.onclick = () => loadPayrollTable();
    }
}

function loadPayrollTable() {
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) return;

    const periodFilter = document.getElementById('payrollPeriodFilter')?.value || 'month';
    const staffFilter = document.getElementById('payrollStaffFilter')?.value || '';

    let dateRange;
    if (periodFilter === 'week') {
        dateRange = getCurrentWeek();
    } else {
        dateRange = getCurrentMonth();
    }
    
    // Calculate payroll for each staff member
    const payrollData = [];
    
    let staffList = AppState.staff;
    if (staffFilter) {
        staffList = staffList.filter(s => s.id === staffFilter);
    }

    staffList.forEach(staff => {
        const staffShifts = AppState.shifts.filter(s => 
            s.staff_id === staff.id && 
            s.actual_hours && 
            isDateInRange(s.shift_date, dateRange.start, dateRange.end)
        );

        if (staffShifts.length > 0) {
            const totalHours = staffShifts.reduce((sum, s) => sum + s.actual_hours, 0);
            const overtimeThreshold = parseFloat(AppState.settings.payroll?.overtime_threshold || 40) * (periodFilter === 'month' ? 4 : 1);
            const regularHours = Math.min(totalHours, overtimeThreshold);
            const overtimeHours = Math.max(0, totalHours - overtimeThreshold);
            const grossPay = (regularHours * staff.hourly_rate) + 
                           (overtimeHours * staff.hourly_rate * parseFloat(AppState.settings.payroll?.overtime_multiplier || 1.5));

            payrollData.push({
                staff,
                totalHours: formatDecimal(totalHours),
                regularHours: formatDecimal(regularHours),
                overtimeHours: formatDecimal(overtimeHours),
                grossPay: grossPay,
                netPay: grossPay,
                period: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
            });
        }
    });

    tbody.innerHTML = payrollData.map(data => `
        <tr>
            <td><strong>${data.staff.full_name}</strong></td>
            <td>${data.period}</td>
            <td>${data.totalHours} hrs</td>
            <td>${data.overtimeHours} hrs</td>
            <td>${formatCurrency(data.grossPay)}</td>
            <td>${formatCurrency(0)}</td>
            <td><strong>${formatCurrency(data.netPay)}</strong></td>
            <td><span class="badge badge-warning">Pending</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewStaffPayroll('${data.staff.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');

    if (payrollData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No payroll data for selected period</td></tr>';
    }
}

// View individual staff payroll
function viewStaffPayroll(staffId) {
    AppState.currentStaffId = staffId;
    viewStaffProfile(staffId);
    // Switch to payroll tab
    setTimeout(() => {
        const payrollTab = document.querySelector('[data-tab="payroll"]');
        if (payrollTab) {
            payrollTab.click();
        }
    }, 100);
}

// =====================================
// Sites Management Module
// =====================================

function loadSitesTable() {
    const tbody = document.getElementById('sitesTableBody');
    if (!tbody) return;

    tbody.innerHTML = AppState.sites.map(site => `
        <tr>
            <td><strong>${site.site_name}</strong></td>
            <td>${site.address}</td>
            <td>${site.contract_type}</td>
            <td>${formatCurrency(site.billing_rate)}/hr</td>
            <td>${site.required_weekly_hours} hrs/week</td>
            <td>
                <span class="badge badge-${site.status === 'Active' ? 'success' : 'secondary'}">
                    ${site.status}
                </span>
            </td>
            <td>
                <div class="dropdown-container" style="position: relative;">
                    <button class="btn btn-sm btn-secondary" onclick="toggleDropdown(event, 'site-${site.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu" id="dropdown-site-${site.id}" style="display: none;">
                        <button class="dropdown-item" onclick="editSite('${site.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="dropdown-item text-danger" onclick="deleteSite('${site.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

function initSitesManagement() {
    document.getElementById('addSiteBtn')?.addEventListener('click', () => {
        document.getElementById('siteModalTitle').textContent = 'Add Site';
        document.getElementById('siteForm').reset();
        document.getElementById('siteId').value = '';
        openModal('siteModal');
    });

    document.getElementById('saveSiteBtn')?.addEventListener('click', saveSite);
}

async function saveSite() {
    const siteId = document.getElementById('siteId').value;
    const siteData = {
        id: siteId || `site-${Date.now()}`,
        site_name: document.getElementById('siteName').value,
        address: document.getElementById('siteAddress').value,
        contract_type: document.getElementById('siteContractType').value,
        billing_rate: parseFloat(document.getElementById('siteBillingRate').value),
        required_weekly_hours: parseFloat(document.getElementById('siteRequiredHours').value),
        status: document.getElementById('siteStatus').value
    };

    try {
        let response;
        if (siteId) {
            response = await fetch(`tables/sites/${siteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteData)
            });
        } else {
            response = await fetch('tables/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteData)
            });
        }

        if (response.ok) {
            await loadSites();
            loadSitesTable();
            closeModal('siteModal');
            showToast(siteId ? 'Site updated successfully' : 'Site added successfully');
        }
    } catch (error) {
        console.error('Error saving site:', error);
        showToast('Error saving site', 'error');
    }
}

function editSite(siteId) {
    const site = AppState.sites.find(s => s.id === siteId);
    if (!site) return;

    document.getElementById('siteModalTitle').textContent = 'Edit Site';
    document.getElementById('siteId').value = site.id;
    document.getElementById('siteName').value = site.site_name;
    document.getElementById('siteAddress').value = site.address;
    document.getElementById('siteContractType').value = site.contract_type;
    document.getElementById('siteBillingRate').value = site.billing_rate;
    document.getElementById('siteRequiredHours').value = site.required_weekly_hours;
    document.getElementById('siteStatus').value = site.status;

    openModal('siteModal');
}

async function deleteSite(siteId) {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
        const response = await fetch(`tables/sites/${siteId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadSites();
            loadSitesTable();
            showToast('Site deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting site:', error);
        showToast('Error deleting site', 'error');
    }
}

// =====================================
// Settings Module
// =====================================

function loadSettingsPage() {
    // General Settings
    document.getElementById('settingCompanyName').value = AppState.settings.general?.company_name || 'Ream Cleaning Services';
    document.getElementById('settingCurrency').value = AppState.settings.general?.currency || 'GBP';
    document.getElementById('settingTimezone').value = AppState.settings.general?.timezone || 'Europe/London';

    // Payroll Settings
    document.getElementById('settingOvertimeThreshold').value = AppState.settings.payroll?.overtime_threshold || 40;
    document.getElementById('settingOvertimeMultiplier').value = AppState.settings.payroll?.overtime_multiplier || 1.5;
    document.getElementById('settingPayCycle').value = AppState.settings.payroll?.pay_cycle || 'Weekly';

    // Shift Rules
    document.getElementById('settingDefaultBreak').value = AppState.settings.shift?.default_break || 30;
    document.getElementById('settingLateThreshold').value = AppState.settings.shift?.late_threshold || 10;
    document.getElementById('settingAllowEarlyClockIn').value = AppState.settings.shift?.allow_early_clockin || 'true';
}

function initSettings() {
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
}

async function saveSettings() {
    const settingsToSave = [
        { category: 'general', key: 'company_name', value: document.getElementById('settingCompanyName').value },
        { category: 'general', key: 'currency', value: document.getElementById('settingCurrency').value },
        { category: 'general', key: 'timezone', value: document.getElementById('settingTimezone').value },
        { category: 'payroll', key: 'overtime_threshold', value: document.getElementById('settingOvertimeThreshold').value },
        { category: 'payroll', key: 'overtime_multiplier', value: document.getElementById('settingOvertimeMultiplier').value },
        { category: 'payroll', key: 'pay_cycle', value: document.getElementById('settingPayCycle').value },
        { category: 'shift', key: 'default_break', value: document.getElementById('settingDefaultBreak').value },
        { category: 'shift', key: 'late_threshold', value: document.getElementById('settingLateThreshold').value },
        { category: 'shift', key: 'allow_early_clockin', value: document.getElementById('settingAllowEarlyClockIn').value }
    ];

    try {
        for (const setting of settingsToSave) {
            const existingSetting = await fetch(`tables/settings?search=${setting.key}`).then(r => r.json());
            const settingData = {
                ...setting,
                id: existingSetting.data?.[0]?.id || `set-${Date.now()}-${Math.random()}`,
                description: `${setting.key} setting`
            };

            if (existingSetting.data?.[0]) {
                await fetch(`tables/settings/${settingData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settingData)
                });
            } else {
                await fetch('tables/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(settingData)
                });
            }
        }

        await loadSettings();
        showToast('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

// =====================================
// Helper Functions for Dropdowns
// =====================================

function populateStaffOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Select Staff</option>' +
        AppState.staff
            .filter(s => s.status === 'Active')
            .map(s => `<option value="${s.id}">${s.full_name}</option>`)
            .join('');
}

function populateSiteOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Select Site</option>' +
        AppState.sites
            .filter(s => s.status === 'Active')
            .map(s => `<option value="${s.id}">${s.site_name}</option>`)
            .join('');
}

// =====================================
// Reports & Export
// =====================================

function exportReport(reportType) {
    let csvContent = '';
    let filename = '';

    switch(reportType) {
        case 'staff-hours':
            csvContent = generateStaffHoursReport();
            filename = `staff-hours-${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'payroll':
            csvContent = generatePayrollReport();
            filename = `payroll-${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'site-performance':
            csvContent = generateSitePerformanceReport();
            filename = `site-performance-${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'attendance':
            csvContent = generateAttendanceReport();
            filename = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
            break;
    }

    downloadCSV(csvContent, filename);
    showToast('Report exported successfully');
}

function generateStaffHoursReport() {
    const month = getCurrentMonth();
    let csv = 'Staff Name,Employment Type,Date,Site,Hours,Status\n';

    AppState.staff.forEach(staff => {
        const staffShifts = AppState.shifts.filter(s => 
            s.staff_id === staff.id && 
            isDateInRange(s.shift_date, month.start, month.end)
        );

        staffShifts.forEach(shift => {
            const site = AppState.sites.find(s => s.id === shift.site_id);
            csv += `${staff.full_name},${staff.employment_type},${shift.shift_date},${site?.site_name || 'Unknown'},${shift.actual_hours || shift.shift_hours},${shift.status}\n`;
        });
    });

    return csv;
}

function generatePayrollReport() {
    const month = getCurrentMonth();
    let csv = 'Staff Name,Total Hours,Regular Hours,Overtime Hours,Hourly Rate,Gross Pay,Net Pay\n';

    AppState.staff.forEach(staff => {
        const staffShifts = AppState.shifts.filter(s => 
            s.staff_id === staff.id && 
            s.actual_hours && 
            isDateInRange(s.shift_date, month.start, month.end)
        );

        if (staffShifts.length > 0) {
            const totalHours = staffShifts.reduce((sum, s) => sum + s.actual_hours, 0);
            const overtimeThreshold = parseFloat(AppState.settings.payroll?.overtime_threshold || 40) * 4;
            const regularHours = Math.min(totalHours, overtimeThreshold);
            const overtimeHours = Math.max(0, totalHours - overtimeThreshold);
            const grossPay = (regularHours * staff.hourly_rate) + 
                           (overtimeHours * staff.hourly_rate * parseFloat(AppState.settings.payroll?.overtime_multiplier || 1.5));

            csv += `${staff.full_name},${formatDecimal(totalHours)},${formatDecimal(regularHours)},${formatDecimal(overtimeHours)},${staff.hourly_rate},${grossPay.toFixed(2)},${grossPay.toFixed(2)}\n`;
        }
    });

    return csv;
}

function generateSitePerformanceReport() {
    const month = getCurrentMonth();
    let csv = 'Site Name,Required Hours,Delivered Hours,Utilization %,Billing Rate,Revenue\n';

    AppState.sites.forEach(site => {
        const siteShifts = AppState.shifts.filter(s => 
            s.site_id === site.id && 
            s.actual_hours && 
            isDateInRange(s.shift_date, month.start, month.end)
        );

        const deliveredHours = siteShifts.reduce((sum, s) => sum + s.actual_hours, 0);
        const requiredHours = site.required_weekly_hours * 4; // Monthly
        const utilization = requiredHours > 0 ? (deliveredHours / requiredHours * 100).toFixed(2) : 0;
        const revenue = deliveredHours * site.billing_rate;

        csv += `${site.site_name},${requiredHours},${formatDecimal(deliveredHours)},${utilization}%,${site.billing_rate},${revenue.toFixed(2)}\n`;
    });

    return csv;
}

function generateAttendanceReport() {
    const month = getCurrentMonth();
    let csv = 'Staff Name,Total Shifts,Completed,Missed,Attendance %\n';

    AppState.staff.forEach(staff => {
        const staffShifts = AppState.shifts.filter(s => 
            s.staff_id === staff.id && 
            isDateInRange(s.shift_date, month.start, month.end)
        );

        if (staffShifts.length > 0) {
            const completed = staffShifts.filter(s => s.status === 'Completed').length;
            const missed = staffShifts.filter(s => s.status === 'Missed').length;
            const attendance = staffShifts.length > 0 ? (completed / staffShifts.length * 100).toFixed(2) : 0;

            csv += `${staff.full_name},${staffShifts.length},${completed},${missed},${attendance}%\n`;
        }
    });

    return csv;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =====================================
// Application Initialization
// =====================================

async function initApp() {
    console.log('Initializing Ream Cleaning Services Dashboard...');
    
    // Load all data
    await loadAllData();
    
    // Initialize UI components
    initNavigation();
    initStaffManagement();
    initScheduling();
    initSitesManagement();
    initSettings();
    initPayroll();
    
    // Load initial dashboard
    loadDashboard();
    
    console.log('Dashboard initialized successfully');
    showToast('Dashboard loaded successfully', 'success');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
