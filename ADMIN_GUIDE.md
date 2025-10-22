# Admin Guide - THYNK Platform

## Creating Admin Account

### Step 1: Setup Database
Ensure MongoDB is running and the backend server has been started at least once to create the database connection.

### Step 2: Run Create Admin Script
```bash
cd backend
npm run create-admin
```

Expected output:
```
MongoDB connected
Admin user created successfully!
Email: admin@example.com
Password: admin123

IMPORTANT: Please change the admin password after first login!
```

### Step 3: Login as Admin
1. Open browser and access `http://localhost:3000/login`
2. Login with credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You will be automatically redirected to `/admin/dashboard`

## Admin Dashboard Features

### 1. Statistics Overview
The dashboard displays statistics:
- **Total Users**: Total number of lecturers and students
- **Pending Approval**: Users waiting for approval
- **Approved Users**: Users that have been approved
- **Total Lecturers**: Number of active lecturers
- **Total Students**: Number of active students

### 2. Pending Approval Tab
Displays list of users waiting for approval with information:
- Name
- Email
- Role (Lecturer/Student)
- Student ID (NIM) / Employee ID (NIP)
- Registration date
- Actions:
  - ✓ (Approve) - Approve user
  - ✗ (Reject) - Reject user

### 3. All Users Tab
Displays all users with information:
- Name
- Email
- Role
- Status (Pending/Approved/Rejected)
- Student ID (NIM) / Employee ID (NIP)
- Registration date
- Actions:
  - ✓ (Approve) - for pending users
  - ✗ (Reject) - for pending users
  - 🗑️ (Delete) - delete user (except admin)
  - ✏️ (Edit) - edit user profile

### 4. Edit User Profile
Admins can edit user information:
- Name
- Email
- Student ID (NIM) for students
- Employee ID (NIP) for lecturers
- Status (Pending/Approved/Rejected)

**Note:** Admin users cannot be edited or deleted.

## Approval Flow

### User Registration
1. User (lecturer/student) registers
2. Account is created with `status: "pending"`
3. User does not receive token and cannot login
4. User receives notification to wait for approval

### Admin Approve
1. Admin logs into dashboard
2. Admin views pending users in "Pending Approval" tab
3. Admin clicks ✓ (Approve) button
4. User status changes to `"approved"`
5. Fields `approvedBy` and `approvedAt` are filled
6. User can now login

### Admin Reject
1. Admin clicks ✗ (Reject) button
2. User status changes to `"rejected"`
3. User cannot login and receives error message

### User Login
1. Approved users can login normally
2. Pending users receive 403 error with message:
   - "Your account is pending approval. Please wait for admin approval."
3. Rejected users receive 403 error with message:
   - "Your account has been rejected. Please contact admin."

## API Endpoints for Admin

### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer {admin_token}
```

Response:
```json
{
  "totalUsers": 10,
  "pendingUsers": 3,
  "approvedUsers": 7,
  "rejectedUsers": 0,
  "totalDosen": 2,
  "totalMahasiswa": 5
}
```

### Get Pending Users
```http
GET /api/admin/users/pending
Authorization: Bearer {admin_token}
```

### Get All Users (with filters)
```http
GET /api/admin/users?status=pending&role=dosen
Authorization: Bearer {admin_token}
```

Query parameters:
- `status`: pending | approved | rejected
- `role`: admin | dosen | mahasiswa

### Approve User
```http
PUT /api/admin/users/{userId}/approve
Authorization: Bearer {admin_token}
```

### Reject User
```http
PUT /api/admin/users/{userId}/reject
Authorization: Bearer {admin_token}
```

### Edit User Profile
```http
PUT /api/admin/users/{userId}
Authorization: Bearer {admin_token}

Body:
{
  "name": "User Name",
  "email": "user@example.com",
  "nim": "123456", // for students
  "nip": "987654", // for lecturers
  "status": "approved" // or "pending" or "rejected"
}
```

### Delete User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

**Note:** Admin users cannot be deleted.

## Security Notes

1. **Change Admin Password**: Immediately change the default password `admin123` after first login
2. **Protected Admin Routes**: All admin endpoints are protected by `protect` and `isAdmin` middleware
3. **Admin Cannot Be Deleted**: Admin users cannot be deleted through the API
4. **Admin Auto-Approved**: Admin accounts are automatically approved and don't need approval
5. **Admin Cannot Edit Admin**: Admins cannot edit other admin user profiles

## Troubleshooting

### Admin Already Exists
If running `npm run create-admin` and admin already exists:
```
Admin user already exists!
Email: admin@example.com
```

### Forgot Admin Password or Want to Reset to Default
Use the reset admin script to restore email and password to default:
```bash
cd backend
npm run reset-admin
```

Expected output:
```
MongoDB connected
Admin user found. Resetting to default credentials...

✅ Admin user reset successfully!

Admin Credentials:
Email: admin@example.com
Password: admin123

⚠️  IMPORTANT: Please change the admin password after login!
```

After reset, you can login with:
- Email: `admin@example.com`
- Password: `admin123`

### User Cannot Login After Being Approved
1. Check user status in database: `status: "approved"`
2. Clear localStorage in browser
3. Login again

### Error "Access denied. Admin only"
Ensure:
1. Admin token is valid and not expired
2. Logged in user has `role: "admin"`
3. Authorization header is correct: `Bearer {token}`

### Cannot Edit User Profile
Ensure:
1. You are logged in as admin
2. The user is not an admin (admin users cannot be edited)
3. Email is unique (not used by another user)

## Best Practices

1. **Regular Password Changes**: Change admin password regularly for security
2. **Review Pending Users**: Check and approve/reject pending users promptly
3. **Verify User Information**: Verify student/lecturer information before approval
4. **Monitor User Activity**: Regularly review user list and remove inactive accounts
5. **Backup Data**: Regularly backup the database (see [DATA_PERSISTENCE.md](DATA_PERSISTENCE.md))

## Admin Profile Management

Admins can manage their own profile:
1. Click on avatar/name in navbar
2. Select "Profile" from dropdown menu
3. Update name, email, or password
4. Upload custom avatar

**Note:** Admin role and status cannot be changed through the profile page.
