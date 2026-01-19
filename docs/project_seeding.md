# Project Seeding Strategy

The `scripts/seed_active_projects.js` script is an automated setup tool designed to initialize the standard project structure within Linear for the agency's core initiatives. It ensures that new environments are immediately populated with actionable, high-priority tasks.

## Purpose

This script acts as an "Expert PM in a box," programmatically creating `Board` and `Priority` aligned tasks for specific projects. It uses the Linear API to check for existing projects and tasks before creating new ones to avoid duplicates (basic idempotency).

## Supported Projects

The script currently seeds tasks for the following projects:

### 1. Agency Ops (`agency-ops`)
Focuses on security and infrastructure foundation.
- **Audit 1Password Vault Permissions** (P1): ensuring secure access control.
- **Configure new user onboarding script** (P2): automating dev environment setup.
- **Review Server Security Hardening** (P2): firewall and SSH audits.

### 2. Dashboard Daddy (`dashboard-daddy`)
The autonomous AI coding platform.
- **Initialize Next.js project structure** (P1): core app setup.
- **Connect to Vercel for Deployment** (P1): CI/CD pipeline.
- **Implement basic Auth** (P2): Supabase/NextAuth integration.

### 3. Voice Agent Platform (`voice-agent-platform`)
High-performance voice AI configurations.
- **Database-backed configs** (P2)
- **Hot reloading** (P2)
- **Config versioning** (P3)
- **UI management interface** (P3)
- **Analytics integration** (P3)

## Usage

This script is typically run during the initial workspace setup or manually when bootstrapping a new environment.

```bash
# Run via Node.js
node scripts/seed_active_projects.js
```

## Configuration

The script requires a configured `LinearClient` (from `./linear_client.js`) and appropriate environment variables for authentication.
