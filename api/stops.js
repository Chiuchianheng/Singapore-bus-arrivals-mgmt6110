// LTA DataMall Bus Stops Serverless Function
// Fetches official bus stops directly from LTA DataMall using LTA_ACCOUNT_KEY.
// Pages with $skip until an empty page is returned, and caches in memory.
// Never exposes the API key or serves fallback/mock data.

let cachedStops = null;
let fetchPromise = null;

async function fetchAllBusStopsFromLTA(accountKey) {
  const allStops = [];
  let skip = 0;

  while (true) {
    const url = `https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`;
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
      if (item && item.BusStopCode) {
        allStops.push({
          BusStopCode: String(item.BusStopCode).padStart(5, '0'),
          RoadName: item.RoadName || '',
          Description: item.Description || '',
        });
      }
    }

    skip += batch.length;
  }

  return allStops;
}

export async function getBusStops(accountKey) {
  if (cachedStops && Array.isArray(cachedStops) && cachedStops.length > 0) {
    return cachedStops;
  }
  if (!fetchPromise) {
    fetchPromise = fetchAllBusStopsFromLTA(accountKey)
      .then((stops) => {
        cachedStops = stops;
        return stops;
      })
      .finally(() => {
        fetchPromise = null;
      });
  }
  return fetchPromise;
}

export default async function handler(req, res) {
  const sendJson = (statusCode, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
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
      unavailable: true,
    });
  }

  try {
    const stops = await getBusStops(accountKey);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(stops || []);
    }
    res.statusCode = 200;
    res.end(JSON.stringify(stops || []));
  } catch (err) {
    console.error('Error fetching stops from LTA DataMall:', err);
    fetchPromise = null;
    return sendJson(502, {
      error: 'Cannot reach LTA DataMall right now',
      message: err.message,
      unavailable: true,
    });
  }
}
