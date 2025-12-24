# VillageOrbit Backend API Documentation

**Generated:** 2024-12-24  
**Project:** VillageOrbit - Smart Village Management System  
**Backend:** Supabase (PostgreSQL + Edge Functions + Auth + Storage)

---

# PART 1 — API INVENTORY

## 1.1 Edge Functions (Serverless APIs)

| # | API Name | HTTP Method | Endpoint Path | Auth Required | Authorization | Description |
|---|----------|-------------|---------------|---------------|---------------|-------------|
| 1 | Create Tax Payment | POST | `/functions/v1/create-tax-payment` | No | None (Public) | Creates a Cashfree payment order for tax payments |
| 2 | Verify Tax Payment | POST | `/functions/v1/verify-tax-payment` | No | Webhook Signature / None | Verifies payment status with Cashfree and updates database |
| 3 | Send User Status Email | POST | `/functions/v1/send-user-status-email` | No | None (Called internally) | Sends approval/rejection emails via Resend API |
| 4 | Village Chatbot | POST | `/functions/v1/village-chatbot` | No | None (Public) | AI chatbot for village-related queries |

### 1.1.1 Create Tax Payment

**Endpoint:** `POST /functions/v1/create-tax-payment`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "<SUPABASE_ANON_KEY>"
}
```

**Request Body:**
```json
{
  "taxType": "string",
  "amount": "number",
  "payerName": "string",
  "payerMobile": "string",
  "payerEmail": "string (optional)",
  "villageAccount": "string (optional)",
  "villageId": "uuid (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "orderId": "string",
  "paymentSessionId": "string",
  "paymentUrl": "string"
}
```

**Error Response (500):**
```json
{
  "error": "string"
}
```

**Database Tables:** `tax_payments`

---

### 1.1.2 Verify Tax Payment

**Endpoint:** `POST /functions/v1/verify-tax-payment`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "<SUPABASE_ANON_KEY>",
  "x-webhook-signature": "string (optional, for webhooks)"
}
```

**Request Body (Frontend):**
```json
{
  "orderId": "string"
}
```

**Request Body (Webhook):**
```json
{
  "data": {
    "orderId": "string"
  },
  "order": {
    "order_id": "string"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "order_id": "string",
    "payment_id": "string",
    "payment_status": "success | failed",
    "payment_date": "timestamp"
  },
  "cashfreeStatus": {}
}
```

**Error Response (500):**
```json
{
  "error": "string"
}
```

**Database Tables:** `tax_payments`

---

### 1.1.3 Send User Status Email

**Endpoint:** `POST /functions/v1/send-user-status-email`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "<SUPABASE_ANON_KEY>"
}
```

**Request Body:**
```json
{
  "email": "string",
  "fullName": "string",
  "status": "approved | rejected",
  "rejectionReason": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {},
  "testMode": "boolean (optional)",
  "message": "string (optional)"
}
```

**Error Response (500):**
```json
{
  "error": "string"
}
```

**Database Tables:** None (Email only)

---

### 1.1.4 Village Chatbot

**Endpoint:** `POST /functions/v1/village-chatbot`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "apikey": "<SUPABASE_ANON_KEY>"
}
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ],
  "language": "string",
  "villageConfig": {}
}
```

**Success Response (200):** `text/event-stream` (SSE)

**Error Response (429/503/500):**
```json
{
  "error": "string"
}
```

**Database Tables:** None (AI response only)

---

## 1.2 Supabase Authentication Endpoints

| # | API Name | Method | Endpoint | Auth Required | Description |
|---|----------|--------|----------|---------------|-------------|
| 1 | Sign Up | POST | `/auth/v1/signup` | No | Register new user with email/password |
| 2 | Sign In | POST | `/auth/v1/token?grant_type=password` | No | Login with email/password |
| 3 | Sign Out | POST | `/auth/v1/logout` | Yes (JWT) | Logout current session |
| 4 | Get Session | GET | `/auth/v1/session` | Yes (JWT) | Get current session |
| 5 | Get User | GET | `/auth/v1/user` | Yes (JWT) | Get current user details |
| 6 | Admin Delete User | DELETE | `/auth/v1/admin/users/{id}` | Yes (Service Role) | Delete user (admin only) |

### 1.2.1 Sign Up

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "options": {
    "data": {
      "full_name": "string",
      "mobile": "string",
      "aadhar_number": "string"
    },
    "emailRedirectTo": "string"
  }
}
```

**Success Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "user_metadata": {}
  },
  "session": null
}
```

---

### 1.2.2 Sign In

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string"
  },
  "session": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

---

## 1.3 Supabase REST API (Database Operations)

All database operations use the Supabase PostgREST API with RLS policies.

**Base URL:** `https://<project-id>.supabase.co/rest/v1/`

**Headers:**
```json
{
  "apikey": "<SUPABASE_ANON_KEY>",
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
}
```

### Database Tables with API Access

| Table | SELECT | INSERT | UPDATE | DELETE | Auth Required | Notes |
|-------|--------|--------|--------|--------|---------------|-------|
| `announcements` | Public | Admin | Admin | Admin | Mixed | Village announcements |
| `comments` | Public | Auth | Owner | Owner/Admin | Mixed | Forum comments |
| `community_workers` | Public (active) | Admin | Admin | Admin | Mixed | Community workers list |
| `contact_form_submissions` | Admin | Public | Admin | Admin | Mixed | Contact form entries |
| `development_works` | Public | Admin | Admin | Admin | Mixed | Development projects |
| `emergency_contacts` | Public | Admin | Admin | Admin | Mixed | Emergency numbers |
| `exam_answers` | Owner/Admin | Owner | Owner | Owner | Yes | Exam answer submissions |
| `exam_attempts` | Owner/Admin | Owner | Owner | No | Yes | Exam attempt records |
| `exam_questions` | Public (active exams) | Admin | Admin | Admin | Mixed | Exam questions |
| `exams` | Public (active) | Admin | Admin | Admin | Mixed | Exam definitions |
| `feedback_submissions` | Admin | Public | Admin | Admin | Mixed | Feedback entries |
| `items` | Owner/Admin/Approved | Public | Owner/Admin | Owner/Admin | Mixed | Marketplace items |
| `market_prices` | Public | Admin | Admin | Admin | Mixed | Crop prices |
| `notable_contributors` | Public (active) | Admin | Admin | Admin | Mixed | Notable people |
| `notices` | Public (active) | Admin | Admin | Admin | Mixed | Official notices |
| `notification_logs` | Admin | System | No | No | Yes | Push notification logs |
| `page_visibility` | Public | Admin | Admin | Admin | Mixed | Page visibility settings |
| `panchayat_members` | Public | Admin | Admin | Admin | Mixed | Panchayat members |
| `post_likes` | Public | Auth | No | Owner | Mixed | Forum post likes |
| `posts` | Public | Auth | Owner/Admin | Owner/Admin | Mixed | Forum posts |
| `profiles` | Owner/Admin | System | Owner/Admin | Admin | Yes | User profiles |
| `push_subscriptions` | Admin/Owner | Public | Owner | Owner | Mixed | Push notification subscriptions |
| `quick_service_submissions` | Auth | Public | Admin | Admin | Mixed | Quick service applications |
| `schemes` | Public | Admin | Admin | Admin | Mixed | Government schemes |
| `service_categories` | Public (active) | Admin | Admin | Admin | Mixed | Service categories |
| `service_ratings` | Public | Public | Owner | No | Mixed | Service ratings |
| `tax_payments` | Public | Public | Admin | Admin | Mixed | Tax payment records |
| `user_push_tokens` | Owner | Owner | Owner | No | Yes | User push tokens |
| `user_roles` | Owner/Admin | Admin | Admin | Admin | Yes | User roles |
| `village_config` | Public | Admin | Admin | Admin | Mixed | Village JSON configuration |
| `village_gallery` | Public | Admin | Admin | Admin | Mixed | Gallery images |
| `village_population` | Public | Admin | Admin | Admin | Mixed | Population stats |
| `village_services` | Public | Admin | Admin | Admin | Mixed | Local services |
| `villages` | Public | Admin | Admin | Admin | Mixed | Village master data |

---

## 1.4 Supabase Storage API

**Bucket:** `items` (Public)

| Operation | Method | Endpoint | Auth Required | Description |
|-----------|--------|----------|---------------|-------------|
| Upload File | POST | `/storage/v1/object/items/{path}` | Yes | Upload image to items bucket |
| Get Public URL | GET | `/storage/v1/object/public/items/{path}` | No | Get public URL for file |
| Delete File | DELETE | `/storage/v1/object/items/{path}` | Yes | Delete file from bucket |

### Upload Patterns Used:

1. **Marketplace Items:** `items/{uuid}_{filename}`
2. **Service Images:** `services/{uuid}_{filename}`

---

# PART 2 — DATABASE SCHEMA EXPORT

## 2.1 Complete Table Schema

### Table: `profiles`
**Purpose:** User profile information linked to Supabase Auth

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | - | Primary Key, References auth.users |
| email | text | Yes | null | User email |
| full_name | text | Yes | null | Full name |
| mobile | text | Yes | null | Mobile number |
| aadhar_number | text | Yes | null | 12-digit Aadhar |
| approval_status | approval_status | Yes | 'pending' | pending/approved/rejected |
| approved_by | uuid | Yes | null | Admin who approved |
| approved_at | timestamptz | Yes | null | Approval timestamp |
| rejection_reason | text | Yes | null | Rejection reason |
| created_at | timestamptz | Yes | now() | Created timestamp |
| updated_at | timestamptz | Yes | now() | Updated timestamp |

**Primary Key:** `id`  
**RLS Policies:** Approved users view/update own, Admin/Gramsevak view/update all

---

### Table: `user_roles`
**Purpose:** Role assignments for RBAC

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| user_id | uuid | No | - | References auth.users (cascade delete) |
| role | app_role | No | - | admin/user/gramsevak/sub_admin |
| created_at | timestamptz | Yes | now() | Created timestamp |

**Primary Key:** `id`  
**Unique Constraint:** (user_id, role)  
**RLS Policies:** Users view own, Admins manage all

---

### Table: `villages`
**Purpose:** Master village data

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| name | text | No | - | Village name |
| state | text | No | - | State name |
| district | text | No | - | District name |
| pincode | text | No | - | PIN code |
| established | text | Yes | null | Establishment year |
| area | text | Yes | null | Area in sq km |
| latitude | text | Yes | null | GPS latitude |
| longitude | text | Yes | null | GPS longitude |
| altitude | text | Yes | null | Altitude |
| description | text | Yes | null | Description |
| vision | text | Yes | null | Village vision |
| is_active | boolean | Yes | true | Active status |
| created_at | timestamptz | Yes | now() | Created timestamp |
| updated_at | timestamptz | Yes | now() | Updated timestamp |

**Primary Key:** `id`

---

### Table: `items` (Marketplace)
**Purpose:** Buy/Sell marketplace listings

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| user_id | uuid | Yes | null | Seller user ID |
| seller_name | text | Yes | null | Seller name |
| item_name | text | No | - | Item name |
| category | text | No | - | Category |
| description | text | Yes | null | Description |
| price | numeric | No | - | Price in INR |
| village | text | No | 'Shivankhed Khurd' | Village name |
| contact | text | No | - | Contact number |
| image_urls | text[] | Yes | ARRAY[]::text[] | Image URLs |
| status | text | No | 'pending' | pending/approved/rejected |
| rejection_reason | text | Yes | null | Rejection reason |
| reviewed_by | uuid | Yes | null | Reviewer ID |
| reviewed_at | timestamptz | Yes | null | Review timestamp |
| sold | boolean | Yes | false | Sold status |
| is_available | boolean | No | true | Availability |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`

---

### Table: `exams`
**Purpose:** Examination definitions

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| village_id | uuid | Yes | null | Village FK |
| title | text | No | - | Exam title |
| description | text | Yes | null | Description |
| subject | exam_subject | No | - | GK/Science/Math/English |
| total_questions | integer | No | 100 | Question count |
| total_marks | integer | Yes | 100 | Total marks |
| pass_marks | integer | Yes | 40 | Pass marks |
| duration_minutes | integer | No | 60 | Duration |
| scheduled_at | timestamptz | No | - | Start time |
| ends_at | timestamptz | No | - | End time |
| status | exam_status | No | 'draft' | draft/scheduled/active/completed/cancelled |
| is_active | boolean | Yes | true | Active flag |
| created_by | uuid | Yes | null | Creator ID |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`

---

### Table: `exam_questions`
**Purpose:** Questions for exams

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| exam_id | uuid | No | - | Exam FK |
| question | text | No | - | Question text |
| option_a | text | No | - | Option A |
| option_b | text | No | - | Option B |
| option_c | text | No | - | Option C |
| option_d | text | No | - | Option D |
| correct_option | text | No | - | Correct answer (A/B/C/D) |
| subject | exam_subject | No | - | Subject |
| explanation | text | Yes | null | Answer explanation |
| difficulty | text | Yes | null | easy/medium/hard |
| class | text | Yes | '7th Standard' | Class level |
| topic | text | Yes | null | Topic |
| marks_per_question | integer | Yes | 1 | Marks |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`  
**Foreign Key:** exam_id → exams(id)

---

### Table: `exam_attempts`
**Purpose:** Student exam attempts

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| exam_id | uuid | No | - | Exam FK |
| user_id | uuid | No | - | User FK |
| student_name | text | No | - | Student name |
| start_time | timestamptz | No | now() | Start time |
| end_time | timestamptz | Yes | null | End time |
| score | integer | Yes | null | Score |
| total_questions | integer | No | - | Total questions |
| correct_answers | integer | Yes | 0 | Correct count |
| wrong_answers | integer | Yes | 0 | Wrong count |
| unanswered | integer | Yes | 0 | Unanswered count |
| integrity_pledge_accepted | boolean | No | false | Pledge accepted |
| start_snapshot_url | text | Yes | null | Start photo URL |
| end_snapshot_url | text | Yes | null | End photo URL |
| created_at | timestamptz | No | now() | Created timestamp |

**Primary Key:** `id`  
**Foreign Key:** exam_id → exams(id)

---

### Table: `exam_answers`
**Purpose:** Individual question answers

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| attempt_id | uuid | No | - | Attempt FK |
| question_id | uuid | No | - | Question FK |
| selected_option | text | Yes | null | Selected answer |
| is_correct | boolean | Yes | null | Correctness |
| answered_at | timestamptz | Yes | now() | Answer timestamp |

**Primary Key:** `id`  
**Foreign Keys:** attempt_id → exam_attempts(id), question_id → exam_questions(id)

---

### Table: `tax_payments`
**Purpose:** Tax payment transactions

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| order_id | text | No | - | Cashfree order ID |
| payment_id | text | Yes | null | Cashfree payment ID |
| tax_type | text | No | - | Tax type |
| amount | numeric | No | - | Amount |
| payer_name | text | No | - | Payer name |
| payer_mobile | text | No | - | Payer mobile |
| payer_email | text | Yes | null | Payer email |
| payment_status | text | No | 'pending' | pending/success/failed |
| payment_date | timestamptz | Yes | null | Payment date |
| village_account | text | Yes | null | Village account |
| village_id | uuid | Yes | null | Village FK |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`  
**Foreign Key:** village_id → villages(id)

---

### Table: `posts` (Forum)
**Purpose:** Community forum posts

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| village_id | uuid | Yes | null | Village FK |
| user_id | uuid | No | - | Author ID |
| title | text | No | - | Post title |
| content | text | No | - | Post content |
| image_url | text | Yes | null | Image URL |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`  
**Foreign Key:** village_id → villages(id)

---

### Table: `comments`
**Purpose:** Comments on forum posts

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| post_id | uuid | No | - | Post FK |
| user_id | uuid | No | - | Author ID |
| content | text | No | - | Comment content |
| created_at | timestamptz | No | now() | Created timestamp |
| updated_at | timestamptz | No | now() | Updated timestamp |

**Primary Key:** `id`  
**Foreign Key:** post_id → posts(id)

---

### Table: `post_likes`
**Purpose:** Post like tracking

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary Key |
| post_id | uuid | No | - | Post FK |
| user_id | uuid | No | - | User ID |
| created_at | timestamptz | No | now() | Created timestamp |

**Primary Key:** `id`  
**Foreign Key:** post_id → posts(id)

---

## 2.2 Enums

```sql
-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'gramsevak', 'sub_admin');

-- Approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Exam status
CREATE TYPE public.exam_status AS ENUM ('draft', 'scheduled', 'active', 'completed', 'cancelled');

-- Exam subjects
CREATE TYPE public.exam_subject AS ENUM ('GK', 'Science', 'Math', 'English');
```

---

## 2.3 Database Functions

### `has_role(_user_id uuid, _role app_role)`
**Returns:** boolean  
**Purpose:** Check if user has specific role (used in RLS policies)

### `is_user_approved(user_id uuid)`
**Returns:** boolean  
**Purpose:** Check if user is approved

### `handle_new_user()`
**Returns:** trigger  
**Purpose:** Auto-create profile and assign 'user' role on signup

### `update_updated_at_column()`
**Returns:** trigger  
**Purpose:** Auto-update `updated_at` timestamp

### `assign_role_by_email(user_email text, user_role app_role)`
**Returns:** void  
**Purpose:** Assign role to user by email

---

# PART 3 — AUTHENTICATION & AUTHORIZATION

## 3.1 Authentication Flow

### Sign Up Flow
1. User submits: email, password, full_name, mobile, aadhar_number
2. Supabase Auth creates user in `auth.users`
3. Trigger `handle_new_user()` fires:
   - Creates profile in `profiles` with `approval_status = 'pending'`
   - Assigns 'user' role in `user_roles`
4. User sees "Registration Submitted" message
5. Admin reviews and approves/rejects via dashboard
6. Edge function `send-user-status-email` sends notification

### Login Flow
1. User submits email + password
2. Supabase Auth validates credentials
3. Returns JWT access token + refresh token
4. Frontend checks:
   - User roles (admin/sub_admin → /admin/dashboard)
   - Approval status (approved → /my-dashboard)
   - Otherwise → / (homepage)

### Logout Flow
1. Call `supabase.auth.signOut()`
2. Clears local session
3. Redirect to homepage

## 3.2 Token Configuration

| Property | Value |
|----------|-------|
| Token Type | JWT |
| Access Token Lifetime | 3600 seconds (1 hour) |
| Refresh Token Lifetime | 604800 seconds (7 days) |
| Auto Refresh | Enabled |
| Persist Session | LocalStorage |

## 3.3 Role-Based Access Control

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | Full administrator | All tables, all operations |
| `sub_admin` | Sub administrator | Same as admin |
| `gramsevak` | Village officer | View/manage profiles, limited admin |
| `user` | Regular user | Own data only (after approval) |

## 3.4 Authorization Patterns

### RLS Function: `has_role()`
Used in most RLS policies to check admin/gramsevak access:
```sql
has_role(auth.uid(), 'admin'::app_role)
```

### Approval Gating
Non-approved users have limited access:
```sql
(auth.uid() = id) AND (approval_status = 'approved'::approval_status)
```

---

# PART 4 — STORAGE

## 4.1 Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `items` | Yes | Marketplace item images, service images |

## 4.2 File Upload Patterns

### Marketplace Items
```typescript
const filePath = `${uuid}_${filename}`;
await supabase.storage.from('items').upload(filePath, file);
const { data: { publicUrl } } = supabase.storage.from('items').getPublicUrl(filePath);
```

### Service Images
```typescript
const filePath = `services/${uuid}_${filename}`;
await supabase.storage.from('items').upload(filePath, file);
```

## 4.3 File Types Allowed

- Images: JPEG, PNG, WebP, GIF
- Max size determined by Supabase plan limits

## 4.4 Access Rules

- **Public bucket:** All files publicly accessible via URL
- **Upload:** Authenticated users only (implied by frontend logic)
- **Delete:** Owner or admin (managed in frontend)

---

# PART 5 — OUTPUT FORMATS

## 5.1 Entity Relationship Diagram (Text)

```
auth.users (Supabase managed)
    │
    ├──1:1──► profiles
    │           │
    │           └──1:N──► approved_by (self-reference)
    │
    ├──1:N──► user_roles
    │
    ├──1:N──► posts
    │           │
    │           ├──1:N──► comments
    │           │
    │           └──1:N──► post_likes
    │
    ├──1:N──► exam_attempts
    │           │
    │           └──1:N──► exam_answers
    │
    └──1:N──► items

villages
    │
    ├──1:N──► announcements
    ├──1:N──► contact_form_submissions
    ├──1:N──► development_works
    ├──1:N──► emergency_contacts
    ├──1:N──► panchayat_members
    ├──1:N──► notable_contributors
    ├──1:N──► schemes
    ├──1:N──► village_config
    ├──1:N──► village_gallery
    ├──1:1──► village_population
    ├──1:N──► village_services
    ├──1:N──► tax_payments
    ├──1:N──► quick_service_submissions
    └──1:N──► posts

exams
    │
    ├──1:N──► exam_questions
    │
    └──1:N──► exam_attempts
                │
                └──1:N──► exam_answers ◄──N:1── exam_questions

service_categories (standalone)
market_prices (optional village_id)
notices (optional village_id)
feedback_submissions (optional village_id)
notification_logs (standalone)
push_subscriptions (optional user_id)
service_ratings (standalone)
page_visibility (standalone)
```

---

## 5.2 Secrets/Environment Variables

| Secret Name | Purpose | Used In |
|-------------|---------|---------|
| SUPABASE_URL | Supabase project URL | Edge functions, Client |
| SUPABASE_ANON_KEY | Anonymous API key | Client |
| SUPABASE_SERVICE_ROLE_KEY | Admin API key | Edge functions |
| RESEND_API_KEY | Email service | send-user-status-email |
| CASHFREE_APP_ID | Payment gateway | create/verify-tax-payment |
| CASHFREE_SECRET_KEY | Payment gateway | create/verify-tax-payment |
| LOVABLE_API_KEY | AI chatbot | village-chatbot |
| VAPID_PUBLIC_KEY | Push notifications | Frontend |
| VAPID_PRIVATE_KEY | Push notifications | Push service |

---

## 5.3 External API Integrations

| Service | Purpose | Endpoint |
|---------|---------|----------|
| Cashfree | Tax payments | `https://sandbox.cashfree.com/pg/` |
| Resend | Email notifications | `https://api.resend.com/emails` |
| Lovable AI Gateway | Chatbot | `https://ai.gateway.lovable.dev/v1/chat/completions` |

---

**END OF DOCUMENTATION**
