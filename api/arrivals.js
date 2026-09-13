// LTA DataMall Bus Arrival Serverless Function
export default async function handler(req, res) {
  // Helper to send JSON compatible with Vercel/Express and Node http
  const sendJson = (statusCode, data) => {
    res.setHeader('Content-Type', 'application/json');
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  // 1. Parse BusStopCode query parameter
  let busStopCode = '';
  if (req.query && (req.query.BusStopCode || req.query.busStopCode)) {
    busStopCode = String(req.query.BusStopCode || req.query.busStopCode).trim();
  } else if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      busStopCode = (
        parsedUrl.searchParams.get('BusStopCode') ||
        parsedUrl.searchParams.get('busStopCode') ||
        ''
      ).trim();
    } catch {
      // ignore
    }
  }

  // 2. Format check before fetch: a stop code must be exactly five digits. Anything else returns 400 with a reason.
  if (!/^\d{5}$/.test(busStopCode)) {
    return sendJson(400, {
      error: 'Stop codes are five digits.',
      reason: 'Stop codes are five digits.',
    });
  }

  // 3. Guard against missing or empty credential BEFORE making any fetch
  const accountKey = process.env.LTA_ACCOUNT_KEY;
  if (!accountKey || accountKey.trim() === '') {
    return sendJson(503, {
      error: 'LTA_ACCOUNT_KEY environment variable is not configured',
      variable: 'LTA_ACCOUNT_KEY',
    });
  }

  const upstreamUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        AccountKey: accountKey.trim(),
      },
    });

    // 3. Check response.ok BEFORE reading the body to prevent dying on empty bodies
    if (!response.ok) {
      let reason = response.statusText || 'Upstream request failed';
      try {
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            reason = parsed.message || parsed['odata.error']?.message?.value || reason;
          } catch {
            reason = text.slice(0, 120);
          }
        }
      } catch {
        // ignore body read error on refusal
      }

      return sendJson(response.status, {
        upstreamStatus: response.status,
        error: reason || 'LTA refused the request. Check the stop code.',
      });
    }

    const data = await response.json();
    const rawServices = Array.isArray(data?.Services) ? data.Services : [];

    const nowMs = Date.now();

    // Helper to parse individual bus object
    const parseBus = (rawBus) => {
      if (!rawBus || typeof rawBus !== 'object') return null;
      const eta = rawBus.EstimatedArrival;
      // An empty EstimatedArrival means no such bus
      if (!eta || typeof eta !== 'string' || eta.trim() === '') return null;

      const arrivalTime = new Date(eta).getTime();
      if (isNaN(arrivalTime)) return null;

      // Work out the minutes against current time
      const diffMins = Math.round((arrivalTime - nowMs) / 60000);
      // Anything under one minute displays as 0 ("Arriving") rather than negative
      const estimatedMinutes = diffMins < 1 ? 0 : diffMins;

      // Load: SEA, SDA, LSD
      const load = rawBus.Load === 'SDA' || rawBus.Load === 'LSD' ? rawBus.Load : 'SEA';

      // Type: SD, DD, BD
      const type = rawBus.Type === 'DD' || rawBus.Type === 'BD' ? rawBus.Type : 'SD';

      // Feature: WAB (wheelchair accessible) or empty
      const feature = rawBus.Feature === 'WAB' ? 'WAB' : '';

      // Monitored: 1 when GPS tracked, 0 when timetable schedule estimate
      const tracked = Number(rawBus.Monitored) === 1;

      return {
        estimatedMinutes,
        load,
        type,
        feature,
        tracked,
      };
    };

    const services = [];

    for (const raw of rawServices) {
      const serviceNo = String(raw.ServiceNo || '').trim();
      if (!serviceNo) continue;

      const buses = [];
      const bus1 = parseBus(raw.NextBus);
      if (bus1) buses.push(bus1);

      const bus2 = parseBus(raw.NextBus2);
      if (bus2) buses.push(bus2);

      services.push({
        serviceNo,
        buses,
      });
    }

    // Sort by arrival time instead of upstream alphabetical text sorting
    services.sort((a, b) => {
      const aMin = a.buses.length > 0 ? a.buses[0].estimatedMinutes : Infinity;
      const bMin = b.buses.length > 0 ? b.buses[0].estimatedMinutes : Infinity;
      if (aMin !== bMin) {
        return aMin - bMin;
      }
      return a.serviceNo.localeCompare(b.serviceNo, undefined, { numeric: true });
    });

    // Cache header matching LTA refresh cycle
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

    return sendJson(200, {
      stopCode: busStopCode,
      services,
    });
  } catch (err) {
    return sendJson(502, {
      error: 'Cannot reach LTA right now',
    });
  }
}
