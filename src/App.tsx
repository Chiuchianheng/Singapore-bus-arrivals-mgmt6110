import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StopSearch } from './components/StopSearch';
import { SavedStops } from './components/SavedStops';
import { ServiceArrivalsList } from './components/ServiceArrivalsList';
import { MyStopsView } from './components/MyStopsView';
import { Footer } from './components/Footer';
import { BusStopData } from './types';
import { fetchStopArrivals, ArrivalFetchStatus } from './services/ltaApi';

const STORAGE_KEY = 'sg_commuter_saved_stops';

export default function App() {
  const [activeTab, setActiveTab] = useState<'stop' | 'my-stops'>('stop');
  const [currentStopCode, setCurrentStopCode] = useState<string>('11149');
  const [stopData, setStopData] = useState<BusStopData | null>(null);
  const [fetchStatus, setFetchStatus] = useState<ArrivalFetchStatus>('loading');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => {
    return (
      new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' SGT'
    );
  });

  const [savedStops, setSavedStops] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if localStorage read fails
    }
    // Default initial saved stops for commuter convenience
    return ['11149', '04121'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStops));
    } catch {
      // Ignore write errors (e.g. private browsing restrictions)
    }
  }, [savedStops]);

  // Load arrivals for the active stop code
  const loadStopArrivals = useCallback(
    async (code: string, mode: 'initial' | 'silent' | 'manual' = 'initial') => {
      const trimmed = code.trim();
      if (!trimmed) {
        setFetchStatus('refused');
        setStopData(null);
        return;
      }

      if (mode === 'initial') {
        setFetchStatus('loading');
        setStopData(null);
      } else if (mode === 'manual') {
        setIsRefreshing(true);
      }

      try {
        const result = await fetchStopArrivals(trimmed);
        setFetchStatus(result.status);
        setStopData(result.data);
        setLastUpdatedTime(
          new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' SGT'
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab === 'stop' && currentStopCode) {
      loadStopArrivals(currentStopCode, 'initial');
    }
  }, [currentStopCode, activeTab, loadStopArrivals]);

  // Refresh current stop immediately (manual button click)
  const handleRefresh = useCallback(() => {
    if (activeTab === 'stop' && currentStopCode) {
      loadStopArrivals(currentStopCode, 'manual');
    }
    setRefreshTrigger((prev) => prev + 1);
  }, [activeTab, currentStopCode, loadStopArrivals]);

  // 20-second automatic refresh loop matching LTA's feed interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'stop' && currentStopCode) {
        loadStopArrivals(currentStopCode, 'silent');
      }
      setRefreshTrigger((prev) => prev + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, [activeTab, currentStopCode, loadStopArrivals]);

  const handleLoadStop = (code: string) => {
    setCurrentStopCode(code);
    loadStopArrivals(code, 'initial');
  };

  const handleAddStop = (code: string) => {
    if (!code) return;
    if (!savedStops.includes(code)) {
      setSavedStops((prev) => [...prev, code]);
    }
  };

  const handleRemoveStop = (code: string) => {
    setSavedStops((prev) => prev.filter((s) => s !== code));
  };

  const handleSelectFromMyStops = (code: string) => {
    setCurrentStopCode(code);
    setActiveTab('stop');
    loadStopArrivals(code, 'initial');
  };

  const isCurrentStopSaved = savedStops.includes(currentStopCode);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      <Header
        onRefresh={handleRefresh}
        lastUpdatedTime={lastUpdatedTime}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Top Tab Bar */}
        <div
          className="flex border-b border-slate-200 mb-4"
          role="tablist"
          aria-label="Screen Selection"
        >
          <button
            type="button"
            role="tab"
            id="tab-stop"
            aria-selected={activeTab === 'stop'}
            aria-controls="tabpanel-stop"
            onClick={() => setActiveTab('stop')}
            className={`pb-2.5 px-4 text-sm font-semibold transition-colors cursor-pointer relative ${
              activeTab === 'stop'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Stop
          </button>
          <button
            type="button"
            role="tab"
            id="tab-my-stops"
            aria-selected={activeTab === 'my-stops'}
            aria-controls="tabpanel-my-stops"
            onClick={() => setActiveTab('my-stops')}
            className={`pb-2.5 px-4 text-sm font-semibold transition-colors cursor-pointer relative ${
              activeTab === 'my-stops'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My stops
          </button>
        </div>

        {/* Screen 1: Stop */}
        {activeTab === 'stop' ? (
          <div id="tabpanel-stop" role="tabpanel" aria-labelledby="tab-stop">
            <StopSearch
              currentStopCode={currentStopCode}
              onLoadStop={handleLoadStop}
              onAddCurrentStop={handleAddStop}
              isCurrentStopSaved={isCurrentStopSaved}
            />

            <SavedStops
              savedStops={savedStops}
              activeStopCode={currentStopCode}
              onSelectStop={handleLoadStop}
              onRemoveStop={handleRemoveStop}
            />

            <ServiceArrivalsList
              stopCode={currentStopCode}
              status={fetchStatus}
              stopData={stopData}
            />
          </div>
        ) : (
          /* Screen 2: My stops */
          <div id="tabpanel-my-stops" role="tabpanel" aria-labelledby="tab-my-stops">
            <MyStopsView
              savedStops={savedStops}
              onSelectStop={handleSelectFromMyStops}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
