# Vercel Deployment Research

## Overview

This document outlines the Vercel deployment strategy for Dashboard Daddy's Next.js frontend. The frontend is located in the `dashboard/` subdirectory (monorepo setup) and will be deployed to Vercel while backend services remain on the VPS via Docker Compose.

**Vercel CLI Version Available:** 50.4.5

---

## 1. Project Setup Steps

### Initial Setup (One-time)

```bash
# 1. Navigate to project root
cd /opt/agency-workspace/dashboard-daddy

# 2. Login to Vercel (interactive)
vercel login

# 3. Link to Vercel project (run from root directory)
vercel link

# 4. During linking, specify:
#    - Root Directory: dashboard
#    - Framework: Next.js (auto-detected)
#    - Build Command: npm run build (default)
#    - Output Directory: .next (default for Next.js)
```

### Alternative: Direct CLI Deployment

```bash
# Deploy from project root with subdirectory
cd /opt/agency-workspace/dashboard-daddy
vercel --cwd dashboard

# Or navigate to dashboard and deploy
cd /opt/agency-workspace/dashboard-daddy/dashboard
vercel
```

---

## 2. vercel.json Configuration

Create `/opt/agency-workspace/dashboard-daddy/vercel.json` in the project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "projectSettings": {
    "rootDirectory": "dashboard",
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm install",
    "devCommand": "npm run dev"
  },
  "github": {
    "enabled": true,
    "autoJobCancelation": true,
    "silent": false
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/vibe-kanban/:path*",
      "destination": "https://claude.dashboard-daddy.com/:path*"
    },
    {
      "source": "/api/terminal/:path*",
      "destination": "https://terminal.dashboard-daddy.com/:path*"
    }
  ]
}
```

### Configuration Notes

- **rootDirectory**: Points to `dashboard/` subdirectory for monorepo setup
- **rewrites**: Proxy API calls to backend services on VPS via Cloudflare Tunnel
- **headers**: CORS configuration for API routes (adjust for production)

---

## 3. Environment Variables

### Required for Production

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | VPS Cloudflare Tunnel URL |
| `NEXT_PUBLIC_VIBE_KANBAN_URL` | Vibe Kanban endpoint | `https://claude.dashboard-daddy.com` |
| `NEXT_PUBLIC_TERMINAL_URL` | Terminal endpoint | `https://terminal.dashboard-daddy.com` |

### Authentication (Choose One)

**If using Supabase:**
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (server-side) | Supabase Dashboard > Settings > API |

**If using NextAuth:**
| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXTAUTH_SECRET` | Session encryption key | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL | Production Vercel URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | GitHub Developer Settings |

### Optional/API Keys (Backend)

| Variable | Description | Notes |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | Claude API | Only needed if frontend calls Claude directly |
| `OPENAI_API_KEY` | OpenAI API | Only needed if frontend calls OpenAI directly |
| `GOOGLE_API_KEY` | Google/Gemini API | Only needed if frontend calls Gemini directly |
| `GITHUB_TOKEN` | GitHub PAT | For PR creation features |

### Setting Environment Variables in Vercel

```bash
# Via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# List current environment variables
vercel env ls

# Pull environment variables to local .env
vercel env pull .env.local
```

**Dashboard Method:**
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add variables with appropriate scopes (Production, Preview, Development)
3. Redeploy after adding sensitive variables

---

## 4. Build Configuration

### Next.js Build Settings

The project uses Next.js 16.1.3 with the following build configuration:

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### Recommended next.config.ts Updates

Update `/opt/agency-workspace/dashboard-daddy/dashboard/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for optimized production builds
  output: 'standalone',

  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Image optimization domains (if using external images)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dashboard-daddy.com',
      },
    ],
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Experimental features (Next.js 16)
  experimental: {
    // Enable if using Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
```

### Build Output

Vercel automatically detects Next.js and:
- Runs `npm install`
- Runs `npm run build`
- Deploys `.next` output directory
- Configures serverless functions for API routes and SSR pages

---

## 5. Deployment Workflows

### Preview Deployments

Every push to a non-production branch creates a preview deployment:

```
https://dashboard-daddy-<hash>-<team>.vercel.app
```

**Features:**
- Unique URL per commit/PR
- Automatic deployment comments on GitHub PRs
- Protected preview links (can require authentication)
- Uses preview environment variables

### Production Deployments

```bash
# Deploy to production manually
vercel --prod

# Or via CLI with confirmation
vercel --prod --confirm
```

**Automatic production deployment triggers:**
- Push to `main` branch (default)
- Merge PR to `main`
- Manual trigger from Vercel Dashboard

### Deployment Commands Summary

```bash
# Preview deployment (any branch)
vercel

# Production deployment
vercel --prod

# Build locally without deploying
vercel build

# Deploy with specific environment
vercel --env production

# Rollback to previous deployment
vercel rollback

# List recent deployments
vercel ls

# Get deployment URL
vercel inspect <deployment-url>
```

---

## 6. GitHub Integration

### Setup Steps

1. **Connect Repository:**
   - Go to Vercel Dashboard > Add New Project
   - Select "Import Git Repository"
   - Authorize Vercel GitHub App
   - Select `dashboard-daddy` repository

2. **Configure Root Directory:**
   - Set root directory to `dashboard`
   - Confirm framework detection (Next.js)

3. **Branch Configuration:**
   ```
   Production Branch: main
   Preview Branches: * (all other branches)
   Ignored Build Step: (optional) git diff --quiet HEAD^ HEAD ./dashboard
   ```

### GitHub Actions Integration (Optional)

Create `.github/workflows/vercel-deploy.yml` for custom CI:

```yaml
name: Vercel Deploy

on:
  push:
    branches: [main]
    paths:
      - 'dashboard/**'
  pull_request:
    branches: [main]
    paths:
      - 'dashboard/**'

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: dashboard/package-lock.json

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: dashboard

      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: dashboard

      - name: Deploy to Vercel
        run: |
          if [ "${{ github.event_name }}" == "push" ] && [ "${{ github.ref }}" == "refs/heads/main" ]; then
            vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
          fi
        working-directory: dashboard
```

### Required GitHub Secrets

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard > Settings > Tokens |
| `VERCEL_ORG_ID` | Organization ID | `vercel link` creates `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Project ID | `vercel link` creates `.vercel/project.json` |

---

## 7. Security Considerations

### Environment Variable Security

1. **Never expose API keys client-side:**
   - Only `NEXT_PUBLIC_*` variables are exposed to browser
   - Keep `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc. server-side only
   - Use API routes as proxy for sensitive operations

2. **Separate environments:**
   - Use different API keys for Production vs Preview
   - Rotate keys regularly
   - Audit access logs

### Authentication Security

```typescript
// middleware.ts - Protect dashboard routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add authentication check here
  // Redirect to login if not authenticated

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### CORS and Headers

```typescript
// next.config.ts headers
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

### Vercel Security Features

1. **DDoS Protection:** Automatic at edge
2. **SSL/TLS:** Automatic certificate provisioning
3. **Deployment Protection:** Password-protect preview deployments
4. **Audit Logs:** Available on Team/Enterprise plans
5. **Attack Challenge Mode:** Enable during high-risk periods

### Secret Scanning

- Vercel automatically scans for exposed secrets in deployment logs
- Use `.vercelignore` to exclude sensitive files:

```
# .vercelignore
.env
.env.local
*.pem
secrets/
```

---

## 8. Monorepo Considerations

### Directory Structure

```
dashboard-daddy/
├── dashboard/              # Next.js frontend (deployed to Vercel)
│   ├── app/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── docker-compose.yml      # Backend services (VPS)
├── vercel.json             # Vercel configuration
├── .env.example
└── .gitignore
```

### Ignored Build Step (Optional)

To skip deployments when only non-frontend files change:

```bash
# In Vercel Dashboard > Project > Settings > Git > Ignored Build Step
git diff --quiet HEAD^ HEAD ./dashboard
```

This returns exit code 0 (skip build) if no changes in `dashboard/`.

---

## 9. CI/CD Workflow Recommendations

### Recommended Workflow

```
Feature Branch → PR → Preview Deploy → Review → Merge → Production Deploy
```

1. **Development:**
   - Create feature branch
   - Push triggers preview deployment
   - Share preview URL for review

2. **Review:**
   - Vercel comments on PR with preview link
   - Run automated tests in GitHub Actions
   - Manual QA on preview deployment

3. **Production:**
   - Merge PR to `main`
   - Automatic production deployment
   - Monitor deployment logs
   - Rollback if needed

### Pre-deployment Checklist

```bash
# Local validation before pushing
cd dashboard

# Run linter
npm run lint

# Run build locally
npm run build

# Test production build
npm run start

# Check for TypeScript errors
npx tsc --noEmit
```

### Post-deployment Monitoring

1. **Vercel Analytics:** Enable for Core Web Vitals
2. **Error Tracking:** Integrate Sentry or similar
3. **Uptime Monitoring:** Use Vercel's built-in or external service

---

## 10. Quick Reference

### Essential Commands

```bash
# Login
vercel login

# Link project
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod

# Environment variables
vercel env add <NAME> <SCOPE>
vercel env ls
vercel env pull

# Manage domains
vercel domains add <domain>
vercel domains ls

# View logs
vercel logs <deployment-url>

# Rollback
vercel rollback
```

### Useful URLs

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/<team>/<project>/settings
- Deployment Logs: https://vercel.com/<team>/<project>/deployments
- Analytics: https://vercel.com/<team>/<project>/analytics

---

## 11. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails with missing module | Check `package.json` dependencies, run `npm install` |
| Environment variable not found | Verify variable is set in Vercel and scope matches |
| 404 on dynamic routes | Check `next.config.ts` and middleware configuration |
| CORS errors | Configure headers in `vercel.json` or `next.config.ts` |
| Slow builds | Use turbo mode, check for large dependencies |
| Deployment stuck | Cancel and redeploy, check Vercel status page |

### Debug Commands

```bash
# Check build output locally
vercel build

# Inspect deployment
vercel inspect <url>

# View detailed logs
vercel logs <url> --follow

# Check project configuration
vercel project ls
```

---

## Next Steps

1. [ ] Create `vercel.json` in project root
2. [ ] Update `next.config.ts` with recommended settings
3. [ ] Set up GitHub repository connection
4. [ ] Configure environment variables in Vercel Dashboard
5. [ ] Create initial production deployment
6. [ ] Set up custom domain (optional)
7. [ ] Enable Vercel Analytics
8. [ ] Configure deployment protection for previews

---

*Research completed: 2026-01-19*
*Vercel CLI Version: 50.4.5*
*Next.js Version: 16.1.3*
