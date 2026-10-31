# AdWorth website

Static multi-page site (no build step) with a Supabase backend.

```
index.html          public website
admin/index.html    admin panel (Supabase login)
css/styles.css      design tokens, layout, glass, motion
js/config.js        Supabase URL and anon key  <- you edit this
js/data.js          all Supabase reads/writes
js/state.js         shared state and helpers
js/site.js          public page rendering and enquiry form
js/motion.js        scroll and reveal animations
js/admin.js         admin panel
js/media.js         resizes photos and makes video preview stills before upload
supabase/schema.sql tables, security rules, storage bucket, starter content
DESIGN.md           design system
```

## Setup

1. Create a project at supabase.com.
2. SQL Editor: paste `supabase/schema.sql` and run it.
3. Authentication -> Users -> Add user: create your admin email and password.
4. Authentication -> Sign In / Providers -> Email: turn off "Allow new users to sign up". Any signed-in user is an admin.
5. Project Settings -> API: copy the Project URL and the anon public key into `js/config.js`.
6. Push to GitHub, then Settings -> Pages -> deploy from `main`, root folder.
7. Open `/admin/`, sign in, then add your WhatsApp number, social links and work.

Run locally with `python3 -m http.server 8000` (ES modules need a server, not file://).

## Live updates

The public site and admin update on their own when content changes. If you set up Supabase before this feature existed, run `supabase/realtime.sql` once in the SQL Editor. Without it the pages still refresh every 45 seconds and when you return to the tab.

## Project galleries

Run `supabase/migrate-gallery.sql` once in the SQL Editor (after `schema.sql`). It adds client, result and testimonial fields, a table for each project's photos and videos, and carries over existing projects. Safe to run again.
