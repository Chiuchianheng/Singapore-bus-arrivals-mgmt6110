// LTA DataMall Bus Routes Serverless Function
// Fetches official bus routes directly from LTA DataMall using LTA_ACCOUNT_KEY.
// Pages with $skip until an empty page is returned, and caches in memory.
// Never exposes the API key or serves fallback/mock data.

let cachedRoutes = null;
let fetchRoutesPromise = null;

async function fetchAllBusRoutesFromLTA(accountKey) {
  const allRoutes = [];
  let skip = 0;

  while (true) {
    const url = `https://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=${skip}`;
    const response = await fetch(url, {
      headers: {
        AccountKey: accountKey.trim(),
      },
    });

    if (!response.ok) {
      let reason = response.statusText;
      try {
        const text = await response.text();
        if (text) reason = text.slice(0, 100);
      } catch {}
      throw new Error(`Upstream error ${response.status}: ${reason}`);
    }

    const data = await response.json();
    const batch = (data && data.value) || [];

    // Page with $skip until LTA returns an empty page
    if (batch.length === 0) {
      break;
    }

    for (const item of batch) {
      if (item && item.ServiceNo && item.BusStopCode) {
        allRoutes.push({
          ServiceNo: String(item.ServiceNo).trim(),
          Direction: Number(item.Direction) || 1,
          StopSequence: Number(item.StopSequence) || 0,
          BusStopCode: String(item.BusStopCode).padStart(5, '0'),
        });
      }
    }

    skip += batch.length;
  }

  return allRoutes;
}

export async function getBusRoutes(accountKey) {
  if (cachedRoutes && Array.isArray(cachedRoutes) && cachedRoutes.length > 0) {
    return cachedRoutes;
  }
  if (!fetchRoutesPromise) {
    fetchRoutesPromise = fetchAllBusRoutesFromLTA(accountKey)
      .then((routes) => {
        cachedRoutes = routes;
        return routes;
      })
      .finally(() => {
        fetchRoutesPromise = null;
      });
  }
  return fetchRoutesPromise;
}

export default async function handler(req, res) {
  const sendJson = (statusCode, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  const accountKey = process.env.LTA_ACCOUNT_KEY;
  if (!accountKey || accountKey.trim() === '') {
    return sendJson(503, {
      error: 'LTA_ACCOUNT_KEY environment variable is not configured',
    });
  }

  // Parse query params: ServiceNo (required), StopCode (optional), DestinationCode (optional)
  let serviceNo = '';
  let stopCode = '';
  let destinationCode = '';

  if (req.query) {
    serviceNo = String(req.query.ServiceNo || req.query.serviceNo || '').trim();
    stopCode = String(req.query.StopCode || req.query.stopCode || '').trim();
    destinationCode = String(req.query.DestinationCode || req.query.destinationCode || '').trim();
  } else if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      serviceNo = (parsedUrl.searchParams.get('ServiceNo') || parsedUrl.searchParams.get('serviceNo') || '').trim();
      stopCode = (parsedUrl.searchParams.get('StopCode') || parsedUrl.searchParams.get('stopCode') || '').trim();
      destinationCode = (parsedUrl.searchParams.get('DestinationCode') || parsedUrl.searchParams.get('destinationCode') || '').trim();
    } catch {
      // ignore
    }
  }

  if (!serviceNo) {
    return sendJson(400, {
      error: 'ServiceNo query parameter is required',
    });
  }

  try {
    const routes = await getBusRoutes(accountKey);

    // Filter to rows matching this ServiceNo
    const serviceRows = routes.filter((r) => r.ServiceNo.toLowerCase() === serviceNo.toLowerCase());

    if (serviceRows.length === 0) {
      return sendJson(404, {
        error: 'RouteNotFound',
        message: `No route data found for service ${serviceNo}`,
      });
    }

    // Group by direction (1 and 2, or whatever LTA returns)
    const directionsMap = new Map();
    for (const row of serviceRows) {
      const dir = row.Direction;
      if (!directionsMap.has(dir)) {
        directionsMap.set(dir, []);
      }
      directionsMap.get(dir).push(row);
    }

    // Sort each direction by StopSequence
    for (const [dir, list] of directionsMap.entries()) {
      list.sort((a, b) => a.StopSequence - b.StopSequence);
    }

    // Find the right direction:
    // "Use the direction of that service in which the current stop appears and which ends at the bus's DestinationCode.
    // If the direction cannot be worked out clearly, show only 'Towards [destination]'."
    let chosenDirectionList = null;

    if (stopCode) {
      const normalizedStop = stopCode.padStart(5, '0');
      const normalizedDest = destinationCode ? destinationCode.padStart(5, '0') : '';

      // Candidates where current stop appears
      const candidateDirs = [];
      for (const [dir, list] of directionsMap.entries()) {
        const stopIndex = list.findIndex((s) => s.BusStopCode === normalizedStop);
        if (stopIndex !== -1) {
          candidateDirs.push({ dir, list, stopIndex });
        }
      }

      if (candidateDirs.length === 1) {
        // Only one direction contains this stop
        // Check if destination is specified and matches the end (or stop is before the end)
        const cand = candidateDirs[0];
        const lastStop = cand.list[cand.list.length - 1];
        if (!normalizedDest || lastStop.BusStopCode === normalizedDest || cand.stopIndex < cand.list.length - 1) {
          chosenDirectionList = cand.list;
        }
      } else if (candidateDirs.length > 1) {
        // If multiple directions contain this stop (e.g. loops or bidirectional stops),
        // match the one whose last stop matches destinationCode
        if (normalizedDest) {
          const matched = candidateDirs.find((c) => {
            const lastStop = c.list[c.list.length - 1];
            return lastStop.BusStopCode === normalizedDest && c.stopIndex < c.list.length - 1;
          });
          if (matched) {
            chosenDirectionList = matched.list;
          } else {
            // Check if any has destination after current stop
            const destAfterStop = candidateDirs.find((c) => {
              const destIndex = c.list.findIndex((s) => s.BusStopCode === normalizedDest);
              return destIndex > c.stopIndex;
            });
            if (destAfterStop) {
              chosenDirectionList = destAfterStop.list;
            }
          }
        }
      }
    } else if (directionsMap.size === 1) {
      chosenDirectionList = directionsMap.values().next().value;
    }

    // Return the ordered list of stop codes along the route
    const stopCodes = chosenDirectionList ? chosenDirectionList.map((s) => s.BusStopCode) : null;

    return sendJson(200, {
      serviceNo,
      directionDetermined: Boolean(chosenDirectionList),
      stops: stopCodes, // array of 5-digit bus stop codes along the route, or null if ambiguous
    });
  } catch (err) {
    return sendJson(502, {
      error: 'Cannot reach LTA right now',
    });
  }
}
