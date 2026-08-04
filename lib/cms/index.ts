import { foodTenantConfig } from './food';
import { energyTenantConfig } from './energy';
import { TenantConfig } from './types';

export const TENANTS = {
  food: foodTenantConfig,
  energy: energyTenantConfig,
} as const;

export function getTenantConfig(tenantId: string): TenantConfig {
  if (tenantId === 'energy') return TENANTS.energy;
  return TENANTS.food; // default fallback
}

export const ERAS = [
  { id: 'past', label: 'Past' },
  { id: 'present', label: 'Present' },
  { id: 'future', label: 'Future' }
];

export const FOOD_TYPES = [
  { id: 'cereals', label: 'Cereals & Grains' },
  { id: 'tubers', label: 'Roots & Tubers' },
  { id: 'produce', label: 'Fruits & Vegetables' },
  { id: 'livestock', label: 'Meat & Poultry' },
  { id: 'dairy', label: 'Dairy & Eggs' },
  { id: 'seafood', label: 'Fish & Seafood' },
  { id: 'legumes', label: 'Legumes & Nuts' }
];

export const VALUE_CHAIN_ACTORS = [
  { id: 'producer', label: 'Farmer / Producer' },
  { id: 'processor', label: 'Processor / Manufacturer' },
  { id: 'distributor', label: 'Distributor / Transporter' },
  { id: 'retailer', label: 'Retailer / Vendor' },
  { id: 'consumer', label: 'Consumer' },
  { id: 'regulator', label: 'Regulator / Policymaker' },
  { id: 'innovator', label: 'Researcher / Innovator' },
  { id: 'investor', label: 'Investor / Financier' }
];
