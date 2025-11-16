/**
 * Badge component voor status en type indicaties
 */

import type { PriceType, CoverageStatus, ComponentCoverageStatus } from '@/domain/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helpers voor specifieke badge types

export function PriceTypeBadge({ type }: { type: PriceType }) {
  const variantMap: Record<PriceType, BadgeVariant> = {
    VAST: 'success',
    STELPOST: 'warning',
    INDICATIE: 'info',
    NOG: 'danger',
    ONBEKEND: 'default',
  };

  const labelMap: Record<PriceType, string> = {
    VAST: 'Vast',
    STELPOST: 'Stelpost',
    INDICATIE: 'Indicatie',
    NOG: 'NOG',
    ONBEKEND: 'Onbekend',
  };

  return <Badge variant={variantMap[type]}>{labelMap[type]}</Badge>;
}

export function CoverageStatusBadge({ status }: { status: CoverageStatus }) {
  const variantMap: Record<CoverageStatus, BadgeVariant> = {
    INCLUSIEF: 'success',
    STELPOST: 'warning',
    INDICATIE: 'info',
    NIET_OPGENOMEN: 'danger',
    ONDERDEEL_ONBEKEND: 'default',
    BUITEN_SCOPE: 'default',
  };

  const labelMap: Record<CoverageStatus, string> = {
    INCLUSIEF: 'Inclusief',
    STELPOST: 'Stelpost',
    INDICATIE: 'Indicatie',
    NIET_OPGENOMEN: 'Niet opgenomen',
    ONDERDEEL_ONBEKEND: 'Onbekend',
    BUITEN_SCOPE: 'Buiten scope',
  };

  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}

export function ComponentCoverageStatusBadge({ status }: { status: ComponentCoverageStatus }) {
  const variantMap: Record<ComponentCoverageStatus, BadgeVariant> = {
    VOLLEDIG: 'success',
    GEDEELTELIJK: 'info',
    STELPOST_ONLY: 'warning',
    INDICATIE_ONLY: 'info',
    ONTBREEKT: 'danger',
  };

  const labelMap: Record<ComponentCoverageStatus, string> = {
    VOLLEDIG: 'Volledig',
    GEDEELTELIJK: 'Gedeeltelijk',
    STELPOST_ONLY: 'Alleen stelpost',
    INDICATIE_ONLY: 'Alleen indicatie',
    ONTBREEKT: 'Ontbreekt',
  };

  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>;
}
