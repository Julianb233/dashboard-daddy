# Supabase Authentication Research for Dashboard Daddy

## Executive Summary

This document outlines the recommended approach for implementing authentication in Dashboard Daddy using Supabase Auth with Next.js 16 App Router. The research covers authentication patterns, middleware configuration, database schema design, and Row Level Security (RLS) policies.

**Recommendation**: Use Supabase Auth with the `@supabase/ssr` package for cookie-based authentication. This provides:
- Secure HTTP-only cookies (avoids XSS vulnerabilities)
- Full SSR support for SEO and performance
- Built-in session refresh via middleware
- Integration with Supabase's RLS for fine-grained access control

---

## Current Project State

### Existing Setup (from codebase analysis)

**docker-compose.yml**: No Supabase services configured. Current stack includes:
- vibe-kanban (Node.js, port 3000)
- terminal (ttyd, port 7681)
- scim-bridge (1Password SCIM)
- redis

**.env.example**: No Supabase environment variables present. Current vars:
- `CLOUDFLARE_TUNNEL_TOKEN`
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- `GITHUB_TOKEN`

**dashboard/package.json**: Currently using `next-auth@5.0.0-beta.30`. Stack:
- Next.js 16.1.3
- React 19.2.3
- Tailwind CSS 4
- bcryptjs (for password hashing)

### Decision Point: NextAuth vs Supabase Auth

The PROJECT.md lists "Supabase or NextAuth" as options. Here's the comparison:

| Aspect | NextAuth (Auth.js v5) | Supabase Auth |
|--------|----------------------|---------------|
| Database | Requires adapter setup | Built-in with Postgres |
| RLS Integration | Manual | Native support |
| Real-time | Requires extra setup | Built-in auth state sync |
| Session Storage | JWT or Database | Cookie-based (SSR optimized) |
| Complexity | Moderate | Lower for Supabase projects |
| Provider Support | Extensive | Comprehensive (GitHub, Google, etc.) |

**Recommendation**: Switch to Supabase Auth. Given Dashboard Daddy will use Supabase for data storage (agent configs, task queues), native auth integration provides:
- Seamless RLS policies using `auth.uid()`
- No adapter configuration needed
- Built-in user management dashboard
- Real-time auth state synchronization

---

## Part 1: Package Setup and Configuration

### Required Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
npm uninstall next-auth bcryptjs  # Remove if switching from NextAuth
npm uninstall @types/bcryptjs     # Remove type definitions too
```

### Environment Variables

Add to `.env.local` (development) and production environment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Note: The new format uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_xxx)
# Legacy anon keys still work during transition period
```

**Security Note**: The anon/publishable key is safe to expose publicly - it's designed for client-side use. RLS policies protect data.

---

## Part 2: Supabase Client Setup

### Project Structure

```
dashboard/
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser client (Client Components)
│       ├── server.ts      # Server client (Server Components, Route Handlers)
│       └── middleware.ts  # Session refresh utility
├── middleware.ts          # Root middleware file
└── app/
    ├── auth/
    │   ├── callback/
    │   │   └── route.ts   # OAuth/Magic Link callback handler
    │   ├── login/
    │   │   └── page.tsx
    │   └── signup/
    │       └── page.tsx
    └── (protected)/
        └── dashboard/
            └── page.tsx
```

### Browser Client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage**: Client Components, real-time subscriptions, client-side auth flows.

### Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignore writes
            // Middleware will handle cookie persistence
          }
        },
      },
    }
  )
}
```

**Usage**: Server Components, Route Handlers, Server Actions.

### Middleware Utility (`lib/supabase/middleware.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Refresh the session and sync cookies
  // This validates the token and refreshes if expired
  await supabase.auth.getUser()

  return response
}
```

---

## Part 3: Middleware for Protected Routes

### Root Middleware (`middleware.ts`)

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Protected route patterns
const PROTECTED_ROUTES = ['/dashboard', '/agents', '/settings', '/profile']
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

export async function middleware(request: NextRequest) {
  // Always refresh the session first
  const response = await updateSession(request)

  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // Check if this is an auth route (login/signup)
  const isAuthRoute = AUTH_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  // If protected route, verify user exists
  if (isProtectedRoute) {
    const supabase = createServerClientForMiddleware(request, response)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If auth route and already logged in, redirect to dashboard
  if (isAuthRoute) {
    const supabase = createServerClientForMiddleware(request, response)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

// Helper to create client in middleware context
function createServerClientForMiddleware(request: NextRequest, response: NextResponse) {
  const { createServerClient } = require('@supabase/ssr')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Security Best Practices

**Critical**: Never rely solely on middleware for authentication. CVE-2025-29927 demonstrated that middleware can be bypassed. Always verify authentication at data access points:

```typescript
// In Server Components and Route Handlers
export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  // Safe to render protected content
  return <Dashboard user={user} />
}
```

**Use `getUser()` not `getSession()`**: The `getUser()` method validates the JWT with Supabase's auth server. The `getSession()` method only reads from cookies and can be spoofed.

---

## Part 4: Authentication Patterns

### Pattern 1: Email/Password Authentication

**Sign Up (`app/auth/signup/actions.ts`)**:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Email confirmation sent
  redirect('/auth/verify-email')
}
```

**Sign In**:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
```

**Sign Out**:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
```

### Pattern 2: Magic Link (Passwordless)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Set to false to require existing account
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for the magic link!' }
}
```

**Configuration Note**: Magic links expire after 1 hour by default. Users can request one every 60 seconds. Configure in Supabase Dashboard: Auth > Providers > Email.

### Pattern 3: OAuth (GitHub)

**Step 1: Configure GitHub OAuth App**

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create new OAuth App:
   - Homepage URL: `https://dashboard-daddy.com`
   - Callback URL: Get from Supabase Dashboard > Auth > Providers > GitHub

**Step 2: Configure Supabase**

1. Go to Supabase Dashboard > Auth > Providers > GitHub
2. Enable GitHub provider
3. Add Client ID and Client Secret from GitHub

**Step 3: Implement OAuth Flow**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGitHub() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: 'read:user user:email',
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to GitHub for authentication
  redirect(data.url)
}
```

### Auth Callback Handler (`app/auth/callback/route.ts`)

This handler is required for OAuth and Magic Link flows:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle token hash for magic links (PKCE flow)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite',
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle OAuth code exchange
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed - redirect to error page
  return NextResponse.redirect(`${origin}/auth/error?error=auth_failed`)
}
```

---

## Part 5: Database Schema for User Management

### Core Schema

Supabase provides `auth.users` table automatically. Never modify this directly. Instead, create a `profiles` table in the `public` schema:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create index for common queries
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_role_idx ON public.profiles(role);
```

### Auto-Create Profile on Signup (Database Trigger)

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to execute on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Warning**: If this trigger fails, user signup will be blocked. Test thoroughly!

### Update Profile Timestamp Trigger

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

### Extended Schema for Dashboard Daddy

```sql
-- Agent configurations (per user)
CREATE TABLE public.agent_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('claude', 'gemini', 'codex')),
  name TEXT NOT NULL,
  api_key_encrypted TEXT, -- Store encrypted, decrypt in application
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
CREATE INDEX agent_configs_user_id_idx ON public.agent_configs(user_id);

-- Task history
CREATE TABLE public.task_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_config_id UUID REFERENCES public.agent_configs(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX task_history_user_id_idx ON public.task_history(user_id);
CREATE INDEX task_history_status_idx ON public.task_history(status);
```

---

## Part 6: Row Level Security (RLS) Policies

### Profiles Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
```

### Agent Configs Policies

```sql
-- Users can view their own agent configs
CREATE POLICY "Users can view own agent configs"
  ON public.agent_configs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can create their own agent configs
CREATE POLICY "Users can create own agent configs"
  ON public.agent_configs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own agent configs
CREATE POLICY "Users can update own agent configs"
  ON public.agent_configs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own agent configs
CREATE POLICY "Users can delete own agent configs"
  ON public.agent_configs
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

### Task History Policies

```sql
-- Users can view their own task history
CREATE POLICY "Users can view own tasks"
  ON public.task_history
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can create tasks for themselves
CREATE POLICY "Users can create own tasks"
  ON public.task_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own pending/running tasks
CREATE POLICY "Users can update own tasks"
  ON public.task_history
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id AND status IN ('pending', 'running'))
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

### RLS Best Practices

1. **Always enable RLS** on public schema tables
2. **Wrap `auth.uid()` in SELECT**: Use `(SELECT auth.uid())` for query optimization
3. **Index policy columns**: Add indexes on `user_id` and other columns used in policies
4. **Separate policies by operation**: Don't use `FOR ALL`; create specific SELECT, INSERT, UPDATE, DELETE policies
5. **Never use `user_metadata` in policies**: User-modifiable data is insecure for authorization

---

## Part 7: Concerns and Trade-offs

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| Middleware bypass (CVE-2025-29927) | Always verify auth at data access points using `getUser()` |
| JWT spoofing | Never trust `getSession()` in server code; use `getUser()` |
| Token in URL (OAuth/Magic Link) | Short-lived codes, PKCE flow enabled by default |
| XSS attacks | HTTP-only cookies prevent JavaScript access |
| CSRF attacks | `SameSite=Lax` cookie attribute provides protection |

### Performance Considerations

| Trade-off | Recommendation |
|-----------|----------------|
| `getUser()` calls auth server every time | Use `getClaims()` in middleware for speed, `getUser()` for critical operations |
| RLS adds query overhead | Index columns used in policies; use `security definer` functions for complex logic |
| Session refresh in middleware | Only runs on matched routes; use specific matcher pattern |

### Operational Considerations

| Concern | Solution |
|---------|----------|
| Email delivery limits (3/hour default) | Configure custom SMTP in Supabase Dashboard |
| Magic link expiration (1 hour) | Configurable in Auth settings; don't exceed 24 hours |
| Rate limiting (1 OTP/60 seconds) | Display appropriate user feedback |
| Profile trigger failure blocks signup | Test thoroughly; add error handling |

### Migration from NextAuth

If proceeding with Supabase Auth, migration steps:

1. Remove packages: `npm uninstall next-auth bcryptjs @types/bcryptjs`
2. Install Supabase: `npm install @supabase/supabase-js @supabase/ssr`
3. Remove NextAuth config files (`auth.ts`, `auth.config.ts`)
4. Create Supabase client utilities
5. Update middleware
6. Migrate existing users (if any) to Supabase

---

## Part 8: Recommended Implementation Order

1. **Set up Supabase project** - Create project at database.new
2. **Configure environment variables** - Add URL and anon key
3. **Create Supabase client utilities** - `client.ts`, `server.ts`, `middleware.ts`
4. **Implement root middleware** - Session refresh and route protection
5. **Create database schema** - Profiles table and triggers
6. **Enable RLS policies** - Start with profiles, then extend
7. **Implement auth flows** - Start with email/password, add OAuth
8. **Create auth callback handler** - Handle OAuth and magic link redirects
9. **Build auth UI components** - Login, signup, logout buttons
10. **Test thoroughly** - Verify RLS, middleware, and all auth flows

---

## Sources

- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase Client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Advanced Server-Side Auth Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Magic Link Authentication](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Next.js + Supabase Cookie-Based Auth (2025 Guide)](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1)
- [How to Set Up Supabase Auth in Next.js (2025 Guide)](https://www.zestminds.com/blog/supabase-auth-nextjs-setup-guide/)
- [Supabase RLS Complete Guide 2025](https://vibeappscanner.com/supabase-row-level-security)
- [Next.js Middleware Supabase Auth](https://supalaunch.com/blog/nextjs-middleware-supabase-auth)
