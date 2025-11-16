/**
 * Mock Budget data
 * Begrotingen voor het project
 */

import type {
  ProjectBudget,
  ComponentBudget,
} from '@/domain/types';

/**
 * Interne projectbegroting (baseline)
 * Dit is wat het project maximaal mag kosten volgens interne afspraken
 */
export const mockInternalBudget: ProjectBudget = {
  id: 'budget-internal-001',
  projectId: 'project-001',
  name: 'Interne projectbegroting',
  totalBudgetIncl: 550000, // €550k totaal budget
  currency: 'EUR',
  isBaseline: true,  // Dit is de hoofdbegroting
  createdAt: '2024-11-01T10:00:00Z',
  updatedAt: '2024-11-01T10:00:00Z',
};

/**
 * Contractbegroting gebaseerd op De Vries offerte
 * Dit wordt de nieuwe baseline na contract
 */
export const mockContractBudget: ProjectBudget = {
  id: 'budget-contract-001',
  projectId: 'project-001',
  name: 'Contractbegroting - De Vries',
  totalBudgetIncl: 525000, // Gebaseerd op winnende offerte
  currency: 'EUR',
  isBaseline: false,
  createdAt: '2024-12-15T14:00:00Z',
  updatedAt: '2024-12-15T14:00:00Z',
};

/**
 * Component budgets voor interne begroting
 * Verdeeld over de verschillende bouwonderdelen
 */
export const mockInternalComponentBudgets: ComponentBudget[] = [
  {
    id: 'cb-int-10',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-10',  // Grondwerk
    budgetAmountIncl: 22000,
    notes: 'Inclusief bemaling en afvoer overtollige grond',
  },
  {
    id: 'cb-int-21',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-21',  // Betonwerk kelder
    budgetAmountIncl: 58000,
    notes: 'Waterdichte kelder volgens NEN 6707',
  },
  {
    id: 'cb-int-23',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-23',  // Metselwerk
    budgetAmountIncl: 95000,
    notes: 'Gevelmetselwerk en spouwmuurisolatie',
  },
  {
    id: 'cb-int-24',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-24',  // Dakgoten
    budgetAmountIncl: 6500,
    notes: 'Complete hemelwaterafvoer',
  },
  {
    id: 'cb-int-31',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-31',  // Houtconstructies
    budgetAmountIncl: 48000,
    notes: 'Dakconstructie en pannen',
  },
  {
    id: 'cb-int-33',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-33',  // Binnendeuren
    budgetAmountIncl: 12000,
    notes: 'Stompe deuren en kozijnen',
  },
  {
    id: 'cb-int-40',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-40',  // Binnenwandafwerking
    budgetAmountIncl: 28000,
    notes: 'Stucwerk en schilderwerk binnen',
  },
  {
    id: 'cb-int-51',
    projectBudgetId: 'budget-internal-001',
    masterComponentId: 'mc-51',  // Sanitair
    budgetAmountIncl: 18000,
    notes: 'Basis sanitair pakket',
  },
];

/**
 * Component budgets voor contractbegroting (De Vries)
 * Gebaseerd op de winnende offerte, iets lager dan interne begroting
 */
export const mockContractComponentBudgets: ComponentBudget[] = [
  {
    id: 'cb-ctr-10',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-10',  // Grondwerk
    budgetAmountIncl: 20500,
  },
  {
    id: 'cb-ctr-21',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-21',  // Betonwerk kelder
    budgetAmountIncl: 54000,
  },
  {
    id: 'cb-ctr-23',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-23',  // Metselwerk
    budgetAmountIncl: 89000,
  },
  {
    id: 'cb-ctr-24',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-24',  // Dakgoten
    budgetAmountIncl: 6000,
  },
  {
    id: 'cb-ctr-31',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-31',  // Houtconstructies
    budgetAmountIncl: 45000,
  },
  {
    id: 'cb-ctr-33',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-33',  // Binnendeuren
    budgetAmountIncl: 11500,
  },
  {
    id: 'cb-ctr-40',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-40',  // Binnenwandafwerking
    budgetAmountIncl: 26000,
  },
  {
    id: 'cb-ctr-51',
    projectBudgetId: 'budget-contract-001',
    masterComponentId: 'mc-51',  // Sanitair
    budgetAmountIncl: 17000,
  },
];

// Export all budgets
export const mockProjectBudgets = [mockInternalBudget, mockContractBudget];

export const mockAllComponentBudgets = [
  ...mockInternalComponentBudgets,
  ...mockContractComponentBudgets,
];

// Export as bundle
export const mockBudgetData = {
  projectBudgets: mockProjectBudgets,
  componentBudgets: mockAllComponentBudgets,
  internalBudget: mockInternalBudget,
  contractBudget: mockContractBudget,
  internalComponentBudgets: mockInternalComponentBudgets,
  contractComponentBudgets: mockContractComponentBudgets,
};
