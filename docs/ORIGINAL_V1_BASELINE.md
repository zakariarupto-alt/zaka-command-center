# Original V1 Baseline

Production reference: https://zaka-command-center.vercel.app/

## Non-negotiable preservation rules
- Keep the original cream background, black borders, offset card shadows, rounded cards, and pink/orange/yellow header gradient.
- Keep the original sidebar information architecture and module names.
- Preserve current user workflows before introducing backend persistence.
- Do not cut over production until a preview is reviewed.

## Existing modules
Home, LifeOS, Business, Warehouse, Leads, Clients, Research, Finance, Memory Vault, Team, Settings.

## Existing dashboard cards
Calendar, Today's Focus, Book Notes / Daily Learning, AI Briefing, To-Do, Weird Knowledge / Idea Spark.

## Existing persistence
Browser LocalStorage key: `zaka-command-center-v1`.

## Planned V2 durability work
1. Recreate maintainable React/Vite source while preserving V1 UI.
2. Add Supabase persistence and authentication.
3. Add migration/import path from existing LocalStorage.
4. Add backup/export and safer automation endpoints.
5. Use Vercel Preview before production cutover.
