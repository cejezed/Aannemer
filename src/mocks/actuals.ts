/**
 * Mock data voor actuals tracking
 * Voor demo doeleinden wanneer Supabase niet geconfigureerd is
 */

import type {
  ProjectActual,
  HourEntry,
  CostEntry,
  PersonalCoachSync,
} from '@/domain/types';

// Mock hour entries - gedetailleerde urenregistratie
export const mockHourEntries: HourEntry[] = [
  // Grondwerk (mc-10)
  {
    id: 'hour-001',
    projectId: 'project-001',
    masterComponentId: 'mc-10',
    workerName: 'Jan de Vries',
    hours: 24,
    hourlyRate: 45,
    date: '2024-11-05',
    description: 'Ontgraven voor kelder',
    source: 'MANUAL',
    createdAt: '2024-11-05T16:00:00Z',
    updatedAt: '2024-11-05T16:00:00Z',
  },
  {
    id: 'hour-002',
    projectId: 'project-001',
    masterComponentId: 'mc-10',
    workerName: 'Piet Jansen',
    hours: 20,
    hourlyRate: 42,
    date: '2024-11-06',
    description: 'Ontgraven en afvoer grond',
    source: 'MANUAL',
    createdAt: '2024-11-06T16:00:00Z',
    updatedAt: '2024-11-06T16:00:00Z',
  },
  // Kelder (mc-21)
  {
    id: 'hour-003',
    projectId: 'project-001',
    masterComponentId: 'mc-21',
    workerName: 'Henk Bakker',
    hours: 32,
    hourlyRate: 48,
    date: '2024-11-10',
    description: 'Storten betonnen kelderwanden',
    source: 'MANUAL',
    createdAt: '2024-11-10T16:00:00Z',
    updatedAt: '2024-11-10T16:00:00Z',
  },
  {
    id: 'hour-004',
    projectId: 'project-001',
    masterComponentId: 'mc-21',
    workerName: 'Tom Peters',
    hours: 28,
    hourlyRate: 48,
    date: '2024-11-11',
    description: 'Afwerking kelderwanden',
    source: 'MANUAL',
    createdAt: '2024-11-11T16:00:00Z',
    updatedAt: '2024-11-11T16:00:00Z',
  },
  // Metselwerk (mc-23)
  {
    id: 'hour-005',
    projectId: 'project-001',
    masterComponentId: 'mc-23',
    workerName: 'Klaas Mulder',
    hours: 120,
    hourlyRate: 52,
    date: '2024-11-15',
    description: 'Metselen buitenwanden begane grond',
    source: 'MANUAL',
    createdAt: '2024-11-15T16:00:00Z',
    updatedAt: '2024-11-15T16:00:00Z',
  },
  {
    id: 'hour-006',
    projectId: 'project-001',
    masterComponentId: 'mc-23',
    workerName: 'Erik van Dam',
    hours: 96,
    hourlyRate: 50,
    date: '2024-11-16',
    description: 'Metselen buitenwanden verdieping',
    source: 'MANUAL',
    createdAt: '2024-11-16T16:00:00Z',
    updatedAt: '2024-11-16T16:00:00Z',
  },
];

// Mock cost entries - materiaal en andere kosten
export const mockCostEntries: CostEntry[] = [
  // Grondwerk
  {
    id: 'cost-001',
    projectId: 'project-001',
    masterComponentId: 'mc-10',
    costType: 'MATERIAL',
    amountIncl: 3500,
    description: 'Afvoer overtollige grond',
    date: '2024-11-06',
    supplier: 'Grondbank Amsterdam',
    invoiceNumber: 'GB-2024-1156',
    source: 'MANUAL',
    createdAt: '2024-11-07T10:00:00Z',
    updatedAt: '2024-11-07T10:00:00Z',
  },
  {
    id: 'cost-002',
    projectId: 'project-001',
    masterComponentId: 'mc-10',
    costType: 'EQUIPMENT',
    amountIncl: 2800,
    description: 'Huur graafmachine 3 dagen',
    date: '2024-11-05',
    supplier: 'Verhuur Van Dijk',
    invoiceNumber: 'VVD-8823',
    source: 'MANUAL',
    createdAt: '2024-11-05T14:00:00Z',
    updatedAt: '2024-11-05T14:00:00Z',
  },
  // Kelder
  {
    id: 'cost-003',
    projectId: 'project-001',
    masterComponentId: 'mc-21',
    costType: 'MATERIAL',
    amountIncl: 12500,
    description: 'Beton voor kelderwanden (18m³)',
    date: '2024-11-10',
    supplier: 'BetonCentrale Noord',
    invoiceNumber: 'BCN-2024-3344',
    source: 'MANUAL',
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: 'cost-004',
    projectId: 'project-001',
    masterComponentId: 'mc-21',
    costType: 'MATERIAL',
    amountIncl: 4200,
    description: 'Wapeningsstaal kelderwanden',
    date: '2024-11-09',
    supplier: 'Staalhandel Rotterdam',
    invoiceNumber: 'SHR-7712',
    source: 'MANUAL',
    createdAt: '2024-11-09T11:00:00Z',
    updatedAt: '2024-11-09T11:00:00Z',
  },
  // Metselwerk
  {
    id: 'cost-005',
    projectId: 'project-001',
    masterComponentId: 'mc-23',
    costType: 'MATERIAL',
    amountIncl: 18500,
    description: 'Bakstenen gevelmetselwerk (12.000 stuks)',
    date: '2024-11-14',
    supplier: 'Steenhandel De Bouwer',
    invoiceNumber: 'SDB-5521',
    source: 'MANUAL',
    createdAt: '2024-11-14T10:00:00Z',
    updatedAt: '2024-11-14T10:00:00Z',
  },
  {
    id: 'cost-006',
    projectId: 'project-001',
    masterComponentId: 'mc-23',
    costType: 'MATERIAL',
    amountIncl: 3200,
    description: 'Metselspecie en voegmortel',
    date: '2024-11-14',
    supplier: 'Steenhandel De Bouwer',
    invoiceNumber: 'SDB-5522',
    source: 'MANUAL',
    createdAt: '2024-11-14T10:30:00Z',
    updatedAt: '2024-11-14T10:30:00Z',
  },
  // Dakgoten
  {
    id: 'cost-007',
    projectId: 'project-001',
    masterComponentId: 'mc-28',
    costType: 'MATERIAL',
    amountIncl: 2400,
    description: 'Koperen dakgoten en regenpijpen',
    date: '2024-11-12',
    supplier: 'Metaalhandel Koper & Zink',
    invoiceNumber: 'MKZ-3398',
    source: 'MANUAL',
    createdAt: '2024-11-12T14:00:00Z',
    updatedAt: '2024-11-12T14:00:00Z',
  },
];

// Mock project actuals - geaggregeerde data (optioneel, voor als er geen detail entries zijn)
export const mockProjectActuals: ProjectActual[] = [
  {
    id: 'actual-001',
    projectId: 'project-001',
    masterComponentId: 'mc-10',
    actualCostIncl: 8280, // 44 uur * avg €45 + €6300 materiaal/apparatuur
    actualHours: 44,
    periodStart: '2024-11-05T00:00:00Z',
    periodEnd: '2024-11-06T23:59:59Z',
    source: 'MANUAL',
    notes: 'Grondwerk afgerond conform planning',
    createdAt: '2024-11-07T12:00:00Z',
    updatedAt: '2024-11-07T12:00:00Z',
  },
  {
    id: 'actual-002',
    projectId: 'project-001',
    masterComponentId: 'mc-21',
    actualCostIncl: 19580, // 60 uur * €48 + €16700 materiaal
    actualHours: 60,
    periodStart: '2024-11-09T00:00:00Z',
    periodEnd: '2024-11-11T23:59:59Z',
    source: 'MANUAL',
    notes: 'Kelderwanden gestort, nog controle waterdichtheid nodig',
    createdAt: '2024-11-12T09:00:00Z',
    updatedAt: '2024-11-12T09:00:00Z',
  },
];

// Mock Personal Coach sync status
export const mockPersonalCoachSync: PersonalCoachSync = {
  id: 'sync-001',
  projectId: 'project-001',
  personalCoachProjectId: 'pc-woning-amsterdam-2024',
  lastSyncAt: '2024-11-16T08:00:00Z',
  syncStatus: 'SUCCESS',
  createdAt: '2024-11-01T10:00:00Z',
  updatedAt: '2024-11-16T08:00:00Z',
};

// Export alle mock actuals data samen
export const mockActualsData = {
  hourEntries: mockHourEntries,
  costEntries: mockCostEntries,
  projectActuals: mockProjectActuals,
  personalCoachSync: mockPersonalCoachSync,
};
