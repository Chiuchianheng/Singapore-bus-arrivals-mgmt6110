import React, { useState, useEffect } from 'react';
import { X, MapPin, Pencil } from 'lucide-react';

interface SavedStopsProps {
  savedStops: string[];
  savedLabels?: Record<string, string>;
  activeStopCode: string;
  onSelectStop: (code: string) => void;
  onRemoveStop: (code: string) => void;
  onEditLabel: (code: string) => void;
  recentlyRemoved?: { code: string; label?: string } | null;
  onUndo?: () => void;
}

export const SavedStops: React.FC<SavedStopsProps> = ({
  savedStops,
  savedLabels = {},
  activeStopCode,
  onSelectStop,
  onRemoveStop,
  onEditLabel,
  recentlyRemoved,
  onUndo,
}) => {
  const [confirmStop, setConfirmStop] = useState<{
    code: string;
    label: string | null;
  } | null>(null);

  useEffect(() => {
    if (!confirmStop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmStop(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmStop]);

  const undoButtonText = recentlyRemoved
    ? recentlyRemoved.label && recentlyRemoved.label.trim()
      ? `Undo remove ${recentlyRemoved.label.trim()} (Stop ${recentlyRemoved.code})`
      : `Undo remove Stop ${recentlyRemoved.code}`
    : '';

  return (
    <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 min-h-[36px]">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Saved Stops
          </h2>
        </div>

        {recentlyRemoved && (
          <button
            type="button"
            id="undo-remove-stop-button"
            onClick={onUndo}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 min-h-[36px]"
          >
            {undoButtonText}
          </button>
        )}
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
                  className="px-3 py-1.5 text-left cursor-pointer flex items-center min-h-[44px]"
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

                <div className="flex items-center border-l border-slate-200/60">
                  <button
                    type="button"
                    id={`edit-label-stop-${stopCode}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLabel(stopCode);
                    }}
                    className="w-11 h-11 inline-flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer rounded-lg"
                    title={`Edit label for Stop ${stopCode}`}
                    aria-label={`Edit label for Stop ${stopCode}`}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    id={`remove-stop-${stopCode}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmStop({ code: stopCode, label });
                    }}
                    className="w-11 h-11 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-r-xl"
                    title={`Remove Stop ${stopCode}`}
                    aria-label={`Remove Stop ${stopCode}`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmStop && (
        <div
          id="remove-stop-dialog-backdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setConfirmStop(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-stop-dialog-title"
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="remove-stop-dialog-title"
              className="text-base font-semibold text-slate-900 mb-2 leading-snug"
            >
              {confirmStop.label
                ? `Remove ${confirmStop.label} (Stop ${confirmStop.code}) from your saved stops?`
                : `Remove Stop ${confirmStop.code} from your saved stops?`}
            </h3>
            <div className="flex gap-2.5 justify-end mt-5">
              <button
                type="button"
                id="cancel-remove-stop-button"
                onClick={() => setConfirmStop(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-remove-stop-button"
                onClick={() => {
                  const code = confirmStop.code;
                  setConfirmStop(null);
                  onRemoveStop(code);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
