import React, { useState } from 'react';
import { BusService, BusArrival, BusStopRecord } from '../types';
import {
  formatLoadText,
  formatVehicleType,
  formatFeature,
  getSeatPillClasses,
} from '../utils/formatters';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchBusRoute } from '../services/ltaApi';

interface ServiceRowProps {
  service: BusService;
  currentStopCode: string;
  stopsCatalog: Record<string, BusStopRecord>;
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

export const ServiceRow: React.FC<ServiceRowProps> = ({
  service,
  currentStopCode,
  stopsCatalog,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showAllStops, setShowAllStops] = useState<boolean>(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeStops, setRouteStops] = useState<string[] | null>(null);
  const [directionDetermined, setDirectionDetermined] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);

  const nextBus = service.buses[0];
  const nextBus2 = service.buses[1];

  const destinationCode =
    service.destinationCode ||
    nextBus?.destinationCode ||
    nextBus2?.destinationCode ||
    '';

  const destinationRecord = destinationCode ? stopsCatalog[destinationCode] : null;
  const destinationName = destinationRecord?.Description || '';

  const loadText = nextBus ? formatLoadText(nextBus.load) : '';
  const vehicleTypeText = nextBus ? formatVehicleType(nextBus.type) : '';
  const featureText = nextBus ? formatFeature(nextBus.feature) : '';

  const handleToggleExpand = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    // Fetch the route only on first expansion
    if (nextState && routeStops === null && !isLoadingRoute) {
      setIsLoadingRoute(true);
      setFetchError(false);
      try {
        const result = await fetchBusRoute(
          service.serviceNo,
          currentStopCode,
          destinationCode
        );
        if (!result.isAvailable) {
          setFetchError(true);
        } else {
          setDirectionDetermined(result.directionDetermined);
          setRouteStops(result.stops);
        }
      } catch {
        setFetchError(true);
      } finally {
        setIsLoadingRoute(false);
      }
    }
  };

  // Build the list of stops after the current stop
  let upcomingStops: string[] = [];
  if (routeStops && routeStops.length > 0) {
    const normalizedCurrent = currentStopCode.padStart(5, '0');
    const currentIndex = routeStops.indexOf(normalizedCurrent);
    if (currentIndex !== -1) {
      upcomingStops = routeStops.slice(currentIndex + 1);
    } else {
      // If current stop was not found along route sequence, use entire route
      upcomingStops = routeStops;
    }
  }

  const renderExpandedContent = () => {
    if (isLoadingRoute) {
      return (
        <div className="py-2.5 px-3 text-xs text-slate-500 italic">
          Loading stops…
        </div>
      );
    }

    if (fetchError) {
      return (
        <div className="py-2.5 px-3 text-xs text-slate-500">
          Stops are not available right now.
        </div>
      );
    }

    // "If the direction cannot be worked out clearly, show only 'Towards [destination]'."
    if (!directionDetermined || !routeStops || upcomingStops.length === 0) {
      if (destinationName) {
        return (
          <div className="py-2.5 px-3 text-xs text-slate-600 font-medium">
            Towards {destinationName}
          </div>
        );
      }
      return (
        <div className="py-2.5 px-3 text-xs text-slate-500">
          Stops are not available right now.
        </div>
      );
    }

    // "It lists the next 4 stops after the current stop, then '… [N] more stops' as a button 'Show all [total] stops', then the last stop in bold, using stop names from /api/stops.
    // Tapping it shows every remaining stop in order, in an area of limited height that scrolls on its own, with the last stop still in bold at the end, and a 'Show fewer' button that returns to the short list."
    const totalUpcoming = upcomingStops.length;
    const firstFour = upcomingStops.slice(0, 4);
    const lastStopCode = upcomingStops[totalUpcoming - 1];
    const moreCount = totalUpcoming > 5 ? totalUpcoming - 5 : 0;
    const showLastStopSeparately = totalUpcoming > 4;

    if (showAllStops) {
      return (
        <div className="py-2.5 px-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-700">Next stops ({totalUpcoming}):</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllStops(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer text-[11px]"
            >
              Show fewer
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto pr-1 rounded border border-slate-200/70 bg-white/70 p-2">
            <ol className="space-y-1 list-none">
              {upcomingStops.map((stopCode, idx) => {
                const isLast = idx === totalUpcoming - 1;
                const record = stopsCatalog[stopCode];
                const name = record ? record.Description : `Stop ${stopCode}`;
                return (
                  <li
                    key={`${stopCode}-${idx}`}
                    className={`flex items-center gap-1.5 ${
                      isLast ? 'text-slate-900 font-bold pt-1 border-t border-slate-100' : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isLast ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{name}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      );
    }

    return (
      <div className="py-2.5 px-3 text-xs space-y-1.5">
        <div className="font-semibold text-slate-700 mb-1">Next stops:</div>
        <ol className="space-y-1 list-none pl-1">
          {firstFour.map((stopCode, idx) => {
            const record = stopsCatalog[stopCode];
            const name = record ? record.Description : `Stop ${stopCode}`;
            return (
              <li key={`${stopCode}-${idx}`} className="text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span className="truncate">{name}</span>
              </li>
            );
          })}

          {moreCount > 0 && (
            <li className="pl-3 py-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllStops(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer text-left"
              >
                Show all {totalUpcoming} stops
              </button>
            </li>
          )}

          {showLastStopSeparately && (
            <li className="text-slate-900 font-bold flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {stopsCatalog[lastStopCode]
                  ? stopsCatalog[lastStopCode].Description
                  : `Stop ${lastStopCode}`}
              </span>
            </li>
          )}
        </ol>
      </div>
    );
  };

  return (
    <div
      id={`service-row-${service.serviceNo}`}
      className="transition-colors hover:bg-slate-50/60"
    >
      {/* Tappable row */}
      <button
        type="button"
        onClick={handleToggleExpand}
        className="w-full text-left grid grid-cols-[1fr_88px_116px] sm:grid-cols-[1fr_100px_130px] items-center px-4 py-3 gap-2.5 cursor-pointer focus:outline-none focus:bg-slate-50/80"
        aria-expanded={isExpanded}
        aria-label={`Bus ${service.serviceNo}, tap to view next stops`}
      >
        {/* Left Column: Service Number, small arrow, destination, and status subtext */}
        <div className="pr-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-800 font-medium rounded-lg px-2.5 py-1 text-sm sm:text-base">
              {service.serviceNo}
            </span>
            <span className="text-slate-400 p-0.5 rounded hover:text-slate-600 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </span>
          </div>

          {/* Destination line: small, muted, one-line "To [destination stop name]", cut off with an ellipsis if long */}
          {destinationName && (
            <div
              className="text-[11px] sm:text-xs text-slate-500 font-normal truncate mt-0.5 max-w-full"
              title={`To ${destinationName}`}
            >
              To {destinationName}
            </div>
          )}

          {nextBus && (
            <div className="mt-1 text-xs leading-tight">
              {/* Seat wording in coloured pill, deck type & Wheelchair in plain grey */}
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
      </button>

      {/* Expanded next stops drawer */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-2 border-b border-slate-100">
          {renderExpandedContent()}
        </div>
      )}
    </div>
  );
};
