import React from 'react';
import { Bus, Clock, RotateCw, Activity } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdatedTime?: string;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  lastUpdatedTime,
  isRefreshing = false,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20 px-4 py-3 sm:px-6 shadow-xs">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bus className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Singapore Bus Arrivals
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Auto-refreshes every 20 seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            id="header-refresh-btn"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>

          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            id="header-status-check-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Status check</span>
          </a>

          {lastUpdatedTime && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Last updated:</span>
              <span className="font-semibold text-slate-800">{lastUpdatedTime}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

