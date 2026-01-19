# Dashboard Daddy

**Autonomous AI Coding Agent Platform** - Run Vibe Kanban on your VPS with secure remote access via Cloudflare Tunnel.

Access your AI coding agents from any device (iPhone, iPad, Mac, PC) through your custom domain.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Devices                              │
│  iPhone │ iPad │ MacBook │ PC │ Any Browser                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare (Your Domain)                        │
│         dashboard.yourdomain.com                             │
│              Cloudflare Tunnel                               │
└─────────────────────┬───────────────────────────────────────┘
                      │ Encrypted Tunnel
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Your Hostinger VPS                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Docker Compose Stack                     │   │
│  │  ┌─────────────────┐    ┌─────────────────────────┐  │   │
│  │  │   Vibe Kanban   │◄───│   Cloudflare Tunnel     │  │   │
│  │  │   (Port 3000)   │    │   (cloudflared)         │  │   │
│  │  └────────┬────────┘    └─────────────────────────┘  │   │
│  │           │                                           │   │
│  │  ┌────────▼────────────────────────────────────────┐ │   │
│  │  │            AI Coding Agents                      │ │   │
│  │  │  Claude Code │ Gemini CLI │ OpenAI Codex        │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **Multi-Agent Support**: Run Claude Code, Gemini CLI, and OpenAI Codex in parallel
- **Autonomous Operation**: Agents run with permission-skipping for hands-off coding
- **Secure Remote Access**: Cloudflare Tunnel - no exposed ports, end-to-end encryption
- **Cross-Device Access**: Use from any device with a browser
- **Auto-Start**: Systemd service ensures Dashboard Daddy starts on boot
- **Git Integration**: Automatic PR creation, worktree isolation

## Quick Start

### 1. Clone and Configure

```bash
cd /opt/agency-workspace/dashboard-daddy
cp .env.example .env
nano .env  # Add your API keys and tunnel token
```

### 2. Get Your Cloudflare Tunnel Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Navigate: **Networks → Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared** connector
5. Name it: `dashboard-daddy`
6. Copy the token (starts with `eyJ...`)
7. Configure public hostname:
   - Subdomain: `dashboard` (or your choice)
   - Domain: `yourdomain.com`
   - Type: `HTTP`
   - URL: `localhost:3000`

### 3. Install & Run

```bash
bash scripts/install.sh
```

### 4. Access Dashboard Daddy

- **Local**: http://localhost:3000
- **Remote**: https://dashboard.yourdomain.com

## Configuration

### Environment Variables (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_TUNNEL_TOKEN` | Yes | Your Cloudflare tunnel token |
| `ANTHROPIC_API_KEY` | Yes | For Claude Code |
| `OPENAI_API_KEY` | Optional | For OpenAI Codex |
| `GOOGLE_API_KEY` | Optional | For Gemini CLI |
| `GITHUB_TOKEN` | Optional | For automatic PR creation |

### Agent Configuration

Edit `config/agents.json` to customize agent settings:
- Enable/disable specific agents
- Set parallel execution limits
- Configure auto-PR creation
- Set worktree cleanup schedule

## Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start Dashboard Daddy |
| `docker compose down` | Stop Dashboard Daddy |
| `docker compose logs -f` | View real-time logs |
| `docker compose logs -f vibe-kanban` | Vibe Kanban logs only |
| `docker compose logs -f cloudflared` | Tunnel logs only |
| `sudo systemctl status dashboard-daddy` | Check service status |
| `sudo systemctl restart dashboard-daddy` | Restart service |

## Troubleshooting

### Tunnel Not Working?

```bash
bash scripts/setup-cloudflare-tunnel.sh
```

This will:
- Check if cloudflared is installed
- Verify tunnel status
- Test connectivity
- Show detailed troubleshooting steps

### Common Issues

**1. "Connection refused" when accessing remote URL**
- Check if Vibe Kanban is running: `docker compose ps`
- Verify port 3000 is listening: `ss -tuln | grep 3000`
- Check tunnel logs: `docker compose logs cloudflared`

**2. Tunnel token invalid**
- Regenerate token in Cloudflare dashboard
- Update `.env` with new token
- Restart: `docker compose restart cloudflared`

**3. Agents not connecting**
- Verify API keys in `.env`
- Check agent is installed in container
- View agent logs in Vibe Kanban UI

**4. Service won't start on boot**
```bash
sudo systemctl enable dashboard-daddy
sudo systemctl daemon-reload
```

## Directory Structure

```
dashboard-daddy/
├── docker-compose.yml      # Main orchestration
├── .env                    # Your secrets (git-ignored)
├── .env.example            # Template
├── config/
│   ├── agents.json         # Agent configuration
│   └── dashboard-daddy.service  # Systemd unit
├── scripts/
│   ├── install.sh          # Full installation
│   ├── setup-cloudflare-tunnel.sh  # Tunnel troubleshooting
│   └── seed_active_projects.js # Project seeding automation
└── docs/
    └── [project_seeding.md](docs/project_seeding.md) # Automated setup docs
```

## Project Seeding

For information on how to use the automated project seeding script, strictly see [docs/project_seeding.md](docs/project_seeding.md).

## Security Notes

- **Never expose port 3000 directly** - always use Cloudflare Tunnel
- API keys are stored in `.env` (git-ignored)
- Agents run with elevated permissions - ensure your VPS is secured
- Cloudflare provides DDoS protection and WAF
- Consider enabling Cloudflare Access for additional authentication

## Updates

```bash
cd /opt/agency-workspace/dashboard-daddy
docker compose pull
docker compose up -d
```

## Credits

- [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) by BloopAI
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

## License

MIT License - Use freely for personal and commercial projects.
