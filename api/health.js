// Health check endpoint reporting credential presence and upstream status
export default async function handler(req, res) {
  const sendJson = (statusCode, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  const accountKey = process.env.LTA_ACCOUNT_KEY;
  const keyConfigured = Boolean(accountKey && accountKey.trim().length > 0);
  const checkedAt = new Date().toISOString();

  if (!keyConfigured) {
    return sendJson(200, {
      checkedAt,
      keyConfigured: false,
      upstreamStatus: null,
      upstreamOk: false,
      message: 'LTA_ACCOUNT_KEY is not configured',
    });
  }

  try {
    const upstreamResponse = await fetch(
      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=11149',
      {
        headers: {
          AccountKey: accountKey.trim(),
        },
      }
    );

    return sendJson(200, {
      checkedAt,
      keyConfigured: true,
      upstreamStatus: upstreamResponse.status,
      upstreamOk: upstreamResponse.ok,
    });
  } catch (error) {
    return sendJson(200, {
      checkedAt,
      keyConfigured: true,
      upstreamStatus: null,
      upstreamOk: false,
      error: 'Cannot reach LTA right now',
    });
  }
}
