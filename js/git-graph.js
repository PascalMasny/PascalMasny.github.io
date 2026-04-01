/* ─── Git Graph Renderer ─────────────────────────────────────────────────────
   GitGraph.render(opts) → { setFilter(branch) }
   Requires window.CV from cv-data.js.
   ─────────────────────────────────────────────────────────────────────────── */

const GitGraph = (() => {
  const MS_PM = 365.25 / 12 * 24 * 3600 * 1000;

  const MONTH_MAP = {
    Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
    Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11,
    Okt:9, Mär:2, Mai:4, Dez:11
  };

  function parseDate(str) {
    if (!str) return new Date();
    const p = str.trim().split(' ');
    if (p.length === 1) return new Date(+p[0], 0);
    return new Date(+p[1], MONTH_MAP[p[0]] ?? 0);
  }

  // Light theme (CV / print)
  const LIGHT = {
    work:   { bar:'#1d4ed8', rail:'#3b82f6', hdrBg:'#dbeafe', hdrText:'#1e40af', dotBorder:'#fff' },
    edu:    { bar:'#059669', rail:'#10b981', hdrBg:'#d1fae5', hdrText:'#065f46', dotBorder:'#fff' },
    social: { bar:'#d97706', rail:'#f59e0b', hdrBg:'#fef3c7', hdrText:'#92400e', dotBorder:'#fff' },
  };
  // Dark theme (main page)
  const DARK = {
    work:   { bar:'#3b82f6', rail:'#60a5fa', hdrBg:'rgba(59,130,246,.14)', hdrText:'#93c5fd', dotBorder:'#1e293b' },
    edu:    { bar:'#00d46e', rail:'#34d399', hdrBg:'rgba(0,212,110,.12)',   hdrText:'#6ee7b7', dotBorder:'#1e293b' },
    social: { bar:'#ffd700', rail:'#fbbf24', hdrBg:'rgba(255,215,0,.10)',   hdrText:'#fde68a', dotBorder:'#1e293b' },
  };

  const BRANCHES = ['work', 'edu', 'social'];

  function render(opts) {
    const {
      containerId,
      lang,
      dark         = false,
      pxPerMonth   = 7,
      yearWidth    = 28,
      headerHeight = 26,
      dotR         = 5,
      barW         = 7,
    } = opts;

    const el = document.getElementById(containerId);
    if (!el || !window.CV) return { setFilter: () => {} };

    const t = CV.T[lang];
    const P = dark ? DARK : LIGHT;

    const RANGE_START  = new Date(2014, 8);   // Sep 2014
    const RANGE_END    = new Date();
    const TOTAL_MONTHS = (RANGE_END - RANGE_START) / MS_PM;
    const GRAPH_H      = Math.ceil(TOTAL_MONTHS) * pxPerMonth;
    const TOTAL_H      = headerHeight + GRAPH_H;

    const textMain = dark ? '#e2e8f0' : '#0f1f36';
    const textSub  = dark ? '#64748b' : '#4b5563';
    const textDate = dark ? '#374151' : '#94a3b8';
    const connClr  = dark ? 'rgba(148,163,184,.35)' : 'rgba(100,116,139,.3)';
    const yearClr  = dark ? '#374151' : '#94a3b8';
    const hrClr    = dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
    const font     = dark ? "'JetBrains Mono', monospace" : "'Inter', sans-serif";

    // Y: newest = top (small), oldest = bottom (large)
    function getY(dateStr) {
      const d = parseDate(dateStr);
      const m = (d - RANGE_START) / MS_PM;
      return headerHeight + (TOTAL_MONTHS - m) * pxPerMonth;
    }

    // Group events by branch
    const byBranch = { work: [], edu: [], social: [] };
    CV.gitEvents.forEach(e => byBranch[e.branch].push(e));

    // ── DOM ──────────────────────────────────────────────────────────────────
    el.innerHTML = '';
    el.style.cssText = `position:relative;font-family:${font};`;

    const wrap = document.createElement('div');
    wrap.style.cssText = `display:flex;height:${TOTAL_H}px;position:relative;`;
    el.appendChild(wrap);

    // Year markers
    const yCol = document.createElement('div');
    yCol.style.cssText = `width:${yearWidth}px;flex-shrink:0;position:relative;`;
    const startYr = RANGE_START.getFullYear();
    const endYr   = RANGE_END.getFullYear() + 1;
    for (let yr = startYr; yr <= endYr; yr++) {
      const yPx = headerHeight + (TOTAL_MONTHS - (yr - startYr) * 12) * pxPerMonth;
      const lbl = document.createElement('div');
      lbl.style.cssText = `position:absolute;top:${yPx}px;right:4px;font-size:7.5px;transform:translateY(-50%);color:${yearClr};`;
      lbl.textContent = yr;
      yCol.appendChild(lbl);
      const hr = document.createElement('div');
      hr.style.cssText = `position:absolute;top:${yPx}px;left:0;right:0;height:1px;background:${hrClr};`;
      yCol.appendChild(hr);
    }
    wrap.appendChild(yCol);

    // Lanes container + SVG overlay
    const lanesEl = document.createElement('div');
    lanesEl.style.cssText = `flex:1;display:flex;position:relative;`;
    wrap.appendChild(lanesEl);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `position:absolute;top:0;left:0;width:100%;height:${TOTAL_H}px;pointer-events:none;overflow:visible;z-index:6;`;
    lanesEl.appendChild(svg);

    // Lane refs for filter control
    const laneEls = {};

    // Render 3 lanes
    BRANCHES.forEach((branch) => {
      const c = P[branch];
      const laneEl = document.createElement('div');
      laneEl.style.cssText = `flex:1;position:relative;transition:opacity .3s;`;
      laneEl.dataset.gitBranch = branch;

      // Header
      const hdr = document.createElement('div');
      hdr.style.cssText = `height:${headerHeight}px;display:flex;align-items:center;justify-content:center;font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${c.hdrText};background:${c.hdrBg};border-radius:3px;margin:0 3px;`;
      hdr.textContent = t[`branch${branch[0].toUpperCase()}${branch.slice(1)}`] || branch;
      laneEl.appendChild(hdr);

      // Rail: thin always-visible vertical line
      const rail = document.createElement('div');
      rail.style.cssText = `position:absolute;top:${headerHeight}px;bottom:0;left:calc(22% + ${dotR}px - ${barW/2}px);width:${barW}px;background:${c.rail};opacity:.15;border-radius:${barW/2}px;z-index:1;`;
      laneEl.appendChild(rail);

      // Track used dot Y positions to avoid collision in same lane
      const usedDotY = [];
      function claimY(rawY) {
        let y = rawY;
        while (usedDotY.some(uy => Math.abs(uy - y) < dotR * 2.5)) y += dotR * 3;
        usedDotY.push(y);
        return y;
      }

      byBranch[branch].forEach(ev => {
        const rawStartY  = getY(ev.dateStart);
        const startY     = claimY(rawStartY);
        const endY       = ev.dateEnd ? getY(ev.dateEnd) : headerHeight;
        const barH       = Math.max(startY - endY, dotR * 2);

        // Active bar (solid colored segment)
        const bar = document.createElement('div');
        bar.style.cssText = `position:absolute;top:${endY}px;height:${barH}px;left:calc(22% + ${dotR}px - ${barW/2}px);width:${barW}px;background:${c.bar};border-radius:${barW/2}px;z-index:2;`;
        laneEl.appendChild(bar);

        // Start dot
        const dot = document.createElement('div');
        dot.style.cssText = `position:absolute;top:${startY - dotR}px;left:22%;transform:translateX(-50%);width:${dotR*2}px;height:${dotR*2}px;border-radius:50%;background:${c.bar};border:2px solid ${c.dotBorder};box-shadow:0 0 0 1.5px ${c.bar};z-index:4;`;
        dot.dataset.evId   = ev.id || '';
        dot.dataset.evDate = ev.dateStart;
        laneEl.appendChild(dot);

        // End marker (small open dot if event has ended)
        if (ev.dateEnd) {
          const endDot = document.createElement('div');
          const edy = getY(ev.dateEnd);
          endDot.style.cssText = `position:absolute;top:${edy - 3}px;left:22%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:${c.dotBorder};border:1.5px solid ${c.bar};opacity:.7;z-index:3;`;
          laneEl.appendChild(endDot);
        }

        // Label: role + org + date range
        const dateLabel = ev.dateStart + (ev.dateEnd ? ' \u2013 ' + ev.dateEnd : ' \u2013 ' + (lang === 'de' ? 'heute' : 'present'));
        const lbl = document.createElement('div');
        lbl.style.cssText = `position:absolute;top:${startY - dotR - 2}px;left:calc(22% + ${dotR * 2 + 5}px);right:3px;z-index:5;`;
        lbl.innerHTML =
          `<div style="font-size:8.5px;font-weight:600;color:${textMain};line-height:1.3;">${ev.role[lang]}</div>` +
          `<div style="font-size:7.5px;color:${textSub};">${ev.org[lang]}</div>` +
          (ev.desc[lang] ? `` : '') +
          `<div style="font-size:7px;color:${textDate};margin-top:1px;">${dateLabel}</div>`;
        laneEl.appendChild(lbl);
      });

      lanesEl.appendChild(laneEl);
      laneEls[branch] = laneEl;
    });

    // ── SVG connecting lines ─────────────────────────────────────────────────
    if (CV.gitConnections) {
      // Force layout so we can read widths
      const totalW = lanesEl.getBoundingClientRect().width || (el.offsetWidth - yearWidth);
      const laneW  = totalW / 3;

      // Dot X center (relative to lanesEl) per branch
      const dotX = {
        work:   laneW * 0 + laneW * 0.22,
        edu:    laneW * 1 + laneW * 0.22,
        social: laneW * 2 + laneW * 0.22,
      };

      CV.gitConnections.forEach(conn => {
        const from = CV.gitEvents.find(e => e.id === conn.from);
        const to   = CV.gitEvents.find(e => e.id === conn.to);
        if (!from || !to) return;

        const x1 = dotX[from.branch];
        const y1 = getY(from.dateStart);
        const x2 = dotX[to.branch];
        const y2 = getY(to.dateStart);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (Math.abs(y1 - y2) < pxPerMonth * 2.5) {
          path.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
        } else {
          const mx = (x1 + x2) / 2;
          path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        }
        path.setAttribute('stroke', connClr);
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-dasharray', '4,3');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      });
    }

    // ── Filter API ───────────────────────────────────────────────────────────
    return {
      setFilter(branch) {
        BRANCHES.forEach(b => {
          const lane = laneEls[b];
          if (!lane) return;
          if (branch === 'all' || b === branch) {
            lane.style.opacity = '1';
            lane.style.flex    = '1';
          } else {
            lane.style.opacity = '0.2';
            lane.style.flex    = '0 0 20px';
          }
        });
      }
    };
  }

  return { render };
})();
