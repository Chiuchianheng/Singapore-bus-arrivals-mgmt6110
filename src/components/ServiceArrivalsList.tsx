import React from 'react';
import { BusStopData, BusService } from '../types';
import { ServiceRow } from './ServiceRow';
import { IncomingBusesBanner } from './IncomingBusesBanner';
import { ArrivalFetchStatus, STATUS_MESSAGES } from '../services/ltaApi';

interface ServiceArrivalsListProps {
  stopCode: string;
  status: ArrivalFetchStatus;
  stopData: BusStopData | null;
  errorMessage?: string;
}

export const ServiceArrivalsList: React.FC<ServiceArrivalsListProps> = ({
  status,
  stopData,
  errorMessage,
}) => {
  if (status === 'loading') {
    return (
      <section
        id="status-notice-loading"
        className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs my-4"
      >
        <p className="text-sm sm:text-base font-medium text-slate-600">
          {STATUS_MESSAGES.loading}
        </p>
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section
        id="status-notice-empty"
        className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs my-4"
      >
        <p className="text-sm sm:text-base font-medium text-slate-600">
          {STATUS_MESSAGES.empty}
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          If this stop code is new to you, check it against the sign at the stop.
        </p>
      </section>
    );
  }

  if (status === 'refused') {
    return (
      <section
        id="status-notice-refused"
        className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs my-4"
      >
        <p className="text-sm sm:text-base font-medium text-slate-600">
          {errorMessage || STATUS_MESSAGES.refused}
        </p>
      </section>
    );
  }

  if (status === 'unreachable') {
    return (
      <section
        id="status-notice-unreachable"
        className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs my-4"
      >
        <p className="text-sm sm:text-base font-medium text-slate-600">
          {STATUS_MESSAGES.unreachable}
        </p>
      </section>
    );
  }

  if (!stopData || !stopData.services || stopData.services.length === 0) {
    return (
      <section
        id="status-notice-empty-fallback"
        className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center shadow-xs my-4"
      >
        <p className="text-sm sm:text-base font-medium text-slate-600">
          {STATUS_MESSAGES.empty}
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          If this stop code is new to you, check it against the sign at the stop.
        </p>
      </section>
    );
  }

  // Sort services by how soon the next bus arrives
  const sortedServices: BusService[] = [...stopData.services].sort((a, b) => {
    const aMins = a.buses.length > 0 ? a.buses[0].estimatedMinutes : Infinity;
    const bMins = b.buses.length > 0 ? b.buses[0].estimatedMinutes : Infinity;
    if (aMins !== bMins) return aMins - bMins;
    return a.serviceNo.localeCompare(b.serviceNo, undefined, { numeric: true });
  });

  return (
    <section className="my-4">
      {/* Incoming Buses Banner */}
      <IncomingBusesBanner services={sortedServices} />

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Row */}
        <div className="grid grid-cols-[1fr_88px_116px] sm:grid-cols-[1fr_100px_130px] items-center px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <div>BUS SERVICE</div>
          <div className="text-center">NEXT BUS</div>
          <div className="text-center">SUBSEQUENT BUS</div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-slate-100">
          {sortedServices.map((service) => (
            <ServiceRow key={service.serviceNo} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

