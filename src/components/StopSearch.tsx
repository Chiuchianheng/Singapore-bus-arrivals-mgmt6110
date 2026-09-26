import React, { useState, useEffect } from 'react';
import { Search, BookmarkPlus, Check } from 'lucide-react';
import { BusStopRecord } from '../types';
import { fetchBusStops, ArrivalFetchStatus, ArrivalFetchResult } from '../services/ltaApi';

interface StopSearchProps {
  currentStopCode: string;
  currentStatus?: ArrivalFetchStatus;
  savedStops: string[];
  onLoadStop: (code: string) => Promise<ArrivalFetchResult | null> | void;
  onAddCurrentStop: (code: string) => void;
  onEditCurrentStopLabel?: (code: string) => void;
  isCurrentStopSaved?: boolean;
}

export const StopSearch: React.FC<StopSearchProps> = ({
  currentStopCode,
  currentStatus,
  savedStops = [],
  onLoadStop,
  onAddCurrentStop,
  onEditCurrentStopLabel,
}) => {
  const [inputVal, setInputVal] = useState(currentStopCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListClosed, setIsListClosed] = useState(false);
  const [allStops, setAllStops] = useState<BusStopRecord[]>([]);
  const [searchUnavailable, setSearchUnavailable] = useState(false);

  // Keep stop code input synchronized with current active stop
  useEffect(() => {
    setInputVal(currentStopCode);
  }, [currentStopCode]);

  // Load bus stops directory directly from server route on mount
  useEffect(() => {
    fetchBusStops().then((res) => {
      if (res.isAvailable && res.stops.length > 0) {
        setAllStops(res.stops);
        setSearchUnavailable(false);
      } else {
        setAllStops([]);
        setSearchUnavailable(true);
      }
    });
  }, []);

  const trimmedInput = inputVal.trim();
  const isFiveDigits = /^\d{5}$/.test(trimmedInput);
  const isBoxCodeSaved = isFiveDigits && savedStops.includes(trimmedInput);
  const showFormatError = trimmedInput.length > 0 && !isFiveDigits;
  const isAddDisabled =
    !isFiveDigits || (trimmedInput === currentStopCode && currentStatus === 'not_found');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFiveDigits) {
      return;
    }
    onLoadStop(trimmedInput);
  };

  const handleAddStop = async () => {
    if (!isFiveDigits) return;

    if (trimmedInput !== currentStopCode) {
      const res = await onLoadStop(trimmedInput);
      if (res && res.status === 'not_found') {
        return;
      }
    } else {
      if (currentStatus === 'not_found') {
        return;
      }
    }

    if (savedStops.includes(trimmedInput)) {
      onEditCurrentStopLabel?.(trimmedInput);
    } else {
      onAddCurrentStop(trimmedInput);
    }
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matches = (!searchUnavailable && trimmedQuery)
    ? allStops.filter((stop) => {
        const desc = (stop.Description || '').toLowerCase();
        const road = (stop.RoadName || '').toLowerCase();
        return desc.includes(trimmedQuery) || road.includes(trimmedQuery);
      })
    : [];

  const handleSelectStop = (code: string) => {
    setInputVal(code);
    setIsListClosed(true);
    onLoadStop(code);
  };

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-4">
      {/* Existing Stop Code Input and Load Button */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <label htmlFor="stop-code-input" className="sr-only">
            Bus stop code
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="stop-code-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter 5-digit stop code (e.g. 11149)"
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            id="load-stop-button"
            type="submit"
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            Load
          </button>

          <button
            id="add-stop-button"
            type="button"
            onClick={handleAddStop}
            disabled={isAddDisabled}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-medium text-sm transition-colors inline-flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isBoxCodeSaved
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200'
            }`}
            title={
              !isFiveDigits
                ? (trimmedInput.length > 0 ? 'Stop codes are five digits.' : 'Enter a 5-digit stop code')
                : trimmedInput === currentStopCode && currentStatus === 'not_found'
                ? 'This stop does not exist.'
                : isBoxCodeSaved
                ? 'Saved (click to edit label)'
                : 'Add current stop to saved stops'
            }
          >
            {isBoxCodeSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" aria-hidden="true" />
                <span>Add to my stops</span>
              </>
            )}
          </button>
        </div>
      </form>

      {showFormatError && (
        <p id="stop-code-format-error" className="mt-2 text-xs sm:text-sm text-red-600 font-medium">
          Stop codes are five digits.
        </p>
      )}

      {/* Second Box: Search by bus stop name or road name */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <label
          htmlFor="stop-name-search-input"
          className="block text-xs font-semibold text-slate-600 mb-1.5"
        >
          Search by bus stop name or road name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="stop-name-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsListClosed(false);
            }}
            placeholder={
              searchUnavailable
                ? 'Stop search is not available right now.'
                : 'Search by bus stop name or road name'
            }
            disabled={searchUnavailable}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Message when LTA cannot be reached or key is unconfigured */}
        {searchUnavailable && (
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Stop search is not available right now. You can still enter a 5-digit stop code above.
          </p>
        )}

        {/* Matching Stops List - Grows only as tall as its matches */}
        {!searchUnavailable && trimmedQuery.length > 0 && !isListClosed && (
          <div className="mt-2.5">
            {matches.length === 0 ? (
              <div className="p-3.5 text-center text-sm font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
                No stops found
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-500 font-medium px-1 mb-1.5 flex items-center justify-between">
                  <span>
                    {matches.length === 1 ? '1 match found' : `${matches.length} matches found`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsListClosed(true)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div
                  className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white"
                  role="listbox"
                  aria-label="Matching bus stops"
                >
                  {matches.map((stop) => (
                    <button
                      key={stop.BusStopCode}
                      type="button"
                      onClick={() => handleSelectStop(stop.BusStopCode)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/60 active:bg-blue-100/60 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {stop.Description}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {stop.RoadName}
                        </div>
                      </div>
                      <div className="font-mono font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md shrink-0 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                        {stop.BusStopCode}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
