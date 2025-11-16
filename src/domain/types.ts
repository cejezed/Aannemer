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
