# Accounts on the site (email + Google) — setup

The game's site can let players sign in so their progress is saved in the cloud (every device, nothing lost when the browser is cleared). The code is already in the game (`source/src/71x-v51acct.js`); it stays hidden until the two values below are filled in. Free tier is enough.

## 1. Create the project
1. Go to <https://supabase.com>, sign in with GitHub, **New project** (any name, e.g. `overdrive`; pick a region near your players; save the database password somewhere).
2. **Project Settings → API**: copy the **Project URL** (`https://xxxx.supabase.co`) and the **anon public** key. The anon key is public by design (it goes into the page); never share the `service_role` key.

## 2. Create the table (SQL Editor → New query → paste → Run)
```sql
create table if not exists public.docs (
  path  text primary key,
  col   text not null,
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  data  jsonb not null default '{}'::jsonb,
  ts    timestamptz not null default now()
);
create index if not exists docs_col on public.docs (col);
alter table public.docs enable row level security;
-- everyone may read the public parts (leaderboards, ghosts, profiles); a private save only by its owner
create policy "read"       on public.docs for select using (col <> 'data' or owner = auth.uid());
-- a player writes only documents whose path carries their own id
create policy "insert own" on public.docs for insert to authenticated with check (owner = auth.uid() and position(auth.uid()::text in path) > 0);
create policy "update own" on public.docs for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "delete own" on public.docs for delete to authenticated using (owner = auth.uid());
-- "DELETE MY ACCOUNT" in the game
create or replace function public.delete_me() returns void language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
```

## 3. Allow the site to receive sign-ins
**Authentication → URL Configuration**
- Site URL: `https://undertaker132.github.io/overdrive-ninja/`
- Redirect URLs: add the same address.

Email sign-in now works (the email has a link; to also get a 6-digit code, in **Authentication → Email Templates → Magic Link** add `{{ .Token }}` to the text).

## 4. Google (optional)
1. <https://console.cloud.google.com> → new project → **APIs & Services → OAuth consent screen** (External, app name, your email) → **Credentials → Create credentials → OAuth client ID** → *Web application*.
2. Authorized redirect URI: `https://xxxx.supabase.co/auth/v1/callback` (your Project URL + `/auth/v1/callback`).
3. Copy the Client ID and Client secret into Supabase **Authentication → Providers → Google**, enable it.

## 5. Turn it on in the game
In `source/src/71x-v51acct.js` set:
```js
const SB = Object.assign({ url: 'https://xxxx.supabase.co', key: '<anon public key>' }, …
```
then build (`python3 source/build.py`) and release. (Or send both values to Claude and it will do it.)

---

# חשבונות באתר (אימייל + גוגל) — הקמה בקצרה
1. ב־supabase.com פותחים פרויקט חדש, ומעתיקים מ־Project Settings → API את **Project URL** ואת **anon public key** (המפתח הזה ציבורי; את `service_role` לא משתפים).
2. ב־SQL Editor מדביקים את קטע ה־SQL שלמעלה ולוחצים Run.
3. ב־Authentication → URL Configuration שמים את כתובת האתר ב־Site URL וב־Redirect URLs.
4. (רשות) גוגל: לפי סעיף 4 למעלה.
5. שולחים ל־Claude את ה־URL וה־anon key, והוא מחבר ומעלה גרסה.
