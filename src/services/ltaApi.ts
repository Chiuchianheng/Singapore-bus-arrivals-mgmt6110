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

    // Upstream refusal (e.g. 400 bad request, 403 forbidden, 404 not found)
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      return {
        status: 'refused',
        data: null,
        errorMessage: STATUS_MESSAGES.refused,
      };
    }

    // 502 bad gateway, 503 service unavailable, 504 gateway timeout, etc.
    return {
      status: 'unreachable',
      data: null,
      errorMessage: STATUS_MESSAGES.unreachable,
    };
  } catch (err) {
    // Network / fetch unreachable
    return {
      status: 'unreachable',
      data: null,
      errorMessage: STATUS_MESSAGES.unreachable,
    };
  }
}
