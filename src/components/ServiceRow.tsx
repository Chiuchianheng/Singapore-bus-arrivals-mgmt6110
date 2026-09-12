import React from 'react';
import { BusService, BusArrival } from '../types';
import {
  formatLoadText,
  formatVehicleType,
  formatFeature,
  getSeatPillClasses,
} from '../utils/formatters';
import { Clock } from 'lucide-react';

interface ServiceRowProps {
  service: BusService;
}

const ArrivalCell: React.FC<{ bus?: BusArrival }> = ({ bus }) => {
  if (!bus) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-[84px] sm:max-w-[92px] bg-slate-100 text-slate-400 rounded-lg px-2 py-1.5 text-center text-sm sm:text-base font-medium">
          —
        </div>
      </div>
    );
  }

  const isArriving = bus.estimatedMinutes < 1;

  return (
    <div className="flex justify-center">
      <div
        className={`w-full max-w-[84px] sm:max-w-[92px] rounded-lg px-2 py-1.5 text-center text-sm sm:text-base font-medium transition-colors ${
          isArriving
            ? 'animate-soft-pulse border border-emerald-200'
            : 'bg-slate-100 border border-transparent text-slate-800'
        }`}
      >
        {isArriving ? (
          <span className="inline-flex items-center justify-center gap-1 text-emerald-800 font-medium text-sm sm:text-base whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
            <span>Arriving</span>
          </span>
        ) : (
          <span className="inline-flex items-baseline justify-center whitespace-nowrap text-slate-800">
            <span>{bus.estimatedMinutes}</span>
            <span className="text-[10px] sm:text-xs font-normal ml-0.5 text-slate-400">
              min
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export const ServiceRow: React.FC<ServiceRowProps> = ({ service }) => {
  const nextBus = service.buses[0];
  const nextBus2 = service.buses[1];

  const loadText = nextBus ? formatLoadText(nextBus.load) : '';
  const vehicleTypeText = nextBus ? formatVehicleType(nextBus.type) : '';
  const featureText = nextBus ? formatFeature(nextBus.feature) : '';

  return (
    <div
      id={`service-row-${service.serviceNo}`}
      className="grid grid-cols-[1fr_88px_116px] sm:grid-cols-[1fr_100px_130px] items-center px-4 py-3 gap-2.5 transition-colors hover:bg-slate-50/60"
    >
      {/* Left Column: Service Number in light grey rounded box with dark text, with quiet subtext */}
      <div className="pr-2 min-w-0">
        <div className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-800 font-medium rounded-lg px-2.5 py-1 text-sm sm:text-base">
          {service.serviceNo}
        </div>

        {nextBus && (
          <div className="mt-1 text-xs leading-tight">
            {/* Seat wording in coloured pill, deck type & Wheelchair in plain grey using spacing without orphaned dots */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`inline-block px-1.5 py-0.5 rounded-md text-[11px] font-medium border leading-none whitespace-nowrap ${getSeatPillClasses(
                  nextBus.load
                )}`}
              >
                {loadText}
              </span>
              {vehicleTypeText && (
                <span className="text-slate-500 whitespace-nowrap">{vehicleTypeText}</span>
              )}
              {featureText && (
                <span className="text-slate-500 whitespace-nowrap">Wheelchair</span>
              )}
            </div>

            {/* Scheduled note: visible with clock glyph and brown text on its own line */}
            {!nextBus.tracked && (
              <div className="flex items-center gap-1 text-[11px] text-amber-900 font-normal mt-1">
                <Clock className="w-3 h-3 shrink-0 text-amber-900" aria-hidden="true" />
                <span>scheduled, not tracked</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Middle Column: Next Bus */}
      <ArrivalCell bus={nextBus} />

      {/* Right Column: Subsequent Bus */}
      <ArrivalCell bus={nextBus2} />
    </div>
  );
};


