import React, { useState } from 'react';
import { Bus, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const [updatedTime] = useState<string>(() => {
    return (
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' SGT'
    );
  });

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20 px-4 py-3 sm:px-6 shadow-xs">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Singapore Bus Arrivals
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Live commuter arrival board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Last updated:</span>
          <span className="font-semibold text-slate-800">{updatedTime}</span>
        </div>
      </div>
    </header>
  );
};

