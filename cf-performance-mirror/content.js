(function() {
  console.log('%c🧠 Codeforces Performance Mirror – Developed by Viraj Sail', 'color: #63b3ed; font-size: 14px;');
  const handle = location.pathname.split('/profile/')[1]?.split('/')[0];
  if (!handle || document.getElementById('cf-mirror-card')) return;

  const TARGET_SELECTORS = ['.userbox', '.userRating', '.rated-user', '#pageContent'];
  let injected = false;
  const observer = new MutationObserver(() => tryInject());
  observer.observe(document.body, { childList: true, subtree: true });
  tryInject();

  function findAnchor() {
    for (let sel of TARGET_SELECTORS) {
      let el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function tryInject() {
    if (injected) return;
    const anchor = findAnchor();
    if (!anchor) return;
    injected = true;
    observer.disconnect();
    injectCard(anchor);
  }

  function buildCardHTML() {
    return `
<div id="cf-mirror-card">
  <div class="cfm-header">
    <div class="cfm-title"><span class="cfm-logo">◈</span> Performance Mirror</div>
    <div class="cfm-controls">
      <button class="cfm-btn cfm-refresh" title="Refresh">↺</button>
      <button class="cfm-btn cfm-toggle" title="Collapse">▾</button>
    </div>
  </div>
  <div class="cfm-body" id="cfm-body">
    <div class="cfm-loading" id="cfm-loading"><div class="cfm-spinner"></div><span>Loading stats...</span></div>
    <div class="cfm-content" id="cfm-content" style="display:none">

      <!-- Contest Reminder -->
      <div id="cfm-reminder" class="cfm-reminder">
        <div class="cfm-reminder-title">⏰ Next Contest</div>
        <div class="cfm-reminder-time" id="cfm-countdown">Loading...</div>
        <a id="cfm-contest-link" class="cfm-reminder-link" href="#" target="_blank">View contest</a>
      </div>

      <!-- Time Machine slider -->
      <div class="cfm-section">
        <div class="cfm-section-label">⏱️ Time Machine</div>
        <input type="range" id="cfm-time-slider" min="0" max="100" step="1" value="100" style="width:100%; margin:8px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa;">
          <span>🏛️ Earliest</span><span>📅 Today</span>
        </div>
        <div id="cfm-time-tooltip" style="text-align: center; font-size: 11px; margin-top: 4px; color: #63b3ed;">Today</div>
      </div>

      <!-- Metrics row (including Efficiency Score) -->
      <div class="cfm-metrics-row">
        <div class="cfm-metric" id="cfm-solved"><div class="cfm-metric-value">—</div><div class="cfm-metric-label">Solved</div></div>
        <div class="cfm-metric" id="cfm-accuracy"><div class="cfm-metric-value">—</div><div class="cfm-metric-label">Accuracy</div></div>
        <div class="cfm-metric" id="cfm-avg-time"><div class="cfm-metric-value">—</div><div class="cfm-metric-label">Avg solve (min)</div></div>
        <div class="cfm-metric" id="cfm-recent"><div class="cfm-metric-value">—</div><div class="cfm-metric-label">Last 7 days</div></div>
        <div class="cfm-metric" id="cfm-efficiency"><div class="cfm-metric-value">—</div><div class="cfm-metric-label">Efficiency Score</div></div>
      </div>

      <!-- Tags (all) -->
      <div class="cfm-section"><div class="cfm-section-label">Tags (all)</div><div class="cfm-tags" id="cfm-tags"></div></div>

      <!-- Column chart for top tags -->
      <div class="cfm-section">
        <div class="cfm-section-label">📊 Problems Solved by Tag</div>
        <div id="cfm-column-chart" class="cfm-column-chart" style="display: flex; align-items: flex-end; gap: 12px; justify-content: center; min-height: 180px; padding: 10px 0; overflow-x: auto;"></div>
      </div>

      <!-- Rating distribution -->
      <div class="cfm-section"><div class="cfm-section-label">Rating Distribution (100‑step)</div><div class="cfm-chart" id="cfm-chart"></div><div class="cfm-chart-labels" id="cfm-chart-labels"></div></div>

      <!-- Weakness of the Day -->
      <div class="cfm-section">
        <div class="cfm-section-label">🎯 Weakness of the Day</div>
        <div id="cfm-weakness-content">Loading...</div>
        <button id="cfm-weakness-refresh">↻ Refresh</button>
      </div>

      <div class="cfm-footer" id="cfm-footer"></div>
      <div class="cfm-credit" style="text-align: center; font-size: 10px; color: #555; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
        🧠 Developed by <strong style="color:#63b3ed;">Viraj Sail</strong> • <a href="https://github.com/VirajSail" target="_blank" style="color:#63b3ed; text-decoration:none;">GitHub</a>
      </div>
    </div>
    <div class="cfm-error" id="cfm-error" style="display:none"><span>⚠</span> <span id="cfm-error-msg"></span></div>
  </div>
</div>`;
  }

  function injectCard(anchor) {
    const insertTarget = anchor.closest('.roundbox') || anchor;
    insertTarget.insertAdjacentHTML('afterend', buildCardHTML());
    const card = document.getElementById('cf-mirror-card');
    if (!card) return;
    setupInteractions(card);
    loadData(card);
  }

  function setupInteractions(card) {
    const toggle = card.querySelector('.cfm-toggle');
    const refresh = card.querySelector('.cfm-refresh');
    const body = card.querySelector('#cfm-body');
    toggle.addEventListener('click', () => {
      const collapsed = card.dataset.collapsed === 'true';
      card.dataset.collapsed = (!collapsed).toString();
      body.style.display = collapsed ? '' : 'none';
      toggle.textContent = collapsed ? '▾' : '▸';
    });
    refresh.addEventListener('click', () => {
      showLoading(card);
      loadData(card, true);
    });
  }

  function showLoading(card) {
    card.querySelector('#cfm-loading').style.display = '';
    card.querySelector('#cfm-content').style.display = 'none';
    card.querySelector('#cfm-error').style.display = 'none';
  }

  function showError(card, msg) {
    card.querySelector('#cfm-loading').style.display = 'none';
    card.querySelector('#cfm-content').style.display = 'none';
    card.querySelector('#cfm-error').style.display = '';
    card.querySelector('#cfm-error-msg').textContent = msg;
  }

  function showContent(card) {
    card.querySelector('#cfm-loading').style.display = 'none';
    card.querySelector('#cfm-content').style.display = '';
    card.querySelector('#cfm-error').style.display = 'none';
  }

  function loadData(card, forceRefresh = false) {
    chrome.runtime.sendMessage({ type: 'FETCH_USER_DATA', handle, forceRefresh }, (resp) => {
      if (chrome.runtime.lastError || !resp || !resp.ok) {
        showError(card, resp?.error || 'Failed to load data');
        return;
      }
      try {
        const { submissions, contests, fromCache } = resp;
        const base = computeBaseStats(submissions, contests);
        const timeline = buildTimeline(submissions, contests);
        renderStats(card, base, timeline, fromCache);
        updateWeaknessOfTheDay(card, base);
        setupTimeMachine(card, timeline);
        startContestReminder(card);
      } catch (err) {
        showError(card, err.message);
        console.error(err);
      }
    });
  }

  // ========== Base statistics ==========
  function computeBaseStats(submissions, contests) {
    const contestMap = {};
    for (let c of contests) contestMap[c.id] = c.startTimeSeconds;

    const solvedSet = new Set();
    let totalSubmissions = 0;
    let acceptedSubmissions = 0;
    const tagCounter = {};
    const ratingBins = {};
    const solveTimes = [];
    const sevenDaysAgo = Date.now() / 1000 - 7 * 86400;
    let recentSolved = 0;

    let ratingSum = 0;
    let ratingCount = 0;

    for (let sub of submissions) {
      totalSubmissions++;
      const prob = sub.problem;
      const probKey = `${prob.contestId || 'gym'}_${prob.index}`;

      if (sub.verdict === 'OK') {
        acceptedSubmissions++;
        if (!solvedSet.has(probKey)) {
          solvedSet.add(probKey);
          if (sub.creationTimeSeconds >= sevenDaysAgo) recentSolved++;
          for (let tag of (prob.tags || [])) {
            tagCounter[tag] = (tagCounter[tag] || 0) + 1;
          }
          if (prob.rating) {
            ratingSum += prob.rating;
            ratingCount++;
            let bucket = Math.floor(prob.rating / 100) * 100;
            if (bucket >= 800 && bucket <= 3500) {
              ratingBins[bucket] = (ratingBins[bucket] || 0) + 1;
            }
          }
          if (prob.contestId && contestMap[prob.contestId] && sub.relativeTimeSeconds != null) {
            let mins = Math.round(sub.relativeTimeSeconds / 60);
            if (mins >= 0 && mins < 600) solveTimes.push(mins);
          }
        }
      }
    }

    const solved = solvedSet.size;
    let accuracyPercent = (acceptedSubmissions / totalSubmissions) * 100;
    if (isNaN(accuracyPercent)) accuracyPercent = 0;
    if (accuracyPercent > 100) accuracyPercent = 100;
    const accuracy = accuracyPercent.toFixed(1);
    const avgTime = solveTimes.length ? Math.round(solveTimes.reduce((a,b)=>a+b,0)/solveTimes.length) : null;
    const avgRating = ratingCount ? Math.round(ratingSum / ratingCount) : 0;
    const efficiency = computeEfficiency(parseFloat(accuracy), avgTime, avgRating);
    const allTags = Object.entries(tagCounter).sort((a,b) => b[1] - a[1]);

    return { solved, accuracy, avgTime, recentSolved, efficiency, ratingBins, allTags, solvedSet, avgRating };
  }

  function computeEfficiency(accuracy, avgTime, avgRating) {
    let score = 0;
    if (accuracy > 0) score += accuracy * 0.4;
    let timeScore = 0;
    if (avgTime) {
      if (avgTime <= 15) timeScore = 100;
      else if (avgTime <= 60) timeScore = 100 - (avgTime - 15) * (30 / 45);
      else timeScore = Math.max(0, 40 - (avgTime - 60) * 0.5);
      score += timeScore * 0.3;
    }
    let ratingScore = 0;
    if (avgRating >= 2500) ratingScore = 100;
    else if (avgRating >= 800) ratingScore = (avgRating - 800) * (100 / 1700);
    score += ratingScore * 0.3;
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  // ========== Timeline (monthly snapshots) for Time Machine ==========
  function buildTimeline(submissions, contests) {
    const contestMap = {};
    for (let c of contests) contestMap[c.id] = c.startTimeSeconds;

    const submissionsByMonth = {};
    for (let sub of submissions) {
      if (sub.verdict !== 'OK') continue;
      const date = new Date(sub.creationTimeSeconds * 1000);
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2,'0')}`;
      if (!submissionsByMonth[monthKey]) submissionsByMonth[monthKey] = [];
      submissionsByMonth[monthKey].push(sub);
    }

    const months = Object.keys(submissionsByMonth).sort();
    const timeline = [];
    let cumulativeSolved = new Set();
    let cumulativeTotalSubs = 0;
    let cumulativeAccepted = 0;
    let cumulativeSolveTimes = [];
    let cumulativeRatingSum = 0;
    let cumulativeRatingCount = 0;

    for (let month of months) {
      const monthSubs = submissionsByMonth[month];
      for (let sub of monthSubs) {
        cumulativeTotalSubs++;
        cumulativeAccepted++;
        const prob = sub.problem;
        const probKey = `${prob.contestId || 'gym'}_${prob.index}`;
        if (!cumulativeSolved.has(probKey)) {
          cumulativeSolved.add(probKey);
          if (prob.rating) {
            cumulativeRatingSum += prob.rating;
            cumulativeRatingCount++;
          }
          if (prob.contestId && contestMap[prob.contestId] && sub.relativeTimeSeconds != null) {
            let mins = Math.round(sub.relativeTimeSeconds / 60);
            if (mins >= 0 && mins < 600) cumulativeSolveTimes.push(mins);
          }
        }
      }
      const solvedCount = cumulativeSolved.size;
      const accuracy = (cumulativeAccepted / cumulativeTotalSubs * 100).toFixed(1);
      const avgTime = cumulativeSolveTimes.length ? Math.round(cumulativeSolveTimes.reduce((a,b)=>a+b,0)/cumulativeSolveTimes.length) : null;
      const avgRating = cumulativeRatingCount ? Math.round(cumulativeRatingSum / cumulativeRatingCount) : 0;
      timeline.push({ month, solved: solvedCount, accuracy, avgTime, avgRating });
    }
    return timeline;
  }

  // ========== Render current stats ==========
  function renderStats(card, base, timeline, fromCache) {
    setMetric(card, '#cfm-solved', base.solved.toLocaleString());
    setMetric(card, '#cfm-accuracy', base.accuracy + '%');
    setMetric(card, '#cfm-avg-time', base.avgTime ? base.avgTime + ' min' : '―');
    setMetric(card, '#cfm-recent', base.recentSolved.toString());
    setMetric(card, '#cfm-efficiency', base.efficiency.toString());

    const allTags = base.allTags;
    const tagsDiv = card.querySelector('#cfm-tags');
    if (allTags.length) {
      tagsDiv.innerHTML = `<div style="display: flex; flex-wrap: wrap; gap: 6px; max-height: 100px; overflow-y: auto; padding: 4px 0;">${allTags.map(([tag, cnt], i) => `<span class="cfm-tag cfm-tag-${i % 3}" title="${cnt} solved">${tag}<em>${cnt}</em></span>`).join('')}</div>`;
    } else {
      tagsDiv.innerHTML = '<span>No tags yet</span>';
    }

    renderColumnChart(card, allTags);
    renderChart(card, base.ratingBins);
    card.querySelector('#cfm-footer').textContent = fromCache ? '● Cached data · click ↺ to refresh' : '● Live data';
    showContent(card);
    animateNumbers(card);
  }

  function setMetric(card, id, value) {
    const el = card.querySelector(id)?.querySelector('.cfm-metric-value');
    if (el) {
      el.textContent = value;
      el.dataset.target = value;
    }
  }

  // ========== Column chart for tags ==========
  function renderColumnChart(card, allTags) {
    const container = card.querySelector('#cfm-column-chart');
    if (!container) return;
    if (!allTags || allTags.length === 0) {
      container.innerHTML = '<div style="color:#aaa; text-align:center; width:100%;">No tag data available</div>';
      return;
    }

    let tagsToShow = allTags.slice(0, 10);
    let othersCount = allTags.slice(10).reduce((sum, t) => sum + t[1], 0);
    let chartData = [...tagsToShow];
    if (othersCount > 0) chartData.push(['others', othersCount]);

    const maxCount = Math.max(...chartData.map(d => d[1]), 1);
    const maxBarHeight = 100;

    container.innerHTML = '';
    for (let [tag, count] of chartData) {
      const barHeight = (count / maxCount) * maxBarHeight;
      const column = document.createElement('div');
      column.style.display = 'flex';
      column.style.flexDirection = 'column';
      column.style.alignItems = 'center';
      column.style.width = '60px';
      column.style.flexShrink = '0';

      const countDiv = document.createElement('div');
      countDiv.textContent = count;
      countDiv.style.fontSize = '12px';
      countDiv.style.fontWeight = 'bold';
      countDiv.style.color = '#facc15';
      countDiv.style.marginBottom = '4px';

      const barDiv = document.createElement('div');
      barDiv.style.width = '36px';
      barDiv.style.height = `${barHeight}px`;
      barDiv.style.background = 'linear-gradient(180deg, #63b3ed, #9f7aea)';
      barDiv.style.borderRadius = '6px 6px 0 0';
      barDiv.style.transition = 'height 0.3s ease';

      const labelDiv = document.createElement('div');
      labelDiv.textContent = tag.length > 10 ? tag.slice(0,7)+'..' : tag;
      labelDiv.style.fontSize = '10px';
      labelDiv.style.marginTop = '6px';
      labelDiv.style.color = '#aaa';
      labelDiv.style.textAlign = 'center';
      labelDiv.title = tag;

      column.appendChild(countDiv);
      column.appendChild(barDiv);
      column.appendChild(labelDiv);
      container.appendChild(column);
    }
  }

  // ========== Rating distribution bar chart ==========
  const RATING_BUCKETS = [];
  for (let r = 800; r <= 3500; r += 100) RATING_BUCKETS.push(r);
  const BAR_COLORS = RATING_BUCKETS.map((_, i) => {
    const t = i / (RATING_BUCKETS.length - 1);
    const r = Math.floor(255 * t);
    const g = Math.floor(255 * (1 - t));
    return `rgb(${r}, ${g}, 80)`;
  });

  function renderChart(card, ratingBins) {
    const chart = card.querySelector('#cfm-chart');
    const labels = card.querySelector('#cfm-chart-labels');
    if (!chart || !labels) return;
    chart.innerHTML = '';
    labels.innerHTML = '';
    if (Object.keys(ratingBins).length === 0) {
      chart.innerHTML = '<span style="color:#aaa">No rated problems</span>';
      return;
    }
    const maxVal = Math.max(...RATING_BUCKETS.map(b => ratingBins[b] || 0), 1);
    RATING_BUCKETS.forEach((b, i) => {
      const cnt = ratingBins[b] || 0;
      const pct = (cnt / maxVal) * 100;
      const bar = document.createElement('div');
      bar.className = 'cfm-bar' + (cnt > 0 ? ' cfm-bar-active' : '');
      bar.style.cssText = `--bar-height:${pct}%;--bar-color:${BAR_COLORS[i]};--bar-delay:${i*20}ms`;
      bar.title = `${b}: ${cnt} solved`;
      chart.appendChild(bar);
      const lbl = document.createElement('div');
      lbl.className = 'cfm-bar-label';
      lbl.textContent = i % 2 === 0 ? b : '';
      labels.appendChild(lbl);
    });
  }

  function animateNumbers(card) {
    card.querySelectorAll('.cfm-metric-value').forEach(el => {
      let raw = el.dataset.target || '';
      let num = parseFloat(raw.replace(/[^0-9.]/g,''));
      if (isNaN(num) || raw.includes('―')) return;
      let suffix = raw.replace(/[0-9.]/g,'');
      let current = 0;
      let duration = 800;
      let start = performance.now();
      function step(now) {
        let t = Math.min(1, (now - start) / duration);
        let eased = 1 - Math.pow(1 - t, 3);
        let val = Math.floor(eased * num);
        el.textContent = val.toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ========== Weakness of the Day ==========
  async function updateWeaknessOfTheDay(card, base) {
    const container = card.querySelector('#cfm-weakness-content');
    const allTags = base.allTags;
    if (allTags.length === 0) {
      container.innerHTML = 'Not enough data to determine weaknesses.';
      return;
    }
    const sorted = [...allTags].sort((a,b) => a[1] - b[1]);
    const weaknessTag = sorted[0][0];
    const avgRating = base.avgRating || 1200;
    const targetRating = Math.min(3500, avgRating + 200);
    container.innerHTML = `🎯 Your weakest tag is <strong>${weaknessTag}</strong>.<br>Fetching a suggested problem...`;
    const problem = await fetchUnsolvedProblemByTag(weaknessTag, targetRating, base.solvedSet);
    if (problem) {
      container.innerHTML = `🎯 Your weakest tag is <strong>${weaknessTag}</strong>.<br>💡 Suggested problem: <a href="https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}" target="_blank" style="color: #facc15;">${problem.name}</a> (Rating: ${problem.rating})`;
    } else {
      container.innerHTML = `🎯 Your weakest tag is <strong>${weaknessTag}</strong>.<br>No unsolved problem found around rating ${targetRating}.`;
    }
    const refreshBtn = card.querySelector('#cfm-weakness-refresh');
    refreshBtn.onclick = () => updateWeaknessOfTheDay(card, base);
  }

  async function fetchUnsolvedProblemByTag(tag, targetRating, solvedSet) {
    const allProblemsKey = 'cf_all_problems';
    let allProblems = await chrome.storage.local.get(allProblemsKey);
    if (!allProblems[allProblemsKey] || Date.now() - (allProblems[allProblemsKey].timestamp || 0) > 86400000) {
      const resp = await fetch('https://codeforces.com/api/problemset.problems');
      const data = await resp.json();
      if (data.status === 'OK') {
        allProblems = { problems: data.result.problems, timestamp: Date.now() };
        await chrome.storage.local.set({ [allProblemsKey]: allProblems });
      } else {
        return null;
      }
    } else {
      allProblems = allProblems[allProblemsKey];
    }
    const candidates = allProblems.problems.filter(p =>
      p.tags && p.tags.includes(tag) && p.rating && p.rating >= targetRating - 100 && p.rating <= targetRating + 100 &&
      !solvedSet.has(`${p.contestId}_${p.index}`)
    );
    if (candidates.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  // ========== Time Machine ==========
  function setupTimeMachine(card, timeline) {
    const slider = card.querySelector('#cfm-time-slider');
    const tooltip = card.querySelector('#cfm-time-tooltip');
    if (timeline.length === 0) return;
    slider.max = timeline.length - 1;
    slider.value = timeline.length - 1;

    slider.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value);
      const snapshot = timeline[idx];
      if (!snapshot) return;
      tooltip.textContent = `${snapshot.month}`;
      setMetric(card, '#cfm-solved', snapshot.solved.toLocaleString());
      setMetric(card, '#cfm-accuracy', snapshot.accuracy + '%');
      setMetric(card, '#cfm-avg-time', snapshot.avgTime ? snapshot.avgTime + ' min' : '―');
      const efficiency = computeEfficiency(parseFloat(snapshot.accuracy), snapshot.avgTime, snapshot.avgRating);
      setMetric(card, '#cfm-efficiency', efficiency.toString());
    });
    slider.dispatchEvent(new Event('input'));
  }

  // ========== Contest Reminder ==========
  async function startContestReminder(card) {
    const countdownEl = card.querySelector('#cfm-countdown');
    const linkEl = card.querySelector('#cfm-contest-link');
    if (!countdownEl) return;

    try {
      const contestKey = 'cf_contest_list';
      const result = await chrome.storage.local.get(contestKey);
      let contests = null;
      if (result[contestKey] && Date.now() - result[contestKey].timestamp < 5*60*1000) {
        contests = result[contestKey].data;
      } else {
        const resp = await fetch('https://codeforces.com/api/contest.list?gym=false');
        const json = await resp.json();
        if (json.status === 'OK') {
          contests = json.result;
          await chrome.storage.local.set({ [contestKey]: { data: contests, timestamp: Date.now() } });
        } else {
          throw new Error('Failed to fetch contests');
        }
      }
      const now = Math.floor(Date.now() / 1000);
      const upcoming = contests.filter(c => c.phase === 'BEFORE').sort((a,b) => a.startTimeSeconds - b.startTimeSeconds);
      if (upcoming.length === 0) {
        countdownEl.textContent = 'No upcoming contest';
        linkEl.href = '#';
        linkEl.style.display = 'none';
        return;
      }
      const next = upcoming[0];
      const start = next.startTimeSeconds;
      const diff = start - now;
      if (diff <= 0) {
        countdownEl.textContent = 'Contest started!';
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        countdownEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
        setTimeout(() => startContestReminder(card), 1000);
      }
      linkEl.href = `https://codeforces.com/contest/${next.id}`;
      linkEl.style.display = 'inline-block';
    } catch (err) {
      countdownEl.textContent = 'Error';
      console.error(err);
    }
  }

})();