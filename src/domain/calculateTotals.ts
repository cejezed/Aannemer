/**
 * Domain service voor het berekenen van totalen
 * Pure functies zonder side effects
 */

import type {
  OfferLine,
  Offer,
  OfferTotals,
  CalculationDiscrepancyWarning,
} from './types';

/**
 * Bereken totalen van alle offerteregels
 */
export function calculateOfferTotals(offerLines: OfferLine[]): {
  totalExcl: number;
  totalIncl: number;
} {
  let totalExcl = 0;
  let totalIncl = 0;

  for (const line of offerLines) {
    if (line.totalPriceExcl !== undefined) {
      totalExcl += line.totalPriceExcl;
    }
    if (line.totalPriceIncl !== undefined) {
      totalIncl += line.totalPriceIncl;
    }
  }

  return {
    totalExcl: roundToTwoDecimals(totalExcl),
    totalIncl: roundToTwoDecimals(totalIncl),
  };
}

/**
 * Bereken totalen per prijstype (vast, stelpost, indicatie)
 */
export function calculateOfferTotalsByType(offerLines: OfferLine[]): {
  totalVastIncl: number;
  totalStelpostIncl: number;
  totalIndicatieIncl: number;
  totalOtherIncl: number;
} {
  let totalVastIncl = 0;
  let totalStelpostIncl = 0;
  let totalIndicatieIncl = 0;
  let totalOtherIncl = 0;

  for (const line of offerLines) {
    const amount = line.totalPriceIncl ?? 0;

    switch (line.priceType) {
      case 'VAST':
        totalVastIncl += amount;
        break;
      case 'STELPOST':
        totalStelpostIncl += amount;
        break;
      case 'INDICATIE':
        totalIndicatieIncl += amount;
        break;
      default:
        totalOtherIncl += amount;
        break;
    }
  }

  return {
    totalVastIncl: roundToTwoDecimals(totalVastIncl),
    totalStelpostIncl: roundToTwoDecimals(totalStelpostIncl),
    totalIndicatieIncl: roundToTwoDecimals(totalIndicatieIncl),
    totalOtherIncl: roundToTwoDecimals(totalOtherIncl),
  };
}

/**
 * Bereken complete offer totals inclusief discrepancy check
 */
export function calculateCompleteOfferTotals(
  offer: Offer,
  offerLines: OfferLine[],
  unmappedLines: OfferLine[]
): OfferTotals {
  const basicTotals = calculateOfferTotals(offerLines);
  const byType = calculateOfferTotalsByType(offerLines);
  const unclearTotals = calculateOfferTotals(unmappedLines);

  const discrepancy = offer.sourceTotalIncl
    ? basicTotals.totalIncl - offer.sourceTotalIncl
    : 0;

  return {
    offerId: offer.id,
    totalExcl: basicTotals.totalExcl,
    totalIncl: basicTotals.totalIncl,
    totalVastIncl: byType.totalVastIncl,
    totalStelpostIncl: byType.totalStelpostIncl,
    totalIndicatieIncl: byType.totalIndicatieIncl,
    totalUnclearIncl: unclearTotals.totalIncl,
    discrepancyWithSource: roundToTwoDecimals(discrepancy),
  };
}

/**
 * Check of er een discrepancy is tussen berekend totaal en bron totaal
 */
export function checkCalculationDiscrepancy(
  offer: Offer,
  calculatedTotal: number,
  tolerancePercentage: number = 0.5 // 0.5% standaard tolerantie
): CalculationDiscrepancyWarning | null {
  if (!offer.sourceTotalIncl) {
    return null;
  }

  const difference = calculatedTotal - offer.sourceTotalIncl;
  const differencePercentage = Math.abs(
    (difference / offer.sourceTotalIncl) * 100
  );

  if (differencePercentage > tolerancePercentage) {
    return {
      type: 'WARNING',
      code: 'CALCULATION_DISCREPANCY',
      offerId: offer.id,
      calculatedTotal: roundToTwoDecimals(calculatedTotal),
      sourceTotal: offer.sourceTotalIncl,
      difference: roundToTwoDecimals(difference),
      differencePercentage: roundToTwoDecimals(differencePercentage),
    };
  }

  return null;
}

/**
 * Helper: rond af op 2 decimalen
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
