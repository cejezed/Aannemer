/**
 * Master bouwstructuur (canoniek)
 * Gebaseerd op Hedibouw/Goorhuis open-staart begroting
 */

import type { MasterComponent } from '@/domain/types';

// IDs voor consistente referenties
const IDS = {
  HOOFDSTUK_20: 'mc-20-000',
  GRONDWERK: 'mc-20-100',
  FUNDERINGSPALEN: 'mc-20-200',

  HOOFDSTUK_21: 'mc-21-000',
  FUNDERING: 'mc-21-100',
  KELDER_WANDEN: 'mc-21-200',
  KELDER_VLOER: 'mc-21-300',
  BEGANE_GROND_VLOER: 'mc-21-400',

  HOOFDSTUK_22: 'mc-22-000',
  METSELWERK_GEVEL: 'mc-22-100',
  METSELWERK_BINNEN: 'mc-22-200',

  HOOFDSTUK_23: 'mc-23-000',
  BETONVLOEREN: 'mc-23-100',
  BETONTRAPPEN: 'mc-23-200',

  HOOFDSTUK_24: 'mc-24-000',
  DAKCONSTRUCTIE: 'mc-24-100',
  DAKBEDEKKING: 'mc-24-200',
  DAKGOTEN: 'mc-24-300',

  HOOFDSTUK_30: 'mc-30-000',
  KOZIJNEN: 'mc-30-100',
  DEUREN: 'mc-30-200',

  HOOFDSTUK_40: 'mc-40-000',
  AFBOUWWERK: 'mc-40-100',
  TEGELWERK: 'mc-40-200',
  STUCWERK: 'mc-40-300',
};

export const MASTER_COMPONENT_IDS = IDS;

export const mockMasterComponents: MasterComponent[] = [
  // ========================================
  // HOOFDSTUK 20 - GROND-, WATER-, RIOOLWERK
  // ========================================
  {
    id: IDS.HOOFDSTUK_20,
    code: '20',
    name: 'Grond-, water-, rioolwerk',
    parentId: undefined,
    sortOrder: 20,
    isLeaf: false,
  },
  {
    id: IDS.GRONDWERK,
    code: '20.1',
    name: 'Grondwerk bouwput',
    parentId: IDS.HOOFDSTUK_20,
    sortOrder: 201,
    isLeaf: true,
  },
  {
    id: IDS.FUNDERINGSPALEN,
    code: '20.2',
    name: 'Funderingspalen',
    parentId: IDS.HOOFDSTUK_20,
    sortOrder: 202,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 21 - BETONWERK
  // ========================================
  {
    id: IDS.HOOFDSTUK_21,
    code: '21',
    name: 'Betonwerk',
    parentId: undefined,
    sortOrder: 21,
    isLeaf: false,
  },
  {
    id: IDS.FUNDERING,
    code: '21.1',
    name: 'Fundering betonpoeren',
    parentId: IDS.HOOFDSTUK_21,
    sortOrder: 211,
    isLeaf: true,
  },
  {
    id: IDS.KELDER_WANDEN,
    code: '21.2',
    name: 'Kelderwanden beton',
    parentId: IDS.HOOFDSTUK_21,
    sortOrder: 212,
    isLeaf: true,
  },
  {
    id: IDS.KELDER_VLOER,
    code: '21.3',
    name: 'Keldervloer beton',
    parentId: IDS.HOOFDSTUK_21,
    sortOrder: 213,
    isLeaf: true,
  },
  {
    id: IDS.BEGANE_GROND_VLOER,
    code: '21.4',
    name: 'Begane grond vloer',
    parentId: IDS.HOOFDSTUK_21,
    sortOrder: 214,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 22 - METSELWERK
  // ========================================
  {
    id: IDS.HOOFDSTUK_22,
    code: '22',
    name: 'Metselwerk',
    parentId: undefined,
    sortOrder: 22,
    isLeaf: false,
  },
  {
    id: IDS.METSELWERK_GEVEL,
    code: '22.1',
    name: 'Metselwerk gevel',
    parentId: IDS.HOOFDSTUK_22,
    sortOrder: 221,
    isLeaf: true,
  },
  {
    id: IDS.METSELWERK_BINNEN,
    code: '22.2',
    name: 'Metselwerk binnenwanden',
    parentId: IDS.HOOFDSTUK_22,
    sortOrder: 222,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 23 - BETONVLOEREN EN TRAPPEN
  // ========================================
  {
    id: IDS.HOOFDSTUK_23,
    code: '23',
    name: 'Betonvloeren en trappen',
    parentId: undefined,
    sortOrder: 23,
    isLeaf: false,
  },
  {
    id: IDS.BETONVLOEREN,
    code: '23.1',
    name: 'Prefab betonvloeren',
    parentId: IDS.HOOFDSTUK_23,
    sortOrder: 231,
    isLeaf: true,
  },
  {
    id: IDS.BETONTRAPPEN,
    code: '23.2',
    name: 'Betonnen trappen',
    parentId: IDS.HOOFDSTUK_23,
    sortOrder: 232,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 24 - DAKWERK
  // ========================================
  {
    id: IDS.HOOFDSTUK_24,
    code: '24',
    name: 'Dakwerk',
    parentId: undefined,
    sortOrder: 24,
    isLeaf: false,
  },
  {
    id: IDS.DAKCONSTRUCTIE,
    code: '24.1',
    name: 'Dakconstructie hout',
    parentId: IDS.HOOFDSTUK_24,
    sortOrder: 241,
    isLeaf: true,
  },
  {
    id: IDS.DAKBEDEKKING,
    code: '24.2',
    name: 'Dakbedekking pannen',
    parentId: IDS.HOOFDSTUK_24,
    sortOrder: 242,
    isLeaf: true,
  },
  {
    id: IDS.DAKGOTEN,
    code: '24.3',
    name: 'Dakgoten en hemelwaterafvoer',
    parentId: IDS.HOOFDSTUK_24,
    sortOrder: 243,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 30 - KOZIJNEN EN DEUREN
  // ========================================
  {
    id: IDS.HOOFDSTUK_30,
    code: '30',
    name: 'Kozijnen en deuren',
    parentId: undefined,
    sortOrder: 30,
    isLeaf: false,
  },
  {
    id: IDS.KOZIJNEN,
    code: '30.1',
    name: 'Kozijnen en ramen',
    parentId: IDS.HOOFDSTUK_30,
    sortOrder: 301,
    isLeaf: true,
  },
  {
    id: IDS.DEUREN,
    code: '30.2',
    name: 'Binnendeuren',
    parentId: IDS.HOOFDSTUK_30,
    sortOrder: 302,
    isLeaf: true,
  },

  // ========================================
  // HOOFDSTUK 40 - AFBOUW
  // ========================================
  {
    id: IDS.HOOFDSTUK_40,
    code: '40',
    name: 'Afbouwwerk',
    parentId: undefined,
    sortOrder: 40,
    isLeaf: false,
  },
  {
    id: IDS.AFBOUWWERK,
    code: '40.1',
    name: 'Gipsplaten en wanden',
    parentId: IDS.HOOFDSTUK_40,
    sortOrder: 401,
    isLeaf: true,
  },
  {
    id: IDS.TEGELWERK,
    code: '40.2',
    name: 'Tegelwerk nat en droog',
    parentId: IDS.HOOFDSTUK_40,
    sortOrder: 402,
    isLeaf: true,
  },
  {
    id: IDS.STUCWERK,
    code: '40.3',
    name: 'Stucwerk',
    parentId: IDS.HOOFDSTUK_40,
    sortOrder: 403,
    isLeaf: true,
  },
];
