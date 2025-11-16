/**
 * Unit tests voor revisionDiff domain service
 * Test met echte mock data (revision 1 vs 2)
 */

import { describe, it, expect } from 'vitest';
import { generateRevisionDiff } from '../revisionDiff';
import { mockMasterComponents } from '../../mocks/masterComponents';
import {
  revisionA1,
  revisionA2,
  revisionA1Lines,
  revisionA2Lines,
} from '../../mocks/revisions';
import {
  revisionA1Mappings,
  revisionA2Mappings,
} from '../../mocks/revisionMappings';

describe('revisionDiff', () => {
  describe('generateRevisionDiff', () => {
    it('should generate complete diff between revision 1 and 2', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      // Basic structure
      expect(diff.fromRevisionId).toBe(revisionA1.id);
      expect(diff.toRevisionId).toBe(revisionA2.id);
      expect(diff.fromRevisionLabel).toBe('Contract');
      expect(diff.toRevisionLabel).toContain('Meerwerk');
      expect(diff.offerId).toBe('offer-001');

      // Tijdstempel
      expect(diff.generatedAt).toBeDefined();
    });

    it('should correctly calculate line statistics', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      // Verwachte wijzigingen:
      // - 1 line ADDED (extra isolatie kelderwanden)
      // - 0 lines REMOVED
      // - 2 lines CHANGED (keldervloer isolatie dikker, dakgoten simpeler)
      // - Rest UNCHANGED

      expect(diff.linesAdded).toBe(1);
      expect(diff.linesRemoved).toBe(0);
      expect(diff.linesChanged).toBe(2);
      expect(diff.linesUnchanged).toBeGreaterThan(0);

      // Totaal aantal diffs moet kloppen
      const totalDiffs = diff.linesAdded + diff.linesRemoved + diff.linesChanged + diff.linesUnchanged;
      expect(totalDiffs).toBe(diff.lineDiffs.length);
    });

    it('should correctly identify ADDED lines', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      const addedLines = diff.lineDiffs.filter(d => d.status === 'ADDED');

      expect(addedLines).toHaveLength(1);

      const extraIsolatie = addedLines[0];
      expect(extraIsolatie.lineV1).toBeUndefined();
      expect(extraIsolatie.lineV2).toBeDefined();
      expect(extraIsolatie.lineV2?.description).toContain('Extra isolatie kelderwanden');
      expect(extraIsolatie.priceDelta).toBe(3872); // Meerwerk
    });

    it('should correctly identify CHANGED lines', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      const changedLines = diff.lineDiffs.filter(d => d.status === 'CHANGED');

      expect(changedLines).toHaveLength(2);

      // Check keldervloer wijziging (prijs omhoog)
      const keldervloer = changedLines.find(
        d => d.lineV1?.description.includes('Keldervloer')
      );
      expect(keldervloer).toBeDefined();
      expect(keldervloer?.priceDelta).toBeGreaterThan(0); // Prijs is omhoog gegaan
      expect(keldervloer?.lineV1?.priceIncl).toBe(10890);
      expect(keldervloer?.lineV2?.priceIncl).toBe(12500);

      // Check dakgoten wijziging (prijs omlaag)
      const dakgoten = changedLines.find(
        d => d.lineV1?.description.includes('Dakgoten')
      );
      expect(dakgoten).toBeDefined();
      expect(dakgoten?.priceDelta).toBeLessThan(0); // Prijs is omlaag gegaan
      expect(dakgoten?.lineV1?.priceIncl).toBe(5445);
      expect(dakgoten?.lineV2?.priceIncl).toBe(3630);
    });

    it('should correctly calculate total delta', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      // Verwachte wijzigingen:
      // + Extra isolatie: +€3.872
      // + Keldervloer dikker: +€1.610 (12500 - 10890)
      // - Dakgoten simpeler: -€1.815 (3630 - 5445)
      // Totaal: +€3.667

      const expectedDelta = 3872 + (12500 - 10890) + (3630 - 5445);
      expect(diff.totalDelta).toBeCloseTo(expectedDelta, 0);

      // Totalen moeten kloppen
      expect(diff.totalV2).toBe(diff.totalV1 + diff.totalDelta);
    });

    it('should calculate component-level differences', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      // Moet component diffs hebben voor gewijzigde componenten
      expect(diff.componentDiffs.length).toBeGreaterThan(0);

      // Check kelderwanden component (heeft meerwerk)
      const kelderWanden = diff.componentDiffs.find(
        d => d.masterComponentName.includes('Kelderwanden')
      );
      expect(kelderWanden).toBeDefined();
      expect(kelderWanden?.delta).toBeGreaterThan(0); // Meerwerk

      // Check keldervloer component (prijs omhoog)
      const kelderVloer = diff.componentDiffs.find(
        d => d.masterComponentName.includes('Keldervloer')
      );
      expect(kelderVloer).toBeDefined();
      expect(kelderVloer?.delta).toBeGreaterThan(0);

      // Check dakgoten component (prijs omlaag)
      const dakgoten = diff.componentDiffs.find(
        d => d.masterComponentName.includes('Dakgoten')
      );
      expect(dakgoten).toBeDefined();
      expect(dakgoten?.delta).toBeLessThan(0); // Minderwerk
    });

    it('should mark significant changes correctly', () => {
      const diff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        revisionA1Lines,
        revisionA2Lines,
        revisionA1Mappings,
        revisionA2Mappings,
        mockMasterComponents
      );

      // Component diffs met > 10% verandering moeten als significant gemarkeerd zijn
      const significantDiffs = diff.componentDiffs.filter(d => d.isSignificant);

      // Dakgoten: van 5445 naar 3630 = -33% (significant!)
      const dakgoten = significantDiffs.find(
        d => d.masterComponentName.includes('Dakgoten')
      );
      expect(dakgoten).toBeDefined();
      expect(Math.abs(dakgoten!.deltaPercentage)).toBeGreaterThan(10);
    });

    it('should handle empty revisions gracefully', () => {
      const emptyDiff = generateRevisionDiff(
        revisionA1,
        revisionA2,
        [],
        [],
        [],
        [],
        mockMasterComponents
      );

      expect(emptyDiff.totalV1).toBe(0);
      expect(emptyDiff.totalV2).toBe(0);
      expect(emptyDiff.totalDelta).toBe(0);
      expect(emptyDiff.linesAdded).toBe(0);
      expect(emptyDiff.linesRemoved).toBe(0);
      expect(emptyDiff.linesChanged).toBe(0);
      expect(emptyDiff.linesUnchanged).toBe(0);
    });
  });
});
