import React, { useState, useEffect } from 'react';
import { BusArrival, BusStopData } from '../types';
import { formatLoadText, getSeatPillClasses } from '../utils/formatters';
import {
  fetchStopArrivals,
  ArrivalFetchStatus,
  STATUS_MESSAGES,
} from '../services/ltaApi';

interface MyStopsViewProps {
  savedStops: string[];
  onSelectStop: (stopCode: string) => void;
  refreshTrigger?: number;
}

interface ServiceArrivalItem {
  serviceNo: string;
  bus: BusArrival;
}

interface SavedStopState {
  stopCode: string;
  status: ArrivalFetchStatus;
  data: BusStopData | null;
  soonestMinutes: number;
  topServices: ServiceArrivalItem[];
}

export const MyStopsView: React.FC<MyStopsViewProps> = ({
  savedStops,
  onSelectStop,
  refreshTrigger = 0,
}) => {
  const [stopsData, setStopsData] = useState<Record<string, SavedStopState>>({});
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(true);

  useEffect(() => {
    if (savedStops.length === 0) {
      setStopsData({});
      setIsLoadingAll(false);
      return;
    }

    let isCancelled = false;
    // Keep showing previous data during periodic auto-refresh, only set full loading if no data yet
    if (Object.keys(stopsData).length === 0) {
      setIsLoadingAll(true);
    }

    // Call /api/arrivals once per saved stop
    const fetchPromises = savedStops.map(async (stopCode) => {
      const res = await fetchStopArrivals(stopCode);
      const services = res.data?.services || [];

      const servicesWithBuses: ServiceArrivalItem[] = [];
      for (const s of services) {
        if (s.buses && s.buses.length > 0) {
          servicesWithBuses.push({
            serviceNo: s.serviceNo,
            bus: s.buses[0],
          });
        }
      }

      // Order services by soonest arrival first
      servicesWithBuses.sort((a, b) => a.bus.estimatedMinutes - b.bus.estimatedMinutes);
      const topServices = servicesWithBuses.slice(0, 3);
      const soonestMinutes =
        topServices.length > 0 ? topServices[0].bus.estimatedMinutes : Infinity;

      let effectiveStatus = res.status;
      if (res.status === 'success' && topServices.length === 0) {
        effectiveStatus = 'empty';
      }

      return {
        stopCode,
        status: effectiveStatus,
        data: res.data,
        soonestMinutes,
        topServices,
      };
    });

    Promise.all(fetchPromises).then((results) => {
      if (isCancelled) return;
      const record: Record<string, SavedStopState> = {};
      for (const item of results) {
        record[item.stopCode] = item;
      }
      setStopsData(record);
      setIsLoadingAll(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [savedStops.join(','), refreshTrigger]);

  if (savedStops.length === 0) {
    return (
      <div
        id="empty-saved-stops-notice"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 text-center text-sm sm:text-base text-slate-500 my-4"
      >
        No saved stops yet. Find a stop on the Stop tab and add it.
      </div>
    );
  }

  // Global loading state: all stops loading
  if (isLoadingAll) {
    return (
      <div
        id="my-stops-loading-notice"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 text-center text-sm sm:text-base text-slate-600 my-4"
      >
        {STATUS_MESSAGES.loading}
      </div>
    );
  }

  const rows: SavedStopState[] = savedStops.map((stopCode) => {
    return (
      stopsData[stopCode] || {
        stopCode,
        status: 'loading',
        data: null,
        soonestMinutes: Infinity,
        topServices: [],
      }
    );
  });

  // Check if ALL saved stops returned the exact same error / empty state
  const allUnreachable = rows.every((r) => r.status === 'unreachable');
  if (allUnreachable) {
    return (
      <div
        id="my-stops-unreachable-notice"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 text-center text-sm sm:text-base text-slate-600 my-4"
      >
        {STATUS_MESSAGES.unreachable}
      </div>
    );
  }

  const allRefused = rows.every((r) => r.status === 'refused');
  if (allRefused) {
    return (
      <div
        id="my-stops-refused-notice"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 text-center text-sm sm:text-base text-slate-600 my-4"
      >
        {STATUS_MESSAGES.refused}
      </div>
    );
  }

  const allEmpty = rows.every((r) => r.status === 'empty');
  if (allEmpty) {
    return (
      <div
        id="my-stops-empty-notice"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 text-center text-sm sm:text-base text-slate-600 my-4"
      >
        {STATUS_MESSAGES.empty}
      </div>
    );
  }

  // Rows ordered by which stop has a bus coming soonest
  rows.sort((a, b) => a.soonestMinutes - b.soonestMinutes);

  return (
    <div className="my-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] items-center px-3.5 sm:px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider gap-3 sm:gap-4">
          <div>STOP</div>
          <div>NEXT 3 SERVICES</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {rows.map(({ stopCode, status, topServices }) => {
            return (
              <div
                key={stopCode}
                id={`my-stop-row-${stopCode}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectStop(stopCode)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStop(stopCode);
                  }
                }}
                className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] items-center px-3.5 sm:px-4 py-3 gap-3 sm:gap-4 cursor-pointer transition-colors hover:bg-slate-50/80 active:bg-slate-100 focus:outline-hidden focus-visible:bg-slate-50"
              >
                {/* Left: Stop code */}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider sm:hidden">
                    Stop
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-800 leading-tight truncate">
                    <span className="hidden sm:inline">Stop </span>
                    {stopCode}
                  </div>
                </div>

                {/* Right: Next 3 services side by side OR status sentence */}
                {status === 'success' && topServices.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {topServices.map(({ serviceNo, bus }) => {
                      const isArriving = bus.estimatedMinutes < 1;
                      const loadText = formatLoadText(bus.load);

                      return (
                        <div
                          key={serviceNo}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-colors ${
                            isArriving
                              ? 'animate-soft-pulse border-emerald-200'
                              : 'bg-slate-50 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          {/* Service number */}
                          <div
                            className={`text-xs sm:text-sm font-semibold leading-tight ${
                              isArriving ? 'text-emerald-950' : 'text-slate-900'
                            }`}
                          >
                            {serviceNo}
                          </div>

                          {/* Arrival time */}
                          <div className="my-0.5">
                            {isArriving ? (
                              <span className="inline-flex items-center justify-center gap-1 text-emerald-800 font-medium text-[11px] sm:text-xs whitespace-nowrap">
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>Arriving</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-baseline justify-center whitespace-nowrap text-xs sm:text-sm font-medium text-slate-800">
                                <span>{bus.estimatedMinutes}</span>
                                <span className="text-[10px] font-normal ml-0.5 text-slate-400">
                                  min
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Seat colour pill */}
                          <div className="mt-0.5 flex justify-center w-full">
                            <span
                              className={`inline-block px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border leading-none text-center truncate max-w-full ${getSeatPillClasses(
                                bus.load
                              )}`}
                              title={loadText}
                            >
                              <span className="hidden sm:inline">{loadText}</span>
                              <span className="sm:hidden">
                                {bus.load === 'SEA'
                                  ? 'Seats'
                                  : bus.load === 'SDA'
                                  ? 'Standing'
                                  : 'Limited'}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-500 italic py-2">
                    {status === 'loading'
                      ? STATUS_MESSAGES.loading
                      : status === 'refused'
                      ? STATUS_MESSAGES.refused
                      : status === 'unreachable'
                      ? STATUS_MESSAGES.unreachable
                      : STATUS_MESSAGES.empty}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
