#!/bin/bash
# Dashboard Daddy - Complete Installation Script
# Run: bash scripts/install.sh

set -e

INSTALL_DIR="/opt/agency-workspace/dashboard-daddy"
cd "$INSTALL_DIR"

echo "=========================================="
echo "  Dashboard Daddy - Installation"
echo "  Vibe Kanban + Cloudflare Tunnel"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check prerequisites
echo ""
echo "[1/6] Checking prerequisites..."

# Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} Docker: $(docker --version | cut -d' ' -f3)"
else
    echo -e "${RED}[ERROR]${NC} Docker not found. Please install Docker first."
    exit 1
fi

# Docker Compose
if docker compose version &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} Docker Compose: $(docker compose version --short)"
else
    echo -e "${RED}[ERROR]${NC} Docker Compose not found."
    exit 1
fi

# Step 2: Create .env file
echo ""
echo "[2/6] Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}[ACTION REQUIRED]${NC} Created .env file"
    echo "   Please edit .env with your API keys and tunnel token:"
    echo "   nano $INSTALL_DIR/.env"
    echo ""
    read -p "Press Enter after you've configured .env..."
else
    echo -e "${GREEN}[OK]${NC} .env file exists"
fi

# Validate required variables
source .env
if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ] || [ "$CLOUDFLARE_TUNNEL_TOKEN" = "your_tunnel_token_here" ]; then
    echo -e "${RED}[ERROR]${NC} CLOUDFLARE_TUNNEL_TOKEN not configured"
    echo "   Get your token from: https://one.dash.cloudflare.com → Networks → Tunnels"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-api03-xxxxx" ]; then
    echo -e "${YELLOW}[WARNING]${NC} ANTHROPIC_API_KEY not set - Claude Code won't work"
fi

echo -e "${GREEN}[OK]${NC} Environment configured"

# Step 3: Create data directories
echo ""
echo "[3/6] Creating data directories..."

mkdir -p ~/.claude ~/.anthropic
echo -e "${GREEN}[OK]${NC} Directories created"

# Step 4: Pull images
echo ""
echo "[4/6] Pulling Docker images..."

docker compose pull
echo -e "${GREEN}[OK]${NC} Images pulled"

# Step 5: Start services
echo ""
echo "[5/6] Starting Dashboard Daddy..."

docker compose up -d

# Wait for health check
echo "Waiting for services to become healthy..."
sleep 10

if docker compose ps | grep -q "healthy"; then
    echo -e "${GREEN}[OK]${NC} Services are running and healthy"
else
    echo -e "${YELLOW}[INFO]${NC} Services starting... (may take up to 60s)"
fi

# Step 6: Install systemd service
echo ""
echo "[6/6] Installing systemd service for auto-start..."

sudo cp config/dashboard-daddy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable dashboard-daddy

echo -e "${GREEN}[OK]${NC} Systemd service installed"

# Summary
echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo ""
echo "Dashboard Daddy is now running!"
echo ""
echo "Access URLs:"
echo "  Local:  http://localhost:3000"
echo "  Remote: https://YOUR-DOMAIN (via Cloudflare Tunnel)"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose logs -f"
echo "  Stop:         docker compose down"
echo "  Start:        docker compose up -d"
echo "  Restart:      sudo systemctl restart dashboard-daddy"
echo "  Status:       sudo systemctl status dashboard-daddy"
echo ""
echo "Troubleshooting:"
echo "  bash scripts/setup-cloudflare-tunnel.sh"
echo ""
