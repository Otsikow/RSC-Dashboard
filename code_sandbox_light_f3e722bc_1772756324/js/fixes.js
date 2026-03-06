/* 
 * COMPREHENSIVE FIXES FOR REAM CLEANING DASHBOARD
 * Version 1.2.0 - All Critical Updates
 */

console.log('Loading fixes and enhancements...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, applying fixes...');
    
    // ===========================================
    // FIX 1: Generate Payroll Button
    // ===========================================
    setTimeout(() => {
        const generateBtn = document.getElementById('generatePayrollBtn');
        if (generateBtn) {
            console.log('Generate Payroll button found');
            
            // Remove any existing listeners
            const newBtn = generateBtn.cloneNode(true);
            generateBtn.parentNode.replaceChild(newBtn, generateBtn);
            
            newBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('Generate Payroll clicked - Processing...');
                
                // Show loading state
                newBtn.disabled = true;
                newBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
                
                try {
                    const periodFilter = document.getElementById('payrollPeriodFilter')?.value || 'month';
                    
                    let dateRange;
                    if (periodFilter === 'week') {
                        dateRange = getCurrentWeek();
                    } else {
                        dateRange = getCurrentMonth();
                    }

                    console.log('Date range:', dateRange);
                    console.log('Staff count:', AppState.staff.length);
                    console.log('Shifts count:', AppState.shifts.length);

                    const payrollRecords = [];
                    let processedCount = 0;

                    for (const staff of AppState.staff) {
                        const staffShifts = AppState.shifts.filter(s => 
                            s.staff_id === staff.id && 
                            s.actual_hours && 
                            isDateInRange(s.shift_date, dateRange.start, dateRange.end)
                        );

                        console.log(`${staff.full_name}: ${staffShifts.length} shifts`);

                        if (staffShifts.length > 0) {
                            const totalHours = staffShifts.reduce((sum, s) => sum + (s.actual_hours || 0), 0);
                            const overtimeThreshold = parseFloat(AppState.settings.payroll?.overtime_threshold || 40) * (periodFilter === 'month' ? 4 : 1);
                            const regularHours = Math.min(totalHours, overtimeThreshold);
                            const overtimeHours = Math.max(0, totalHours - overtimeThreshold);
                            const overtimeMultiplier = parseFloat(AppState.settings.payroll?.overtime_multiplier || 1.5);
                            const grossPay = (regularHours * staff.hourly_rate) + (overtimeHours * staff.hourly_rate * overtimeMultiplier);

                            const payrollRecord = {
                                id: `payroll-${Date.now()}-${processedCount}-${Math.random().toString(36).substr(2, 9)}`,
                                staff_id: staff.id,
                                period_start: dateRange.start.toISOString().split('T')[0],
                                period_end: dateRange.end.toISOString().split('T')[0],
                                total_hours: parseFloat(totalHours.toFixed(2)),
                                regular_hours: parseFloat(regularHours.toFixed(2)),
                                overtime_hours: parseFloat(overtimeHours.toFixed(2)),
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

                            console.log('Creating payroll record:', payrollRecord);

                            // Save to database
                            const response = await fetch('tables/payroll_records', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payrollRecord)
                            });
                            
                            if (response.ok) {
                                processedCount++;
                                payrollRecords.push(payrollRecord);
                                console.log(`Saved payroll for ${staff.full_name}`);
                            } else {
                                console.error(`Failed to save payroll for ${staff.full_name}`);
                            }
                        }
                    }

                    // Reset button
                    newBtn.disabled = false;
                    newBtn.innerHTML = '<i class="fas fa-calculator"></i> Generate Payroll';

                    if (processedCount > 0) {
                        showToast(`Successfully generated ${processedCount} payroll records!`, 'success');
                        console.log(`Generated ${processedCount} payroll records`);
                        
                        // Reload data
                        await loadPayrollRecords();
                        loadPayrollTable();
                    } else {
                        showToast('No completed shifts found for the selected period. Staff need to clock out first.', 'error');
                        console.log('No shifts with actual_hours found');
                    }
                } catch (error) {
                    console.error('Error generating payroll:', error);
                    showToast('Error generating payroll: ' + error.message, 'error');
                    
                    // Reset button
                    newBtn.disabled = false;
                    newBtn.innerHTML = '<i class="fas fa-calculator"></i> Generate Payroll';
                }
            });
        } else {
            console.warn('Generate Payroll button not found');
        }
    }, 500);
    
    // ===========================================
    // FIX 2: View Staff Payroll Function
    // ===========================================
    window.viewStaffPayroll = function(staffId) {
        console.log('View payroll for staff:', staffId);
        
        AppState.currentStaffId = staffId;
        const staff = AppState.staff.find(s => s.id === staffId);
        
        if (staff) {
            console.log('Opening profile for:', staff.full_name);
            
            // Call the existing viewStaffProfile function
            if (typeof viewStaffProfile === 'function') {
                viewStaffProfile(staffId);
                
                // Switch to payroll tab
                setTimeout(() => {
                    const tabs = document.querySelectorAll('.tab');
                    const tabContents = document.querySelectorAll('.tab-content');
                    const payrollTab = document.querySelector('[data-tab="payroll"]');
                    const payrollContent = document.getElementById('payroll-tab');
                    
                    if (payrollTab && payrollContent) {
                        // Deactivate all
                        tabs.forEach(t => t.classList.remove('active'));
                        tabContents.forEach(tc => tc.classList.remove('active'));
                        
                        // Activate payroll
                        payrollTab.classList.add('active');
                        payrollContent.classList.add('active');
                        
                        console.log('Switched to payroll tab');
                    }
                }, 300);
            }
        } else {
            console.error('Staff not found:', staffId);
            showToast('Staff not found', 'error');
        }
    };
    
    // ===========================================
    // FIX 3: Ensure Shift Modal Works
    // ===========================================
    setTimeout(() => {
        // Reset shift modal state when opening
        const addShiftBtn = document.getElementById('addShiftBtn');
        if (addShiftBtn) {
            addShiftBtn.addEventListener('click', function() {
                console.log('Opening shift modal');
                
                // Reset checkboxes
                const recurringCheck = document.getElementById('shiftRecurring');
                const multiDayCheck = document.getElementById('multiDayMode');
                
                if (recurringCheck) recurringCheck.checked = false;
                if (multiDayCheck) multiDayCheck.checked = false;
                
                // Show/hide appropriate fields
                const singleDayFields = document.getElementById('singleDayFields');
                const multiDayFields = document.getElementById('multiDayFields');
                const recurringFields = document.getElementById('recurringFields');
                
                if (singleDayFields) singleDayFields.style.display = 'block';
                if (multiDayFields) multiDayFields.style.display = 'none';
                if (recurringFields) recurringFields.style.display = 'none';
                
                // Set default date to today
                const dateInput = document.getElementById('shiftDate');
                if (dateInput && !dateInput.value) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.value = today;
                }
                
                // Set default times if empty
                const startTime = document.getElementById('shiftStartTime');
                const endTime = document.getElementById('shiftEndTime');
                if (startTime && !startTime.value) startTime.value = '08:00';
                if (endTime && !endTime.value) endTime.value = '16:00';
            });
        }
        
        // Ensure multi-day calendar generates properly
        const multiDayCheck = document.getElementById('multiDayMode');
        if (multiDayCheck) {
            multiDayCheck.addEventListener('change', function(e) {
                if (e.target.checked) {
                    console.log('Multi-day mode enabled');
                    if (typeof generateMultiDayCalendar === 'function') {
                        setTimeout(generateMultiDayCalendar, 100);
                    }
                }
            });
        }
    }, 500);
    
    // ===========================================
    // FIX 4: Back Button Enhancement
    // ===========================================
    
    // Add back buttons to all major pages programmatically
    setTimeout(() => {
        // This ensures back functionality works universally
        document.querySelectorAll('.back-button, #backToStaffBtn').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Back button clicked');
                
                // Determine where to go back to
                const currentPage = document.querySelector('.page.active');
                if (currentPage && currentPage.id === 'staff-profile-page') {
                    navigateToPage('staff');
                } else {
                    // Default behavior
                    navigateToPage('dashboard');
                }
            });
        });
    }, 500);
    
    console.log('All fixes applied successfully!');
});

// ===========================================
// HELPER: Ensure navigateToPage is global
// ===========================================
if (typeof window.navigateToPage === 'undefined') {
    window.navigateToPage = function(pageName) {
        console.log('Navigating to:', pageName);
        const navItem = document.querySelector(`[data-page="${pageName}"]`);
        if (navItem) {
            navItem.click();
        }
    };
}

console.log('Fixes module loaded');
