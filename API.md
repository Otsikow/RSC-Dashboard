# 📡 API Documentation

## Ream Cleaning Services - RESTful Table API

**Version:** 1.0.0  
**Base URL:** `tables/`  
**Format:** JSON  
**Authentication:** None (add as needed)

---

## 📋 Overview

This system uses a RESTful Table API for all data operations. Each table has standard CRUD endpoints following REST conventions.

### Available Tables

1. **staff** - Employee records
2. **sites** - Client locations
3. **shifts** - Work schedules
4. **payroll_records** - Payment history
5. **notes** - Staff notes
6. **settings** - System configuration
7. **audit_logs** - Activity tracking

---

## 🔌 HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `GET` | Retrieve data | Get list of staff |
| `POST` | Create new record | Add new staff member |
| `PUT` | Full update | Replace entire staff record |
| `PATCH` | Partial update | Update only hourly rate |
| `DELETE` | Remove record | Delete staff member |

---

## 📊 Standard Endpoints

### 1. List Records

**Endpoint:** `GET tables/{table}`

**Query Parameters:**
```
page     - Page number (default: 1)
limit    - Records per page (default: 100, max: 1000)
search   - Search query (searches all text fields)
sort     - Sort field (e.g., "created_at", "-created_at" for desc)
```

**Request:**
```http
GET tables/staff?page=1&limit=10&search=john&sort=-created_at
```

**Response:**
```json
{
    "data": [
        {
            "id": "staff-001",
            "full_name": "John Smith",
            "email": "john@example.com",
            "status": "Active",
            "created_at": 1234567890000,
            "updated_at": 1234567890000
        }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "table": "staff",
    "schema": {...}
}
```

---

### 2. Get Single Record

**Endpoint:** `GET tables/{table}/{record_id}`

**Request:**
```http
GET tables/staff/staff-001
```

**Response:**
```json
{
    "id": "staff-001",
    "full_name": "John Smith",
    "phone": "07700 900000",
    "email": "john@example.com",
    "ni_number": "AB123456C",
    "address": "123 Main St, London",
    "employment_type": "Full-Time",
    "hourly_rate": 12.50,
    "default_site_id": "site-001",
    "status": "Active",
    "account_name": "John Smith",
    "sort_code": "20-00-00",
    "account_number": "12345678",
    "bank_reference": "REAM-JS",
    "created_at": 1234567890000,
    "updated_at": 1234567890000
}
```

---

### 3. Create Record

**Endpoint:** `POST tables/{table}`

**Request:**
```http
POST tables/staff
Content-Type: application/json

{
    "id": "staff-002",
    "full_name": "Jane Doe",
    "phone": "07700 900111",
    "email": "jane@example.com",
    "ni_number": "CD789012E",
    "address": "456 Park Ave, London",
    "employment_type": "Part-Time",
    "hourly_rate": 11.75,
    "default_site_id": "site-002",
    "status": "Active",
    "account_name": "Jane Doe",
    "sort_code": "40-47-84",
    "account_number": "87654321",
    "bank_reference": "REAM-JD"
}
```

**Response:** HTTP 201 Created
```json
{
    "id": "staff-002",
    "full_name": "Jane Doe",
    ...
    "created_at": 1709380800000,
    "updated_at": 1709380800000
}
```

---

### 4. Full Update (Replace)

**Endpoint:** `PUT tables/{table}/{record_id}`

**Request:**
```http
PUT tables/staff/staff-002
Content-Type: application/json

{
    "id": "staff-002",
    "full_name": "Jane Doe",
    "phone": "07700 900222",
    "email": "jane.new@example.com",
    "ni_number": "CD789012E",
    "address": "789 New St, London",
    "employment_type": "Full-Time",
    "hourly_rate": 13.00,
    "default_site_id": "site-001",
    "status": "Active",
    "account_name": "Jane Doe",
    "sort_code": "40-47-84",
    "account_number": "87654321",
    "bank_reference": "REAM-JD"
}
```

**Response:** HTTP 200 OK
```json
{
    "id": "staff-002",
    "full_name": "Jane Doe",
    ...
    "updated_at": 1709384400000
}
```

---

### 5. Partial Update

**Endpoint:** `PATCH tables/{table}/{record_id}`

**Request:**
```http
PATCH tables/staff/staff-002
Content-Type: application/json

{
    "hourly_rate": 14.00,
    "employment_type": "Full-Time"
}
```

**Response:** HTTP 200 OK
```json
{
    "id": "staff-002",
    "full_name": "Jane Doe",
    "hourly_rate": 14.00,
    "employment_type": "Full-Time",
    ...
    "updated_at": 1709388000000
}
```

---

### 6. Delete Record

**Endpoint:** `DELETE tables/{table}/{record_id}`

**Request:**
```http
DELETE tables/staff/staff-002
```

**Response:** HTTP 204 No Content

**Note:** This performs a soft delete (sets `deleted=true` flag). Record remains in database but is hidden from queries.

---

## 📝 Table Schemas

### Staff Table

**Endpoint:** `GET tables/staff`

**Fields:**
```json
{
    "id": "string (required, primary key)",
    "full_name": "string (required)",
    "phone": "string (required)",
    "email": "string (required)",
    "ni_number": "string (required)",
    "address": "string (required)",
    "employment_type": "string (required, enum: Full-Time|Part-Time|Contractor)",
    "hourly_rate": "number (required, decimal)",
    "default_site_id": "string (foreign key → sites.id)",
    "status": "string (required, enum: Active|Inactive)",
    "account_name": "string",
    "sort_code": "string (format: XX-XX-XX)",
    "account_number": "string (8 digits)",
    "bank_reference": "string"
}
```

**Example:**
```javascript
const staff = {
    id: `staff-${Date.now()}`,
    full_name: 'Sarah Johnson',
    phone: '07700 900123',
    email: 'sarah@reamcleaning.co.uk',
    ni_number: 'AB123456C',
    address: '45 Grove Road, London E3 5AX',
    employment_type: 'Full-Time',
    hourly_rate: 12.50,
    default_site_id: 'site-001',
    status: 'Active',
    account_name: 'Sarah Johnson',
    sort_code: '20-00-00',
    account_number: '12345678',
    bank_reference: 'REAM-SJ001'
};
```

---

### Sites Table

**Endpoint:** `GET tables/sites`

**Fields:**
```json
{
    "id": "string (required, primary key)",
    "site_name": "string (required)",
    "address": "string (required)",
    "contract_type": "string (required)",
    "billing_rate": "number (required, decimal)",
    "required_weekly_hours": "number (required, decimal)",
    "status": "string (required, enum: Active|Inactive)"
}
```

**Example:**
```javascript
const site = {
    id: `site-${Date.now()}`,
    site_name: 'Canary Wharf Office Tower',
    address: '1 Canada Square, London E14 5AB',
    contract_type: 'Commercial - Office',
    billing_rate: 28.50,
    required_weekly_hours: 40,
    status: 'Active'
};
```

---

### Shifts Table

**Endpoint:** `GET tables/shifts`

**Fields:**
```json
{
    "id": "string (required, primary key)",
    "staff_id": "string (required, foreign key → staff.id)",
    "site_id": "string (required, foreign key → sites.id)",
    "shift_date": "string (required, ISO date: YYYY-MM-DD)",
    "start_time": "string (required, HH:MM)",
    "end_time": "string (required, HH:MM)",
    "break_duration": "number (required, minutes)",
    "shift_hours": "number (calculated, decimal)",
    "notes": "string",
    "clock_in": "string (ISO datetime)",
    "clock_out": "string (ISO datetime)",
    "actual_hours": "number (calculated, decimal)",
    "status": "string (enum: Scheduled|In Progress|Completed|Missed)"
}
```

**Example:**
```javascript
const shift = {
    id: `shift-${Date.now()}`,
    staff_id: 'staff-001',
    site_id: 'site-001',
    shift_date: '2026-03-03',
    start_time: '08:00',
    end_time: '16:00',
    break_duration: 30,
    shift_hours: 7.5,
    notes: 'Regular morning shift',
    clock_in: null,
    clock_out: null,
    actual_hours: null,
    status: 'Scheduled'
};
```

---

### Notes Table

**Endpoint:** `GET tables/notes`

**Fields:**
```json
{
    "id": "string (required, primary key)",
    "staff_id": "string (required, foreign key → staff.id)",
    "note_text": "string (required, rich text)",
    "author": "string (required)",
    "is_internal": "boolean (default: false)",
    "timestamp": "string (ISO datetime)"
}
```

**Example:**
```javascript
const note = {
    id: `note-${Date.now()}`,
    staff_id: 'staff-001',
    note_text: 'Excellent performance this month.',
    author: 'Admin',
    is_internal: true,
    timestamp: new Date().toISOString()
};
```

---

### Settings Table

**Endpoint:** `GET tables/settings`

**Fields:**
```json
{
    "id": "string (required, primary key)",
    "category": "string (required, enum: general|payroll|shift)",
    "key": "string (required, unique per category)",
    "value": "string (required)",
    "description": "string"
}
```

**Example:**
```javascript
const setting = {
    id: `set-${Date.now()}`,
    category: 'payroll',
    key: 'overtime_threshold',
    value: '40',
    description: 'Overtime threshold in hours per week'
};
```

---

## 💡 Usage Examples

### JavaScript Fetch API

#### List All Active Staff
```javascript
async function getActiveStaff() {
    const response = await fetch('tables/staff?limit=1000');
    const result = await response.json();
    
    const activeStaff = result.data.filter(s => s.status === 'Active');
    console.log('Active Staff:', activeStaff);
    return activeStaff;
}
```

#### Create New Shift
```javascript
async function createShift(staffId, siteId, date, startTime, endTime) {
    const shift = {
        id: `shift-${Date.now()}`,
        staff_id: staffId,
        site_id: siteId,
        shift_date: date,
        start_time: startTime,
        end_time: endTime,
        break_duration: 30,
        shift_hours: calculateHours(startTime, endTime, 30),
        status: 'Scheduled',
        clock_in: null,
        clock_out: null,
        actual_hours: null
    };
    
    const response = await fetch('tables/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift)
    });
    
    if (response.ok) {
        const created = await response.json();
        console.log('Shift created:', created);
        return created;
    } else {
        console.error('Error creating shift');
        throw new Error('Failed to create shift');
    }
}

function calculateHours(start, end, breakMinutes) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM) - breakMinutes;
    return (totalMinutes / 60).toFixed(2);
}
```

#### Update Staff Hourly Rate
```javascript
async function updateHourlyRate(staffId, newRate) {
    const response = await fetch(`tables/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourly_rate: newRate })
    });
    
    if (response.ok) {
        const updated = await response.json();
        console.log('Hourly rate updated:', updated);
        return updated;
    }
}
```

#### Clock In
```javascript
async function clockIn(shiftId) {
    const response = await fetch(`tables/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'In Progress',
            clock_in: new Date().toISOString()
        })
    });
    
    return await response.json();
}
```

#### Clock Out
```javascript
async function clockOut(shiftId) {
    // First, get the shift to calculate hours
    const shiftResponse = await fetch(`tables/shifts/${shiftId}`);
    const shift = await shiftResponse.json();
    
    const clockOutTime = new Date();
    const clockInTime = new Date(shift.clock_in);
    const totalMinutes = (clockOutTime - clockInTime) / 1000 / 60;
    const actualHours = ((totalMinutes - shift.break_duration) / 60).toFixed(2);
    
    const response = await fetch(`tables/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'Completed',
            clock_out: clockOutTime.toISOString(),
            actual_hours: parseFloat(actualHours)
        })
    });
    
    return await response.json();
}
```

#### Delete Staff
```javascript
async function deleteStaff(staffId) {
    // Check for existing shifts first
    const shiftsResponse = await fetch(`tables/shifts?limit=1000`);
    const shiftsResult = await shiftsResponse.json();
    const hasShifts = shiftsResult.data.some(s => s.staff_id === staffId);
    
    if (hasShifts) {
        if (!confirm('This staff member has shifts. Delete anyway?')) {
            return false;
        }
    }
    
    const response = await fetch(`tables/staff/${staffId}`, {
        method: 'DELETE'
    });
    
    return response.ok;
}
```

---

## 🔄 Bulk Operations

### Import Multiple Records

```javascript
async function importStaff(staffArray) {
    const results = [];
    
    for (const staff of staffArray) {
        try {
            const response = await fetch('tables/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: `staff-${Date.now()}-${Math.random()}`,
                    ...staff
                })
            });
            
            if (response.ok) {
                const created = await response.json();
                results.push({ success: true, data: created });
            } else {
                results.push({ success: false, error: 'Failed to create' });
            }
        } catch (error) {
            results.push({ success: false, error: error.message });
        }
    }
    
    return results;
}

// Usage
const newStaff = [
    { full_name: 'Alice Brown', phone: '07700 900001', ... },
    { full_name: 'Bob Green', phone: '07700 900002', ... }
];

const results = await importStaff(newStaff);
console.log(`Imported ${results.filter(r => r.success).length} of ${results.length} staff`);
```

---

## 🚨 Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Deleted successfully |
| 400 | Bad Request | Check request format |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact support |

### Example Error Handler

```javascript
async function safeAPICall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Resource not found');
            } else if (response.status === 400) {
                throw new Error('Invalid request data');
            } else if (response.status >= 500) {
                throw new Error('Server error - please try again');
            }
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Usage
try {
    const staff = await safeAPICall('tables/staff/staff-001');
    console.log(staff);
} catch (error) {
    // Error already logged and toast shown
}
```

---

## 🔒 Authentication (Future Enhancement)

### JWT Token Authentication

```javascript
// Login to get token
async function login(email, password) {
    const response = await fetch('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const { token } = await response.json();
    localStorage.setItem('auth_token', token);
    return token;
}

// Use token in requests
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
}
```

---

## 📚 Additional Resources

- **Full Schema:** See `README.md` → Database Schema section
- **Examples:** Check `js/app.js` for real implementations
- **Testing:** Use browser DevTools Network tab to inspect requests

---

**API Version:** 1.0.0  
**Last Updated:** March 2, 2026  
**Support:** See README.md for contact information
