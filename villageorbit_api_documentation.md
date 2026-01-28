# VillageOrbit API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8001/api/v1`  
**Swagger UI:** `http://localhost:8001/api/v1/swagger-ui.html`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Password Reset](#2-password-reset)
3. [User Profile](#3-user-profile)
4. [User Management (Admin)](#4-user-management-admin)
5. [RBAC Management](#5-rbac-management)
6. [Village Management](#6-village-management)
7. [Village Services](#7-village-services)
8. [Marketplace](#8-marketplace)
9. [Forum Posts](#9-forum-posts)
10. [Feedback & Contact](#10-feedback--contact)
11. [Exams](#11-exams)
12. [File Storage](#12-file-storage)
13. [Email Service](#13-email-service)
14. [Rate Limiting (Admin)](#14-rate-limiting-admin)
15. [Scheduler Jobs (Admin)](#15-scheduler-jobs-admin)
16. [Health Check](#16-health-check)

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

---

## Common Headers

| Header | Description | Required |
|--------|-------------|----------|
| `Authorization` | Bearer JWT token | For protected endpoints |
| `Content-Type` | `application/json` | For POST/PUT requests |
| `X-Village-Id` | Village identifier | For some endpoints |

---

# 1. Authentication

Base path: `/api/v1/auth`

## 1.1 User Signup

**POST** `/auth/signup`

Register a new user account.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123",
    "fullName": "John Doe",
    "mobile": "9876543210",
    "aadharNumber": "123456789012",
    "villageId": "shivankhed"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, uppercase, lowercase, number, special char |
| fullName | string | Yes | 3-100 characters |
| mobile | string | No | 10-digit Indian mobile |
| aadharNumber | string | No | 12-digit Aadhar |
| villageId | string | Yes | Village identifier |

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "mobile": "9876543210",
    "approvalStatus": "PENDING",
    "villageId": "shivankhed",
    "isActive": true,
    "roles": [{"id": "uuid", "name": "user"}],
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "User registered successfully"
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": {
    "code": "SIGNUP_ERROR",
    "message": "Email already in use: user@example.com"
  }
}
```

---

## 1.2 User Login

**POST** `/auth/login`

Authenticate and receive tokens.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@villageorbit.in",
    "password": "SecurePass@123"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Registered email |
| password | string | Yes | User password |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "superadmin@villageorbit.in",
      "fullName": "Super Admin",
      "roles": [{"id": "uuid", "name": "super_admin"}],
      "permissions": ["users:view", "users:create", "users:delete"]
    }
  },
  "message": "Login successful"
}
```

### Error Response (401)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_FAILED",
    "message": "Invalid email or password"
  }
}
```

---

## 1.3 Refresh Token

**POST** `/auth/refresh-token`

Get new access token using refresh token.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "message": "Token refreshed successfully"
}
```

### Error Response (401)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

---

## 1.4 Logout

**POST** `/auth/logout` ðŸ”’

Revoke refresh token.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/logout" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

## 1.5 Get Current User Profile

**GET** `/auth/me` ðŸ”’

Get authenticated user's profile.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/auth/me" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "superadmin@villageorbit.in",
    "fullName": "Super Admin",
    "mobile": "+91-9876543210",
    "approvalStatus": "APPROVED",
    "villageId": "shivankhed",
    "roles": [
      {
        "id": "uuid",
        "name": "super_admin",
        "permissions": [
          {"id": "uuid", "name": "users:view"},
          {"id": "uuid", "name": "users:create"}
        ]
      }
    ],
    "allPermissions": ["users:view", "users:create", "users:delete"],
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Profile retrieved successfully"
}
```

---

# 2. Password Reset

Base path: `/api/v1/auth`

## 2.1 Forgot Password (Request Reset)

**POST** `/auth/forgot-password`

Initiate password reset process. Sends reset email if user exists.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Registered email address |

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a password reset link has been sent"
}
```

> **Note:** For security, always returns success even if email doesn't exist.

---

## 2.2 Validate Reset Token

**GET** `/auth/validate-reset-token`

Validate if a password reset token is still valid.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/auth/validate-reset-token?token=abc123xyz..."
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Password reset token from email |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "valid": true
  },
  "message": "Token is valid"
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired reset token"
  }
}
```

---

## 2.3 Reset Password

**POST** `/auth/reset-password`

Reset password using a valid token.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123xyz...",
    "newPassword": "NewSecurePass@123",
    "confirmPassword": "NewSecurePass@123"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Reset token from email |
| newPassword | string | Yes | New password (min 8 chars, mixed case, number, special char) |
| confirmPassword | string | Yes | Must match newPassword |

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful"
}
```

### Error Response (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Passwords do not match"
  }
}
```

---

# 3. User Profile

Base path: `/api/v1/users`

## 3.1 Get Profile

**GET** `/users/profile` ðŸ”’

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/users/profile" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "mobile": "9876543210",
    "approvalStatus": "APPROVED",
    "villageId": "shivankhed",
    "roles": [{"id": "uuid", "name": "user"}],
    "allPermissions": [],
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Profile retrieved successfully"
}
```

---

## 3.2 Update Profile

**PUT** `/users/profile` ðŸ”’

### Request
```bash
curl -X PUT "http://localhost:8001/api/v1/users/profile" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Updated",
    "mobile": "9876543211",
    "aadharNumber": "123456789013"
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "John Updated",
    "mobile": "9876543211"
  },
  "message": "Profile updated successfully"
}
```

---

# 4. User Management (Admin)

Base path: `/api/v1/admin/users` ðŸ”’

## 3.1 Get All Users

**GET** `/admin/users`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/users?villageId=shivankhed&page=0&size=20&approvalStatus=PENDING" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| villageId | string | default | Filter by village |
| page | int | 0 | Page number (0-indexed) |
| size | int | 20 | Items per page |
| approvalStatus | string | - | Filter: PENDING, APPROVED, REJECTED |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "userId": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "approvalStatus": "PENDING",
        "villageId": "shivankhed",
        "isActive": true,
        "roles": [{"id": "uuid", "name": "user"}],
        "createdAt": "2025-12-30T10:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  },
  "message": "Users retrieved successfully"
}
```

---

## 3.2 Get User By ID

**GET** `/admin/users/{userId}`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000?villageId=shivankhed" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "mobile": "9876543210",
    "approvalStatus": "PENDING",
    "villageId": "shivankhed",
    "isActive": true,
    "roles": [{"id": "uuid", "name": "user"}],
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "User retrieved successfully"
}
```

### Error Response (404)
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found with ID: 550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 3.3 Approve User

**POST** `/admin/users/{userId}/approve`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/approve" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "villageId": "shivankhed"
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "User approved successfully"
}
```

---

## 3.4 Reject User

**POST** `/admin/users/{userId}/reject`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/reject" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "villageId": "shivankhed",
    "reason": "Incomplete documentation"
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "User rejected successfully"
}
```

---

## 3.5 Delete User

**DELETE** `/admin/users/{userId}`

### Request
```bash
curl -X DELETE "http://localhost:8001/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000?villageId=shivankhed" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

---

# 5. RBAC Management

Base path: `/api/v1/rbac` ðŸ”’

## 4.1 Create Permission

**POST** `/rbac/permissions`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/rbac/permissions" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "notices:create",
    "description": "Permission to create notices"
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "notices:create",
    "description": "Permission to create notices",
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Permission created successfully"
}
```

---

## 4.2 Get All Permissions

**GET** `/rbac/permissions`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/rbac/permissions" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "users:view",
      "description": "View users",
      "createdAt": "2025-12-30T10:00:00"
    },
    {
      "id": "uuid",
      "name": "users:create",
      "description": "Create users",
      "createdAt": "2025-12-30T10:00:00"
    }
  ],
  "message": "Permissions retrieved successfully"
}
```

---

## 4.3 Get All Roles

**GET** `/rbac/roles`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/rbac/roles" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "super_admin",
      "description": "Super Administrator with full access",
      "isSystemRole": true,
      "permissions": ["users:view", "users:create", "users:delete"]
    },
    {
      "id": "uuid",
      "name": "user",
      "description": "Regular user",
      "isSystemRole": true,
      "permissions": []
    }
  ],
  "message": "Roles retrieved successfully"
}
```

---

## 4.4 Assign Permissions to Role

**POST** `/rbac/roles/{roleId}/permissions`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/rbac/roles/550e8400-e29b-41d4-a716-446655440000/permissions" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '["permission-uuid-1", "permission-uuid-2"]'
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Permissions assigned to role successfully"
}
```

---

## 4.5 Assign Role to User

**POST** `/rbac/users/{userId}/roles`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/rbac/users/550e8400-e29b-41d4-a716-446655440000/roles" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '["role-uuid-1"]'
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Roles assigned to user successfully"
}
```

---

# 6. Village Management

Base path: `/api/v1/villages`

## 5.1 List Villages (Public)

**GET** `/villages`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/villages?activeOnly=true"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Shivankhed Khurd",
      "slug": "shivankhed",
      "district": "Buldhana",
      "taluka": "Mehkar",
      "state": "Maharashtra",
      "pincode": "443301",
      "isActive": true,
      "createdAt": "2025-12-30T10:00:00"
    }
  ],
  "message": "Villages retrieved successfully"
}
```

---

## 5.2 Get Village By ID (Public)

**GET** `/villages/{villageId}`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/villages/550e8400-e29b-41d4-a716-446655440000"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Shivankhed Khurd",
    "slug": "shivankhed",
    "district": "Buldhana",
    "taluka": "Mehkar",
    "state": "Maharashtra",
    "pincode": "443301",
    "isActive": true
  },
  "message": "Village retrieved successfully"
}
```

---

## 5.3 Get Village Config (Public)

**GET** `/villages/{villageId}/config`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/villages/550e8400-e29b-41d4-a716-446655440000/config?language=en"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "villageId": "uuid",
    "language": "en",
    "villageName": "Shivankhed Khurd",
    "sarpanchName": "Shri. Rajesh Kumar",
    "gramsevakName": "Shri. Suresh Patil",
    "contactNumber": "+91-9876543210",
    "configData": {}
  },
  "message": "Village config retrieved successfully"
}
```

---

## 5.4 Create Village ðŸ”’

**POST** `/villages`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/villages" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Village",
    "slug": "new-village",
    "district": "Buldhana",
    "taluka": "Mehkar",
    "state": "Maharashtra",
    "pincode": "443301"
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Village",
    "slug": "new-village"
  },
  "message": "Village created successfully"
}
```

---

# 7. Village Services

Base path: `/api/v1/services`

## 6.1 List Services (Public)

**GET** `/services`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/services?villageId=uuid&category=Medical&page=0&limit=20"
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| villageId | string | - | Filter by village |
| category | string | - | Filter by category |
| search | string | - | Search by name/owner |
| page | int | 0 | Page number |
| limit | int | 20 | Items per page |
| sortBy | string | name | Sort field |
| sortOrder | string | asc | asc or desc |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "name": "Village Medical Store",
        "description": "24x7 Medical services",
        "category": "Medical",
        "ownerName": "Dr. Ramesh Sharma",
        "contactNumber": "9876543210",
        "address": "Main Road, Shivankhed",
        "villageId": "uuid",
        "rating": 4.5,
        "isActive": true
      }
    ],
    "total": 50,
    "page": 0,
    "limit": 20,
    "totalPages": 3
  },
  "message": "Services retrieved successfully"
}
```

---

## 6.2 Get Service By ID (Public)

**GET** `/services/{serviceId}`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/services/550e8400-e29b-41d4-a716-446655440000"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Village Medical Store",
    "description": "24x7 Medical services",
    "category": "Medical",
    "ownerName": "Dr. Ramesh Sharma",
    "contactNumber": "9876543210",
    "address": "Main Road, Shivankhed",
    "villageId": "uuid",
    "rating": 4.5,
    "isActive": true
  },
  "message": "Service retrieved successfully"
}
```

---

## 6.3 Get Service Categories (Public)

**GET** `/services/categories`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/services/categories"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {"id": "uuid", "name": "Medical", "icon": "ðŸ¥", "isActive": true},
    {"id": "uuid", "name": "Grocery", "icon": "ðŸ›’", "isActive": true},
    {"id": "uuid", "name": "Education", "icon": "ðŸ“š", "isActive": true}
  ],
  "message": "Categories retrieved successfully"
}
```

---

## 6.4 Create Service ðŸ”’

**POST** `/services`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/services" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Service",
    "description": "Service description",
    "category": "Medical",
    "ownerName": "Owner Name",
    "contactNumber": "9876543210",
    "address": "Address",
    "villageId": "village-uuid"
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Service"
  },
  "message": "Service created successfully"
}
```

---

# 8. Marketplace

Base path: `/api/v1/items`

**Required Header:** `X-Village-Id: <village-uuid>`

## 7.1 List Marketplace Items (Public)

**GET** `/items`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/items?category=Electronics&page=0&size=20" \
  -H "X-Village-Id: <village-uuid>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "iPhone 13 Pro",
        "description": "Good condition, 1 year old",
        "price": 55000,
        "category": "Electronics",
        "condition": "GOOD",
        "status": "AVAILABLE",
        "sellerName": "John Doe",
        "sellerContact": "9876543210",
        "images": ["url1", "url2"],
        "createdAt": "2025-12-30T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  },
  "message": "Items retrieved successfully"
}
```

---

## 7.2 Get Item Details (Public)

**GET** `/items/{itemId}`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/items/550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Village-Id: <village-uuid>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "iPhone 13 Pro",
    "description": "Good condition, 1 year old",
    "price": 55000,
    "category": "Electronics",
    "condition": "GOOD",
    "status": "AVAILABLE",
    "sellerName": "John Doe",
    "sellerContact": "9876543210",
    "images": ["url1", "url2"]
  },
  "message": "Item retrieved successfully"
}
```

---

## 7.3 Create Item Listing ðŸ”’

**POST** `/items`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/items" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Village-Id: <village-uuid>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13 Pro",
    "description": "Good condition, 1 year old",
    "price": 55000,
    "category": "Electronics",
    "condition": "GOOD",
    "contactNumber": "9876543210",
    "images": ["url1", "url2"]
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "iPhone 13 Pro",
    "status": "PENDING"
  },
  "message": "Item created successfully. Pending admin approval."
}
```

---

## 7.4 Get My Items ðŸ”’

**GET** `/items/my-items`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/items/my-items?page=0&size=20" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 7.5 Mark Item as Sold ðŸ”’

**PUT** `/items/{itemId}/sold`

### Request
```bash
curl -X PUT "http://localhost:8001/api/v1/items/550e8400-e29b-41d4-a716-446655440000/sold" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "SOLD"
  },
  "message": "Item marked as sold"
}
```

---

# 9. Forum Posts

Base path: `/api/v1/posts`

**Required Header:** `X-Village-Id: <village-uuid>`

## 8.1 Get Posts (Public)

**GET** `/posts`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/posts?search=announcement&page=0&size=20" \
  -H "X-Village-Id: <village-uuid>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "content": "Village meeting tomorrow at 5 PM",
        "authorId": "uuid",
        "authorName": "Sarpanch",
        "likesCount": 25,
        "commentsCount": 10,
        "isLikedByCurrentUser": false,
        "createdAt": "2025-12-30T10:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 5
  },
  "message": "Posts retrieved successfully"
}
```

---

## 8.2 Create Post ðŸ”’

**POST** `/posts`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/posts" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "X-Village-Id: <village-uuid>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello village! Important announcement...",
    "images": ["url1"]
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Hello village! Important announcement...",
    "authorName": "John Doe",
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Post created successfully"
}
```

---

## 8.3 Like Post ðŸ”’

**POST** `/posts/{postId}/like`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/posts/550e8400-e29b-41d4-a716-446655440000/like" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 26
  },
  "message": "Post liked"
}
```

---

## 8.4 Add Comment ðŸ”’

**POST** `/posts/{postId}/comments`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/posts/550e8400-e29b-41d4-a716-446655440000/comments" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great announcement!"
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Great announcement!",
    "authorName": "John Doe",
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Comment added successfully"
}
```

---

# 10. Feedback & Contact

Base path: `/api/v1`

## 9.1 Submit Feedback (Public)

**POST** `/feedback`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "COMPLAINT",
    "subject": "Road condition",
    "message": "The main road needs repair",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "villageId": "shivankhed"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | COMPLAINT, SUGGESTION, APPRECIATION, GENERAL |
| subject | string | Yes | Feedback subject |
| message | string | Yes | Feedback message |
| name | string | No | Submitter name |
| email | string | No | Submitter email |
| phone | string | No | Submitter phone |
| villageId | string | No | Village identifier |

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "COMPLAINT",
    "subject": "Road condition",
    "status": "PENDING",
    "referenceNumber": "FB-2025-001",
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Feedback submitted successfully"
}
```

---

## 9.2 Submit Contact Form (Public)

**POST** `/contact`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "subject": "General Inquiry",
    "message": "I would like to know more about..."
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referenceNumber": "CT-2025-001",
    "createdAt": "2025-12-30T10:00:00"
  },
  "message": "Contact form submitted successfully"
}
```

---

# 11. Exams

Base path: `/api/v1/exams`

**Required Header:** `X-Village-ID: <village-uuid>`

## 10.1 List Available Exams

**GET** `/exams`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/exams" \
  -H "X-Village-ID: <village-uuid>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "General Knowledge Quiz",
      "description": "Test your GK",
      "subject": "GK",
      "duration": 30,
      "totalQuestions": 20,
      "passingScore": 60,
      "status": "ACTIVE"
    }
  ],
  "message": "Available exams retrieved"
}
```

---

## 10.2 Start Exam Attempt ðŸ”’

**POST** `/exams/{examId}/attempts`

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/exams/550e8400-e29b-41d4-a716-446655440000/attempts" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe"
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "examId": "uuid",
    "status": "IN_PROGRESS",
    "startedAt": "2025-12-30T10:00:00",
    "expiresAt": "2025-12-30T10:30:00"
  },
  "message": "Exam attempt started"
}
```

---

## 10.3 Submit Answers ðŸ”’

**PUT** `/exams/attempts/{attemptId}`

### Request
```bash
curl -X PUT "http://localhost:8001/api/v1/exams/attempts/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "uuid", "selectedOption": "A"},
      {"questionId": "uuid", "selectedOption": "B"}
    ]
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "status": "COMPLETED",
    "score": 85,
    "passed": true
  },
  "message": "Answers submitted"
}
```

---

## 10.4 Get Exam Results ðŸ”’

**GET** `/exams/attempts/{attemptId}/results`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/exams/attempts/550e8400-e29b-41d4-a716-446655440000/results?includeAnswers=true" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "examTitle": "General Knowledge Quiz",
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "passed": true,
    "timeTaken": "25:30"
  },
  "message": "Results retrieved"
}
```

---

# 12. File Storage

Base path: `/api/v1/storage`

## 12.1 Upload File ðŸ”’

**POST** `/storage/upload`

Upload a file to cloud storage (Cloudflare R2 / AWS S3).

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/storage/upload" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@/path/to/document.pdf" \
  -F "folder=documents"
```

### Form Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | File to upload (max 100MB) |
| folder | string | No | Destination folder |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "key": "uploads/2025/12/31/document-abc123.pdf",
    "fileName": "document.pdf",
    "contentType": "application/pdf",
    "size": 1048576,
    "url": "https://storage.villageorbit.com/uploads/2025/12/31/document-abc123.pdf"
  },
  "message": "File uploaded successfully"
}
```

---

## 12.2 Download File ðŸ”’

**GET** `/storage/download`

Download a file from storage.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/storage/download?filePath=uploads/2025/12/31/document.pdf" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -o document.pdf
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Full path/key of the file |

### Success Response (200)
Returns file binary with appropriate Content-Type header.

---

## 12.3 Get File Metadata ðŸ”’

**GET** `/storage/metadata`

Get metadata of a stored file.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/storage/metadata?filePath=uploads/2025/12/31/document.pdf" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "key": "uploads/2025/12/31/document.pdf",
    "size": 1048576,
    "contentType": "application/pdf",
    "lastModified": "2025-12-31T10:00:00Z",
    "metadata": {
      "uploadedBy": "user-uuid",
      "originalName": "document.pdf"
    }
  },
  "message": "File metadata retrieved"
}
```

---

## 12.4 Get Signed URL ðŸ”’

**GET** `/storage/signed-url`

Get a pre-signed URL for temporary access.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/storage/signed-url?filePath=uploads/document.pdf&expiresIn=3600" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Full path/key of the file |
| expiresIn | integer | No | URL validity in seconds (default: 3600) |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "url": "https://storage.villageorbit.com/uploads/document.pdf?X-Amz-Signature=...",
    "expiresAt": "2025-12-31T11:00:00Z"
  },
  "message": "Signed URL generated"
}
```

---

## 12.5 Delete File ðŸ”’

**DELETE** `/storage/delete`

Delete a file from storage.

### Request
```bash
curl -X DELETE "http://localhost:8001/api/v1/storage/delete?filePath=uploads/document.pdf" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "File deleted successfully"
}
```

---

# 13. Email Service

Base path: `/api/v1/email`

## 13.1 Send Email ðŸ”’ (Admin)

**POST** `/email/send`

Send an email using configured provider (SendGrid/AWS SES).

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/email/send" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Important Notification",
    "body": "This is the email content.",
    "html": "<h1>Important Notification</h1><p>This is the email content.</p>"
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| to | string | Yes | Recipient email address |
| subject | string | Yes | Email subject |
| body | string | Yes | Plain text body |
| html | string | No | HTML body (optional) |
| cc | string | No | CC recipients (comma-separated) |
| bcc | string | No | BCC recipients (comma-separated) |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "messageId": "msg-uuid-123",
    "provider": "sendgrid",
    "status": "sent"
  },
  "message": "Email sent successfully"
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_SEND_FAILED",
    "message": "Failed to send email: Invalid recipient"
  }
}
```

---

## 13.2 Get Email Service Status ðŸ”’

**GET** `/email/status`

Check email service configuration and status.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/email/status" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "provider": "sendgrid",
    "fromAddress": "noreply@villageorbit.com",
    "configured": true
  },
  "message": "Email service status retrieved"
}
```

---

# 14. Rate Limiting (Admin)

Base path: `/api/v1/admin/rate-limits`

All endpoints require admin authentication ðŸ”’

## 14.1 Get All Rate Limit Configurations

**GET** `/admin/rate-limits`

Retrieve all rate limit configurations.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/rate-limits" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "configKey": "LOGIN_PER_IP",
      "description": "Login attempts per IP address",
      "requestsPerPeriod": 5,
      "periodInSeconds": 60,
      "requestsPerMinute": 5.0,
      "enabled": true,
      "updatedBy": null,
      "createdAt": "2025-12-31T00:00:00",
      "updatedAt": "2025-12-31T00:00:00"
    },
    {
      "id": "uuid",
      "configKey": "SIGNUP_PER_IP",
      "description": "Signup attempts per IP address",
      "requestsPerPeriod": 3,
      "periodInSeconds": 60,
      "requestsPerMinute": 3.0,
      "enabled": true
    },
    {
      "id": "uuid",
      "configKey": "FORGOT_PASSWORD_PER_IP",
      "description": "Password reset requests per IP",
      "requestsPerPeriod": 3,
      "periodInSeconds": 3600,
      "requestsPerMinute": 0.05,
      "enabled": true
    },
    {
      "id": "uuid",
      "configKey": "PUBLIC_API_PER_IP",
      "description": "Public API requests per IP",
      "requestsPerPeriod": 60,
      "periodInSeconds": 60,
      "requestsPerMinute": 60.0,
      "enabled": true
    },
    {
      "id": "uuid",
      "configKey": "AUTHENTICATED_STANDARD",
      "description": "Standard user API requests",
      "requestsPerPeriod": 100,
      "periodInSeconds": 60,
      "requestsPerMinute": 100.0,
      "enabled": true
    },
    {
      "id": "uuid",
      "configKey": "AUTHENTICATED_ADMIN",
      "description": "Admin user API requests",
      "requestsPerPeriod": 300,
      "periodInSeconds": 60,
      "requestsPerMinute": 300.0,
      "enabled": true
    },
    {
      "id": "uuid",
      "configKey": "UPLOAD_PER_USER",
      "description": "File uploads per user",
      "requestsPerPeriod": 10,
      "periodInSeconds": 60,
      "requestsPerMinute": 10.0,
      "enabled": true
    }
  ],
  "message": "Rate limit configurations retrieved"
}
```

---

## 14.2 Get Rate Limit by Key

**GET** `/admin/rate-limits/{configKey}`

Get a specific rate limit configuration.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/rate-limits/LOGIN_PER_IP" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "configKey": "LOGIN_PER_IP",
    "description": "Login attempts per IP address",
    "requestsPerPeriod": 5,
    "periodInSeconds": 60,
    "requestsPerMinute": 5.0,
    "enabled": true
  },
  "message": "Configuration retrieved"
}
```

---

## 14.3 Update Rate Limit Configuration

**PUT** `/admin/rate-limits/{configKey}`

Update an existing rate limit configuration.

### Request
```bash
curl -X PUT "http://localhost:8001/api/v1/admin/rate-limits/LOGIN_PER_IP" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "LOGIN_PER_IP",
    "description": "Login attempts per IP address",
    "requestsPerPeriod": 10,
    "periodInSeconds": 60,
    "enabled": true
  }'
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| configKey | string | Yes | Rate limit identifier |
| description | string | Yes | Human-readable description |
| requestsPerPeriod | integer | Yes | Max requests allowed (min: 1) |
| periodInSeconds | integer | Yes | Time window in seconds (min: 1) |
| enabled | boolean | No | Enable/disable the limit (default: true) |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "configKey": "LOGIN_PER_IP",
    "description": "Login attempts per IP address",
    "requestsPerPeriod": 10,
    "periodInSeconds": 60,
    "requestsPerMinute": 10.0,
    "enabled": true,
    "updatedBy": "admin-uuid",
    "updatedAt": "2025-12-31T10:00:00"
  },
  "message": "Rate limit configuration updated"
}
```

---

## 14.4 Toggle Rate Limit

**PATCH** `/admin/rate-limits/{configKey}/toggle`

Enable or disable a rate limit.

### Request
```bash
curl -X PATCH "http://localhost:8001/api/v1/admin/rate-limits/LOGIN_PER_IP/toggle?enabled=false" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| enabled | boolean | Yes | true to enable, false to disable |

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "configKey": "LOGIN_PER_IP",
    "enabled": false
  },
  "message": "Rate limit disabled"
}
```

---

## 14.5 Create Custom Rate Limit

**POST** `/admin/rate-limits`

Create a new custom rate limit configuration.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/rate-limits" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "CUSTOM_ENDPOINT_LIMIT",
    "description": "Custom rate limit for special endpoint",
    "requestsPerPeriod": 20,
    "periodInSeconds": 60,
    "enabled": true
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "configKey": "CUSTOM_ENDPOINT_LIMIT",
    "description": "Custom rate limit for special endpoint",
    "requestsPerPeriod": 20,
    "periodInSeconds": 60,
    "requestsPerMinute": 20.0,
    "enabled": true
  },
  "message": "Rate limit configuration created"
}
```

---

## 14.6 Delete Rate Limit

**DELETE** `/admin/rate-limits/{configKey}`

Delete a custom rate limit configuration.

### Request
```bash
curl -X DELETE "http://localhost:8001/api/v1/admin/rate-limits/CUSTOM_ENDPOINT_LIMIT" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Rate limit configuration deleted"
}
```

---

## 14.7 Reset Rate Limit for Identifier

**POST** `/admin/rate-limits/reset/{identifier}`

Clear rate limit buckets for a specific IP or user.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/rate-limits/reset/192.168.1.100" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| identifier | string | IP address or user UUID |

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Rate limits reset for 192.168.1.100"
}
```

---

## 14.8 Refresh Rate Limit Cache

**POST** `/admin/rate-limits/refresh-cache`

Force refresh of rate limit configuration cache.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/rate-limits/refresh-cache" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": null,
  "message": "Rate limit cache refreshed"
}
```

---

## 14.9 Get Current Rate Limit Status

**GET** `/admin/rate-limits/status`

Get rate limit status for the current request/user.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/rate-limits/status" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "configKey": "AUTHENTICATED_ADMIN",
    "limited": false,
    "remainingRequests": 295,
    "totalAllowed": 300,
    "resetInSeconds": 45,
    "identifier": "user-uuid"
  },
  "message": "Rate limit status retrieved"
}
```

---

## Rate Limit Response Headers

All API responses include rate limit headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Total requests allowed | `100` |
| `X-RateLimit-Remaining` | Requests remaining | `95` |
| `X-RateLimit-Reset` | Seconds until reset | `45` |
| `Retry-After` | Seconds to wait (when limited) | `60` |

### Rate Limited Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds."
  }
}
```

---

# 15. Scheduler Jobs (Admin)

Base path: `/api/v1/admin/scheduler`

All endpoints require admin authentication ðŸ”’

## 15.1 Get All Scheduled Jobs

**GET** `/admin/scheduler/jobs`

List all scheduled jobs and their status.

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/admin/scheduler/jobs" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "jobName": "healthCheckScheduler",
      "description": "Periodic health check every 5 minutes",
      "cronExpression": "0 */5 * * * *",
      "lastExecution": "2025-12-31T09:55:00",
      "nextExecution": "2025-12-31T10:00:00",
      "status": "ACTIVE",
      "enabled": true
    },
    {
      "jobName": "expiredTokenCleanup",
      "description": "Clean up expired password reset tokens",
      "cronExpression": "0 0 2 * * *",
      "lastExecution": "2025-12-31T02:00:00",
      "nextExecution": "2026-01-01T02:00:00",
      "status": "ACTIVE",
      "enabled": true
    }
  ],
  "message": "Scheduled jobs retrieved"
}
```

---

## 15.2 Trigger Job Manually

**POST** `/admin/scheduler/jobs/{jobName}/trigger`

Manually trigger a scheduled job.

### Request
```bash
curl -X POST "http://localhost:8001/api/v1/admin/scheduler/jobs/healthCheckScheduler/trigger" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "jobName": "healthCheckScheduler",
    "triggeredAt": "2025-12-31T10:00:00",
    "status": "TRIGGERED"
  },
  "message": "Job triggered successfully"
}
```

---

# 16. Health Check

## 16.1 Basic Health Check (Public)

**GET** `/health` or `/api/v1/health`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/health"
```

### Success Response (200)
```json
{
  "status": "UP",
  "service": "villageorbit-api",
  "timestamp": "2025-12-30T10:00:00"
}
```

---

## 16.2 Detailed Health Check (Public)

**GET** `/health/detailed` or `/api/v1/health/detailed`

### Request
```bash
curl -X GET "http://localhost:8001/api/v1/health/detailed"
```

### Success Response (200)
```json
{
  "status": "UP",
  "service": "villageorbit-api",
  "profile": "dev",
  "timestamp": "2025-12-30T10:00:00",
  "uptime": "2h 30m 15s",
  "startedAt": "2025-12-30T07:29:45",
  "build": {
    "version": "1.0.0",
    "artifact": "villageorbit-api",
    "name": "VillageOrbit API"
  },
  "database": {
    "status": "UP",
    "database": "PostgreSQL",
    "version": "16.0"
  }
}
```

---

# Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_FAILED | 401 | Invalid credentials |
| UNAUTHORIZED | 401 | Missing or invalid token |
| INVALID_TOKEN | 401 | Token expired or invalid |
| PERMISSION_DENIED | 403 | Insufficient permissions |
| USER_NOT_FOUND | 404 | User does not exist |
| ITEM_NOT_FOUND | 404 | Resource not found |
| VILLAGE_NOT_FOUND | 404 | Village does not exist |
| SIGNUP_ERROR | 400 | Registration failed |
| VALIDATION_ERROR | 400 | Invalid input data |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| EMAIL_SEND_FAILED | 500 | Email delivery failed |
| STORAGE_ERROR | 500 | File storage operation failed |
| ERROR | 500 | Internal server error |

---

# Authentication Notes

## Token Usage

1. Call `/auth/login` to get `accessToken` and `refreshToken`
2. Include `accessToken` in all protected requests:
   ```
   Authorization: Bearer <accessToken>
   ```
3. When `accessToken` expires (15 min default), call `/auth/refresh-token`
4. `refreshToken` expires in 7 days

## Test Credentials

```
Email: superadmin@villageorbit.in
Password: SecurePass@123
Role: super_admin (full access)
```

---

**Document Version:** 1.1.0  
**Last Updated:** December 31, 2025  
**API Version:** v1
