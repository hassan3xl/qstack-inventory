# 🚀 Quick Reference - Email Integration

## Before Going Live ⚠️

Update these 3 URLs in your code:

```bash
# 1. Tenant Registration API
api/controllers/tenants/views.py - Line ~64
cta_link="https://YOUR_FRONTEND_URL/login"

# 2. Staff Creation API
api/controllers/dashboard/views.py - Line ~162
cta_link="https://YOUR_FRONTEND_URL/login"

# 3. Admin Panel
admin_panel/views/tenants.py - Line ~42
cta_link="https://YOUR_FRONTEND_URL/admin/login"
```

---

## How It Works

### When Admin Creates Tenant:

```json
POST /api/tenants/register/
{
  "business_name": "My Store",
  "business_type": "grocery",
  "admin_email": "owner@example.com"
}
```

→ **Sends 2 emails**: Welcome + Login Credentials

### When Admin Adds Staff:

```json
POST /api/tenants/staff/
{
  "email": "staff@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "store_role": "manager"
}
```

→ **Sends 1 email**: Welcome with Login Credentials (if new user)

### When Admin Creates Tenant (Web Panel):

Admin Panel → Create Tenant Form
→ **Sends 2 emails**: Welcome + Admin Account Credentials

---

## Email Content Examples

### Welcome Email

- Professional greeting
- Overview of Qstack Inventory features
- Call-to-action button

### Login Credentials Email

- Personalized greeting
- Email address
- **Temporary password** (in code block)
- Login button
- Security reminder to change password

---

## Testing

```bash
# Test all email workflows
python test_integration_emails.py

# Test individual email templates
python test_emails.py
```

All tests should show: **✅ PASSED**

---

## Resend API Status

- ✅ API Key configured
- ✅ Emails sending successfully
- ⚠️ Check quota at: https://resend.com/dashboard

---

## Troubleshooting

| Issue                 | Solution                                   |
| --------------------- | ------------------------------------------ |
| Emails not received   | Check spam folder, verify email in request |
| Resend API errors     | Verify RESEND_API_KEY in .env              |
| URLs in emails wrong  | Update the 3 cta_link URLs above           |
| Password not included | Check user creation succeeded              |

---

## Code Locations

| Workflow    | File                                 | Lines   |
| ----------- | ------------------------------------ | ------- |
| Tenant API  | `api/controllers/tenants/views.py`   | 43-80   |
| Staff API   | `api/controllers/dashboard/views.py` | 120-175 |
| Admin Panel | `admin_panel/views/tenants.py`       | 15-52   |

---

## Features at a Glance

✅ Automatic email on user creation
✅ Temporary password generation
✅ Professional HTML templates
✅ Error handling (won't block operations)
✅ Personalized greetings
✅ CTA buttons with login links
✅ Mobile-friendly emails

---

## Environment Variables

```bash
# .env file
RESEND_API_KEY=your_api_key_here
```

---

## Support Links

- 📧 Resend Docs: https://resend.com/docs
- 📚 Email Guide: See `EMAIL_GUIDE.md`
- 🔗 Integration Details: See `EMAIL_INTEGRATION.md`
- 🧪 Test Suite: Run `test_integration_emails.py`
