# Supabase Setup Guide

Dit document beschrijft hoe je Supabase configureert voor de Actuals tracking functionaliteit.

## Overzicht

De app kan werkelijke kosten en uren tracken via Supabase. Dit maakt het mogelijk om:
- **Werkelijke kosten** en **uren** bij te houden per bouwcomponent
- **Budget vs werkelijk** vergelijkingen te maken
- **Integratie met Personal Coach app** voor automatische sync

**Belangrijk**: De app werkt ook **zonder** Supabase configuratie. In dat geval wordt demo data (mocks) gebruikt.

## Stap 1: Maak een Supabase Project

1. Ga naar [https://supabase.com](https://supabase.com)
2. Maak een account aan (gratis tier is voldoende voor development)
3. Klik op "New Project"
4. Vul in:
   - **Project name**: bijv. "aannemer-offerte-app"
   - **Database password**: kies een sterk wachtwoord
   - **Region**: kies de dichtstbijzijnde regio (bijv. West EU voor Nederland)
5. Klik "Create new project"

## Stap 2: Run Database Migrations

De database schema's zijn klaar in `/supabase/migrations/`.

### Optie A: Via Supabase Dashboard (makkelijkst)

1. Open je project in Supabase Dashboard
2. Ga naar **SQL Editor** (in de sidebar)
3. Open het bestand `/supabase/migrations/001_create_actuals_tables.sql`
4. Kopieer de hele inhoud
5. Plak in de SQL Editor
6. Klik op "Run"

### Optie B: Via Supabase CLI

```bash
# Installeer Supabase CLI
npm install -g supabase

# Login
supabase login

# Link naar je project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Stap 3: Configureer Environment Variables

1. Kopieer `.env.example` naar `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Haal je Supabase credentials op:
   - Ga naar je Supabase project
   - Klik op **Settings** (tandwiel icoon)
   - Ga naar **API**
   - Kopieer:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (klik op "Reveal" eerst)

3. Vul je `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

4. **Belangrijk**: Voeg `.env.local` toe aan `.gitignore` (staat er al in!)

## Stap 4: Test de Connectie

1. Start de development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000/projects/project-001/actuals`

3. Je zou nu:
   - **MOCK data** moeten zien als Supabase niet geconfigureerd is
   - **SUPABASE data** moeten zien als alles correct is ingesteld (maar initieel leeg)

## Stap 5: Voeg Test Data Toe (Optioneel)

Je kunt handmatig test data toevoegen via SQL Editor:

```sql
-- Voorbeeld hour entry
INSERT INTO hour_entries (
  project_id,
  master_component_id,
  worker_name,
  hours,
  hourly_rate,
  date,
  description,
  source
) VALUES (
  'project-001',
  'mc-10',
  'Jan de Vries',
  8,
  45.00,
  '2024-11-16',
  'Grondwerk begonnen',
  'MANUAL'
);

-- Voorbeeld cost entry
INSERT INTO cost_entries (
  project_id,
  master_component_id,
  cost_type,
  amount_incl,
  description,
  date,
  supplier,
  source
) VALUES (
  'project-001',
  'mc-10',
  'MATERIAL',
  2500.00,
  'Afvoer grond',
  '2024-11-16',
  'Grondbank Amsterdam',
  'MANUAL'
);
```

## Personal Coach App Integratie

Als je al een Personal Coach app hebt met actuals data:

### Optie 1: Zelfde Supabase Database

Gebruik gewoon dezelfde database. Voeg de tables toe via de migratie.

### Optie 2: Aparte Supabase Database

Configureer aparte credentials in `.env.local`:

```env
PERSONAL_COACH_SUPABASE_URL=https://andere-project.supabase.co
PERSONAL_COACH_SUPABASE_KEY=eyJhbGc...
```

Dan kun je een sync-functie bouwen die data kopieert van Personal Coach naar deze app.

## Row Level Security (RLS)

⚠️ **Let op**: De huidige RLS policies staan alle operaties toe voor authenticated users.

Voor productie moet je dit aanscherpen:

```sql
-- Voorbeeld: Alleen eigen project data lezen
CREATE POLICY "Users can only view their own project data"
  ON hour_entries FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
```

## Troubleshooting

### "Supabase not configured" melding

✅ **Normaal!** De app werkt met mock data als Supabase niet is ingesteld.

Om Supabase te activeren, controleer:
- `.env.local` bestaat en bevat de juiste keys
- Development server is herstart na toevoegen van `.env.local`

### Connection errors

- Check of je **Project URL** klopt (moet beginnen met `https://`)
- Check of de **anon key** en **service role key** niet zijn verwisseld
- Check of je database actief is in Supabase Dashboard

### RLS errors ("Row level security policy violation")

De migrations enablen RLS met open policies. Als je handmatig policies hebt aangepast:

```sql
-- Tijdelijk RLS uitzetten voor development
ALTER TABLE hour_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries DISABLE ROW LEVEL SECURITY;
```

## Database Schema Overzicht

De migratie maakt 4 tables aan:

1. **hour_entries**: Gedetailleerde urenregistratie per medewerker
2. **cost_entries**: Kostenposten (materiaal, apparatuur, onderaannemers)
3. **project_actuals**: Geaggregeerde actuals per component per periode
4. **personal_coach_sync**: Sync status met Personal Coach app

Zie `src/lib/supabase/database.types.ts` voor volledige TypeScript types.

## Volgende Stappen

Na setup kun je:
- 📊 **Actuals invoeren** via SQL of later een invoer-UI bouwen
- 🔄 **Sync configureren** met Personal Coach app
- 📈 **Budget vs Werkelijk** vergelijkingen bekijken op `/actuals` pagina
- 📱 **API endpoints** gebruiken voor externe integraties

---

Vragen? Check de [Supabase Docs](https://supabase.com/docs) of open een issue.
