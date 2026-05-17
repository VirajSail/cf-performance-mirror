document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('codeforces.com/profile/')) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH' });
      document.getElementById('status').innerHTML = '🔄 Refreshing...';
      setTimeout(() => document.getElementById('status').innerHTML = '✅ Refresh sent', 1000);
    } else {
      document.getElementById('status').innerHTML = '❌ Not on a Codeforces profile';
    }
  });
});