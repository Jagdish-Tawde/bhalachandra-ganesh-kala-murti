# Bhalachandra Ganesh Kala Murti - Project Notes

## Current Stack

- Frontend: React + Vite
- Styling: custom CSS
- Hosting: Cloudflare Pages
- Backend/data: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth for admin login
- Image storage: Supabase Storage bucket `murti-images`

## Local Commands

```bash
npm install
npm run dev
npm run build
```

Local public site:

```text
http://127.0.0.1:5173/
```

Local admin:

```text
http://127.0.0.1:5173/#admin
```

## Supabase Environment Variables

Keep these in `.env` locally and Cloudflare Pages environment variables:

```env
VITE_SUPABASE_URL=https://ctpcfvcdelgamwlpkwpc.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

Do not commit `.env`.

Do not share or commit:

- service role key
- secret key
- JWT secret
- database password

## Supabase Tables

Main tables:

- `site_settings`
- `murtis`
- `inquiries`

Storage bucket:

- `murti-images`

SQL setup is in:

```text
supabase-schema.sql
```

Run the full file in Supabase SQL Editor whenever policies/schema are updated.

## Current Features

Public website:

- Responsive homepage
- Murti listing
- Search by murti name
- Category filter
- Category section
- Murti detail page
- WhatsApp enquiry button
- Website inquiry form
- Festival season mode banner
- Custom favicon/logo

Admin:

- Supabase Auth login
- Logout from sidebar and top bar
- Dashboard stats
- Add murti
- Upload image with browser-side compression
- Save image to Supabase Storage
- Save murti to Supabase database
- Search current murtis
- Update status
- Delete murti
- Gallery panel
- Live inquiries panel
- Website settings

## Admin URL

On live Cloudflare URL:

```text
https://your-site.pages.dev/#admin
```

Public users do not see the admin link in the menu.

## Murti Status Meaning

- `Available`: shown publicly and open for inquiry
- `Booked`: shown publicly as booked
- `Reserved`: shown publicly as reserved
- `Sold`: shown publicly as sold
- `Hidden`: kept in admin but hidden from public website

Delete permanently removes a murti from admin and public website.

## Website Settings

Settings are stored in Supabase `site_settings`.

Fields:

- Shop Name
- WhatsApp Number
- Default Visibility
- Festival Season Mode

Default Visibility controls the default status when adding a new murti.

Festival Season Mode:

- `On`: booking-focused hero text and festival banner
- `Off`: normal website messaging

## WhatsApp Behavior

Admin saves a number like:

```text
+91 89752 17511
```

The app normalizes it to:

```text
918975217511
```

Desktop opens:

```text
https://web.whatsapp.com/send?phone=...
```

Mobile opens:

```text
https://wa.me/...
```

Messages are prefilled, for example:

```text
Hi, I would like to inquire about Dagdu Sheth Ganpati from Bhalachandra Ganesh Kala Murti.
```

## Image Compression

When admin uploads a photo:

- Browser resizes max dimension to `1400px`
- Converts to JPEG
- Uses quality `72%`
- Uploads compressed image to Supabase Storage

This helps keep Supabase storage usage low.

## Deployment

Cloudflare Pages settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

Cloudflare environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

After GitHub is connected, redeploy by pushing code:

```bash
git add .
git commit -m "Update website"
git push
```

Supabase data changes do not need redeploy:

- murtis
- images
- status
- settings
- inquiries

Redeploy is only needed for code/design/feature changes.

## Free Plan Limits

### Cloudflare Pages Free

- 500 builds/month
- 1 build at a time
- 20 minute build timeout
- 20,000 files per site
- 25 MiB max static asset size
- 100 custom domains per Pages project
- Unlimited static requests/bandwidth for Pages

Docs:

```text
https://developers.cloudflare.com/pages/platform/limits/
https://pages.cloudflare.com/
```

### Supabase Free

- 2 active free projects
- 500 MB database size
- 1 GB file storage
- 50 MB max file upload size
- 5 GB egress + 5 GB cached egress
- 50,000 monthly active auth users
- Unlimited API requests
- Free projects may pause after 1 week of inactivity

Docs:

```text
https://supabase.com/pricing
https://supabase.com/docs/guides/storage/uploads/file-limits
https://supabase.com/docs/guides/storage/serving/bandwidth
```

Approx photo capacity after compression:

```text
300 KB each -> around 3,300 photos
500 KB each -> around 2,000 photos
800 KB each -> around 1,250 photos
1 MB each -> around 1,000 photos
```

Practical safe range on Supabase Free:

```text
500-1000 optimized photos
```

## Git Notes

Ignore:

```gitignore
.env
node_modules
dist
.DS_Store
.idea/
```

If `.idea` was staged:

```bash
git rm -r --cached .idea
```

Normal update flow:

```bash
git add .
git commit -m "Update website"
git push
```

## Important Security Notes

The frontend uses the Supabase publishable/anon key. That is expected.

Security is enforced by Supabase Row Level Security policies.

Do not add public insert/update/delete policies for `murtis`.

Admin writes should require authenticated Supabase users.

Before final public launch:

- Keep only real admin users in Supabase Auth
- Confirm `.env` is not committed
- Confirm `service_role` key is never used in frontend
- Test add/update/delete/inquiry on live site
