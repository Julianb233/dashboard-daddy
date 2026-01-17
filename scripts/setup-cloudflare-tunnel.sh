#!/bin/bash
# Dashboard Daddy - Cloudflare Tunnel Setup & Troubleshooting
# Run: bash scripts/setup-cloudflare-tunnel.sh

set -e

echo "=========================================="
echo "  Dashboard Daddy - Cloudflare Tunnel Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if cloudflared is installed
check_cloudflared() {
    if command -v cloudflared &> /dev/null; then
        echo -e "${GREEN}[OK]${NC} cloudflared is installed: $(cloudflared --version)"
        return 0
    else
        echo -e "${YELLOW}[INFO]${NC} cloudflared not found. Installing..."
        return 1
    fi
}

# Install cloudflared
install_cloudflared() {
    echo "Installing cloudflared..."

    # Detect OS
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared.deb
        rm cloudflared.deb
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
        sudo rpm -i cloudflared.rpm
        rm cloudflared.rpm
    else
        # Generic Linux
        curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
        chmod +x cloudflared
        sudo mv cloudflared /usr/local/bin/
    fi

    echo -e "${GREEN}[OK]${NC} cloudflared installed successfully"
}

# Check tunnel status
check_tunnel_status() {
    echo ""
    echo "Checking tunnel status..."

    # Check if running as service
    if systemctl is-active --quiet cloudflared 2>/dev/null; then
        echo -e "${GREEN}[OK]${NC} cloudflared service is running"
        systemctl status cloudflared --no-pager | head -10
    else
        echo -e "${YELLOW}[INFO]${NC} cloudflared service is not running"
    fi

    # Check Docker container
    if docker ps | grep -q dashboard-daddy-tunnel; then
        echo -e "${GREEN}[OK]${NC} Tunnel container is running"
    else
        echo -e "${YELLOW}[INFO]${NC} Tunnel container is not running"
    fi
}

# Troubleshoot common issues
troubleshoot() {
    echo ""
    echo "=========================================="
    echo "  Troubleshooting Common Issues"
    echo "=========================================="

    # 1. Check if token is set
    if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
        echo -e "${RED}[ERROR]${NC} CLOUDFLARE_TUNNEL_TOKEN not set in .env"
        echo "       Fix: Get token from Cloudflare Zero Trust dashboard"
        echo "       https://one.dash.cloudflare.com → Networks → Tunnels"
    else
        echo -e "${GREEN}[OK]${NC} CLOUDFLARE_TUNNEL_TOKEN is set"
    fi

    # 2. Check DNS resolution
    echo ""
    echo "Testing DNS resolution..."
    if ping -c 1 cloudflare.com &> /dev/null; then
        echo -e "${GREEN}[OK]${NC} Can reach Cloudflare"
    else
        echo -e "${RED}[ERROR]${NC} Cannot reach Cloudflare - check internet connection"
    fi

    # 3. Check port 3000
    echo ""
    echo "Checking if Vibe Kanban is running on port 3000..."
    if netstat -tuln 2>/dev/null | grep -q ":3000" || ss -tuln | grep -q ":3000"; then
        echo -e "${GREEN}[OK]${NC} Port 3000 is listening"
    else
        echo -e "${RED}[ERROR]${NC} Port 3000 is not listening"
        echo "       Fix: Start Vibe Kanban first with: docker compose up vibe-kanban"
    fi

    # 4. Check Docker logs
    echo ""
    echo "Recent tunnel logs (if running in Docker):"
    docker logs dashboard-daddy-tunnel --tail 20 2>/dev/null || echo "       Container not running"
}

# Create tunnel via Cloudflare dashboard walkthrough
create_tunnel_guide() {
    echo ""
    echo "=========================================="
    echo "  How to Create a Cloudflare Tunnel"
    echo "=========================================="
    echo ""
    echo "1. Go to: https://one.dash.cloudflare.com"
    echo "2. Navigate: Networks → Tunnels"
    echo "3. Click 'Create a tunnel'"
    echo "4. Select 'Cloudflared' connector"
    echo "5. Name it: 'dashboard-daddy'"
    echo "6. Copy the TUNNEL_TOKEN (starts with 'eyJ...')"
    echo "7. Add it to your .env file"
    echo ""
    echo "8. Configure public hostname:"
    echo "   - Subdomain: dashboard (or your choice)"
    echo "   - Domain: yourdomain.com"
    echo "   - Type: HTTP"
    echo "   - URL: localhost:3000"
    echo ""
    echo "9. Save the tunnel"
    echo ""
}

# Main menu
main() {
    echo ""
    echo "What would you like to do?"
    echo "1) Check/Install cloudflared"
    echo "2) Check tunnel status"
    echo "3) Troubleshoot issues"
    echo "4) Show tunnel creation guide"
    echo "5) Run all checks"
    echo ""
    read -p "Enter choice [1-5]: " choice

    case $choice in
        1)
            check_cloudflared || install_cloudflared
            ;;
        2)
            check_tunnel_status
            ;;
        3)
            source .env 2>/dev/null || true
            troubleshoot
            ;;
        4)
            create_tunnel_guide
            ;;
        5)
            check_cloudflared || install_cloudflared
            check_tunnel_status
            source .env 2>/dev/null || true
            troubleshoot
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
}

# Run if called directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
