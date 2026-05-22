import resend
from src.config import RESEND_API_KEY
from typing import List, Dict, Optional
from enum import Enum

resend.api_key = RESEND_API_KEY

SENDER_EMAIL = "Qstack Inventory <noreply@mail.qstack.com.ng>"


class EmailType(Enum):
    """Email types for different use cases"""
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"
    ACCOUNT_CREATED = "account_created"
    PASSWORD_CHANGED = "password_changed"
    WELCOME = "welcome"
    NOTIFICATION = "notification"
    CUSTOM = "custom"


class EmailTemplate:
    """Email template builder with reusable structure"""
    
    @staticmethod
    def password_reset(name: str, reset_link: str, expiry_hours: int = 24) -> Dict[str, str]:
        """Template for password reset emails"""
        return {
            "subject": "Reset Your Password",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi {name},</p>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                <a href="{reset_link}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">This link will expire in {expiry_hours} hours.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }
    
    @staticmethod
    def email_verification(name: str, verification_link: str) -> Dict[str, str]:
        """Template for email verification"""
        return {
            "subject": "Verify Your Email Address",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify Your Email</h2>
                <p>Hi {name},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                <a href="{verification_link}" style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Verify Email
                </a>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
                <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }
    
    @staticmethod
    def account_created(name: str, email: str, login_link: str = None) -> Dict[str, str]:
        """Template for new account creation confirmation"""
        login_button = ""
        if login_link:
            login_button = f"""
            <a href="{login_link}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Go to Login
            </a>
            """
        
        return {
            "subject": "Welcome to Qstack Inventory!",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to Qstack Inventory!</h2>
                <p>Hi {name},</p>
                <p>Your account has been successfully created. Here are your details:</p>
                <ul style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; color: #333;">
                    <li><strong>Email:</strong> {email}</li>
                </ul>
                <p>You can now log in to your account and start managing your inventory.</p>
                {login_button}
                <p style="color: #666; font-size: 14px;">If you have any questions, feel free to contact our support team.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }
    
    @staticmethod
    def password_changed(name: str) -> Dict[str, str]:
        """Template for password change confirmation"""
        return {
            "subject": "Your Password Has Been Changed",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Changed</h2>
                <p>Hi {name},</p>
                <p>Your password has been successfully changed.</p>
                <p style="color: #666; font-size: 14px;">If you didn't make this change, please reset your password immediately.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }
    
    @staticmethod
    def welcome(name: str) -> Dict[str, str]:
        """Template for welcome email"""
        return {
            "subject": "Welcome to Qstack Inventory",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome, {name}!</h2>
                <p>We're excited to have you on board!</p>
                <p>Qstack Inventory helps you manage your business inventory efficiently. Here's what you can do:</p>
                <ul style="color: #333;">
                    <li>Track product inventory</li>
                    <li>Manage sales and orders</li>
                    <li>Monitor stock levels</li>
                    <li>Generate reports</li>
                </ul>
                <p>Happy managing!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }
    
    @staticmethod
    def notification(name: str, title: str, message: str, cta_text: str = None, cta_link: str = None) -> Dict[str, str]:
        """Template for generic notifications"""
        cta_button = ""
        if cta_text and cta_link:
            cta_button = f"""
            <a href="{cta_link}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                {cta_text}
            </a>
            """
        
        return {
            "subject": title,
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">{title}</h2>
                <p>Hi {name},</p>
                <p>{message}</p>
                {cta_button}
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">© 2026 Qstack Inventory. All rights reserved.</p>
            </div>
            """,
        }


class EmailSender:
    """Robust email sender utility"""
    
    @staticmethod
    def send(
        to: str | List[str],
        subject: str,
        html: str,
        email_type: EmailType = EmailType.CUSTOM,
        **kwargs
    ) -> Dict:
        """
        Send email using Resend
        
        Args:
            to: Single email or list of emails
            subject: Email subject
            html: HTML content of the email
            email_type: Type of email (for logging/tracking)
            **kwargs: Additional parameters (e.g., reply_to, tags)
        
        Returns:
            Response from Resend API
        """
        # Ensure to is a list
        if isinstance(to, str):
            to = [to]
        
        params = {
            "from": SENDER_EMAIL,
            "to": to,
            "subject": subject,
            "html": html,
        }
        
        # Add optional parameters
        if "reply_to" in kwargs:
            params["reply_to"] = kwargs["reply_to"]
        
        if "tags" in kwargs:
            params["tags"] = kwargs["tags"]
        
        try:
            response = resend.Emails.send(params)
            print(f"✓ Email sent ({email_type.value}): {response}")
            return response
        except Exception as e:
            print(f"✗ Error sending email ({email_type.value}): {str(e)}")
            raise
    
    @staticmethod
    def send_password_reset(
        to: str,
        name: str,
        reset_link: str,
        expiry_hours: int = 24,
        **kwargs
    ) -> Dict:
        """Send password reset email"""
        template = EmailTemplate.password_reset(name, reset_link, expiry_hours)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "password_reset"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.PASSWORD_RESET,
            **kwargs
        )
    
    @staticmethod
    def send_email_verification(
        to: str,
        name: str,
        verification_link: str,
        **kwargs
    ) -> Dict:
        """Send email verification link"""
        template = EmailTemplate.email_verification(name, verification_link)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "email_verification"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.EMAIL_VERIFICATION,
            **kwargs
        )
    
    @staticmethod
    def send_account_created(
        to: str,
        name: str,
        email: str,
        login_link: str = None,
        **kwargs
    ) -> Dict:
        """Send account created confirmation"""
        template = EmailTemplate.account_created(name, email, login_link)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "account_created"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.ACCOUNT_CREATED,
            **kwargs
        )
    
    @staticmethod
    def send_password_changed(
        to: str,
        name: str,
        **kwargs
    ) -> Dict:
        """Send password change confirmation"""
        template = EmailTemplate.password_changed(name)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "password_changed"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.PASSWORD_CHANGED,
            **kwargs
        )
    
    @staticmethod
    def send_welcome(
        to: str,
        name: str,
        **kwargs
    ) -> Dict:
        """Send welcome email"""
        template = EmailTemplate.welcome(name)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "welcome"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.WELCOME,
            **kwargs
        )
    
    @staticmethod
    def send_notification(
        to: str,
        name: str,
        title: str,
        message: str,
        cta_text: str = None,
        cta_link: str = None,
        **kwargs
    ) -> Dict:
        """Send custom notification email"""
        template = EmailTemplate.notification(name, title, message, cta_text, cta_link)
        kwargs["tags"] = kwargs.get("tags", [])
        kwargs["tags"].append({"name": "type", "value": "notification"})
        
        return EmailSender.send(
            to=to,
            subject=template["subject"],
            html=template["html"],
            email_type=EmailType.NOTIFICATION,
            **kwargs
        )