const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(url, cacheKey) {
  const stored = await chrome.storage.local.get(cacheKey);
  if (stored[cacheKey] && Date.now() - stored[cacheKey].timestamp < CACHE_TTL_MS) {
    return { ok: true, data: stored[cacheKey].data, fromCache: true };
  }

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.status !== 'OK') throw new Error(json.comment || 'API error');

    await chrome.storage.local.set({
      [cacheKey]: { data: json.result, timestamp: Date.now() }
    });
    return { ok: true, data: json.result, fromCache: false };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function clearCacheForHandle(handle) {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter(k => k.includes(handle));
  if (keys.length) await chrome.storage.local.remove(keys);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_USER_DATA') {
    const { handle, forceRefresh } = message;
    (async () => {
      if (forceRefresh) await clearCacheForHandle(handle);

      const subsKey = `cf_subs_${handle}`;
      const contestKey = 'cf_contest_list';
      const [subsResult, contestResult] = await Promise.all([
        cachedFetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`, subsKey),
        cachedFetch('https://codeforces.com/api/contest.list?gym=false', contestKey)
      ]);

      if (!subsResult.ok) {
        sendResponse({ ok: false, error: subsResult.error });
        return;
      }
      sendResponse({
        ok: true,
        submissions: subsResult.data,
        contests: contestResult.ok ? contestResult.data : [],
        fromCache: subsResult.fromCache
      });
    })();
    return true;
  }
});