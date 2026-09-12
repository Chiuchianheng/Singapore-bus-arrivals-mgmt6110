import React from 'react';
import { BusService } from '../types';

interface IncomingBusesBannerProps {
  services: BusService[];
}

export const IncomingBusesBanner: React.FC<IncomingBusesBannerProps> = ({ services }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 mb-4">
      {/* Label and Note */}
      <div className="flex flex-wrap items-baseline gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          INCOMING BUSES
        </span>
        <span className="text-xs text-slate-400 italic">
          Buses might not arrive in exact order.
        </span>
      </div>

      {/* Horizontal row of chips, ordered by earliest next bus */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-1.5 pt-0.5">
        {services.map((service) => {
          const nextBus = service.buses[0];
          const isArriving = nextBus && nextBus.estimatedMinutes < 1;

          return (
            <div
              key={service.serviceNo}
              id={`incoming-chip-${service.serviceNo}`}
              className={`flex flex-col items-center justify-center px-3.5 sm:px-4 py-2 rounded-xl text-center shrink-0 transition-colors ${
                isArriving
                  ? 'animate-soft-pulse border border-emerald-200'
                  : 'bg-slate-100 border border-slate-200/80 text-slate-800'
              }`}
            >
              {/* Service number on top, large and dark */}
              <div
                className={`text-base font-semibold leading-tight mb-0.5 ${
                  isArriving ? 'text-emerald-950' : 'text-slate-900'
                }`}
              >
                {service.serviceNo}
              </div>

              {/* Arrival time underneath, smaller and grey (or green if arriving) */}
              <div className="text-xs">
                {!nextBus ? (
                  <span className="text-slate-400 font-normal">—</span>
                ) : isArriving ? (
                  <span className="inline-flex items-center justify-center gap-1 text-emerald-800 font-medium whitespace-nowrap text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Arriving</span>
                  </span>
                ) : (
                  <span className="inline-flex items-baseline justify-center whitespace-nowrap text-xs font-normal text-slate-500">
                    <span>{nextBus.estimatedMinutes}</span>
                    <span className="text-[10px] ml-0.5 text-slate-400">
                      min
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
