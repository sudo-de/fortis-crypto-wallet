#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>

namespace crypto_wallet {

// Email Provider Types
enum class EmailProvider {
    GMAIL,
    OUTLOOK,
    SENDGRID,
    MAILGUN,
    SMTP
};

// Email Priority Levels
enum class EmailPriority {
    LOW,
    NORMAL,
    HIGH,
    URGENT
};

// Email Status
enum class EmailStatus {
    PENDING,
    SENT,
    FAILED,
    BOUNCED,
    DELIVERED,
    OPENED,
    CLICKED
};

// Email Template Data
struct EmailTemplateData {
    std::map<std::string, std::string> variables;
    std::string user_name;
    std::string user_email;
    std::string timestamp;
    std::string base_url;
    
    EmailTemplateData() = default;
    EmailTemplateData(const std::string& name, const std::string& email) 
        : user_name(name), user_email(email) {}
};

// Email Message Structure
struct EmailMessage {
    std::string to;
    std::string from;
    std::string subject;
    std::string html_content;
    std::string text_content;
    std::vector<std::string> cc;
    std::vector<std::string> bcc;
    std::vector<std::string> attachments;
    EmailPriority priority;
    std::string template_name;
    EmailTemplateData template_data;
    
    EmailMessage() : priority(EmailPriority::NORMAL) {}
};

// Email Queue Item
struct EmailQueueItem {
    std::string id;
    EmailMessage message;
    int retry_count;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point scheduled_at;
    std::chrono::system_clock::time_point last_attempt;
    
    EmailQueueItem() : retry_count(0) {}
};

// Email Service Interface
class EmailService {
public:
    virtual ~EmailService() = default;
    
    // Core email functionality
    virtual bool send_email(const EmailMessage& message) = 0;
    virtual bool send_template_email(const std::string& template_name, 
                                   const std::string& to,
                                   const EmailTemplateData& data) = 0;
    
    // Bulk operations
    virtual bool send_bulk_email(const std::vector<EmailMessage>& messages) = 0;
    virtual bool send_bulk_template_email(const std::string& template_name,
                                        const std::vector<std::string>& recipients,
                                        const EmailTemplateData& data) = 0;
    
    // Queue management
    virtual bool queue_email(const EmailMessage& message) = 0;
    virtual bool queue_template_email(const std::string& template_name,
                                    const std::string& to,
                                    const EmailTemplateData& data) = 0;
    virtual bool process_queue() = 0;
    virtual std::vector<EmailQueueItem> get_queue_status() = 0;
    
    // Template management
    virtual bool load_template(const std::string& template_name, 
                             const std::string& template_path) = 0;
    virtual std::string render_template(const std::string& template_name,
                                      const EmailTemplateData& data) = 0;
    
    // Email validation
    virtual bool validate_email(const std::string& email) = 0;
    virtual bool is_deliverable(const std::string& email) = 0;
    
    // Statistics and monitoring
    virtual std::map<EmailStatus, int> get_email_stats() = 0;
    virtual std::vector<EmailMessage> get_recent_emails(int limit = 100) = 0;
    
    // Configuration
    virtual bool configure(const std::string& config_file) = 0;
    virtual bool test_connection() = 0;
};

// Email Service Factory
class EmailServiceFactory {
public:
    static std::unique_ptr<EmailService> create_email_service(EmailProvider provider);
    static std::unique_ptr<EmailService> create_email_service_from_config(const std::string& config_file);
};

// Gmail Email Service Implementation
class GmailEmailService : public EmailService {
private:
    std::string username_;
    std::string password_;
    std::string smtp_host_;
    int smtp_port_;
    bool smtp_secure_;
    
public:
    GmailEmailService(const std::string& username, const std::string& password);
    virtual ~GmailEmailService() = default;
    
    bool send_email(const EmailMessage& message) override;
    bool send_template_email(const std::string& template_name, 
                           const std::string& to,
                           const EmailTemplateData& data) override;
    bool send_bulk_email(const std::vector<EmailMessage>& messages) override;
    bool send_bulk_template_email(const std::string& template_name,
                                 const std::vector<std::string>& recipients,
                                 const EmailTemplateData& data) override;
    bool queue_email(const EmailMessage& message) override;
    bool queue_template_email(const std::string& template_name,
                            const std::string& to,
                            const EmailTemplateData& data) override;
    bool process_queue() override;
    std::vector<EmailQueueItem> get_queue_status() override;
    bool load_template(const std::string& template_name, 
                      const std::string& template_path) override;
    std::string render_template(const std::string& template_name,
                              const EmailTemplateData& data) override;
    bool validate_email(const std::string& email) override;
    bool is_deliverable(const std::string& email) override;
    std::map<EmailStatus, int> get_email_stats() override;
    std::vector<EmailMessage> get_recent_emails(int limit = 100) override;
    bool configure(const std::string& config_file) override;
    bool test_connection() override;
};

// SendGrid Email Service Implementation
class SendGridEmailService : public EmailService {
private:
    std::string api_key_;
    std::string from_email_;
    std::string from_name_;
    
public:
    SendGridEmailService(const std::string& api_key, 
                        const std::string& from_email,
                        const std::string& from_name);
    virtual ~SendGridEmailService() = default;
    
    bool send_email(const EmailMessage& message) override;
    bool send_template_email(const std::string& template_name, 
                           const std::string& to,
                           const EmailTemplateData& data) override;
    bool send_bulk_email(const std::vector<EmailMessage>& messages) override;
    bool send_bulk_template_email(const std::string& template_name,
                                 const std::vector<std::string>& recipients,
                                 const EmailTemplateData& data) override;
    bool queue_email(const EmailMessage& message) override;
    bool queue_template_email(const std::string& template_name,
                            const std::string& to,
                            const EmailTemplateData& data) override;
    bool process_queue() override;
    std::vector<EmailQueueItem> get_queue_status() override;
    bool load_template(const std::string& template_name, 
                      const std::string& template_path) override;
    std::string render_template(const std::string& template_name,
                              const EmailTemplateData& data) override;
    bool validate_email(const std::string& email) override;
    bool is_deliverable(const std::string& email) override;
    std::map<EmailStatus, int> get_email_stats() override;
    std::vector<EmailMessage> get_recent_emails(int limit = 100) override;
    bool configure(const std::string& config_file) override;
    bool test_connection() override;
};

// Email Template Manager
class EmailTemplateManager {
private:
    std::map<std::string, std::string> templates_;
    std::string template_directory_;
    
public:
    EmailTemplateManager(const std::string& template_directory);
    
    bool load_template(const std::string& template_name);
    bool load_all_templates();
    std::string render_template(const std::string& template_name,
                              const EmailTemplateData& data);
    std::vector<std::string> get_available_templates();
    bool template_exists(const std::string& template_name);
};

// Email Queue Manager
class EmailQueueManager {
private:
    std::vector<EmailQueueItem> queue_;
    std::string queue_file_;
    int max_retries_;
    std::chrono::seconds retry_delay_;
    
public:
    EmailQueueManager(const std::string& queue_file, 
                     int max_retries = 3,
                     std::chrono::seconds retry_delay = std::chrono::seconds(300));
    
    bool add_to_queue(const EmailMessage& message);
    bool add_to_queue(const EmailMessage& message, 
                     std::chrono::system_clock::time_point scheduled_at);
    bool process_queue(EmailService& email_service);
    std::vector<EmailQueueItem> get_queue_status();
    bool remove_from_queue(const std::string& email_id);
    bool clear_queue();
    bool save_queue();
    bool load_queue();
};

// Email Analytics
class EmailAnalytics {
private:
    std::map<std::string, std::map<EmailStatus, int>> stats_;
    std::vector<EmailMessage> recent_emails_;
    
public:
    void record_email_sent(const EmailMessage& message, EmailStatus status);
    void record_email_opened(const std::string& email_id);
    void record_email_clicked(const std::string& email_id);
    std::map<EmailStatus, int> get_stats();
    std::map<EmailStatus, int> get_stats_for_period(
        std::chrono::system_clock::time_point start,
        std::chrono::system_clock::time_point end);
    double get_delivery_rate();
    double get_open_rate();
    double get_click_rate();
};

} // namespace crypto_wallet
