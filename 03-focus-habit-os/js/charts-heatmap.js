"use strict";

window.FocusHabitOS = window.FocusHabitOS || {};

(function registerChartsAndHeatmap(ns) {
  const TRACK_COLORS = {
    Coding: "#ea580c",
    Study: "#14b8a6",
    Language: "#f59e0b",
    Reading: "#8b5cf6",
    Planning: "#10b981",
  };

  const TRACKS = ["Coding", "Study", "Language", "Reading", "Planning"];
  const TRIGGER_KEYS = [
    "Stress",
    "Boredom",
    "Loneliness",
    "LateNight",
    "CoffeeRoutine",
    "ScreenScrolling",
  ];

  const SHORT_WEEKDAYS = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    fa: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
  };

  const SHORT_MONTHS_GREG = {
    en: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    de: [
      "Jan",
      "Feb",
      "Mär",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dez",
    ],
  };

  const FULL_MONTHS_JALALI = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  // DOM Elements
  const heatmapSvgEl = document.getElementById("heatmap-svg");
  const heatmapReadoutEl = document.getElementById("heatmap-hover-info");
  const weeklyBarSvgEl = document.getElementById("weekly-bar-svg");
  const focusDonutSvgEl = document.getElementById("focus-donut-svg");
  const focusDonutTotalEl = document.getElementById("focus-donut-total");
  const focusDonutLegendEl = document.getElementById("focus-donut-legend");
  const triggerBarsEl = document.getElementById("trigger-bars");

  function toISODate(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
  }

  function getMonthInfo(dateObj, lang) {
    if (
      lang === "fa" &&
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.gregorianToJalali === "function"
    ) {
      const { jy, jm } = window.TrilingualCalendar.gregorianToJalali(
        dateObj.getFullYear(),
        dateObj.getMonth() + 1,
        dateObj.getDate(),
      );
      return {
        key: `${jy}-${jm}`,
        shortName: FULL_MONTHS_JALALI[jm - 1] || "",
        yearLabel: ns.Store.toPersianDigits(jy),
      };
    }

    const gy = dateObj.getFullYear();
    const gm = dateObj.getMonth();
    const list = SHORT_MONTHS_GREG[lang] || SHORT_MONTHS_GREG.en;
    return {
      key: `${gy}-${gm + 1}`,
      shortName: list[gm] || "",
      yearLabel: String(gy),
    };
  }

  function getHeatFillVar(score) {
    if (score <= 0) return "var(--heat-0)";
    if (score === 1) return "var(--heat-1)";
    if (score <= 3) return "var(--heat-2)";
    if (score <= 5) return "var(--heat-3)";
    return "var(--heat-4)";
  }

  /* =========================================================
     1. 365-DAY SVG CONSISTENCY HEATMAP (آبان ۱۴۰۵ تا آبان ۱۴۰۶ / Nov 2026 - Nov 2027)
     ========================================================= */
  function renderHeatmap() {
    if (!heatmapSvgEl) return;
    heatmapSvgEl.setAttribute("dir", "ltr");

    const lang = ns.Store.state.lang;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayISO = toISODate(today);

    const startDayOfWeek = today.getDay(); // 0=Sun..6=Sat
    const startDate = new Date(today.getTime() - startDayOfWeek * 86400000);
    const endRangeDate = new Date(
      startDate.getTime() + (53 * 7 - 1) * 86400000,
    );
    const endMonthKey = getMonthInfo(endRangeDate, lang).key;

    const cellSize = 11;
    const step = 14;
    const offsetX = 24;
    const offsetY = 22;

    let svgMarkup = "";
    let lastMonthKey = "";
    let lastLabelEndX = -Infinity;

    for (let col = 0; col < 53; col++) {
      const colStart = new Date(startDate.getTime() + col * 7 * 86400000);
      const colEnd = new Date(colStart.getTime() + 6 * 86400000);
      const monthInfo = getMonthInfo(colEnd, lang);
      const isFirstCol = col === 0;
      const isFinalMonth = monthInfo.key === endMonthKey;

      if (monthInfo.key !== lastMonthKey) {
        lastMonthKey = monthInfo.key;
        const labelX = offsetX + col * step;
        const fullLabel =
          isFirstCol || isFinalMonth
            ? `${monthInfo.shortName} ${monthInfo.yearLabel}`
            : monthInfo.shortName;

        if (isFirstCol || isFinalMonth || labelX >= lastLabelEndX + 6) {
          svgMarkup += `<text x="${labelX}" y="13" text-anchor="start" direction="ltr" unicode-bidi="isolate" class="heat-month-label">${ns.Store.escapeHTML(fullLabel)}</text>`;
          lastLabelEndX = labelX + fullLabel.length * 5.8;
        }
      }

      for (let row = 0; row < 7; row++) {
        const cellDate = new Date(
          startDate.getTime() + (col * 7 + row) * 86400000,
        );
        const iso = toISODate(cellDate);
        const score = ns.Store.getDailyActivityScore(iso);
        const fill = getHeatFillVar(score);
        const x = offsetX + col * step;
        const y = offsetY + row * step;
        const isToday = iso === todayISO;

        svgMarkup += `<rect class="heat-cell${isToday ? " is-today" : ""}" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2.5" fill="${fill}" data-heat-iso="${iso}" data-heat-score="${score}"></rect>`;
      }
    }

    heatmapSvgEl.innerHTML = svgMarkup;

    if (heatmapReadoutEl) {
      const todayScore = ns.Store.getDailyActivityScore(todayISO);
      heatmapReadoutEl.textContent = formatHeatmapReadout(todayISO, todayScore);
    }
  }

  function formatHeatmapReadout(isoDate, score) {
    const lang = ns.Store.state.lang;
    const formattedDate =
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.formatDate === "function"
        ? window.TrilingualCalendar.formatDate(isoDate, lang, true)
        : isoDate;
    return `${ns.Store.formatNum(score)} ${ns.Store.t("heatmapScoreWord")} ${formattedDate}`;
  }

  /* =========================================================
     2. 7-DAY FOCUS MINUTES COLUMN BAR CHART
     ========================================================= */
  function renderWeeklyBarChart() {
    if (!weeklyBarSvgEl) return;
    weeklyBarSvgEl.setAttribute("dir", "ltr");

    const lang = ns.Store.state.lang;
    const weekdayNames = SHORT_WEEKDAYS[lang] || SHORT_WEEKDAYS.en;
    const minsUnit = ns.Store.t("minsUnit");

    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = toISODate(d);
      const mins = ns.Store.state.data.focusSessions
        .filter((s) => s.date === iso)
        .reduce((sum, s) => sum + s.minutes, 0);
      daysData.push({
        iso,
        label: weekdayNames[d.getDay()],
        mins,
        isToday: i === 0,
      });
    }

    const maxMins = Math.max(30, ...daysData.map((d) => d.mins));
    const chartBottomY = 165;
    const maxBarHeight = 122;
    const colWidth = 34;
    const gap = 22;
    const startX = 24;

    let svgMarkup = `<line x1="12" y1="${chartBottomY}" x2="408" y2="${chartBottomY}" class="bar-axis"></line>`;

    daysData.forEach((item, idx) => {
      const x = startX + idx * (colWidth + gap);
      const barH =
        item.mins > 0 ? Math.max(8, (item.mins / maxMins) * maxBarHeight) : 4;
      const y = chartBottomY - barH;
      const fillColor = item.isToday ? "var(--teal)" : "var(--brand-accent)";
      const topLabel = `${ns.Store.formatNum(item.mins)}${minsUnit}`;

      svgMarkup += `
        <g>
          <rect x="${x}" y="${y}" width="${colWidth}" height="${barH}" rx="6" fill="${fillColor}" opacity="${item.mins > 0 ? "0.92" : "0.22"}"></rect>
          <text x="${x + colWidth / 2}" y="${y - 7}" text-anchor="middle" direction="ltr" unicode-bidi="isolate" class="bar-val-text">${ns.Store.escapeHTML(topLabel)}</text>
          <text x="${x + colWidth / 2}" y="${chartBottomY + 20}" text-anchor="middle" direction="ltr" unicode-bidi="isolate" class="bar-day-text">${ns.Store.escapeHTML(item.label)}</text>
        </g>
      `;
    });

    weeklyBarSvgEl.innerHTML = svgMarkup;
  }

  /* =========================================================
     3. FOCUS CATEGORY SVG DONUT CHART
     ========================================================= */
  function renderFocusDonut() {
    if (!focusDonutSvgEl || !focusDonutLegendEl) return;
    const sessions = ns.Store.state.data.focusSessions;
    const totalMins = sessions.reduce((sum, s) => sum + s.minutes, 0);
    const totalHours = (totalMins / 60).toFixed(1);

    if (focusDonutTotalEl) {
      const formattedHours =
        ns.Store.state.lang === "fa"
          ? ns.Store.toPersianDigits(totalHours)
          : totalHours;
      focusDonutTotalEl.textContent = `${formattedHours}${ns.Store.t("hoursUnit")}`;
    }

    const trackStats = TRACKS.map((track) => {
      const mins = sessions
        .filter((s) => s.track === track)
        .reduce((sum, s) => sum + s.minutes, 0);
      const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
      return {
        track,
        label: ns.Store.tGroup("focusTracks", track),
        mins,
        pct,
        color: TRACK_COLORS[track],
      };
    });

    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    let svgCircles = `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(168,162,158,0.16)" stroke-width="18"></circle>`;

    if (totalMins > 0) {
      let offsetAcc = 0;
      trackStats.forEach((item) => {
        if (item.mins <= 0) return;
        const segLen = (item.mins / totalMins) * circumference;
        const dashArray = `${Math.max(0, segLen - 2)} ${circumference}`;
        const dashOffset = -offsetAcc;
        offsetAcc += segLen;
        svgCircles += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${item.color}" stroke-width="18" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}"></circle>`;
      });
    }

    focusDonutSvgEl.innerHTML = svgCircles;

    focusDonutLegendEl.innerHTML = trackStats
      .map(
        (item) => `
        <li class="legend-item">
          <span class="legend-left">
            <span class="legend-dot" style="background:${item.color}"></span>
            <span>${ns.Store.escapeHTML(item.label)}</span>
          </span>
          <span class="legend-val">${ns.Store.formatPct(item.pct)}</span>
        </li>
      `,
      )
      .join("");
  }

  /* =========================================================
     4. TRIGGER DIAGNOSTICS PERCENTAGE BARS
     ========================================================= */
  function renderTriggerBars() {
    if (!triggerBarsEl) return;
    const logs = ns.Store.state.data.recovery.triggerLogs || [];
    const total = logs.length;

    if (total === 0) {
      triggerBarsEl.innerHTML = `<p class="empty-placeholder">${ns.Store.escapeHTML(ns.Store.t("emptyTriggers"))}</p>`;
      return;
    }

    const grouped = TRIGGER_KEYS.map((cause) => {
      const count = logs.filter((l) => l.cause === cause).length;
      const pct = Math.round((count / total) * 100);
      return {
        cause,
        label: ns.Store.tGroup("triggerCauses", cause),
        count,
        pct,
      };
    })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    triggerBarsEl.innerHTML = grouped
      .map(
        (row) => `
        <div class="trigger-bar-row">
          <div class="trigger-bar-meta">
            <span>${ns.Store.escapeHTML(row.label)}</span>
            <strong>${ns.Store.formatNum(row.count)} (${ns.Store.formatPct(row.pct)})</strong>
          </div>
          <div class="trigger-track">
            <div class="trigger-fill" style="width: ${row.pct}%"></div>
          </div>
        </div>
      `,
      )
      .join("");
  }

  function renderAllCharts() {
    renderHeatmap();
    renderWeeklyBarChart();
    renderFocusDonut();
    renderTriggerBars();
  }

  function init() {
    if (heatmapSvgEl && heatmapReadoutEl) {
      heatmapSvgEl.addEventListener("mouseover", (event) => {
        const cell = event.target.closest(".heat-cell[data-heat-iso]");
        if (!cell) return;
        const iso = cell.getAttribute("data-heat-iso");
        const score =
          Number.parseInt(cell.getAttribute("data-heat-score"), 10) || 0;
        heatmapReadoutEl.textContent = formatHeatmapReadout(iso, score);
      });
    }
    renderAllCharts();
  }

  ns.ChartsEngine = {
    init,
    renderAllCharts,
  };
})(window.FocusHabitOS);
