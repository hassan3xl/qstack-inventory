# Email Integration Documentation

## Overview

Email integration has been successfully integrated into three key workflows:

1. **Tenant Registration** (API) - When admin creates a tenant via API
2. **Staff Creation** (Dashboard API) - When tenant admin adds new staff
3. **Admin Panel** (Web Views) - When platform admin creates tenant via admin panel

## Integrated Workflows

### 1. Tenant Registration (API)

**Location**: `/api/controllers/tenants/views.py` - `TenantRegisterAPIView`

**Trigger**: POST `/api/tenants/register/`

**Emails Sent**:

- ✅ Welcome Email
- ✅ Login Credentials Email (with temporary password)

**Example Request**:

```json
{
  "business_name": "My Store",
  "business_type": "grocery",
  "admin_email": "owner@example.com"
}
```

**What Happens**:

1. User account created with temporary password
2. Tenant created and linked to user
3. Welcome email sent to the user
4. Login credentials email sent (includes temporary password)

---

### 2. Staff Creation (Dashboard API)

**Location**: `/api/controllers/dashboard/views.py` - `StaffCreateAPIView`

**Trigger**: POST `/api/tenants/staff/`

**Emails Sent**:

- ✅ Staff Welcome Email (with temporary password if new user)

**Example Request**:

```json
{
  "email": "staff@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "store_role": "manager"
}
```

**What Happens**:

1. User account created (if doesn't exist) with temporary password
2. User linked to tenant with specified role
3. Staff welcome email sent (includes temporary password and login instructions)
4. If user already exists, no email is sent (only linked to tenant)

---

### 3. Admin Panel Tenant Creation (Web Views)

**Location**: `/admin_panel/views/tenants.py` - `tenant_list_view`

**Trigger**: POST form submission on admin panel

**Emails Sent**:

- ✅ Welcome Email
- ✅ Admin Account Email (with temporary password)

**What Happens**:

1. User account created with temporary password
2. Tenant created and linked to user as ADMIN
3. Welcome email sent to the user
4. Admin account email sent (includes temporary password)

---

## Email Templates Used

### Welcome Email Template

- Used in: Tenant registration, admin panel
- Content: Generic welcome message about Qstack Inventory
- CTA: Optional login button

### Notification Email Template

- Used in: Staff creation, admin account creation
- Content: Customizable title and message
- Includes: Email, temporary password, login button
- CTA: Login link

---

## Features

### Error Handling

- All email sending is wrapped in try-except blocks
- If email fails, the process continues (graceful degradation)
- Warning messages logged to console

### Password Generation

- Generates random 10-12 character passwords
- Mix of letters and numbers
- Stored hashed in database

### User Recognition

- Uses first_name from profile if available
- Falls back to email prefix if name not available
- Personalizes email greetings

---

## Testing

### Run Integration Tests

```bash
python test_integration_emails.py
```

This tests all three email workflows.

### Test with Your Email

Edit `test_integration_emails.py` and change:

```python
TEST_EMAIL = "your-email@example.com"
```

---

## Environment Setup

Ensure these are configured:

1. `RESEND_API_KEY` - Your Resend API key in `.env`
2. Frontend URLs - Update these in the code:
   - `https://qstack-inventory.com/login` - User login
   - `https://qstack-inventory.com/admin/login` - Admin login

---

## Frontend URLs to Update

Find and update these URLs in the code with your actual frontend URLs:

### In `/api/controllers/tenants/views.py`:

```python
cta_link="https://qstack-inventory.com/login"  # ← Update this
```

### In `/api/controllers/dashboard/views.py`:

```python
cta_link="https://qstack-inventory.com/login"  # ← Update this
```

### In `/admin_panel/views/tenants.py`:

```python
cta_link="https://qstack-inventory.com/admin/login"  # ← Update this
```

---

## Resend API Usage

**Quota After Testing**: 18 emails sent (from test suite)
**Rate Limit**: 5 emails per second (as per Resend default)

### Monitor Usage

- Check Resend dashboard for daily/monthly quota
- All emails are tagged with `type` for analytics
- Response includes quota information

---

## Troubleshooting

### Email Not Received

1. Check spam folder
2. Verify RESEND_API_KEY is correct
3. Check console for error messages
4. Verify recipient email is correct

### Password Not Generated

- Check if user creation succeeded
- Verify database transaction completed
- Check error logs

### Email Sending Fails

- System continues without email (graceful error)
- Check Resend API status
- Verify API key has sufficient quota

---

## Future Improvements

Potential enhancements:

1. **Email Templates in Database** - Allow customizing email content
2. **Async Sending** - Use Celery for background email sending
3. **Email Logs** - Store sent emails in database for tracking
4. **Resend Templates** - Use Resend's template feature for dynamic content
5. **Password Reset Flow** - Integrate email sending in password reset
6. **Email Verification** - Send verification email for new accounts

---

## Code References

### Email Sender Utility

Location: `utils/resend.py`

Key Methods:

- `EmailSender.send_welcome()` - Welcome email
- `EmailSender.send_notification()` - Custom notification
- `EmailSender.send()` - Raw email sending

### Integration Points

1. `api/controllers/tenants/views.py` - Line 35-80
2. `api/controllers/dashboard/views.py` - Line 150-175
3. `admin_panel/views/tenants.py` - Line 25-52

---

## Testing Checklist

- [x] Email sends on tenant registration
- [x] Email sends on staff creation
- [x] Email sends on admin panel tenant creation
- [x] Temporary password generated and included
- [x] Error handling doesn't block user creation
- [x] Email templates are properly styled
- [x] CTA links are clickable
- [x] Multiple emails can be sent in sequence
