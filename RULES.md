# Dashboard Daddy - Rules & Constraints

## Code Rules

### 1. Type Safety
- ❌ NEVER use `any` type
- ✅ Always define interfaces for API responses
- ✅ Match client types to actual API response format
- ✅ Use TypeScript strict mode

### 2. API Response Handling
- ❌ NEVER assume response format without checking
- ✅ Always verify: Does API return `{ data: [...] }` or `[...]` directly?
- ✅ Handle loading, error, and empty states
- ✅ Add fallback for missing fields

### 3. Component Architecture
- ✅ `'use client'` directive for client-side components
- ✅ Use `dynamic()` with `ssr: false` for browser-only libs
- ✅ Keep server/client boundary clear
- ✅ Use SWR or React Query for data fetching

### 4. Styling
- ✅ Use Tailwind CSS classes
- ✅ Dark theme by default (gray-900/950 backgrounds)
- ✅ Consistent color scheme across pages
- ❌ No inline styles unless necessary

## Testing Rules

### Before ANY Deployment
1. ✅ Run `npm run build` locally - must pass
2. ✅ Check for TypeScript errors
3. ✅ Test all API endpoints with curl

### Before Saying "Done"
1. ✅ Open production URL in browser
2. ✅ Verify data renders (not "Loading..." stuck)
3. ✅ Check browser console for errors
4. ✅ Test on at least 2 pages
5. ✅ Take screenshot as proof

### After Fixing Bugs
1. ✅ Verify the fix with browser test
2. ✅ Check related pages didn't break
3. ✅ Document root cause in TESTING.md

## Deployment Rules

### Vercel Deployment
- ✅ Always use `vercel build --prod` then `vercel deploy --prebuilt --prod`
- ✅ Verify environment variables are set
- ✅ Wait for deployment to complete before testing
- ❌ NEVER say "deployed" without verifying live URL

### Environment Variables
Required on Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Git Rules

### Commits
- ✅ Descriptive commit messages
- ✅ One logical change per commit
- ✅ Include what was fixed and why

### Branches
- `main` - production ready
- `feature/*` - new features
- `fix/*` - bug fixes

## Error Handling Rules

### API Errors
```typescript
// ✅ Correct
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
const data = await response.json();
if (!data || !Array.isArray(data.items)) {
  throw new Error('Invalid response format');
}

// ❌ Wrong - no error handling
const data = await response.json();
return data.items.map(...); // Will crash if items missing
```

### UI Error States
- ✅ Always show error message to user
- ✅ Provide retry option
- ✅ Log errors for debugging
- ❌ NEVER show blank screen on error

## Performance Rules

### Data Fetching
- ✅ Use SWR with `refreshInterval` for real-time data
- ✅ Limit initial data load (e.g., 10-20 items)
- ✅ Implement pagination for large lists
- ❌ NEVER fetch all data at once without limits

### Images
- ✅ Use Next.js `<Image>` component
- ✅ Specify width/height
- ✅ Use appropriate formats (WebP)

## Security Rules

- ❌ NEVER commit secrets to git
- ❌ NEVER expose API keys in client code
- ✅ Use `NEXT_PUBLIC_` prefix only for public values
- ✅ Validate all user inputs
- ✅ Sanitize data before display

## Communication Rules

### When Reporting Status
- ✅ Include screenshot proof
- ✅ List what was verified
- ✅ Be specific about what works/doesn't
- ❌ NEVER say "it works" without browser verification

### When Something Breaks
- ✅ Acknowledge the issue immediately
- ✅ Investigate root cause
- ✅ Fix and verify before reporting done
- ✅ Document in TESTING.md to prevent repeat
