import React, { useState } from 'react';
import { Search, BookmarkPlus, Check } from 'lucide-react';

interface StopSearchProps {
  currentStopCode: string;
  onLoadStop: (code: string) => void;
  onAddCurrentStop: (code: string) => void;
  onEditCurrentStopLabel?: (code: string) => void;
  isCurrentStopSaved: boolean;
}

export const StopSearch: React.FC<StopSearchProps> = ({
  currentStopCode,
  onLoadStop,
  onAddCurrentStop,
  onEditCurrentStopLabel,
  isCurrentStopSaved,
}) => {
  const [inputVal, setInputVal] = useState(currentStopCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onLoadStop(inputVal.trim());
    }
  };

  const handleAddStop = () => {
    if (currentStopCode.trim()) {
      if (isCurrentStopSaved) {
        onEditCurrentStopLabel?.(currentStopCode.trim());
      } else {
        onAddCurrentStop(currentStopCode.trim());
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-4">
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
            disabled={!currentStopCode}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-medium text-sm transition-colors inline-flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              isCurrentStopSaved
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200'
            }`}
            title={isCurrentStopSaved ? 'Saved (click to edit label)' : 'Add current stop to saved stops'}
          >
            {isCurrentStopSaved ? (
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
    </section>
  );
};
