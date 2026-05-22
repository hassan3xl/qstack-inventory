# Email Sending Utility Documentation

## Overview

This is a robust, reusable email sending system using Resend that supports multiple email types without exhausting API tokens.

## Features

- ✅ Multiple email templates (password reset, verification, account creation, etc.)
- ✅ Easy-to-use API with sensible defaults
- ✅ Support for single and bulk email sending
- ✅ Email tagging for analytics
- ✅ Customizable HTML templates with styling
- ✅ Professional, branded email layouts

## Installation

The `resend` package has been installed. Make sure your `RESEND_API_KEY` is set in your environment variables.

## Usage

### 1. Password Reset Email

```python
from utils.resend import EmailSender

EmailSender.send_password_reset(
    to="user@example.com",
    name="John Doe",
    reset_link="https://qstack.com/reset?token=abc123",
    expiry_hours=24
)
```

### 2. Email Verification

```python
EmailSender.send_email_verification(
    to="user@example.com",
    name="John Doe",
    verification_link="https://qstack.com/verify?token=verify123"
)
```

### 3. Account Created Confirmation

```python
EmailSender.send_account_created(
    to="user@example.com",
    name="John Doe",
    email="user@example.com",
    login_link="https://qstack.com/login"
)
```

### 4. Password Changed Confirmation

```python
EmailSender.send_password_changed(
    to="user@example.com",
    name="John Doe"
)
```

### 5. Welcome Email

```python
EmailSender.send_welcome(
    to="user@example.com",
    name="John Doe"
)
```

### 6. Custom Notification

```python
EmailSender.send_notification(
    to="user@example.com",
    name="John Doe",
    title="Low Stock Alert",
    message="You have low stock for product 'Widget A'. Current stock: 5 units.",
    cta_text="View Inventory",  # Optional
    cta_link="https://qstack.com/inventory"  # Optional
)
```

### 7. Custom Email (Advanced)

```python
from utils.resend import EmailSender, EmailType

EmailSender.send(
    to="user@example.com",  # or ["user1@example.com", "user2@example.com"]
    subject="Custom Subject",
    html="<p>Custom HTML content</p>",
    email_type=EmailType.CUSTOM,
    tags=[{"name": "category", "value": "custom"}]  # Optional
)
```

## Integration with Django Views

### Example: Password Reset View

```python
from django.views import View
from utils.resend import EmailSender

class PasswordResetView(View):
    def post(self, request):
        email = request.POST.get('email')
        user = User.objects.get(email=email)

        # Generate reset token
        reset_token = generate_reset_token(user)
        reset_link = f"https://qstack.com/reset?token={reset_token}"

        # Send email
        EmailSender.send_password_reset(
            to=user.email,
            name=user.first_name or user.email,
            reset_link=reset_link,
            expiry_hours=24
        )

        return JsonResponse({"status": "Email sent"})
```

### Example: User Registration View

```python
class RegisterView(View):
    def post(self, request):
        email = request.POST.get('email')
        name = request.POST.get('name')

        # Create user
        user = User.objects.create_user(email=email, ...)

        # Send account created email
        EmailSender.send_account_created(
            to=user.email,
            name=name,
            email=user.email,
            login_link="https://qstack.com/login"
        )

        # Send verification email
        verification_link = f"https://qstack.com/verify?token={generate_verification_token(user)}"
        EmailSender.send_email_verification(
            to=user.email,
            name=name,
            verification_link=verification_link
        )

        return JsonResponse({"status": "User created"})
```

## Email Types and Use Cases

| Email Type         | Use Case                    | Rate Limiting             |
| ------------------ | --------------------------- | ------------------------- |
| PASSWORD_RESET     | User forgot password        | ✅ Limit to 1 per 30 mins |
| EMAIL_VERIFICATION | Verify new email address    | ✅ Sent once on signup    |
| ACCOUNT_CREATED    | Welcome new user            | ✅ Sent once on signup    |
| PASSWORD_CHANGED   | Confirm password update     | ✅ Sent on change         |
| WELCOME            | Onboarding email            | ✅ Sent once on signup    |
| NOTIFICATION       | Custom alerts/notifications | ✅ Can be sent frequently |
| CUSTOM             | Any custom email            | ⚠️ Unrestricted           |

## Testing

Run the test suite:

```bash
python test_emails.py
```

This will test all email templates with your configured email address.

## Advanced Features

### Bulk Email Sending

```python
EmailSender.send(
    to=["user1@example.com", "user2@example.com", "user3@example.com"],
    subject="Bulk Announcement",
    html="<p>Important announcement...</p>",
    email_type=EmailType.NOTIFICATION
)
```

### Adding Custom Tags

```python
EmailSender.send_notification(
    to="user@example.com",
    name="John",
    title="Alert",
    message="This is an alert",
    tags=[
        {"name": "priority", "value": "high"},
        {"name": "category", "value": "alert"}
    ]
)
```

## Email Template Customization

To customize email templates, edit the `EmailTemplate` class in `utils/resend.py`:

```python
@staticmethod
def password_reset(name: str, reset_link: str, expiry_hours: int = 24) -> Dict[str, str]:
    """Customize HTML and subject here"""
    return {
        "subject": "Custom Subject",
        "html": "<p>Custom HTML</p>"
    }
```

## Environment Variables

Ensure these are set in your `.env` file:

```
RESEND_API_KEY=your_resend_api_key_here
```

## Error Handling

The utility includes built-in error handling:

```python
try:
    EmailSender.send_password_reset(...)
except Exception as e:
    print(f"Email sending failed: {e}")
    # Handle error (log, notify admin, etc.)
```

## Rate Limiting Recommendations

To prevent API quota exhaustion:

1. **Password Reset**: Limit to 1 per user per 30 minutes
2. **Verification Emails**: Send only once per signup
3. **Account Created**: Send only once per signup
4. **Notifications**: Implement daily/hourly limits based on user preferences
5. **Bulk Emails**: Use Resend's batch API for large volumes

## Support

For issues with Resend, visit: https://resend.com/docs
For issues with this utility, check the test file: `test_emails.py`
