import { BusStopData } from '../types';

export type ArrivalFetchStatus = 'loading' | 'empty' | 'refused' | 'unreachable' | 'success';

export interface ArrivalFetchResult {
  status: ArrivalFetchStatus;
  data: BusStopData | null;
  errorMessage?: string;
}

export const STATUS_MESSAGES = {
  loading: 'Checking the road…',
  empty: 'No buses are running from this stop right now.',
  refused: 'LTA refused the request. Check the stop code.',
  unreachable: 'Cannot reach LTA right now.',
} as const;

export async function fetchStopArrivals(stopCode: string): Promise<ArrivalFetchResult> {
  const trimmed = stopCode.trim();
  if (!trimmed) {
    return {
      status: 'refused',
      data: null,
      errorMessage: STATUS_MESSAGES.refused,
    };
  }

  try {
    const res = await fetch(`/api/arrivals?BusStopCode=${encodeURIComponent(trimmed)}`);

    if (res.ok) {
      const json = await res.json();
      const services = Array.isArray(json?.services) ? json.services : [];

      // Check if there are no services or no upcoming buses running at all
      const hasAnyBuses = services.some(
        (s: any) => Array.isArray(s.buses) && s.buses.length > 0
      );

      if (services.length === 0 || !hasAnyBuses) {
        return {
          status: 'empty',
          data: {
            stopCode: trimmed,
            services,
          },
          errorMessage: STATUS_MESSAGES.empty,
        };
      }

      return {
        status: 'success',
        data: {
          stopCode: trimmed,
          services,
        },
      };
    }

    // When upstream returns a non-2xx status (including 401, 404, etc.), LTA answered and refused the request.
    // Only a genuine network failure where no response comes back at all shows "Cannot reach LTA right now."
    let errorJson: any = null;
    try {
      errorJson = await res.json();
    } catch {
      // ignore
    }

    const isUpstreamRefusal =
      Boolean(errorJson?.upstreamStatus) ||
      (res.status >= 400 && res.status < 500);

    if (isUpstreamRefusal) {
      const refusalMessage = errorJson?.upstreamStatus
        ? STATUS_MESSAGES.refused
        : (errorJson?.error || errorJson?.reason || STATUS_MESSAGES.refused);

      return {
        status: 'refused',
        data: null,
        errorMessage: refusalMessage,
      };
    }

    // Genuine network failure where upstream didn't respond
    return {
      status: 'unreachable',
      data: null,
      errorMessage: STATUS_MESSAGES.unreachable,
    };
  } catch (err) {
    // Genuine network failure / fetch threw
    return {
      status: 'unreachable',
      data: null,
      errorMessage: STATUS_MESSAGES.unreachable,
    };
  }
}
