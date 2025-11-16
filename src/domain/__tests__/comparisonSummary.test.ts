/**
 * Unit tests voor comparisonSummary domain service
 * Test met echte mock data
 */

import { describe, it, expect } from 'vitest';
import { generateComparisonSummary } from '../comparisonSummary';
import {
  loadMockData,
  groupLinesByOffer,
  groupMappingsByOffer,
  createContractorMap,
} from '../../mocks';

describe('comparisonSummary', () => {
  describe('generateComparisonSummary', () => {
    it('should generate complete comparison summary from mock data', () => {
      const mockData = loadMockData();
      const offerLinesMap = groupLinesByOffer(mockData.offerLines);
      const lineMappingsMap = groupMappingsByOffer(mockData.lineMappings);
      const contractorMap = createContractorMap(mockData.contractors);

      const summary = generateComparisonSummary(
        mockData.project,
        mockData.offers,
        contractorMap,
        offerLinesMap,
        lineMappingsMap,
        mockData.masterComponents
      );

      // Check basic structure
      expect(summary.projectId).toBe(mockData.project.id);
      expect(summary.projectName).toBe(mockData.project.name);
      expect(summary.offerIds).toHaveLength(3);

      // Check normalized views
      expect(summary.normalizedViews).toHaveLength(3);

      // Check allowance profiles
      expect(summary.allowanceProfiles).toHaveLength(3);

      // Offerte A heeft geen stelposten (excl. overhead lines die niet gemapped zijn)
      const offerAProfile = summary.allowanceProfiles.find(
        p => p.offerId === 'offer-001'
      );
      expect(offerAProfile?.totalAllowance).toBe(0);

      // Offerte B heeft wel stelposten
      const offerBProfile = summary.allowanceProfiles.find(
        p => p.offerId === 'offer-002'
      );
      expect(offerBProfile?.totalAllowance).toBeGreaterThan(0);

      // Offerte C heeft veel stelposten
      const offerCProfile = summary.allowanceProfiles.find(
        p => p.offerId === 'offer-003'
      );
      expect(offerCProfile?.totalAllowance).toBeGreaterThan(0);

      // Check component differences
      expect(summary.componentDifferences.length).toBeGreaterThan(0);

      // Check missing components
      expect(summary.missingComponents.length).toBeGreaterThan(0);

      // Offerte C mist kelder - check of dit gedetecteerd is
      const missingKelder = summary.missingComponents.find(
        mc => mc.masterComponentCode === '21.2' || mc.masterComponentCode === '21.3'
      );
      expect(missingKelder).toBeDefined();

      // Check unclear buckets
      expect(summary.unclearBuckets.length).toBeGreaterThan(0);

      // Meta-info checks
      expect(summary.totalComponentsCompared).toBeGreaterThan(0);
      expect(summary.generatedAt).toBeDefined();
    });

    it('should identify large price discrepancies', () => {
      const mockData = loadMockData();
      const offerLinesMap = groupLinesByOffer(mockData.offerLines);
      const lineMappingsMap = groupMappingsByOffer(mockData.lineMappings);
      const contractorMap = createContractorMap(mockData.contractors);

      const summary = generateComparisonSummary(
        mockData.project,
        mockData.offers,
        contractorMap,
        offerLinesMap,
        lineMappingsMap,
        mockData.masterComponents
      );

      const largeDifferences = summary.componentDifferences.filter(
        d => d.isLargeDelta
      );

      expect(largeDifferences.length).toBeGreaterThan(0);

      // Check dat kelder een groot verschil heeft (omdat offerte C het mist)
      const kelderDifference = largeDifferences.find(
        d => d.masterComponentCode.startsWith('21.')
      );
      expect(kelderDifference).toBeDefined();
    });

    it('should correctly identify unclear lines', () => {
      const mockData = loadMockData();
      const offerLinesMap = groupLinesByOffer(mockData.offerLines);
      const lineMappingsMap = groupMappingsByOffer(mockData.lineMappings);
      const contractorMap = createContractorMap(mockData.contractors);

      const summary = generateComparisonSummary(
        mockData.project,
        mockData.offers,
        contractorMap,
        offerLinesMap,
        lineMappingsMap,
        mockData.masterComponents
      );

      // Offerte A heeft overhead lijnen die niet gemapped zijn
      const offerAUnclear = summary.unclearBuckets.find(
        b => b.offerId === 'offer-001'
      );
      expect(offerAUnclear).toBeDefined();
      expect(offerAUnclear!.lines.length).toBeGreaterThan(0);

      // Offerte B heeft "Onvoorzien" die niet gemapped is
      const offerBUnclear = summary.unclearBuckets.find(
        b => b.offerId === 'offer-002'
      );
      expect(offerBUnclear).toBeDefined();
    });
  });
});
