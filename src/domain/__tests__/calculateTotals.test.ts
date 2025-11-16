/**
 * Unit tests voor calculateTotals domain service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOfferTotals,
  calculateOfferTotalsByType,
  calculateCompleteOfferTotals,
  checkCalculationDiscrepancy,
} from '../calculateTotals';
import type { OfferLine, Offer } from '../types';

describe('calculateTotals', () => {
  describe('calculateOfferTotals', () => {
    it('should calculate totals from offer lines correctly', () => {
      const lines: OfferLine[] = [
        {
          id: '1',
          offerId: 'offer-1',
          rawText: 'Line 1',
          description: 'Test line 1',
          priceExcl: 100,
          priceIncl: 121,
          priceType: 'VAST',
          sortOrder: 1,
        },
        {
          id: '2',
          offerId: 'offer-1',
          rawText: 'Line 2',
          description: 'Test line 2',
          priceExcl: 200,
          priceIncl: 242,
          priceType: 'VAST',
          sortOrder: 2,
        },
      ];

      const result = calculateOfferTotals(lines);

      expect(result.totalExcl).toBe(300);
      expect(result.totalIncl).toBe(363);
    });

    it('should handle lines without prices', () => {
      const lines: OfferLine[] = [
        {
          id: '1',
          offerId: 'offer-1',
          rawText: 'Line 1',
          description: 'Test line 1',
          priceType: 'VAST',
          sortOrder: 1,
        },
      ];

      const result = calculateOfferTotals(lines);

      expect(result.totalExcl).toBe(0);
      expect(result.totalIncl).toBe(0);
    });

    it('should round to two decimals', () => {
      const lines: OfferLine[] = [
        {
          id: '1',
          offerId: 'offer-1',
          rawText: 'Line 1',
          description: 'Test line 1',
          priceIncl: 10.555,
          priceType: 'VAST',
          sortOrder: 1,
        },
        {
          id: '2',
          offerId: 'offer-1',
          rawText: 'Line 2',
          description: 'Test line 2',
          priceIncl: 20.444,
          priceType: 'VAST',
          sortOrder: 2,
        },
      ];

      const result = calculateOfferTotals(lines);

      expect(result.totalIncl).toBe(31); // 10.555 + 20.444 = 30.999 -> 31.00
    });
  });

  describe('calculateOfferTotalsByType', () => {
    it('should separate totals by price type', () => {
      const lines: OfferLine[] = [
        {
          id: '1',
          offerId: 'offer-1',
          rawText: 'Vast',
          description: 'Vast prijs',
          priceIncl: 100,
          priceType: 'VAST',
          sortOrder: 1,
        },
        {
          id: '2',
          offerId: 'offer-1',
          rawText: 'Stelpost',
          description: 'Stelpost',
          priceIncl: 50,
          priceType: 'STELPOST',
          sortOrder: 2,
        },
        {
          id: '3',
          offerId: 'offer-1',
          rawText: 'Indicatie',
          description: 'Indicatie',
          priceIncl: 25,
          priceType: 'INDICATIE',
          sortOrder: 3,
        },
      ];

      const result = calculateOfferTotalsByType(lines);

      expect(result.totalVastIncl).toBe(100);
      expect(result.totalStelpostIncl).toBe(50);
      expect(result.totalIndicatieIncl).toBe(25);
      expect(result.totalOtherIncl).toBe(0);
    });
  });

  describe('checkCalculationDiscrepancy', () => {
    it('should detect discrepancy above tolerance', () => {
      const offer: Offer = {
        id: 'offer-1',
        projectId: 'proj-1',
        contractorId: 'cont-1',
        title: 'Test Offer',
        pricingModel: 'INCL_OPSLAGEN',
        sourceTotalIncl: 10000,
        currency: 'EUR',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const calculatedTotal = 10100; // 1% verschil

      const warning = checkCalculationDiscrepancy(offer, calculatedTotal, 0.5);

      expect(warning).not.toBeNull();
      expect(warning?.code).toBe('CALCULATION_DISCREPANCY');
      expect(warning?.difference).toBe(100);
      expect(warning?.differencePercentage).toBe(1);
    });

    it('should not warn when discrepancy is within tolerance', () => {
      const offer: Offer = {
        id: 'offer-1',
        projectId: 'proj-1',
        contractorId: 'cont-1',
        title: 'Test Offer',
        pricingModel: 'INCL_OPSLAGEN',
        sourceTotalIncl: 10000,
        currency: 'EUR',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const calculatedTotal = 10040; // 0.4% verschil

      const warning = checkCalculationDiscrepancy(offer, calculatedTotal, 0.5);

      expect(warning).toBeNull();
    });

    it('should return null when no source total is available', () => {
      const offer: Offer = {
        id: 'offer-1',
        projectId: 'proj-1',
        contractorId: 'cont-1',
        title: 'Test Offer',
        pricingModel: 'INCL_OPSLAGEN',
        currency: 'EUR',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const calculatedTotal = 10000;

      const warning = checkCalculationDiscrepancy(offer, calculatedTotal);

      expect(warning).toBeNull();
    });
  });
});
