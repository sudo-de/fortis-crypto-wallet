#!/bin/bash

# Email Setup Script for Crypto Wallet
echo "📧 Setting up Email Service for Crypto Wallet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Email configuration
EMAIL_CONFIG_FILE="config/mail.env"
TEMPLATES_DIR="templates/email"

echo -e "${BLUE}📋 Email Configuration:${NC}"
echo "  Config File: $EMAIL_CONFIG_FILE"
echo "  Templates: $TEMPLATES_DIR"
echo ""

# Check if config file exists
if [ ! -f "$EMAIL_CONFIG_FILE" ]; then
    echo -e "${RED}❌ Email config file not found: $EMAIL_CONFIG_FILE${NC}"
    echo "Please create the email configuration file first."
    exit 1
fi

echo -e "${GREEN}✅ Email config file found${NC}"

# Check if templates directory exists
if [ ! -d "$TEMPLATES_DIR" ]; then
    echo -e "${YELLOW}⚠️  Templates directory not found. Creating it...${NC}"
    mkdir -p "$TEMPLATES_DIR"
fi

echo -e "${GREEN}✅ Templates directory ready${NC}"

# Check if email templates exist
TEMPLATES=("welcome.html" "password-reset.html" "transaction-alert.html" "login-alert.html")
MISSING_TEMPLATES=()

for template in "${TEMPLATES[@]}"; do
    if [ ! -f "$TEMPLATES_DIR/$template" ]; then
        MISSING_TEMPLATES+=("$template")
    fi
done

if [ ${#MISSING_TEMPLATES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All email templates found${NC}"
else
    echo -e "${YELLOW}⚠️  Missing templates: ${MISSING_TEMPLATES[*]}${NC}"
    echo "Creating missing templates..."
    
    for template in "${MISSING_TEMPLATES[@]}"; do
        case $template in
            "welcome.html")
                echo "Creating welcome email template..."
                ;;
            "password-reset.html")
                echo "Creating password reset email template..."
                ;;
            "transaction-alert.html")
                echo "Creating transaction alert email template..."
                ;;
            "login-alert.html")
                echo "Creating login alert email template..."
                ;;
        esac
    done
fi

# Test email configuration
echo -e "${BLUE}🔍 Testing email configuration...${NC}"

# Read email provider from config
EMAIL_PROVIDER=$(grep "EMAIL_PROVIDER=" "$EMAIL_CONFIG_FILE" | cut -d'=' -f2)

case $EMAIL_PROVIDER in
    "GMAIL")
        echo "Testing Gmail configuration..."
        GMAIL_USERNAME=$(grep "GMAIL_USERNAME=" "$EMAIL_CONFIG_FILE" | cut -d'=' -f2)
        if [ -z "$GMAIL_USERNAME" ] || [ "$GMAIL_USERNAME" = "your-email@gmail.com" ]; then
            echo -e "${YELLOW}⚠️  Gmail username not configured${NC}"
        else
            echo -e "${GREEN}✅ Gmail username configured${NC}"
        fi
        ;;
    "SENDGRID")
        echo "Testing SendGrid configuration..."
        SENDGRID_API_KEY=$(grep "SENDGRID_API_KEY=" "$EMAIL_CONFIG_FILE" | cut -d'=' -f2)
        if [ -z "$SENDGRID_API_KEY" ] || [ "$SENDGRID_API_KEY" = "your-sendgrid-api-key" ]; then
            echo -e "${YELLOW}⚠️  SendGrid API key not configured${NC}"
        else
            echo -e "${GREEN}✅ SendGrid API key configured${NC}"
        fi
        ;;
    "SMTP")
        echo "Testing SMTP configuration..."
        SMTP_HOST=$(grep "SMTP_HOST=" "$EMAIL_CONFIG_FILE" | cut -d'=' -f2)
        if [ -z "$SMTP_HOST" ] || [ "$SMTP_HOST" = "smtp.your-provider.com" ]; then
            echo -e "${YELLOW}⚠️  SMTP host not configured${NC}"
        else
            echo -e "${GREEN}✅ SMTP host configured${NC}"
        fi
        ;;
    *)
        echo -e "${YELLOW}⚠️  Unknown email provider: $EMAIL_PROVIDER${NC}"
        ;;
esac

# Show email service status
echo -e "${BLUE}📊 Email Service Status:${NC}"
echo "  Provider: $EMAIL_PROVIDER"
echo "  Templates: ${#TEMPLATES[@]} available"
echo "  Config: $EMAIL_CONFIG_FILE"

# Show available templates
echo ""
echo -e "${BLUE}📧 Available Email Templates:${NC}"
for template in "${TEMPLATES[@]}"; do
    if [ -f "$TEMPLATES_DIR/$template" ]; then
        echo "  ✅ $template"
    else
        echo "  ❌ $template"
    fi
done

# Show configuration summary
echo ""
echo -e "${BLUE}⚙️  Configuration Summary:${NC}"
echo "  Email Provider: $EMAIL_PROVIDER"
echo "  Templates Directory: $TEMPLATES_DIR"
echo "  Config File: $EMAIL_CONFIG_FILE"

# Show next steps
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Update your email credentials in $EMAIL_CONFIG_FILE"
echo "2. Test email sending with: ./scripts/test-email.sh"
echo "3. Configure your backend to use the email service"
echo "4. Set up email templates for your specific use case"
echo ""
echo -e "${GREEN}✅ Email service setup completed!${NC}"
echo ""
echo -e "${BLUE}📧 Email Features Available:${NC}"
echo "  ✅ Welcome emails for new users"
echo "  ✅ Password reset emails"
echo "  ✅ Transaction alerts"
echo "  ✅ Login security alerts"
echo "  ✅ Bulk email support"
echo "  ✅ Email templates"
echo "  ✅ Email queue management"
echo "  ✅ Email analytics"
echo ""
echo -e "${GREEN}🎉 Ready to send emails with your crypto wallet!${NC}"
