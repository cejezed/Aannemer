# Offerte Vergelijking App

Een professionele webapp voor architecten om aannemersoffertes te structureren en eerlijk te vergelijken.

## Functionaliteit

Deze applicatie helpt architecten om:

- **Offertes structureren** op basis van een canonieke bouwstructuur (master template)
- **Eerlijk vergelijken** tussen verschillende aannemers, rekening houdend met verschillende overhead modellen
- **Stelposten analyseren** en risicoprofiel per aannemer inzichtelijk maken
- **Ontbrekende onderdelen** identificeren in offertes
- **Onduidelijke posten** beheren en toewijzen aan de juiste bouwonderdelen

## Technische Stack

- **Framework**: Next.js 15 met App Router
- **Taal**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Validatie**: Zod schemas
- **Testing**: Vitest
- **Architectuur**: Domain-Driven Design met pure functions

## Projectstructuur

```
src/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   │   └── projects/
│   │       └── [projectId]/
│   │           ├── comparison/   # Vergelijkingssamenvatting
│   │           ├── offers/       # Offertes per project
│   │           ├── structure/    # Bouwstructuur met aggregaties
│   │           └── unclearlines/ # Onduidelijke regels
│   ├── projects/
│   │   └── [projectId]/
│   │       └── samenvatting/     # Samenvatting UI
│   └── page.tsx              # Homepage
├── components/
│   └── ui/                   # Herbruikbare UI componenten
│       ├── Badge.tsx         # Status badges
│       ├── Card.tsx          # Card layout
│       └── Table.tsx         # Data tables
├── domain/                   # Domain logic (pure functions)
│   ├── types.ts              # TypeScript domain types
│   ├── schemas.ts            # Zod validation schemas
│   ├── calculateTotals.ts    # Berekeningen
│   ├── aggregateByMaster.ts  # Aggregaties per component
│   ├── allowanceDashboard.ts # Stelpost analyses
│   ├── normalizeForComparison.ts # Overhead normalisatie
│   ├── comparisonSummary.ts  # Vergelijkingssamenvatting
│   └── __tests__/            # Unit tests
├── mocks/                    # Mock data voor demo
│   ├── masterComponents.ts   # Bouwstructuur (Hedibouw/Goorhuis-stijl)
│   ├── offers.ts             # 3 voorbeeld offertes
│   ├── lineMappings.ts       # Mappings naar master
│   └── index.ts              # Data loader
└── lib/                      # Utilities
    └── formatCurrency.ts     # Formatting helpers
```

## Data Model

### Kern concepten

1. **MasterComponent**: Canonieke bouwstructuur (bijv. "21.2 Kelderwanden beton")
2. **Offer**: Een offerte van een aannemer
3. **OfferLine**: Een regel in een offerte
4. **LineMapping**: Koppeling tussen offertelijn en mastercomponent
5. **PricingModel**:
   - `EXCL_OPSLAGEN`: Opslagen apart vermeld (AK/W&R)
   - `INCL_OPSLAGEN`: Opslagen verwerkt in posten
6. **PriceType**: `VAST`, `STELPOST`, `INDICATIE`, `NOG`, `ONBEKEND`

### Demo Data

De applicatie bevat 3 realistische voorbeeld-offertes:

1. **Bouwbedrijf De Vries** (€465.850 incl. BTW)
   - EXCL_OPSLAGEN model (expliciete 12% AK + 5% W&R)
   - Volledig uitgespecificeerd
   - Alle onderdelen vast geprijsd

2. **Aannemersbedrijf Jansen** (€478.500 incl. BTW)
   - INCL_OPSLAGEN model
   - Mix van vaste prijzen en stelposten
   - Kelderwanden als stelpost (€22.000)
   - Dakconstructie als stelpost (€36.000)

3. **Bouwgroep Amsterdam** (€442.000 incl. BTW)
   - INCL_OPSLAGEN model
   - Veel stelposten en indicaties
   - **Kelder ontbreekt volledig** (kelderwanden en keldervloer niet opgenomen)
   - Veel onderdelen als stelpost (kozijnen, tegelwerk, stucwerk)

## Domain Services

### calculateTotals.ts
- Bereken totalen per offerte
- Check discrepanties met brontotalen
- Separeer totalen per prijstype

### aggregateByMaster.ts
- Groepeer offerteregels per mastercomponent
- Bepaal coverage status (VOLLEDIG, GEDEELTELIJK, STELPOST_ONLY, ONTBREEKT)
- Aggregeer naar parent components

### allowanceDashboard.ts
- Genereer stelpost profielen per offerte
- Identificeer grote stelposten (>€5000)
- Bereken stelpost percentages

### normalizeForComparison.ts
- Normaliseer offertes met verschillende overhead modellen
- Scheid directe kosten van overhead
- Schat overhead voor INCL_OPSLAGEN offertes

### comparisonSummary.ts
- Genereer complete vergelijkingssamenvatting
- Analyseer prijsverschillen per component
- Identificeer ontbrekende onderdelen
- Verzamel onduidelijke posten

## API Routes

- `GET /api/projects` - Lijst van projecten
- `GET /api/projects/:id` - Project details
- `GET /api/projects/:id/offers` - Offertes per project
- `GET /api/projects/:id/comparison` - Complete vergelijkingssamenvatting
- `GET /api/projects/:id/structure` - Bouwstructuur met aggregaties
- `GET /api/projects/:id/unclearlines` - Onduidelijke regels

## UI Componenten

### Badge
- `PriceTypeBadge`: Kleurcodering voor VAST/STELPOST/INDICATIE
- `CoverageStatusBadge`: Status van component coverage
- `ComponentCoverageStatusBadge`: VOLLEDIG/GEDEELTELIJK/ONTBREEKT

### Card, Table
Herbruikbare layout componenten met consistente styling.

## Installation & Usage

```bash
# Installeer dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000

# Run tests
npm test

# Build voor productie
npm run build
```

## Testing

Unit tests voor alle domain services:

```bash
npm test
```

Test coverage:
- calculateTotals: ✓ 7 tests
- aggregateByMaster: ✓ 3 tests
- comparisonSummary: ✓ 3 tests (met echte mock data)

## Design Principles

1. **Pure Functions**: Alle domain logic is side-effect vrij
2. **Type Safety**: Strict TypeScript + Zod validatie
3. **Separation of Concerns**: Domain logic gescheiden van UI
4. **Testability**: Alle berekeningen unit tested
5. **Scalability**: Voorbereid op echte database (Supabase/Postgres)

## Toekomstige Features

- [ ] PDF parser integratie voor automatische offerte-extractie
- [ ] AI-suggesties voor onduidelijke posten
- [ ] Database persistentie (Supabase)
- [ ] Export naar Excel/PDF
- [ ] Grafische vergelijkingen (charts)
- [ ] Multi-project ondersteuning
- [ ] User authentication

## Licentie

Proprietary - Ontwikkeld voor architecten
