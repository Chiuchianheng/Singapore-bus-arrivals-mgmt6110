import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, WifiOff } from 'lucide-react';
import { Header } from './components/Header';
import { StopSearch } from './components/StopSearch';
import { SavedStops } from './components/SavedStops';
import { ServiceArrivalsList } from './components/ServiceArrivalsList';
import { MyStopsView } from './components/MyStopsView';
import { StopLabelModal } from './components/StopLabelModal';
import { DisqusComments } from './components/DisqusComments';
import { Footer } from './components/Footer';
import { BusStopData, BusStopRecord } from './types';
import { fetchStopArrivals, fetchBusStops, ArrivalFetchStatus } from './services/ltaApi';

const STORAGE_KEY = 'sg_commuter_saved_stops';
const LABELS_STORAGE_KEY = 'sg_commuter_saved_stop_labels';

export default function App() {
  const [activeTab, setActiveTab] = useState<'stop' | 'my-stops'>('stop');
  const [currentStopCode, setCurrentStopCode] = useState<string>('11149');
  const [stopData, setStopData] = useState<BusStopData | null>(null);
  const [fetchStatus, setFetchStatus] = useState<ArrivalFetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);
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

  const [savedLabels, setSavedLabels] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(LABELS_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if localStorage read fails
    }
    return {};
  });

  const [labelModal, setLabelModal] = useState<{
    isOpen: boolean;
    stopCode: string;
    isEditing: boolean;
    initialLabel: string;
  }>({
    isOpen: false,
    stopCode: '',
    isEditing: false,
    initialLabel: '',
  });

  const [stopsCatalog, setStopsCatalog] = useState<Record<string, BusStopRecord>>({});

  useEffect(() => {
    fetchBusStops().then((res) => {
      if (res.isAvailable && res.stops.length > 0) {
        const map: Record<string, BusStopRecord> = {};
        for (const stop of res.stops) {
          map[stop.BusStopCode] = stop;
        }
        setStopsCatalog(map);
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStops));
    } catch {
      // Ignore write errors (e.g. private browsing restrictions)
    }
  }, [savedStops]);

  useEffect(() => {
    try {
      localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(savedLabels));
    } catch {
      // Ignore write errors
    }
  }, [savedLabels]);

  // Load arrivals for the active stop code
  const loadStopArrivals = useCallback(
    async (code: string, mode: 'initial' | 'silent' | 'manual' = 'initial') => {
      const trimmed = code.trim();
      if (!trimmed) {
        setFetchStatus('refused');
        setStopData(null);
        setErrorMessage('Stop codes are five digits.');
        return;
      }

      if (mode === 'initial') {
        setFetchStatus('loading');
        setStopData(null);
        setErrorMessage('');
      } else if (mode === 'manual') {
        setIsRefreshing(true);
      }

      try {
        const result = await fetchStopArrivals(trimmed);
        setFetchStatus(result.status);
        setStopData(result.data);
        setErrorMessage(result.errorMessage || '');
        setLastUpdatedTime(
          new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' SGT'
        );
        return result;
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

  const formatCheckedTime = (checkedAt?: string): string => {
    if (checkedAt) {
      const match = checkedAt.match(/T(\d{2}):(\d{2})/);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
      }
      try {
        const d = new Date(checkedAt);
        return d
          .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
          .toLowerCase();
      } catch {
        // Fall back below
      }
    }
    return new Date()
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        setSystemStatus({
          type: 'warning',
          message:
            "LTA's live bus data is not responding right now. Arrival times may be missing or out of date.",
        });
        return;
      }
      const data = await res.json();
      if (data && data.upstreamOk === true) {
        const timeStr = formatCheckedTime(data.checkedAt);
        setSystemStatus({
          type: 'success',
          message: `Live bus times are working. Last checked ${timeStr}.`,
        });
      } else {
        setSystemStatus({
          type: 'warning',
          message:
            "LTA's live bus data is not responding right now. Arrival times may be missing or out of date.",
        });
      }
    } catch {
      setSystemStatus({
        type: 'error',
        message: 'Could not check. Your device may be offline.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

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

  const handleLoadStop = async (code: string) => {
    const trimmed = code.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setFetchStatus('refused');
      setStopData(null);
      setErrorMessage('Stop codes are five digits.');
      return null;
    }
    setCurrentStopCode(trimmed);
    return await loadStopArrivals(trimmed, 'initial');
  };

  const handlePromptAddStop = (code: string) => {
    if (!code) return;
    if (code === currentStopCode && fetchStatus === 'not_found') return;
    setLabelModal({
      isOpen: true,
      stopCode: code,
      isEditing: false,
      initialLabel: savedLabels[code] || '',
    });
  };

  const handlePromptEditLabel = (code: string) => {
    if (!code) return;
    if (code === currentStopCode && fetchStatus === 'not_found') return;
    setLabelModal({
      isOpen: true,
      stopCode: code,
      isEditing: true,
      initialLabel: savedLabels[code] || '',
    });
  };

  const handleSaveLabelModal = (label: string) => {
    const code = labelModal.stopCode;
    if (!code) return;
    if (code === currentStopCode && fetchStatus === 'not_found') {
      setLabelModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }
    const trimmed = label.trim();

    if (!savedStops.includes(code)) {
      setSavedStops((prev) => [...prev, code]);
    }

    setSavedLabels((prev) => {
      const next = { ...prev };
      if (trimmed) {
        next[code] = trimmed;
      } else {
        delete next[code];
      }
      return next;
    });

    setLabelModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseLabelModal = () => {
    setLabelModal((prev) => ({ ...prev, isOpen: false }));
  };

  const [recentlyRemoved, setRecentlyRemoved] = useState<{
    code: string;
    label?: string;
    index: number;
  } | null>(null);

  const handleRemoveStop = (code: string) => {
    const index = savedStops.indexOf(code);
    const label = savedLabels[code];

    setSavedStops((prev) => prev.filter((s) => s !== code));
    setSavedLabels((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });

    setRecentlyRemoved({
      code,
      label,
      index: index >= 0 ? index : 0,
    });
  };

  const handleUndoRemoveStop = () => {
    if (!recentlyRemoved) return;
    const { code, label, index } = recentlyRemoved;

    setSavedStops((prev) => {
      if (prev.includes(code)) return prev;
      const next = [...prev];
      const targetIndex = Math.min(Math.max(0, index), next.length);
      next.splice(targetIndex, 0, code);
      return next;
    });

    if (label) {
      setSavedLabels((prev) => ({
        ...prev,
        [code]: label,
      }));
    }

    setRecentlyRemoved(null);
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
        onStatusCheck={handleCheckStatus}
        lastUpdatedTime={lastUpdatedTime}
        isRefreshing={isRefreshing}
        isCheckingStatus={isCheckingStatus}
      />

      {/* System Status Message below Header */}
      {systemStatus && (
        <div
          id="system-status-notice"
          className="bg-white border-b border-slate-200/90 shadow-2xs"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-2xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {systemStatus.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              )}
              {systemStatus.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              )}
              {systemStatus.type === 'error' && (
                <WifiOff className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              )}
              <p
                className={`text-xs sm:text-sm font-medium ${
                  systemStatus.type === 'success'
                    ? 'text-slate-800'
                    : systemStatus.type === 'warning'
                    ? 'text-amber-900'
                    : 'text-slate-700'
                }`}
              >
                {systemStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSystemStatus(null)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-md transition-colors cursor-pointer shrink-0"
              aria-label="Close status message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              currentStatus={fetchStatus}
              savedStops={savedStops}
              onLoadStop={handleLoadStop}
              onAddCurrentStop={handlePromptAddStop}
              onEditCurrentStopLabel={handlePromptEditLabel}
              isCurrentStopSaved={isCurrentStopSaved}
            />

            <SavedStops
              savedStops={savedStops}
              savedLabels={savedLabels}
              stopsCatalog={stopsCatalog}
              activeStopCode={currentStopCode}
              onSelectStop={handleLoadStop}
              onRemoveStop={handleRemoveStop}
              onEditLabel={handlePromptEditLabel}
              recentlyRemoved={recentlyRemoved}
              onUndo={handleUndoRemoveStop}
            />

            <ServiceArrivalsList
              stopCode={currentStopCode}
              status={fetchStatus}
              stopData={stopData}
              errorMessage={errorMessage}
              stopRecord={stopsCatalog[currentStopCode] || null}
              label={savedLabels[currentStopCode] || null}
            />
          </div>
        ) : (
          /* Screen 2: My stops */
          <div id="tabpanel-my-stops" role="tabpanel" aria-labelledby="tab-my-stops">
            <MyStopsView
              savedStops={savedStops}
              savedLabels={savedLabels}
              stopsCatalog={stopsCatalog}
              onSelectStop={handleSelectFromMyStops}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        <DisqusComments currentView={activeTab} />

        <Footer />
      </main>

      <StopLabelModal
        isOpen={labelModal.isOpen}
        stopCode={labelModal.stopCode}
        isEditing={labelModal.isEditing}
        initialLabel={labelModal.initialLabel}
        onSave={handleSaveLabelModal}
        onClose={handleCloseLabelModal}
      />
    </div>
  );
}
