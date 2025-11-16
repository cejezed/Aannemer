/**
 * Unit tests voor aggregateByMaster domain service
 */

import { describe, it, expect } from 'vitest';
import { aggregateByMasterComponent } from '../aggregateByMaster';
import type { MasterComponent, OfferLine, LineMapping } from '../types';

describe('aggregateByMaster', () => {
  describe('aggregateByMasterComponent', () => {
    it('should aggregate lines correctly by master component', () => {
      const masterComponents: MasterComponent[] = [
        {
          id: 'mc-1',
          code: '21',
          name: 'Betonwerk',
          sortOrder: 1,
          isLeaf: false,
        },
        {
          id: 'mc-1-1',
          code: '21.1',
          name: 'Fundering',
          parentId: 'mc-1',
          sortOrder: 11,
          isLeaf: true,
        },
      ];

      const offerLines: OfferLine[] = [
        {
          id: 'line-1',
          offerId: 'offer-1',
          rawText: 'Fundering 1',
          description: 'Fundering betonpoeren',
          priceExcl: 10000,
          priceIncl: 12100,
          priceType: 'VAST',
          sortOrder: 1,
        },
        {
          id: 'line-2',
          offerId: 'offer-1',
          rawText: 'Fundering 2',
          description: 'Extra fundering',
          priceExcl: 5000,
          priceIncl: 6050,
          priceType: 'STELPOST',
          sortOrder: 2,
        },
      ];

      const lineMappings: LineMapping[] = [
        {
          id: 'map-1',
          offerLineId: 'line-1',
          masterComponentId: 'mc-1-1',
          coverageStatus: 'INCLUSIEF',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'map-2',
          offerLineId: 'line-2',
          masterComponentId: 'mc-1-1',
          coverageStatus: 'STELPOST',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const result = aggregateByMasterComponent(
        masterComponents,
        offerLines,
        lineMappings,
        'offer-1'
      );

      expect(result).toHaveLength(1);
      expect(result[0].masterComponentId).toBe('mc-1-1');
      expect(result[0].totalVastExcl).toBe(10000);
      expect(result[0].totalVastIncl).toBe(12100);
      expect(result[0].totalStelpostExcl).toBe(5000);
      expect(result[0].totalStelpostIncl).toBe(6050);
      expect(result[0].lineCount).toBe(2);
      expect(result[0].coverageStatus).toBe('GEDEELTELIJK');
    });

    it('should only process leaf components', () => {
      const masterComponents: MasterComponent[] = [
        {
          id: 'mc-1',
          code: '21',
          name: 'Betonwerk',
          sortOrder: 1,
          isLeaf: false, // Parent component
        },
      ];

      const offerLines: OfferLine[] = [];
      const lineMappings: LineMapping[] = [];

      const result = aggregateByMasterComponent(
        masterComponents,
        offerLines,
        lineMappings,
        'offer-1'
      );

      expect(result).toHaveLength(0);
    });

    it('should determine coverage status correctly', () => {
      const masterComponents: MasterComponent[] = [
        {
          id: 'mc-1',
          code: '21.1',
          name: 'Fundering',
          sortOrder: 1,
          isLeaf: true,
        },
        {
          id: 'mc-2',
          code: '21.2',
          name: 'Kelder',
          sortOrder: 2,
          isLeaf: true,
        },
      ];

      const offerLines: OfferLine[] = [
        {
          id: 'line-1',
          offerId: 'offer-1',
          rawText: 'Fundering',
          description: 'Fundering betonpoeren',
          priceIncl: 12100,
          priceType: 'VAST',
          sortOrder: 1,
        },
      ];

      const lineMappings: LineMapping[] = [
        {
          id: 'map-1',
          offerLineId: 'line-1',
          masterComponentId: 'mc-1',
          coverageStatus: 'INCLUSIEF',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const result = aggregateByMasterComponent(
        masterComponents,
        offerLines,
        lineMappings,
        'offer-1'
      );

      const funderingAgg = result.find(r => r.masterComponentId === 'mc-1');
      const kelderAgg = result.find(r => r.masterComponentId === 'mc-2');

      expect(funderingAgg?.coverageStatus).toBe('VOLLEDIG');
      expect(kelderAgg?.coverageStatus).toBe('ONTBREEKT');
    });
  });
});
