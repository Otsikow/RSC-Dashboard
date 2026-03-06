# 🚀 Quick Start Guide

## Ream Cleaning Services Operations Dashboard

---

## ⚡ 5-Minute Setup

### Step 1: Open the Dashboard
Simply open `index.html` in your web browser. That's it!

The system will automatically:
- ✅ Load the database schema
- ✅ Initialize demo data
- ✅ Display the dashboard

### Step 2: Explore the Interface

**Main Navigation (Left Sidebar):**
- 📊 Dashboard - Overview and metrics
- 👥 Staff - Manage your team
- 📅 Scheduling - Plan shifts
- ⏰ Time Tracking - Clock in/out
- 💰 Payroll - Calculate payments
- 🏢 Sites - Manage locations
- 📄 Reports - Export data
- ⚙️ Settings - Configure system

### Step 3: Try Key Features

#### Add Your First Staff Member
1. Click **Staff** in sidebar
2. Click **+ Add Staff** button
3. Fill in the form:
   - Personal info
   - Employment details
   - UK bank details
4. Click **Save Staff**

#### Create a Shift
1. Click **Scheduling** in sidebar
2. Click **+ Add Shift** button
3. Select staff, site, date, and times
4. Choose shift type:
   - Single shift
   - Multi-day (select dates in calendar)
   - Recurring weekly
5. Click **Save Shift**

#### Clock In/Out
1. Click **Time Tracking** in sidebar
2. Find today's shift
3. Click **Clock In** to start
4. Click **Clock Out** when done
5. Hours are automatically calculated!

#### Toggle Dark Mode
Click the **moon icon** (☾) in the top right corner

---

## 📱 Device-Specific Usage

### Desktop/Laptop (Recommended)
- Full interface with sidebar always visible
- Optimal for admin and supervisors
- Best for data entry and reporting

### Tablet
- Responsive sidebar (collapsible)
- Great for supervisors in the field
- Touch-friendly buttons and forms

### Mobile
- Sidebar hidden by default (tap ☰ to open)
- Ideal for staff checking shifts
- Quick clock in/out functionality

---

## 🎯 Common Tasks

### Daily Admin Workflow
```
1. Check Dashboard → Review active staff and missed shifts
2. Time Tracking → Monitor active shifts
3. Scheduling → Plan tomorrow's shifts
4. Staff → Update any changes
```

### Weekly Supervisor Workflow
```
1. Scheduling → Create next week's shifts
2. Use "Recurring Weekly" for regular patterns
3. Reports → Export attendance report
4. Dashboard → Review weekly hours
```

### Monthly Admin Workflow
```
1. Payroll → Generate monthly payroll
2. Review overtime hours
3. Export payroll report
4. Mark payments as paid
```

---

## 🔧 Configuration

### Update Company Settings
1. Go to **Settings** page
2. **General Settings:**
   - Company Name: "Your Company Name"
   - Currency: GBP/EUR/USD
   - Time Zone: Select yours
3. **Payroll Settings:**
   - Overtime Threshold: 40 hours/week (default)
   - Overtime Multiplier: 1.5x (default)
4. **Shift Rules:**
   - Default Break: 30 minutes
   - Late Threshold: 10 minutes
5. Click **Save Settings**

---

## 💡 Pro Tips

### Scheduling Efficiency
- **Use Recurring Shifts** for regular weekly patterns
- **Bulk Assignment** for emergencies (assign multiple staff at once)
- **Multi-Day Mode** for creating several shifts quickly

### Staff Management
- Always fill in bank details for smooth payroll processing
- Use the Notes system for important staff information
- Mark internal notes for sensitive information

### Time Tracking
- Staff can clock in up to 10 minutes early (configurable)
- Late arrivals are automatically flagged
- Manual edits available for admin corrections

### Payroll
- Review overtime before finalizing payroll
- Export CSV for accounting software integration
- Use custom date ranges for special periods

---

## 🎨 Interface Shortcuts

**Keyboard Navigation:**
- `Tab` - Move between form fields
- `Enter` - Submit forms
- `Esc` - Close modals

**Quick Actions:**
- Click staff/site names to view details
- Use search bars to filter quickly
- Click status badges for filtering

---

## 📊 Understanding the Dashboard

### Summary Cards
- **Active Staff** - Currently employed staff
- **Hours This Week** - Total worked hours (Monday-Sunday)
- **Hours This Month** - Total for current month
- **Payroll Due** - Calculated gross pay owed
- **Shifts Today** - Scheduled for today
- **Missed Shifts** - Not completed this week

### Charts
- **Weekly Hours per Staff** - Bar chart showing individual hours
- **Monthly Payroll Trend** - Line chart showing 6-month trend

---

## ⚠️ Important Notes

### Data Persistence
- All data is stored in the database tables
- Changes are saved immediately
- No "Save" button needed (auto-save)

### Browser Requirements
- Use modern browsers (Chrome, Firefox, Safari, Edge)
- Enable JavaScript
- Allow cookies for dark mode preference

### Decimal Formatting
- All monetary values: £X.XX (2 decimals)
- All hours: X.XX (2 decimals)
- Automatic rounding applied

---

## 🔄 Data Management

### Clear Demo Data
To start fresh:
1. Go to each module (Staff, Sites, Shifts)
2. Delete demo entries
3. Add your real data

### Backup Your Data
Export reports regularly:
1. Go to **Reports** page
2. Export CSV files
3. Save to your system

### Import Existing Data
Use the API endpoints to bulk import:
```javascript
// Example: Import staff from CSV
const staffMembers = parseCSV(yourFile);
for (const staff of staffMembers) {
    await fetch('tables/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
}
```

---

## 🆘 Troubleshooting

### Dashboard Not Loading
1. Check internet connection (for CDN resources)
2. Clear browser cache
3. Try different browser
4. Check browser console for errors

### Data Not Saving
1. Check API endpoint configuration
2. Verify database connection
3. Check browser network tab for errors
4. Ensure proper data format

### Charts Not Displaying
1. Wait for data to load (2-3 seconds)
2. Ensure Chart.js is loading from CDN
3. Check if dark mode affects visibility
4. Try refreshing the page

### Dark Mode Not Persisting
1. Check if cookies are enabled
2. Verify localStorage is available
3. Try different browser

---

## 📞 Need Help?

### Documentation
- Full README: See `README.md`
- API Documentation: See "API Integration" section
- Code Comments: Check `js/app.js` for inline documentation

### Support Channels
- System issues: Contact your IT department
- Feature requests: Document and prioritize
- Bug reports: Provide browser console logs

---

## 🎓 Training Materials

### For Administrators (2 hours)
```
Hour 1: System Overview
- Interface walkthrough
- All modules demonstration
- Settings configuration

Hour 2: Daily Operations
- Staff management practice
- Shift scheduling exercises
- Payroll calculation review
```

### For Supervisors (1 hour)
```
30 min: Essential Features
- Time tracking
- Shift creation
- Staff lookup

30 min: Hands-on Practice
- Clock in/out practice
- Shift editing
- Quick reports
```

### For Staff (15 minutes)
```
10 min: Basic Usage
- Login/access
- View shifts
- Clock in/out

5 min: Practice
- Clock in test
- View payslip
- Q&A
```

---

## ✅ Pre-Launch Checklist

Before using in production:

- [ ] Update company name in Settings
- [ ] Clear all demo data
- [ ] Add real staff members
- [ ] Add all sites
- [ ] Configure payroll settings
- [ ] Set up correct time zone
- [ ] Test clock in/out functionality
- [ ] Verify payroll calculations
- [ ] Test on all devices (desktop/tablet/mobile)
- [ ] Train all users
- [ ] Set up backup routine
- [ ] Document custom procedures

---

## 🎉 You're Ready!

This system is built to handle:
- ✅ 100-300 staff members
- ✅ Thousands of shifts per month
- ✅ Real-time tracking
- ✅ Accurate payroll
- ✅ Complete audit trails

**Start with the basics, then explore advanced features as you grow.**

---

**Happy managing!** 🧹✨
