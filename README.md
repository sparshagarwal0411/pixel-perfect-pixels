# Pixel Perfect Pixels

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49d49e77-2665-4c64-98f1-74546d9638cd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Syncing public Unstop events

1. Run `supabase/events.sql` in the Supabase SQL editor.
2. Install the scraper dependencies with `python -m pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` there. The sync script loads this root `.env` automatically.
4. Run `python scripts/sync_unstop_events.py`.

The same migration creates `profiles` and `event_tracking`. Supabase OAuth users
are linked through `auth.users.id`; event tracking is protected by row-level
security, so each user can read and update only their own statuses. `Registered`
means the user marked the event in AvsarMarg—it does not claim that Unstop
registration was completed.

The sync reads Unstop's public opportunity JSON endpoint, publishes only events
whose Delhi/NCR location can be matched to a known map location, and reports the
number of fetched and skipped opportunities. Use `UNSTOP_MAX_API_PAGES` and
`UNSTOP_API_PAGE_SIZE` to control the sync volume. It uses a service-role key
only on the server; never put `SUPABASE_SERVICE_ROLE_KEY` in `VITE_*` variables
or the browser.
