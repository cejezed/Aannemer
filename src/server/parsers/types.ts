/**
 * Types for offer parsing with LLM
 */

export type ParsedOfferLineCandidate = {
  description: string;
  priceIncl?: number;
  priceType: 'VAST' | 'STELPOST' | 'INDICATIE' | 'NOG' | 'ONBEKEND';
  rawText?: string;
  code?: string;
  quantity?: number;
  unit?: string;
};

export type OfferParseResult = {
  lines: ParsedOfferLineCandidate[];
  warnings: string[];
};
