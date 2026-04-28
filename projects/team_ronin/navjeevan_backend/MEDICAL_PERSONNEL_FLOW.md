# Medical Personnel Registration & Activation Flow

## Overview
Medical personnel accounts are created by superadmins, then activated by the medical personnel themselves using their Login ID and a password.

---

## Step 1: Create Medical Personnel Account (Superadmin Only)

**Endpoint:** `POST /api/auth/medical/create/`  
**Permission:** Superuser only (IsAuthenticated)

### Request
```json
{
  "name": "Dr. John Doe",
  "email": "john.doe@example.com",
  "phone_number": "+1234567890"
}
```

### Response (201 Created)
```json
{
  "message": "Medical personnel profile created and activated for setup. Login ID has been sent to john.doe@example.com. Account is inactive until the personnel activates it with their password.",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "login_id": "JOHN-550E",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "status": "inactive",
    "is_verified": false,
    "date_joined": "2026-04-26T10:30:00Z"
  },
  "login_id": "JOHN-550E"
}
```

**What Happens:**
- Account is created with `status='inactive'` and `is_verified=False`
- Password is set to unusable (cannot log in yet)
- **Login ID is emailed** to the provided email address
- In debug mode, login_id is returned in response for testing

### Error Responses
- **400**: Validation error (invalid email, duplicate email, invalid phone)
- **403**: Not a superuser
- **502**: Email delivery failed (account is rolled back)

---

## Step 2: Activate Medical Personnel Account (Public)

**Endpoint:** `POST /api/auth/medical/activate/`  
**Permission:** AllowAny (public)

### Request
```json
{
  "login_id": "JOHN-550E",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

### Password Requirements
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Response (200 OK)
```json
{
  "message": "Medical personnel account activated successfully.",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "login_id": "JOHN-550E",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "status": "active",
    "is_verified": true,
    "date_joined": "2026-04-26T10:30:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

**What Happens:**
- Login ID is validated (must exist and be inactive/unverified)
- Passwords are validated for match and strength
- Account is marked `is_verified=True` and `status='active'`
- Password is set
- JWT tokens are returned (can immediately log in)

### Error Responses
- **400**: Validation errors
  - `"No medical personnel account found with this Login ID."`
  - `"This medical personnel account is already activated."`
  - `"Passwords do not match."`
  - `"Password must be at least 8 characters..."`
  - etc.

---

## Step 3: Login as Medical Personnel

**Endpoint:** `POST /api/auth/user/login/`  
**Permission:** AllowAny (public)

### Request
```json
{
  "login_id": "JOHN-550E",
  "password": "SecurePass123!"
}
```

### Response (200 OK)
```json
{
  "message": "Login successful.",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "login_id": "JOHN-550E",
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "status": "active",
    "is_verified": true,
    "date_joined": "2026-04-26T10:30:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### Error Responses
- **400**: Validation errors
  - `"Invalid Login ID or password."`
  - `"This account is inactive."`
  - `"Medical personnel account not activated. Please activate using your Login ID."`

---

## Step 4: Access Protected Endpoints

Use the `access` token in the Authorization header:

```
Authorization: Bearer <access_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJ0eXAi..." http://localhost:8000/api/auth/user/profile/
```

### Response (200 OK)
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "login_id": "JOHN-550E",
  "name": "Dr. John Doe",
  "email": "john.doe@example.com",
  "phone_number": "+1234567890",
  "status": "active",
  "is_verified": true,
  "date_joined": "2026-04-26T10:30:00Z"
}
```

---

## Account Status Reference

| Status | is_verified | Can Login | Can Activate | Description |
|--------|-------------|-----------|--------------|-------------|
| inactive | False | ❌ No | ✅ Yes | Newly created, awaiting activation |
| active | True | ✅ Yes | ❌ No (already activated) | Activated and ready to use |
| inactive | True | ❌ No | ❌ No (conflicts) | Manually deactivated (superadmin action) |

---

## Email Templates

### Medical Personnel Login ID Email
```
Subject: Your Navjeevan Medical Personnel Login ID — Activate Your Account

Hello [Name],

A medical personnel account has been created for you in Navjeevan.

Your Login ID is:

    [LOGIN_ID]

To activate your account, go to the activation page and enter:
  - Your Login ID (above)
  - A password of your choice
  - Confirm your password

Password requirements:
  - At least 8 characters
  - At least one uppercase letter  (A-Z)
  - At least one lowercase letter  (a-z)
  - At least one digit             (0-9)
  - At least one special character (!@#$%^&*(),.?":{}|<>)

After successful activation, your account will be active and you can log in.

-- The Navjeevan Team
```

---

## Testing the Flow

### Test with curl or Postman:

```bash
# 1. Create medical personnel (as superadmin)
POST http://localhost:8000/api/auth/medical/create/
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "Dr. Jane Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+1987654321"
}

# 2. Activate medical personnel (public)
POST http://localhost:8000/api/auth/medical/activate/
Content-Type: application/json

{
  "login_id": "JANE-XXXX",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!"
}

# 3. Login (public)
POST http://localhost:8000/api/auth/user/login/
Content-Type: application/json

{
  "login_id": "JANE-XXXX",
  "password": "StrongPass123!"
}

# 4. Access protected endpoint
GET http://localhost:8000/api/auth/user/profile/
Authorization: Bearer <access_token>
```

---

## Implementation Details

### Models
- `MedicalPersonnel`: inherits from `BaseUser`
  - `is_verified`: False until activated
  - `status`: 'active' or 'inactive'
  - `user_type`: always 'medical'

### Serializers
- `AdminCreateMedicalPersonnelSerializer`: used by superadmin to create initial profile
- `MedicalPersonnelActivationSerializer`: used by medical personnel to activate with password
- `LoginSerializer`: shared by both NormalUser and MedicalPersonnel
- `MedicalPersonnelSerializer`: profile view serializer

### Views
- `MedicalPersonnelViewSet.create_personnel()`: superadmin action, sends email
- `MedicalPersonnelViewSet.activate_personnel()`: public action, sets password and status
- `NormalUserViewSet.login()`: shared login for both user types

### Email
- Handled by Django's `send_mail()` with Gmail SMTP (configured in settings.py)
- Credentials from `.env` file: `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`
