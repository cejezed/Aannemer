/**
 * Zod validation schemas voor alle domain types
 * Gebruikt voor input validatie in API routes en bij mockdata
 */

import { z } from 'zod';

// ============================================================================
// Base schemas
// ============================================================================

export const UUIDSchema = z.string().uuid();

// ============================================================================
// Project & Contractor schemas
// ============================================================================

export const ProjectSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1, "Project naam is verplicht"),
  location: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ContractorSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1, "Contractor naam is verplicht"),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const CreateContractorSchema = ContractorSchema.omit({ id: true });

// ============================================================================
// Pricing Model & Offer schemas
// ============================================================================

export const PricingModelSchema = z.enum([
  "EXCL_OPSLAGEN",
  "INCL_OPSLAGEN",
  "MIXED",
  "ONBEKEND"
]);

export const OfferSchema = z.object({
  id: UUIDSchema,
  projectId: UUIDSchema,
  contractorId: UUIDSchema,
  title: z.string().min(1, "Offerte titel is verplicht"),
  sourceFileName: z.string().optional(),
  pricingModel: PricingModelSchema,
  sourceTotalExcl: z.number().nonnegative().optional(),
  sourceTotalIncl: z.number().nonnegative().optional(),
  currency: z.literal("EUR"),
  isWinningOffer: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateOfferSchema = OfferSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Offer Revision schemas
// ============================================================================

export const OfferRevisionSchema = z.object({
  id: UUIDSchema,
  offerId: UUIDSchema,
  revisionIndex: z.number().int().positive(),
  label: z.string().min(1, "Revision label is verplicht"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateOfferRevisionSchema = OfferRevisionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Master Component schema
// ============================================================================

export const MasterComponentSchema = z.object({
  id: UUIDSchema,
  code: z.string().min(1, "Component code is verplicht"),
  name: z.string().min(1, "Component naam is verplicht"),
  parentId: UUIDSchema.optional(),
  sortOrder: z.number().int().nonnegative(),
  isLeaf: z.boolean(),
});

export const CreateMasterComponentSchema = MasterComponentSchema.omit({ id: true });

// ============================================================================
// Price Type & Coverage Status schemas
// ============================================================================

export const PriceTypeSchema = z.enum([
  "VAST",
  "STELPOST",
  "INDICATIE",
  "NOG",
  "ONBEKEND"
]);

export const CoverageStatusSchema = z.enum([
  "INCLUSIEF",
  "STELPOST",
  "INDICATIE",
  "NIET_OPGENOMEN",
  "ONDERDEEL_ONBEKEND",
  "BUITEN_SCOPE"
]);

// ============================================================================
// Offer Line schema
// ============================================================================

export const OfferLineSchema = z.object({
  id: UUIDSchema,
  offerId: UUIDSchema,
  revisionId: UUIDSchema.optional(),
  rawText: z.string(),
  code: z.string().optional(),
  description: z.string().min(1, "Beschrijving is verplicht"),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  priceExcl: z.number().nonnegative().optional(),
  priceIncl: z.number().nonnegative().optional(),
  priceType: PriceTypeSchema,
  chapterHint: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
});

export const CreateOfferLineSchema = OfferLineSchema.omit({ id: true });

// ============================================================================
// Line Mapping schema
// ============================================================================

export const LineMappingSchema = z.object({
  id: UUIDSchema,
  offerLineId: UUIDSchema,
  masterComponentId: UUIDSchema,
  coverageStatus: CoverageStatusSchema,
  confidence: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateLineMappingSchema = LineMappingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Aggregation schemas
// ============================================================================

export const ComponentCoverageStatusSchema = z.enum([
  "VOLLEDIG",
  "GEDEELTELIJK",
  "STELPOST_ONLY",
  "INDICATIE_ONLY",
  "ONTBREEKT"
]);

export const ComponentOfferAggregationSchema = z.object({
  masterComponentId: UUIDSchema,
  offerId: UUIDSchema,
  totalVastExcl: z.number().nonnegative(),
  totalVastIncl: z.number().nonnegative(),
  totalStelpostExcl: z.number().nonnegative(),
  totalStelpostIncl: z.number().nonnegative(),
  totalIndicatieExcl: z.number().nonnegative(),
  totalIndicatieIncl: z.number().nonnegative(),
  lineCount: z.number().int().nonnegative(),
  coverageStatus: ComponentCoverageStatusSchema,
});

export const OfferTotalsSchema = z.object({
  offerId: UUIDSchema,
  totalExcl: z.number().nonnegative(),
  totalIncl: z.number().nonnegative(),
  totalVastIncl: z.number().nonnegative(),
  totalStelpostIncl: z.number().nonnegative(),
  totalIndicatieIncl: z.number().nonnegative(),
  totalUnclearIncl: z.number().nonnegative(),
  discrepancyWithSource: z.number(),
});

export const AllowanceDetailSchema = z.object({
  offerId: UUIDSchema,
  masterComponentId: UUIDSchema,
  masterComponentName: z.string(),
  masterComponentCode: z.string(),
  amount: z.number().nonnegative(),
  percentage: z.number().min(0).max(100),
  lines: z.array(z.object({
    id: UUIDSchema,
    description: z.string(),
    amount: z.number().nonnegative(),
  })),
});

export const AllowanceProfileSchema = z.object({
  offerId: UUIDSchema,
  contractorName: z.string(),
  totalAllowance: z.number().nonnegative(),
  allowancePercentage: z.number().min(0).max(100),
  bigAllowances: z.array(AllowanceDetailSchema),
  allAllowances: z.array(AllowanceDetailSchema),
});

export const ComponentDifferenceSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  deltaPerOffer: z.record(UUIDSchema, z.number()),
  minPrice: z.number().nonnegative(),
  maxPrice: z.number().nonnegative(),
  deltaAmount: z.number().nonnegative(),
  deltaPercentage: z.number().min(0),
  isLargeDelta: z.boolean(),
  reasonHint: z.string().optional(),
});

export const MissingComponentInfoSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  missingInOffers: z.array(z.object({
    offerId: UUIDSchema,
    contractorName: z.string(),
  })),
});

export const UnclearBucketSchema = z.object({
  offerId: UUIDSchema,
  contractorName: z.string(),
  unclearTotal: z.number().nonnegative(),
  unclearPercentage: z.number().min(0).max(100),
  lines: z.array(z.object({
    id: UUIDSchema,
    description: z.string(),
    amount: z.number().nonnegative(),
    suggestedComponents: z.array(z.object({
      masterComponentId: UUIDSchema,
      masterComponentName: z.string(),
      confidence: z.number().min(0).max(1),
    })).optional(),
  })),
});

export const NormalizedOfferViewSchema = z.object({
  offerId: UUIDSchema,
  contractorName: z.string(),
  pricingModel: PricingModelSchema,
  componentDirectCosts: z.record(UUIDSchema, z.number()),
  overheadModel: z.object({
    akPercentage: z.number().min(0).max(100).optional(),
    wrPercentage: z.number().min(0).max(100).optional(),
    totalOverheadAmount: z.number().nonnegative(),
    isEstimated: z.boolean(),
  }),
  totalDirectCosts: z.number().nonnegative(),
  totalWithOverhead: z.number().nonnegative(),
  warnings: z.array(z.string()),
});

export const OfferComparisonSummarySchema = z.object({
  projectId: UUIDSchema,
  projectName: z.string(),
  offerIds: z.array(UUIDSchema),
  componentDifferences: z.array(ComponentDifferenceSchema),
  missingComponents: z.array(MissingComponentInfoSchema),
  allowanceProfiles: z.array(AllowanceProfileSchema),
  unclearBuckets: z.array(UnclearBucketSchema),
  normalizedViews: z.array(NormalizedOfferViewSchema),
  totalComponentsCompared: z.number().int().nonnegative(),
  largeDiscrepanciesCount: z.number().int().nonnegative(),
  missingComponentsCount: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
});

// ============================================================================
// Error & Warning schemas
// ============================================================================

export const DomainErrorSchema = z.object({
  type: z.literal("DOMAIN_ERROR"),
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const InvalidMappingErrorSchema = DomainErrorSchema.extend({
  code: z.literal("INVALID_MAPPING"),
  offerLineId: UUIDSchema,
  masterComponentId: UUIDSchema,
});

export const CalculationDiscrepancyWarningSchema = z.object({
  type: z.literal("WARNING"),
  code: z.literal("CALCULATION_DISCREPANCY"),
  offerId: UUIDSchema,
  calculatedTotal: z.number(),
  sourceTotal: z.number(),
  difference: z.number(),
  differencePercentage: z.number(),
});

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(DomainErrorSchema),
  warnings: z.array(CalculationDiscrepancyWarningSchema),
});

// ============================================================================
// Revision Diff schemas
// ============================================================================

export const RevisionLineChangeStatusSchema = z.enum([
  "UNCHANGED",
  "ADDED",
  "REMOVED",
  "CHANGED"
]);

export const RevisionDiffLineSchema = z.object({
  masterComponentId: UUIDSchema.optional(),
  masterComponentName: z.string().optional(),
  lineV1: OfferLineSchema.optional(),
  lineV2: OfferLineSchema.optional(),
  status: RevisionLineChangeStatusSchema,
  priceDelta: z.number().optional(),
  descriptionChanged: z.boolean().optional(),
});

export const RevisionDiffComponentSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  totalV1: z.number().nonnegative(),
  totalV2: z.number().nonnegative(),
  delta: z.number(),
  deltaPercentage: z.number(),
  isSignificant: z.boolean(),
});

export const RevisionDiffSchema = z.object({
  fromRevisionId: UUIDSchema,
  fromRevisionLabel: z.string(),
  toRevisionId: UUIDSchema,
  toRevisionLabel: z.string(),
  offerId: UUIDSchema,
  componentDiffs: z.array(RevisionDiffComponentSchema),
  lineDiffs: z.array(RevisionDiffLineSchema),
  totalV1: z.number().nonnegative(),
  totalV2: z.number().nonnegative(),
  totalDelta: z.number(),
  totalDeltaPercentage: z.number(),
  linesAdded: z.number().int().nonnegative(),
  linesRemoved: z.number().int().nonnegative(),
  linesChanged: z.number().int().nonnegative(),
  linesUnchanged: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
});

// ============================================================================
// TechSpec schemas
// ============================================================================

export const RequirementTypeSchema = z.enum(["KOSTEN", "KWALITEIT", "PROCES"]);

export const TechSpecSchema = z.object({
  id: UUIDSchema,
  projectId: UUIDSchema,
  title: z.string().min(1),
  version: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TechSpecSectionSchema = z.object({
  id: UUIDSchema,
  techSpecId: UUIDSchema,
  headingNumber: z.string(),
  title: z.string().min(1),
  body: z.string(),
});

export const TechSpecMappingSchema = z.object({
  id: UUIDSchema,
  sectionId: UUIDSchema,
  masterComponentId: UUIDSchema,
  requirementType: RequirementTypeSchema,
});

export const ComponentScopeStatusSchema = z.enum([
  "VOLLEDIG_GEDEKT",
  "ALLEEN_TEKST_GEEN_BEDRAG",
  "ALLEEN_BEDRAG_GEEN_TEKST",
  "ONBEKEND"
]);

export const ComponentScopeCoverageSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  scopeStatus: ComponentScopeStatusSchema,
  totalAmountIncl: z.number().nonnegative(),
  fromMainOfferAmountIncl: z.number().nonnegative(),
  fromSubcontractorsAmountIncl: z.number().nonnegative(),
  requirementSections: z.array(TechSpecSectionSchema),
});

export const MissingCostItemSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  sectionId: UUIDSchema,
  title: z.string(),
  headingNumber: z.string(),
});

export const UnscopedCostItemSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  totalAmountIncl: z.number().nonnegative(),
});

export const SuspiciousCoverageItemSchema = z.object({
  sectionId: UUIDSchema,
  sectionTitle: z.string(),
  headingNumber: z.string(),
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  hasMainOfferCoverage: z.boolean(),
  hasSubcontractCoverage: z.boolean(),
  mainOfferAmountIncl: z.number().nonnegative(),
  subcontractAmountIncl: z.number().nonnegative(),
  coverageConfidence: z.number().min(0).max(1),
  reason: z.string().optional(),
});

export const OfferScopeReportSchema = z.object({
  offerId: UUIDSchema,
  offerTitle: z.string(),
  revisionId: UUIDSchema.optional(),
  techSpecId: UUIDSchema,
  techSpecTitle: z.string(),
  components: z.array(ComponentScopeCoverageSchema),
  missingCostItems: z.array(MissingCostItemSchema),
  unscopedCostItems: z.array(UnscopedCostItemSchema),
  suspiciousCoverageItems: z.array(SuspiciousCoverageItemSchema),
  stats: z.object({
    fullyCoveredCount: z.number().int().nonnegative(),
    textOnlyCount: z.number().int().nonnegative(),
    amountOnlyCount: z.number().int().nonnegative(),
    unknownCount: z.number().int().nonnegative(),
  }),
  generatedAt: z.string().datetime(),
});

// ============================================================================
// Subcontractor schemas
// ============================================================================

export const SubcontractorSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1),
  discipline: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const SubcontractOfferSchema = z.object({
  id: UUIDSchema,
  projectId: UUIDSchema,
  mainOfferId: UUIDSchema.optional(),
  subcontractorId: UUIDSchema,
  title: z.string().min(1),
  sourceFileName: z.string().optional(),
  sourceTotalIncl: z.number().nonnegative().optional(),
  currency: z.literal("EUR"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SubcontractOfferLineSchema = z.object({
  id: UUIDSchema,
  subcontractOfferId: UUIDSchema,
  rawText: z.string(),
  description: z.string().min(1),
  priceIncl: z.number().optional(),
  priceType: PriceTypeSchema,
  code: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  chapterHint: z.string().optional(),
});

export const SubcontractLineMappingSchema = z.object({
  id: UUIDSchema,
  subcontractOfferLineId: UUIDSchema,
  masterComponentId: UUIDSchema,
  coverageStatus: CoverageStatusSchema,
  confidence: z.number().min(0).max(1).optional(),
});

// ============================================================================
// Budget schemas
// ============================================================================

export const BudgetStatusSchema = z.enum([
  "WITHIN_BUDGET",
  "APPROACHING_LIMIT",
  "OVER_BUDGET"
]);

export const ProjectBudgetSchema = z.object({
  id: UUIDSchema,
  projectId: UUIDSchema,
  name: z.string().min(1),
  totalBudgetIncl: z.number().nonnegative(),
  currency: z.literal("EUR"),
  isBaseline: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ComponentBudgetSchema = z.object({
  id: UUIDSchema,
  projectBudgetId: UUIDSchema,
  masterComponentId: UUIDSchema,
  budgetAmountIncl: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const BudgetVarianceSchema = z.object({
  masterComponentId: UUIDSchema,
  masterComponentCode: z.string(),
  masterComponentName: z.string(),
  budgetAmountIncl: z.number().nonnegative(),
  actualAmountIncl: z.number().nonnegative(),
  variance: z.number(),
  variancePercentage: z.number(),
  status: BudgetStatusSchema,
});

export const BudgetReportSchema = z.object({
  projectBudgetId: UUIDSchema,
  projectBudgetName: z.string(),
  offerId: UUIDSchema.optional(),
  offerTitle: z.string().optional(),
  totalBudgetIncl: z.number().nonnegative(),
  totalActualIncl: z.number().nonnegative(),
  totalVariance: z.number(),
  totalVariancePercentage: z.number(),
  overallStatus: BudgetStatusSchema,
  componentVariances: z.array(BudgetVarianceSchema),
  stats: z.object({
    componentsWithinBudget: z.number().int().nonnegative(),
    componentsApproachingLimit: z.number().int().nonnegative(),
    componentsOverBudget: z.number().int().nonnegative(),
  }),
  generatedAt: z.string().datetime(),
});
