import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 pt-6 pb-10 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
      <p className="max-w-lg mx-auto leading-relaxed text-slate-500">
        Contains information from Bus Arrival API accessed via{' '}
        <span className="font-semibold text-slate-700">LTA DataMall</span> which is made available under the terms of the{' '}
        <a
          href="https://data.gov.sg/open-data-licence"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-slate-600 hover:text-slate-800 transition-colors"
        >
          Singapore Open Data Licence version 1.0
        </a>.
      </p>
      <p className="max-w-md mx-auto text-[11px] leading-relaxed text-slate-400">
        Destination and waypoint names are not shown because they need a separate dataset of five thousand bus stops.
      </p>
    </footer>
  );
};

