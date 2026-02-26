# Coding Conventions & Rules

## Critical Rules

1. **NEVER edit these auto-generated files:**
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env`
   - `supabase/config.toml`
   - `package.json` (use dependency tools)

2. **Design system tokens only** — Never use raw color classes (`text-white`, `bg-black`). Always use semantic tokens (`text-foreground`, `bg-background`, `text-primary`, etc.).

3. **All colors must be HSL** in `index.css` and `tailwind.config.ts`.

4. **Dark mode only** — The app uses a single dark theme. No light mode toggle.

## Styling Patterns

```tsx
// ✅ Correct — use semantic tokens
<div className="bg-card text-card-foreground border-border">
<Button variant="hero">CTA</Button>
<span className="text-muted-foreground">Secondary text</span>
<div className="bg-primary/10 text-primary">Accent area</div>

// ❌ Wrong — raw colors
<div className="bg-gray-800 text-white border-gray-700">
```

## Component Patterns

- Use shadcn/ui primitives from `@/components/ui/`
- Import Supabase client from `@/integrations/supabase/client`
- Use `@tanstack/react-query` for data fetching
- Use `sonner` for toast notifications (`toast.success()`, `toast.error()`)
- Use `zod` for form validation
- Use `lucide-react` for icons
- Use `framer-motion` for animations

## File Organization

- Pages go in `src/pages/`
- Reusable components in `src/components/{domain}/`
- Hooks in `src/hooks/`
- Utility functions in `src/lib/`
- Edge functions in `supabase/functions/{function-name}/index.ts`

## Authentication Pattern

```tsx
// Check auth in components
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  // handle
});

// Check roles
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId);
```

## Data Fetching Pattern

```tsx
// Use React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['unique-key'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', value);
    if (error) throw error;
    return data;
  },
});
```

## Edge Function Pattern

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // ... implementation
});
```

## Navigation Updates

When adding new pages:
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx` (above the `*` catch-all)
3. Add nav link in `src/components/Navigation.tsx` if needed
4. Wrap with `<ProtectedRoute>` if auth required

## SEO Pattern

Every public page should include:
```tsx
<SEO 
  title="Page Title - Cydena"
  description="Meta description under 160 chars"
  keywords="relevant, keywords"
/>
<Schema type="breadcrumb" data={{ items: [...] }} />
```
