# Price Radar — Supabase Email Templates

## Brand tokens used

| Token        | Value     | Usage                        |
|--------------|-----------|------------------------------|
| Primary      | `#2563EB` | Button background, links     |
| Primary hover| `#1D4ED8` | Button hover                 |
| Foreground   | `#0F1729` | Headings, strong text        |
| Muted text   | `#64748B` | Body copy                    |
| Subtle text  | `#94A3B8` | Footer, fallback links       |
| Border       | `#E2E8F0` | Card border, dividers        |
| Background   | `#F1F5F9` | Email page background        |
| Card bg      | `#ffffff` | Card surface                 |
| Accent-subtle| `#EFF6FF` | Logo badge background        |
| Destructive  | `#DC2626` | Security notice border       |

## Files

| File                  | Template name in Supabase        |
|-----------------------|----------------------------------|
| `confirm-signup.html` | **Confirm signup**               |
| `password-reset.html` | **Reset password**               |
| `magic-link.html`     | **Magic link**                   |
| `invite.html`         | **Invite user**                  |

## How to apply in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → select your project
2. Navigate to **Authentication → Email Templates**
3. For each template:
   - Click the template name (e.g. "Confirm signup")
   - Delete the existing content
   - Paste the corresponding HTML file content
   - Click **Save**

### Navigation path
```
Authentication
  └── Email Templates
        ├── Confirm signup       ← confirm-signup.html
        ├── Reset password       ← password-reset.html
        ├── Magic link           ← magic-link.html
        └── Invite user          ← invite.html
```

## Adding a hosted logo

Once you have a logo hosted at a public URL (e.g. Supabase Storage or CDN):

1. Open each template
2. Find the comment `<!-- <img src="https://yourdomain.com/logo.png" ... -->`
3. Uncomment the `<img>` tag and update the `src` URL
4. Remove or hide the text-based logo badge below it

Recommended logo specs for email:
- Format: PNG with transparent background
- Width: 140px (2x → 280px for retina, use `width="140"` attribute)
- Height: ≤ 48px

## Supabase variables used

| Variable                | Description                              |
|-------------------------|------------------------------------------|
| `{{ .ConfirmationURL }}` | The verification/action URL             |
| `{{ .Email }}`           | The recipient's email address           |

## Email client compatibility

All templates use:
- Table-based layout (Outlook safe)
- Inline styles only (Gmail safe)
- VML button fallback for Outlook rendering
- `word-break: break-all` on fallback URLs
- Conditional comments `<!--[if mso]>` for Outlook
