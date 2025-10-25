# Deployment Guide

## Production Deployment

### Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Root or sudo access
- Domain name (optional, for HTTPS)
- SSL certificate (for HTTPS)

### System Requirements

- **CPU**: 2+ cores
- **RAM**: 4GB+ recommended
- **Storage**: 20GB+ available space
- **Network**: Stable internet connection

### Installation Steps

1. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install dependencies:**
   ```bash
   # Install system dependencies
   sudo apt install -y \
       build-essential \
       cmake \
       libssl-dev \
       libcurl4-openssl-dev \
       pkg-config \
       nginx \
       nodejs \
       npm
   
   # Install libsecp256k1
   git clone https://github.com/bitcoin-core/secp256k1.git
   cd secp256k1
   ./autogen.sh
   ./configure
   make
   sudo make install
   cd ..
   ```

3. **Clone and build the application:**
   ```bash
   git clone <repository-url> crypto-wallet
   cd crypto-wallet
   make deps
   make build
   ```

4. **Create system user:**
   ```bash
   sudo useradd -r -s /bin/false crypto-wallet
   sudo mkdir -p /var/lib/crypto-wallet
   sudo chown crypto-wallet:crypto-wallet /var/lib/crypto-wallet
   ```

5. **Install the application:**
   ```bash
   sudo make install
   ```

### Nginx Configuration

Create `/etc/nginx/sites-available/crypto-wallet`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/crypto-wallet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Systemd Service

Create `/etc/systemd/system/crypto-wallet-backend.service`:

```ini
[Unit]
Description=Crypto Wallet Backend
After=network.target

[Service]
Type=simple
User=crypto-wallet
Group=crypto-wallet
WorkingDirectory=/var/lib/crypto-wallet
ExecStart=/usr/local/bin/crypto_wallet server
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/crypto-wallet-frontend.service`:

```ini
[Unit]
Description=Crypto Wallet Frontend
After=network.target

[Service]
Type=simple
User=crypto-wallet
Group=crypto-wallet
WorkingDirectory=/var/lib/crypto-wallet/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Start the services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable crypto-wallet-backend
sudo systemctl enable crypto-wallet-frontend
sudo systemctl start crypto-wallet-backend
sudo systemctl start crypto-wallet-frontend
```

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - ./data:/var/lib/crypto-wallet
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSL Certificate:**
   - Use Let's Encrypt for free SSL certificates
   - Configure automatic renewal

3. **Database Security:**
   - Encrypt wallet files at rest
   - Use secure file permissions
   - Regular backups

4. **Network Security:**
   - Use HTTPS only
   - Implement rate limiting
   - Configure proper CORS

### Monitoring

1. **Log Management:**
   ```bash
   sudo journalctl -u crypto-wallet-backend -f
   sudo journalctl -u crypto-wallet-frontend -f
   ```

2. **Health Checks:**
   - Monitor backend API endpoints
   - Check frontend accessibility
   - Monitor system resources

3. **Backup Strategy:**
   - Regular wallet file backups
   - Database backups (if applicable)
   - Configuration backups

### Troubleshooting

1. **Service Issues:**
   ```bash
   sudo systemctl status crypto-wallet-backend
   sudo systemctl status crypto-wallet-frontend
   ```

2. **Log Analysis:**
   ```bash
   sudo journalctl -u crypto-wallet-backend --since "1 hour ago"
   ```

3. **Network Issues:**
   ```bash
   curl -I http://localhost:8080/health
   curl -I http://localhost:5173
   ```

### Updates

1. **Backend Updates:**
   ```bash
   git pull
   make build
   sudo systemctl restart crypto-wallet-backend
   ```

2. **Frontend Updates:**
   ```bash
   cd frontend
   npm install
   npm run build
   sudo systemctl restart crypto-wallet-frontend
   ```
