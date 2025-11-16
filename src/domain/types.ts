/**
 * Core domain types for the offerte vergelijking application
 * Deze types vormen de basis van het domeinmodel
 */

export type UUID = string;

// ============================================================================
// Project & Contractor types
// ============================================================================

export type Project = {
  id: UUID;
  name: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export type Contractor = {
  id: UUID;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
};

// ============================================================================
// Pricing Model & Offer types
// ============================================================================

/**
 * Hoe de aannemer prijzen opbouwt:
 * - EXCL_OPSLAGEN: directe kosten, opslagen apart (AK/W&R)
 * - INCL_OPSLAGEN: opslagen in posten verwerkt
 * - MIXED: deels apart, deels verwerkt
 * - ONBEKEND: nog niet duidelijk
 */
export type PricingModel =
  | "EXCL_OPSLAGEN"
  | "INCL_OPSLAGEN"
  | "MIXED"
  | "ONBEKEND";

export type Offer = {
  id: UUID;
  projectId: UUID;
  contractorId: UUID;
  title: string;
  sourceFileName?: string;
  pricingModel: PricingModel;
  sourceTotalExcl?: number;   // zoals genoemd in brief/offerte
  sourceTotalIncl?: number;
  currency: "EUR";
  isWinningOffer?: boolean;   // true als dit de winnende offerte is
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Offer Revisions
// ============================================================================

/**
 * Een revisie van een offerte (v1 = contract, v2+  = wijzigingen)
 * Elke revisie bevat een set OfferLines
 */
export type OfferRevision = {
  id: UUID;
  offerId: UUID;
  revisionIndex: number;  // 1 = contract, 2, 3, ... = wijzigingen
  label: string;          // "Contract", "Revisie 1 - Meerwerk kelder", etc.
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Master Component (Brikx Bouwstructuur)
// ============================================================================

/**
 * De canonieke bouwstructuur - master template gebaseerd op
 * gedetailleerde open-staart begroting (Hedibouw/Goorhuis stijl)
 */
export type MasterComponent = {
  id: UUID;
  code: string;            // bijv. "21", "21.1", "21.10"
  name: string;            // "Betonwerk kelder", "Fundering", etc.
  parentId?: UUID;
  sortOrder: number;
  isLeaf: boolean;         // true = hieronder hangen offerteposten
};

// ============================================================================
// Price Type & Coverage Status
// ============================================================================

/**
 * Type prijs van een offertelijn
 */
export type PriceType =
  | "VAST"
  | "STELPOST"
  | "INDICATIE"
  | "NOG"          // Nader Overeen Te Komen
  | "ONBEKEND";

/**
 * Of en hoe een mastercomponent gedekt is in een offerte
 */
export type CoverageStatus =
  | "INCLUSIEF"          // opgenomen als vaste post
  | "STELPOST"           // stelpost
  | "INDICATIE"          // globale indicatie
  | "NIET_OPGENOMEN"     // in master wel, in deze offerte niet
  | "ONDERDEEL_ONBEKEND" // we weten nog niet bij welk mastercomponent dit hoort
  | "BUITEN_SCOPE";      // bewust buiten de scope geplaatst

// ============================================================================
// Offer Lines
// ============================================================================

export type OfferLine = {
  id: UUID;
  offerId: UUID;
  revisionId?: UUID;      // NIEUW: koppeling naar revisie (optioneel voor backwards compatibility)
  rawText: string;        // originele regel uit offerte
  code?: string;          // 21.00.0000 etc., indien aanwezig
  description: string;
  quantity?: number;
  unit?: string;
  priceExcl?: number;
  priceIncl?: number;
  priceType: PriceType;
  chapterHint?: string;   // ruwe hint uit parser/AI
  sortOrder: number;      // volgorde in offerte
};

// ============================================================================
// Line Mapping
// ============================================================================

/**
 * Mapping tussen offerteregels en mastercomponenten
 */
export type LineMapping = {
  id: UUID;
  offerLineId: UUID;
  masterComponentId: UUID;
  coverageStatus: CoverageStatus;
  confidence?: number;    // 0..1, optioneel voor AI-suggesties
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Aggregated data types voor analyses
// ============================================================================

/**
 * Aggregatie van offerteregels per mastercomponent per offerte
 */
export type ComponentOfferAggregation = {
  masterComponentId: UUID;
  offerId: UUID;
  totalVastExcl: number;
  totalVastIncl: number;
  totalStelpostExcl: number;
  totalStelpostIncl: number;
  totalIndicatieExcl: number;
  totalIndicatieIncl: number;
  lineCount: number;
  coverageStatus: ComponentCoverageStatus;
};

/**
 * Coverage status voor een compleet mastercomponent in een offerte
 */
export type ComponentCoverageStatus =
  | "VOLLEDIG"           // alle onderdelen zijn vast geprijsd
  | "GEDEELTELIJK"       // mix van vast en stelpost/indicatie
  | "STELPOST_ONLY"      // alleen stelposten
  | "INDICATIE_ONLY"     // alleen indicaties
  | "ONTBREEKT";         // niet opgenomen in deze offerte

/**
 * Totalen per offerte
 */
export type OfferTotals = {
  offerId: UUID;
  totalExcl: number;
  totalIncl: number;
  totalVastIncl: number;
  totalStelpostIncl: number;
  totalIndicatieIncl: number;
  totalUnclearIncl: number;  // niet gemapt
  discrepancyWithSource: number; // verschil met sourceTotalIncl
};

/**
 * Detail voor stelpost dashboard
 */
export type AllowanceDetail = {
  offerId: UUID;
  masterComponentId: UUID;
  masterComponentName: string;
  masterComponentCode: string;
  amount: number;
  percentage: number;  // van totale offerte
  lines: {
    id: UUID;
    description: string;
    amount: number;
  }[];
};

/**
 * Stelpost profiel van een offerte
 */
export type AllowanceProfile = {
  offerId: UUID;
  contractorName: string;
  totalAllowance: number;
  allowancePercentage: number;
  bigAllowances: AllowanceDetail[];  // > bepaalde drempel, bijv. €5000
  allAllowances: AllowanceDetail[];
};

/**
 * Verschil tussen offertes voor een mastercomponent
 */
export type ComponentDifference = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  deltaPerOffer: Record<UUID, number>;   // offerId -> bedrag incl.
  minPrice: number;
  maxPrice: number;
  deltaAmount: number;       // max - min
  deltaPercentage: number;   // (max - min) / min * 100
  isLargeDelta: boolean;     // > bepaalde drempel, bijv. 20%
  reasonHint?: string;       // bv. "Kelder bij A als stelpost, bij B volledig uitgespecificeerd"
};

/**
 * Ontbrekende componenten per offerte
 */
export type MissingComponentInfo = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  missingInOffers: {
    offerId: UUID;
    contractorName: string;
  }[];
};

/**
 * Bucket voor onduidelijke/niet-gemapte regels
 */
export type UnclearBucket = {
  offerId: UUID;
  contractorName: string;
  unclearTotal: number;
  unclearPercentage: number;
  lines: {
    id: UUID;
    description: string;
    amount: number;
    suggestedComponents?: {
      masterComponentId: UUID;
      masterComponentName: string;
      confidence: number;
    }[];
  }[];
};

/**
 * Genormaliseerde view voor eerlijke vergelijking
 * Houdt rekening met verschillende overhead modellen
 */
export type NormalizedOfferView = {
  offerId: UUID;
  contractorName: string;
  pricingModel: PricingModel;

  // Direct costs per component (zonder overhead)
  componentDirectCosts: Record<UUID, number>; // masterComponentId -> bedrag

  // Overhead & winst
  overheadModel: {
    akPercentage?: number;      // Algemene Kosten
    wrPercentage?: number;      // Winst & Risico
    totalOverheadAmount: number;
    isEstimated: boolean;       // true als we een schatting hebben gemaakt
  };

  // Totalen genormaliseerd
  totalDirectCosts: number;
  totalWithOverhead: number;

  warnings: string[];  // bijv. "Overhead is geschat op 15% AK + 5% W&R"
};

/**
 * Complete vergelijkingssamenvatting
 */
export type OfferComparisonSummary = {
  projectId: UUID;
  projectName: string;
  offerIds: UUID[];

  componentDifferences: ComponentDifference[];
  missingComponents: MissingComponentInfo[];
  allowanceProfiles: AllowanceProfile[];
  unclearBuckets: UnclearBucket[];
  normalizedViews: NormalizedOfferView[];

  // Meta-info
  totalComponentsCompared: number;
  largeDiscrepanciesCount: number;
  missingComponentsCount: number;

  generatedAt: string;
};

// ============================================================================
// Error & Warning types
// ============================================================================

export type DomainError = {
  type: "DOMAIN_ERROR";
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type InvalidMappingError = DomainError & {
  code: "INVALID_MAPPING";
  offerLineId: UUID;
  masterComponentId: UUID;
};

export type CalculationDiscrepancyWarning = {
  type: "WARNING";
  code: "CALCULATION_DISCREPANCY";
  offerId: UUID;
  calculatedTotal: number;
  sourceTotal: number;
  difference: number;
  differencePercentage: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: DomainError[];
  warnings: CalculationDiscrepancyWarning[];
};

// ============================================================================
// Revision Diff Types
// ============================================================================

/**
 * Change status voor een offertelijn in een revision diff
 */
export type RevisionLineChangeStatus =
  | "UNCHANGED"   // regel is hetzelfde gebleven
  | "ADDED"       // nieuwe regel in v2
  | "REMOVED"     // regel verwijderd t.o.v. v1
  | "CHANGED";    // regel is gewijzigd (bedrag of beschrijving)

/**
 * Verschil voor een individuele offertelijn tussen revisies
 */
export type RevisionDiffLine = {
  masterComponentId?: UUID;
  masterComponentName?: string;
  lineV1?: OfferLine;      // null als ADDED
  lineV2?: OfferLine;      // null als REMOVED
  status: RevisionLineChangeStatus;
  priceDelta?: number;     // verschil in priceIncl
  descriptionChanged?: boolean;
};

/**
 * Verschil per mastercomponent tussen revisies
 */
export type RevisionDiffComponent = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  totalV1: number;         // totaal bedrag in revisie 1
  totalV2: number;         // totaal bedrag in revisie 2
  delta: number;           // v2 - v1
  deltaPercentage: number; // (delta / v1) * 100
  isSignificant: boolean;  // delta > bepaalde drempel
};

/**
 * Complete diff tussen twee revisies
 */
export type RevisionDiff = {
  fromRevisionId: UUID;
  fromRevisionLabel: string;
  toRevisionId: UUID;
  toRevisionLabel: string;
  offerId: UUID;

  // Aggregated verschillen per component
  componentDiffs: RevisionDiffComponent[];

  // Line-level verschillen
  lineDiffs: RevisionDiffLine[];

  // Totalen
  totalV1: number;
  totalV2: number;
  totalDelta: number;
  totalDeltaPercentage: number;

  // Statistieken
  linesAdded: number;
  linesRemoved: number;
  linesChanged: number;
  linesUnchanged: number;

  generatedAt: string;
};

// ============================================================================
// TechSpec (Technische Omschrijving) - Scope-bron
// ============================================================================

/**
 * Technische omschrijving van het project
 * Basis voor scope-checking: wat moet er volgens het bestek worden geleverd
 */
export type TechSpec = {
  id: UUID;
  projectId: UUID;
  title: string;
  version: string;          // bijv. "Definitief 2025-01-10"
  createdAt: string;
  updatedAt: string;
};

/**
 * Type vereiste in de TechSpec
 */
export type RequirementType = "KOSTEN" | "KWALITEIT" | "PROCES";

/**
 * Een sectie/paragraaf uit de technische omschrijving
 */
export type TechSpecSection = {
  id: UUID;
  techSpecId: UUID;
  headingNumber: string;    // "3", "5.4", "10.1"
  title: string;            // "Grondwerk", "Kelder", "Aluminium buitenkozijnen"
  body: string;             // volledige tekst van de paragraaf
};

/**
 * Koppeling tussen TechSpec sectie en MasterComponent
 */
export type TechSpecMapping = {
  id: UUID;
  sectionId: UUID;
  masterComponentId: UUID;
  requirementType: RequirementType;
};

// ============================================================================
// Scope Coverage Status
// ============================================================================

/**
 * Status van scope-dekking voor een component
 */
export type ComponentScopeStatus =
  | "VOLLEDIG_GEDEKT"           // TechSpec aanwezig + kostenpost(en) aanwezig
  | "ALLEEN_TEKST_GEEN_BEDRAG"  // wel omschreven in TechSpec, geen post in (sub)offertes
  | "ALLEEN_BEDRAG_GEEN_TEKST"  // wel post(en), geen TechSpec-section gekoppeld
  | "ONBEKEND";                 // noch tekst, noch post (of niet in mapping betrokken)

/**
 * Scope-dekking voor één mastercomponent
 */
export type ComponentScopeCoverage = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  scopeStatus: ComponentScopeStatus;

  // Geaggregeerde bedragen (incl. sub-offers)
  totalAmountIncl: number;
  fromMainOfferAmountIncl: number;
  fromSubcontractorsAmountIncl: number;

  // Gekoppelde TechSpec secties
  requirementSections: TechSpecSection[];
};

/**
 * Item dat vereist is maar geen kosten heeft
 */
export type MissingCostItem = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  sectionId: UUID;
  title: string;
  headingNumber: string;
};

/**
 * Item met kosten maar geen TechSpec
 */
export type UnscopedCostItem = {
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;
  totalAmountIncl: number;
};

/**
 * Item met verdachte/lage dekking
 */
export type SuspiciousCoverageItem = {
  sectionId: UUID;
  sectionTitle: string;
  headingNumber: string;
  masterComponentId: UUID;
  masterComponentCode: string;
  masterComponentName: string;

  // Mogelijk via sub-offers gedekt, maar met lage confidence/indicatie
  hasMainOfferCoverage: boolean;
  hasSubcontractCoverage: boolean;
  mainOfferAmountIncl: number;
  subcontractAmountIncl: number;
  coverageConfidence: number; // 0..1
  reason?: string;  // beschrijving waarom verdacht
};

/**
 * Complete scope-rapport voor een offerte
 */
export type OfferScopeReport = {
  offerId: UUID;
  offerTitle: string;
  revisionId?: UUID;
  techSpecId: UUID;
  techSpecTitle: string;

  // Scope-dekking per component
  components: ComponentScopeCoverage[];

  // Vereist maar niet begroot
  missingCostItems: MissingCostItem[];

  // Begroot maar niet in scope
  unscopedCostItems: UnscopedCostItem[];

  // Verdacht gedekt (alleen stelpost, alleen subcontractor, etc.)
  suspiciousCoverageItems: SuspiciousCoverageItem[];

  // Statistieken
  stats: {
    fullyCoveredCount: number;
    textOnlyCount: number;
    amountOnlyCount: number;
    unknownCount: number;
  };

  generatedAt: string;
};

// ============================================================================
// Subcontractors & Onderaannemers-offertes
// ============================================================================

/**
 * Onderaannemer
 */
export type Subcontractor = {
  id: UUID;
  name: string;
  discipline?: string;    // bijv. "Elektro", "Installatie", "Gevel"
  contactName?: string;
  email?: string;
  phone?: string;
};

/**
 * Offerte van een onderaannemer
 */
export type SubcontractOffer = {
  id: UUID;
  projectId: UUID;
  mainOfferId?: UUID;     // optioneel koppeling naar hoofd-offerte
  subcontractorId: UUID;
  title: string;
  sourceFileName?: string;
  sourceTotalIncl?: number;
  currency: "EUR";
  createdAt: string;
  updatedAt: string;
};

/**
 * Regel uit onderaannemer-offerte
 */
export type SubcontractOfferLine = {
  id: UUID;
  subcontractOfferId: UUID;
  rawText: string;
  description: string;
  priceIncl?: number;
  priceType: PriceType;
  code?: string;
  quantity?: number;
  unit?: string;
  chapterHint?: string;
};

/**
 * Mapping van subcontract-regel naar mastercomponent
 */
export type SubcontractLineMapping = {
  id: UUID;
  subcontractOfferLineId: UUID;
  masterComponentId: UUID;
  coverageStatus: CoverageStatus;
  confidence?: number;
};
