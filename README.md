# 🛡️ XCryptoVault - Cryptocurrency Wallet & Trading Platform

A comprehensive cryptocurrency wallet and trading platform built with modern web technologies, featuring multi-blockchain support, advanced security, and a complete admin management system.

## 🌟 Features

### 🔐 Core Wallet Features
- **Multi-Blockchain Support**: Bitcoin, Ethereum, Cardano, Solana, Polkadot
- **Secure Vault Technology**: Military-grade encryption and security
- **HD Wallet Support**: Hierarchical deterministic wallet generation
- **Real-time Portfolio Tracking**: Live portfolio value and P&L monitoring
- **Transaction Management**: Send, receive, and track cryptocurrency transactions

### 📈 Trading & Exchange
- **Trading Engine**: Market and limit orders with real-time execution
- **Order Book Management**: Complete order book with depth charts
- **Trading Pairs**: Multiple cryptocurrency trading pairs
- **Real-time Price Data**: Live price updates and market data
- **Portfolio Analytics**: Performance charts and analytics

### 🛡️ Admin Management System
- **Role-Based Access Control**: Super Admin, Manager, Moderator, User roles
- **User Management**: Create, update, delete users with granular permissions
- **System Administration**: Maintenance mode, system settings, backup controls
- **Incident Management**: Track and resolve system incidents
- **Compliance Tools**: KYC/AML rules, API rate limits, trading limits
- **Audit Logging**: Complete activity tracking and audit trails

### 🔒 Security Features
- **Two-Factor Authentication**: Enhanced security with 2FA
- **Email Verification**: Secure email-based account verification
- **Password Management**: Secure password reset and change functionality
- **Session Management**: Secure session handling and logout
- **Encryption**: End-to-end encryption for sensitive data

## 🏗️ Architecture

### Backend (C++)
- **Web Server**: Custom HTTP server with socket-based implementation
- **Database Integration**: PostgreSQL with SQLite fallback
- **Trading Engine**: High-performance trading system
- **Crypto Operations**: Bitcoin address generation and key management
- **Email Service**: SMTP integration for notifications

### Frontend (React + TypeScript)
- **Modern UI**: Responsive design with Tailwind CSS
- **Real-time Updates**: Live data synchronization
- **Role-Based Interface**: Different interfaces for different user roles
- **Interactive Charts**: Real-time price and portfolio charts
- **Admin Dashboard**: Comprehensive admin management interface

### Database (PostgreSQL)
- **User Management**: User accounts, roles, and permissions
- **Transaction Records**: Complete transaction history
- **Trading Data**: Orders, trades, and market data
- **Admin System**: Incidents, compliance rules, audit logs
- **System Settings**: Global configuration management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- C++ compiler (GCC/Clang)
- CMake 3.16+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wallet
```

2. **Install dependencies**
```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
mkdir build && cd build
cmake ..
make -j4
```

3. **Database Setup**
```bash
# Run PostgreSQL setup script
./scripts/setup-postgresql.sh

# Apply database schema
psql -d crypto_wallet -U wallet_user -f backend/schema.sql
```

4. **Start Services**
```bash
# Start backend server
cd backend/build
./crypto_wallet server

# Start frontend (in new terminal)
cd frontend
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Admin Dashboard: http://localhost:5173/admin

## 👥 User Roles & Permissions

### 🛡️ Super Admin
- **Full System Access**: Complete control over backend, database, and security
- **User Management**: Create/delete admins, modify system-wide settings
- **System Control**: Maintenance mode, system rollback, emergency controls
- **Compliance Management**: KYC/AML rules, API rate limits, global trading pairs
- **Incident Response**: Handle critical incidents and system emergencies
- **Developer Access**: Full access to development tools and APIs

### 🧭 Admin (Manager-Level)
- **Day-to-day Operations**: Approve listings, manage liquidity pools, update prices
- **User Verification**: Oversee user verifications and risk settings
- **Reporting**: Generate daily trades, P&L, volume reports
- **Incident Management**: Create and resolve system incidents
- **Compliance**: Manage KYC/AML rules and trading limits
- **Team Management**: Manage moderators and support staff

### 🤝 Moderator / Support Staff
- **User Support**: Access user info for support purposes
- **Account Management**: Freeze accounts temporarily, reset passwords
- **Suspicious Activity**: Report and track suspicious user behavior
- **Support Tools**: Generate support reports and user assistance
- **Limited Access**: No access to funds or system configuration
- **Customer Service**: Handle user inquiries and technical support

### 💼 User (Trader / Investor)
- **Standard Trading**: Trade, deposit, withdraw, use APIs
- **Portfolio Management**: View and manage personal portfolio
- **Account Settings**: Personal preferences and security settings
- **Upgrade Options**: Pro user features for higher limits
- **Data Privacy**: Access only to own data
- **Trading Tools**: Trading features and analytics

### 🤖 Automated Trader / Bot
- **API Access**: Full API access for automated trading
- **Trading Algorithms**: Deploy and manage trading bots
- **Risk Management**: Set automated risk parameters
- **Performance Monitoring**: Track bot performance and profitability
- **Strategy Management**: Create, test, and deploy trading strategies
- **Real-time Execution**: High-frequency trading capabilities

### 🔍 Auditor / Compliance Officer
- **Compliance Monitoring**: Monitor and audit system compliance
- **Risk Assessment**: Assess and report on system risks
- **Regulatory Reporting**: Generate compliance reports
- **Audit Trails**: Access complete audit logs and transaction history
- **Policy Management**: Review and update compliance policies
- **Regulatory Updates**: Stay updated with regulatory changes

### 🔒 Security Role
- **Security Monitoring**: Monitor system security and threats
- **Incident Response**: Handle security incidents and breaches
- **Access Control**: Manage user access and permissions
- **Security Audits**: Conduct regular security assessments
- **Threat Analysis**: Analyze and respond to security threats
- **Security Policies**: Develop and enforce security policies

### 👨‍💻 Developer
- **API Development**: Create and maintain API endpoints
- **System Integration**: Integrate with external systems and services
- **Code Management**: Access to source code and development tools
- **Testing**: Develop and run automated tests
- **Documentation**: Create and maintain technical documentation
- **Deployment**: Deploy and manage application updates
- **Debugging**: Access to system logs and debugging tools
- **Performance Optimization**: Optimize system performance and scalability

## 📊 Admin Dashboard Features

### System Overview
- **Real-time Status**: System health, uptime, database status
- **User Statistics**: Total users, active users, new registrations
- **Incident Tracking**: Open incidents, severity levels, resolution status
- **Quick Actions**: Role-specific action buttons and controls

### User Management
- **User List**: Search, filter, and manage all users
- **Role Assignment**: Assign admin levels and granular permissions
- **Account Actions**: Freeze, activate, delete user accounts
- **User Details**: View comprehensive user information and activity

### System Administration
- **Global Settings**: System-wide configuration management
- **Maintenance Mode**: Toggle system maintenance with custom messages
- **Backup Controls**: System backup and recovery operations
- **Emergency Actions**: Emergency shutdown and system rollback

### Incident Management
- **Incident Creation**: Create incidents with severity levels and descriptions
- **Incident Tracking**: Monitor and update incident status
- **Resolution Management**: Resolve incidents with detailed notes
- **Incident History**: View and analyze resolved incidents

### Compliance Management
- **Rule Creation**: Create KYC/AML compliance rules
- **Rule Configuration**: Set verification levels and document requirements
- **Active Rules**: Manage and monitor active compliance rules
- **Rule Types**: KYC verification, AML monitoring, API limits, trading limits

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `POST /auth/change-password` - Change password
- `GET /auth/verify-email` - Email verification

### Admin System
- `GET /admin/users` - List all users
- `POST /admin/users` - Create new user
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/settings` - Get system settings
- `PUT /admin/settings` - Update system settings
- `GET /admin/incidents` - List incidents
- `POST /admin/incidents` - Create incident
- `PUT /admin/incidents/{id}` - Resolve incident
- `GET /admin/compliance` - List compliance rules
- `POST /admin/compliance` - Create compliance rule
- `GET /admin/audit` - Get audit logs
- `GET /admin/system/status` - System status
- `POST /admin/system/maintenance` - Toggle maintenance mode

### Trading
- `POST /trading/orders` - Place order
- `DELETE /trading/orders/{id}` - Cancel order
- `GET /trading/orders/{wallet}` - Get user orders
- `GET /trading/pairs` - Get trading pairs
- `GET /trading/market/{symbol}` - Get market data
- `GET /trading/orderbook/{pair}` - Get order book

### Wallet Operations
- `GET /balance/{wallet}?network={network}` - Get wallet balance
- `POST /send` - Send transaction
- `GET /addresses/{wallet}` - Get wallet addresses
- `GET /transactions/{wallet}` - Get transaction history

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **wallets**: Wallet information and balances
- **transactions**: Transaction records
- **trading_orders**: Trading orders and execution
- **market_data**: Real-time market data

### Admin Tables
- **admin_users**: Admin user roles and permissions
- **system_settings**: Global system configuration
- **compliance_rules**: KYC/AML rules and policies
- **system_incidents**: Incident tracking and management
- **audit_logs**: Complete audit trail

## 🔒 Security Features

### Authentication & Authorization
- **Multi-factor Authentication**: 2FA support for enhanced security
- **Role-based Access Control**: Granular permissions system
- **Session Management**: Secure session handling
- **Password Security**: Secure password hashing and reset

### Data Protection
- **Encryption**: End-to-end encryption for sensitive data
- **Secure Storage**: Encrypted private key storage
- **Audit Logging**: Complete activity tracking
- **Privacy Controls**: User data privacy and control

### System Security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention

## 🚀 Deployment

### Production Setup
1. **Database Configuration**: Set up PostgreSQL with proper security
2. **Backend Deployment**: Compile and deploy C++ backend
3. **Frontend Build**: Build and deploy React frontend
4. **SSL Configuration**: Set up HTTPS with SSL certificates
5. **Email Service**: Configure SMTP for notifications
6. **Monitoring**: Set up system monitoring and logging

### Environment Variables
```bash
# Database
DATABASE_TYPE=POSTGRESQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=wallet_user
PG_PASSWORD=secure_password
PG_DBNAME=crypto_wallet

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📈 Performance & Scalability

### Backend Optimization
- **High-performance C++**: Optimized for speed and efficiency
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connection management
- **Caching**: Redis integration for improved performance

### Frontend Optimization
- **Code Splitting**: Optimized bundle loading
- **Lazy Loading**: On-demand component loading
- **Real-time Updates**: Efficient data synchronization
- **Responsive Design**: Optimized for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and FAQ

## 🔮 Roadmap

### Upcoming Features
- **Mobile App**: Native mobile applications
- **Analytics**: Machine learning insights
- **DeFi Integration**: Decentralized finance protocols
- **Cross-chain Support**: Additional blockchain networks
- **API Marketplace**: Third-party API integrations

### Role-Specific Development
- **🤖 Automated Trading**: Bot management and strategy deployment
- **🔍 Compliance Tools**: Enhanced audit and compliance reporting
- **🔒 Security Features**: Security monitoring and threat detection
- **👨‍💻 Developer Tools**: Comprehensive API documentation and SDK
- **📊 Analytics Dashboard**: Role-specific analytics and reporting

---

**XCryptoVault** - Secure, scalable, and feature-rich cryptocurrency wallet and trading platform with comprehensive admin management system. 🛡️✨
