# Dashboard Daddy

A unified dashboard for managing multiple AI coding agents across projects. Monitor, dispatch, and coordinate Claude Code, Gemini CLI, and OpenAI Codex from a single interface.

## Features

- **Multi-Agent Support**: Manage Claude Code, Gemini CLI, and OpenAI Codex
- **Project Dashboard**: View all projects and their active agents
- **Vibe Kanban Integration**: Pull tasks directly from your kanban board
- **Remote Execution**: Run agents on remote servers via SSH
- **Parallel Execution**: Spawn multiple agents simultaneously
- **GitHub Integration**: Auto-create PRs from completed work

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js with GitHub OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub OAuth App (for authentication)
- API keys for AI agents you want to use

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/dashboard-daddy.git
   cd dashboard-daddy/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your values.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | Yes | Canonical URL of your deployment |
| `GITHUB_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth App Client Secret |
| `VIBE_KANBAN_URL` | No | URL to Vibe Kanban instance |
| `ANTHROPIC_API_KEY` | No* | API key for Claude Code agent |
| `GOOGLE_API_KEY` | No* | API key for Gemini CLI agent |
| `OPENAI_API_KEY` | No* | API key for OpenAI Codex agent |

*At least one agent API key is required for full functionality.

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Setting up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Dashboard Daddy
   - **Homepage URL**: Your deployment URL
   - **Authorization callback URL**: `{YOUR_URL}/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the project in Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import from GitHub
   - Select the `dashboard-daddy` repository
   - Set the Root Directory to `dashboard`

3. Configure environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`

4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Project Structure

```
dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/               # API routes
├── public/                # Static assets
├── vercel.json           # Vercel configuration
├── .env.example          # Environment template
└── package.json          # Dependencies
```

## Configuration

Agent configuration is stored in `../config/agents.json`. Each agent defines:
- Command and arguments
- Required environment variables
- Feature flags (parallel execution, autonomous mode, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
