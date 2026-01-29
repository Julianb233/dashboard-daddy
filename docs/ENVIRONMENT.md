# Dashboard Daddy - Environment Variables

## Required Variables

### Supabase (Database)
```env
NEXT_PUBLIC_SUPABASE_URL=https://jrirksdiklqwsaatbhvg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2Rpa2xxd3NhYXRiaHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI5NjYsImV4cCI6MjA2NDU4ODk2Nn0.mb1VQ9eOiRTyOMAu5f9OTYh6V7ialfkzr8DPylvA4vk
```

## Supabase Project
- **Project:** dashboard-daddy
- **Region:** us-east-1
- **URL:** https://jrirksdiklqwsaatbhvg.supabase.co

## Deployment

### Vercel
Add these env vars in Vercel Dashboard → Settings → Environment Variables

### Docker
```bash
docker run -d \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  dashboard-daddy:latest
```

### Local Development
Copy `.env.example` to `.env.local` and fill in values.
