import { LoadCode, VehicleTypeCode, FeatureCode } from '../types';

export function formatMinutes(mins: number): string {
  if (mins < 1) {
    return 'Arr';
  }
  return `${mins} min`;
}

export function formatLoadText(load: LoadCode): string {
  switch (load) {
    case 'SEA':
      return 'Seats available';
    case 'SDA':
      return 'Standing available';
    case 'LSD':
      return 'Limited standing';
    default:
      return load;
  }
}

export function getSeatPillClasses(load: LoadCode): string {
  switch (load) {
    case 'SEA':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'SDA':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'LSD':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getLoadColorClasses(load: LoadCode): {
  bg: string;
  text: string;
  dot: string;
  border: string;
} {
  switch (load) {
    case 'SEA':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
        border: 'border-emerald-200',
      };
    case 'SDA':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-200',
      };
    case 'LSD':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        dot: 'bg-rose-500',
        border: 'border-rose-200',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        dot: 'bg-slate-500',
        border: 'border-slate-200',
      };
  }
}

export function formatVehicleType(type: VehicleTypeCode): string {
  switch (type) {
    case 'SD':
      return 'Single deck';
    case 'DD':
      return 'Double deck';
    case 'BD':
      return 'Bendy';
    default:
      return type;
  }
}

export function formatFeature(feature: FeatureCode): string {
  if (feature === 'WAB') {
    return 'Wheelchair accessible';
  }
  return '';
}
