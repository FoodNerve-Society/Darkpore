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
