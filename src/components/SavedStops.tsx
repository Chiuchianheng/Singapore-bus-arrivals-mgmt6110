import React from 'react';
import { X, MapPin, Pencil } from 'lucide-react';

interface SavedStopsProps {
  savedStops: string[];
  savedLabels?: Record<string, string>;
  activeStopCode: string;
  onSelectStop: (code: string) => void;
  onRemoveStop: (code: string) => void;
  onEditLabel: (code: string) => void;
}

export const SavedStops: React.FC<SavedStopsProps> = ({
  savedStops,
  savedLabels = {},
  activeStopCode,
  onSelectStop,
  onRemoveStop,
  onEditLabel,
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
            const rawLabel = savedLabels[stopCode];
            const label = rawLabel && rawLabel.trim() ? rawLabel.trim() : null;

            return (
              <div
                key={stopCode}
                id={`saved-stop-${stopCode}`}
                className={`inline-flex items-center rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  id={`select-saved-stop-${stopCode}`}
                  onClick={() => onSelectStop(stopCode)}
                  className="px-3 py-1.5 text-left cursor-pointer flex items-center min-h-[42px]"
                >
                  {label ? (
                    <div className="flex flex-col leading-tight py-0.5">
                      <span
                        className={`text-sm font-bold ${
                          isActive ? 'text-blue-950' : 'text-slate-900'
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      >
                        Stop {stopCode}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? 'text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      Stop {stopCode}
                    </span>
                  )}
                </button>

                <div className="flex items-center pr-1 border-l border-slate-200/60 ml-0.5">
                  <button
                    type="button"
                    id={`edit-label-stop-${stopCode}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLabel(stopCode);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer rounded-lg"
                    title={`Edit label for stop ${stopCode}`}
                    aria-label={`Edit label for stop ${stopCode}`}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    id={`remove-stop-${stopCode}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStop(stopCode);
                    }}
                    className="p-1.5 pr-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-r-xl"
                    title={`Remove stop ${stopCode}`}
                    aria-label={`Remove stop ${stopCode}`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
