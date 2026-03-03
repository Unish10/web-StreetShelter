# StreetShelter - Roles and Flow Documentation

## Three Roles System

### 1. **Reporter** (Role: `user`)
- **Purpose**: Report injured/stray dogs they find
- **Capabilities**:
  - Create account via registration
  - Report dogs with photos, location, description
  - View their own reports and status
  - Track rescue progress

### 2. **Rescue Owner** (Role: `owner`)
- **Purpose**: Rescue and care for reported dogs
- **Registration Flow**:
  1. Create basic account via registration (select "Rescue Owner" role)
  2. Login → Redirected to complete organization profile form
  3. Fill organization details:
     - Business/Organization name
     - ID/Registration number
     - Ownership type (Individual, NGO, Shelter, Veterinary, Other)
     - Capacity
     - Description
  4. Submit profile → Status: **PENDING VERIFICATION**
  5. Wait for admin verification
  6. Once verified → Can access dog reports and start rescues

- **Capabilities (After Verification)**:
  - View all dog reports submitted by reporters
  - Start rescue process (change status to "In Progress")
  - Complete rescue (change status to "Rescued")
  - Track rescue statistics

### 3. **Admin** (Role: `admin`)
- **Purpose**: Verify rescue owners and manage system
- **Login Credentials**:
  - Email: `admin@streetshelter.com`
  - Password: `Admin@123`
  
- **Capabilities**:
  - View pending rescue owner registrations
  - Review organization details
  - Verify or reject owner registrations
  - View all users (reporters and owners)
  - View statistics

## Application Flow

### Reporter Flow
```
Register → Login → Dashboard → Report Dog → Submit → View Reports
```

### Rescue Owner Flow
```
Register (select Owner role)
   ↓
Login
   ↓
Complete Organization Profile Form
   ↓
Submit Profile (Status: PENDING)
   ↓
Wait for Admin Verification
   ↓
Admin Verifies ✅
   ↓
Access Dog Reports
   ↓
Start Rescue Process
   ↓
Complete Rescue
```

### Admin Flow
```
Login (admin@streetshelter.com / Admin@123)
   ↓
View Pending Verifications
   ↓
Review Organization Details
   ↓
Verify ✅ or Reject ❌
   ↓
Owner gets access to reports
```

## Important URLs

- **Home/Landing**: `/`
- **Register**: `/register`
- **Login (Reporter/Owner)**: `/login`
- **Admin Login**: `/admin/login`
- **Dashboard**: `/dashboard` (routes to appropriate dashboard based on role)
- **Owner Registration Form**: `/dashboard/owner-registration`
- **Dog Reports**: `/dashboard/dog-reports`
- **Report Dog**: `/dashboard/report-dog`

## Verification Status Values

- `pending`: Waiting for admin verification
- `verified`: Approved by admin
- `rejected`: Rejected by admin

## Local Storage Keys

- `user`: Current logged-in user
- `admin`: Current logged-in admin
- `allUsers`: Array of all registered users
- `adminAccount`: Admin credentials
- `ownerProfile`: Current owner's organization profile
- `ownerProfile_{userId}`: Specific owner profile by user ID
- `dogReports`: Array of all dog reports
- `rescueActions`: Array of rescue actions taken

## User Object Structure

```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string,
  password: string,
  role: 'user' | 'owner' | 'admin',
  ownerVerified: boolean,
  ownerProfileCompleted: boolean,
  createdAt: string (ISO date)
}
```

## Owner Profile Structure

```javascript
{
  user_id: number,
  business_name: string,
  id_number: string,
  ownership_type: 'individual' | 'ngo' | 'shelter' | 'veterinary' | 'other',
  description: string,
  capacity: number,
  verified: boolean,
  verificationStatus: 'pending' | 'verified' | 'rejected',
  created_at: string (ISO date),
  verifiedAt: string (ISO date) // when verified
}
```

## Testing the Flow

1. **Create Reporter Account**
   - Go to `/register`
   - Select "Reporter" role
   - Complete registration
   - Login and report a dog

2. **Create Rescue Owner Account**
   - Go to `/register`
   - Select "Rescue Owner" role
   - Complete basic registration
   - Login → Will be prompted to complete organization profile
   - Fill organization details and submit
   - You'll see "Pending Verification" screen
   - Logout

3. **Admin Verification**
   - Go to `/admin/login`
   - Login with: `admin@streetshelter.com` / `Admin@123`
   - Click "Verifications" tab
   - See pending owner registration
   - Review details
   - Click "✓ Verify" button
   - Owner is now verified

4. **Rescue Owner After Verification**
   - Login as rescue owner again
   - Now you can access dashboard
   - Click "Dog Reports" or "Rescue Map"
   - View reports submitted by reporters
   - Click "View Full Details" on pending reports
   - Start rescue process

## UI Flow Summary

✅ **Register Page**: Simple form, NO owner fields inline
✅ **Owner Registration Page**: Separate page after first owner login
✅ **Owner Dashboard**: Shows verification status, blocks unverified owners
✅ **Dog Reports**: Only accessible to verified owners
✅ **Admin Dashboard**: Verification interface with all owner profile details
✅ **Reporter Dashboard**: Can report dogs and view own reports

All UIs maintain existing design - only logic and flow updated!
