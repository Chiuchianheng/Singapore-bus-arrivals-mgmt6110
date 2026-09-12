import React from 'react';
import { X, MapPin } from 'lucide-react';

interface SavedStopsProps {
  savedStops: string[];
  activeStopCode: string;
  onSelectStop: (code: string) => void;
  onRemoveStop: (code: string) => void;
}

export const SavedStops: React.FC<SavedStopsProps> = ({
  savedStops,
  activeStopCode,
  onSelectStop,
  onRemoveStop,
}) => {
  return (
    <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs mb-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Saved Stops
        </h2>
      </div>

      {savedStops.length === 0 ? (
        <p className="text-xs sm:text-sm text-slate-500 py-1.5 italic">
          No saved stops yet. Load a stop and add it.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {savedStops.map((stopCode) => {
            const isActive = stopCode === activeStopCode;
            return (
              <div
                key={stopCode}
                id={`saved-stop-${stopCode}`}
                className={`inline-flex items-center rounded-xl border text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectStop(stopCode)}
                  className="px-3 py-2 text-left cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                >
                  <span>Stop {stopCode}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStop(stopCode);
                  }}
                  className="p-1.5 pr-2.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-r-xl"
                  title={`Remove stop ${stopCode}`}
                  aria-label={`Remove stop ${stopCode}`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
