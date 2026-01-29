# Dashboard Daddy - Deployment

## Current Setup (VPS)
- **URL:** https://dashboard-daddy.com
- **Server:** 91.98.184.20
- **Proxy:** Traefik v2.11
- **Container:** dashboard-daddy-web

## Subdomains
| Domain | Purpose |
|--------|---------|
| dashboard-daddy.com | Main app |
| d.dashboard-daddy.com | Short URL |
| claude.dashboard-daddy.com | Claude interface |
| terminal.dashboard-daddy.com | Web terminal |
| vibe.dashboard-daddy.com | Vibe |
| scim.dashboard-daddy.com | SCIM |

## Traefik Config
Located at: `/home/dev/migration_files/dynamic/dashboard-daddy.yml`

## Docker Commands
```bash
# Build
docker build -t dashboard-daddy ./frontend

# Run
docker run -d --name dashboard-daddy-web \
  --network web \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  dashboard-daddy:latest

# View logs
docker logs dashboard-daddy-web

# Restart
docker restart dashboard-daddy-web
```

## Cloudflare
- DNS managed via Cloudflare
- SSL Mode: Flexible (recommended) or Full with origin cert
- A records point to 91.98.184.20
