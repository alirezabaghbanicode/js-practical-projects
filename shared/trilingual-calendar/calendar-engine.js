"use strict";

(function attachTrilingualCalendar(globalScope) {
  const CALENDAR_META = {
    en: {
      systemLabel: "Gregorian Calendar",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      shortMonths: [
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
      weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      todayBtn: "Today",
      closeBtn: "Close",
    },
    de: {
      systemLabel: "Gregorianischer Kalender",
      months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      shortMonths: [
        "Jan.",
        "Feb.",
        "Mär.",
        "Apr.",
        "Mai",
        "Jun.",
        "Jul.",
        "Aug.",
        "Sep.",
        "Okt.",
        "Nov.",
        "Dez.",
      ],
      weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      todayBtn: "Heute",
      closeBtn: "Schließen",
    },
    fa: {
      systemLabel: "تقویم رسمی هجری شمسی",
      months: [
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
      ],
      shortMonths: [
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
      ],
      weekdays: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
      todayBtn: "امروز",
      closeBtn: "بستن",
    },
  };

  function toPersianDigits(text) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(text).replace(/\d/g, (d) => digits[Number(d)]);
  }

  function toLatinDigits(text) {
    const map = {
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
    };
    return String(text).replace(/[۰-۹]/g, (ch) => map[ch] || ch);
  }

  function pad2(num) {
    return String(num).padStart(2, "0");
  }

  function toISODate(gy, gm, gd) {
    return `${gy}-${pad2(gm)}-${pad2(gd)}`;
  }

  function getTodayISO() {
    const now = new Date();
    return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function parseISODate(isoStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoStr || ""))) {
      const now = new Date();
      return {
        gy: now.getFullYear(),
        gm: now.getMonth() + 1,
        gd: now.getDate(),
      };
    }
    const [gy, gm, gd] = isoStr.split("-").map(Number);
    return { gy, gm, gd };
  }

  function gregorianToJalali(gy, gm, gd) {
    try {
      const dateObj = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0));
      const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        timeZone: "UTC",
      }).formatToParts(dateObj);

      const yearPart = parts.find((p) => p.type === "year");
      const monthPart = parts.find((p) => p.type === "month");
      const dayPart = parts.find((p) => p.type === "day");

      if (yearPart && monthPart && dayPart) {
        const jy = Number.parseInt(toLatinDigits(yearPart.value), 10);
        const jm = Number.parseInt(toLatinDigits(monthPart.value), 10);
        const jd = Number.parseInt(toLatinDigits(dayPart.value), 10);
        if (Number.isFinite(jy) && jy > 1300 && jy < 1600) {
          return { jy, jm, jd };
        }
      }
    } catch {
      // Fallback to arithmetic conversion below
    }

    const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      355666 +
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) +
      gd +
      gdm[gm - 1];
    let jy = -1595 + 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const jm =
      days < 186
        ? 1 + Math.floor(days / 31)
        : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return { jy, jm, jd };
  }

  function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;
    let days =
      -355668 +
      365 * jy +
      Math.floor(jy / 33) * 8 +
      Math.floor(((jy % 33) + 3) / 4) +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const salA = [
      0,
      31,
      (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    let gm = 1;
    for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) {
      gd -= salA[gm];
    }
    return { gy, gm, gd };
  }

  function getJalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    const g1 = jalaliToGregorian(jy, 1, 1);
    const g2 = jalaliToGregorian(jy + 1, 1, 1);
    const d1 = Date.UTC(g1.gy, g1.gm - 1, g1.gd);
    const d2 = Date.UTC(g2.gy, g2.gm - 1, g2.gd);
    return Math.round((d2 - d1) / 86400000) === 366 ? 30 : 29;
  }

  function getActiveLang(explicitLang) {
    const raw = String(explicitLang || document.documentElement.lang || "en")
      .trim()
      .toLowerCase();
    const candidate = raw.split("-")[0];
    return Object.prototype.hasOwnProperty.call(CALENDAR_META, candidate)
      ? candidate
      : "en";
  }

  function formatDate(isoDate, lang, includeYear = true) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ""))) return "";
    const activeLang = getActiveLang(lang);
    const { gy, gm, gd } = parseISODate(isoDate);
    const meta = CALENDAR_META[activeLang];

    if (activeLang === "fa") {
      const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
      const dayStr = toPersianDigits(jd);
      const monthStr = meta.months[jm - 1];
      return includeYear
        ? `${dayStr} ${monthStr} ${toPersianDigits(jy)}`
        : `${dayStr} ${monthStr}`;
    }

    if (activeLang === "de") {
      const monthStr = meta.shortMonths[gm - 1];
      return includeYear ? `${gd}. ${monthStr} ${gy}` : `${gd}. ${monthStr}`;
    }

    const monthStr = meta.shortMonths[gm - 1];
    return includeYear ? `${monthStr} ${gd}, ${gy}` : `${monthStr} ${gd}`;
  }

  // Singleton Popover State
  const popoverState = {
    initialized: false,
    isOpen: false,
    targetInputId: null,
    triggerEl: null,
    viewYear: 2026,
    viewMonth: 11,
    activeLang: "en",
    elements: null,
  };

  function buildPopoverDOM() {
    if (popoverState.elements) return popoverState.elements;

    const popover = document.createElement("div");
    popover.id = "tc-shared-calendar-popover";
    popover.className = "tc-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", "Localized Date Picker");
    popover.hidden = true;

    const header = document.createElement("div");
    header.className = "tc-header";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "tc-nav-btn";
    prevBtn.setAttribute("aria-label", "Previous month");
    prevBtn.innerHTML =
      '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

    const titleBox = document.createElement("div");
    titleBox.className = "tc-title-box";

    const monthYearEl = document.createElement("strong");
    monthYearEl.className = "tc-month-year";

    const systemBadgeEl = document.createElement("span");
    systemBadgeEl.className = "tc-system-badge";

    titleBox.append(monthYearEl, systemBadgeEl);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "tc-nav-btn";
    nextBtn.setAttribute("aria-label", "Next month");
    nextBtn.innerHTML =
      '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    header.append(prevBtn, titleBox, nextBtn);

    const weekdaysEl = document.createElement("div");
    weekdaysEl.className = "tc-weekdays";

    const daysGridEl = document.createElement("div");
    daysGridEl.className = "tc-days-grid";

    const footer = document.createElement("div");
    footer.className = "tc-footer";

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "tc-footer-btn";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tc-footer-btn";

    footer.append(todayBtn, closeBtn);
    popover.append(header, weekdaysEl, daysGridEl, footer);
    document.body.appendChild(popover);

    prevBtn.addEventListener("click", () => {
      if (popoverState.viewMonth === 1) {
        popoverState.viewMonth = 12;
        popoverState.viewYear -= 1;
      } else {
        popoverState.viewMonth -= 1;
      }
      renderPopover(popoverState.activeLang);
    });

    nextBtn.addEventListener("click", () => {
      if (popoverState.viewMonth === 12) {
        popoverState.viewMonth = 1;
        popoverState.viewYear += 1;
      } else {
        popoverState.viewMonth += 1;
      }
      renderPopover(popoverState.activeLang);
    });

    todayBtn.addEventListener("click", () => {
      const todayISO = getTodayISO();
      if (popoverState.targetInputId) {
        setValue(popoverState.targetInputId, todayISO, true);
      }
      close();
    });

    closeBtn.addEventListener("click", close);

    daysGridEl.addEventListener("click", (event) => {
      const cell = event.target.closest(".tc-day-cell[data-iso]");
      if (!cell) return;
      const pickedISO = cell.getAttribute("data-iso");
      if (popoverState.targetInputId && pickedISO) {
        setValue(popoverState.targetInputId, pickedISO, true);
      }
      close();
    });

    popoverState.elements = {
      popover,
      prevBtn,
      nextBtn,
      monthYearEl,
      systemBadgeEl,
      weekdaysEl,
      daysGridEl,
      todayBtn,
      closeBtn,
    };

    return popoverState.elements;
  }

  function renderPopover(explicitLang) {
    const els = buildPopoverDOM();
    const lang = getActiveLang(explicitLang);
    popoverState.activeLang = lang;
    const isRTL = lang === "fa";

    els.popover.dir = isRTL ? "rtl" : "ltr";
    els.prevBtn.innerHTML = isRTL
      ? '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
      : '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    els.nextBtn.innerHTML = isRTL
      ? '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
      : '<svg class="tc-nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    const meta = CALENDAR_META[lang];
    const vy = popoverState.viewYear;
    const vm = popoverState.viewMonth;

    const targetInput = popoverState.targetInputId
      ? document.getElementById(popoverState.targetInputId)
      : null;
    const selectedISO = targetInput ? targetInput.value : "";
    const todayISO = getTodayISO();

    const yearLabel = lang === "fa" ? toPersianDigits(vy) : String(vy);
    els.monthYearEl.textContent = `${meta.months[vm - 1]} ${yearLabel}`;
    els.systemBadgeEl.textContent = meta.systemLabel;
    els.todayBtn.textContent = meta.todayBtn;
    els.closeBtn.textContent = meta.closeBtn;

    els.weekdaysEl.innerHTML = "";
    meta.weekdays.forEach((dayName) => {
      const span = document.createElement("span");
      span.className = "tc-weekday";
      span.textContent = dayName;
      els.weekdaysEl.appendChild(span);
    });

    let firstDayOffset = 0;
    let totalDays = 30;

    if (lang === "fa") {
      const gFirst = jalaliToGregorian(vy, vm, 1);
      const jsDay = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay();
      firstDayOffset = (jsDay + 1) % 7;
      totalDays = getJalaliMonthLength(vy, vm);
    } else {
      const jsDay = new Date(vy, vm - 1, 1).getDay();
      firstDayOffset = lang === "de" ? (jsDay + 6) % 7 : jsDay;
      totalDays = new Date(vy, vm, 0).getDate();
    }

    els.daysGridEl.innerHTML = "";
    for (let i = 0; i < firstDayOffset; i++) {
      const empty = document.createElement("span");
      empty.className = "tc-day-empty";
      els.daysGridEl.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
      let cellISO = "";
      if (lang === "fa") {
        const gDate = jalaliToGregorian(vy, vm, day);
        cellISO = toISODate(gDate.gy, gDate.gm, gDate.gd);
      } else {
        cellISO = toISODate(vy, vm, day);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tc-day-cell";
      if (cellISO === todayISO) btn.classList.add("is-today");
      if (cellISO === selectedISO) btn.classList.add("is-selected");
      btn.setAttribute("data-iso", cellISO);
      btn.textContent = lang === "fa" ? toPersianDigits(day) : String(day);
      els.daysGridEl.appendChild(btn);
    }
  }

  function positionPopover(triggerBtn) {
    const els = buildPopoverDOM();
    const rect = triggerBtn.getBoundingClientRect();
    const popWidth = 296;
    const popHeight = 324;
    const isRTL =
      popoverState.activeLang === "fa" ||
      document.documentElement.dir === "rtl";

    let left = isRTL ? rect.right - popWidth : rect.left;
    left = Math.max(12, Math.min(left, window.innerWidth - popWidth - 12));

    let top = rect.bottom + 6;
    if (top + popHeight > window.innerHeight - 12) {
      top = Math.max(12, rect.top - popHeight - 6);
    }

    els.popover.style.left = `${left}px`;
    els.popover.style.top = `${top}px`;
  }

  function syncViewCoordinates(isoStr, lang) {
    const { gy, gm, gd } = parseISODate(isoStr || getTodayISO());
    if (lang === "fa") {
      const { jy, jm } = gregorianToJalali(gy, gm, gd);
      popoverState.viewYear = jy;
      popoverState.viewMonth = jm;
    } else {
      popoverState.viewYear = gy;
      popoverState.viewMonth = gm;
    }
  }

  function open(triggerBtn) {
    const targetId = triggerBtn.getAttribute("data-calendar-target");
    const hiddenInput = targetId ? document.getElementById(targetId) : null;
    if (!hiddenInput) return;

    const els = buildPopoverDOM();
    const lang = getActiveLang();
    syncViewCoordinates(hiddenInput.value || getTodayISO(), lang);

    popoverState.isOpen = true;
    popoverState.targetInputId = targetId;
    popoverState.triggerEl = triggerBtn;

    const parentDialog = triggerBtn.closest("dialog[open]");
    if (parentDialog) {
      parentDialog.appendChild(els.popover);
    } else if (els.popover.parentElement !== document.body) {
      document.body.appendChild(els.popover);
    }

    els.popover.hidden = false;
    renderPopover(lang);
    positionPopover(triggerBtn);
  }

  function close() {
    if (!popoverState.elements) return;
    popoverState.isOpen = false;
    popoverState.elements.popover.hidden = true;
  }

  function syncTriggerDisplay(targetInputId, explicitLang) {
    const hiddenInput = document.getElementById(targetInputId);
    const triggerBtn = document.querySelector(
      `.tc-trigger-btn[data-calendar-target="${targetInputId}"]`,
    );
    if (!hiddenInput || !triggerBtn) return;

    const textSpan = triggerBtn.querySelector(".tc-trigger-text");
    if (!textSpan) return;

    const isoVal = hiddenInput.value || getTodayISO();
    hiddenInput.value = isoVal;
    textSpan.textContent = formatDate(isoVal, explicitLang, true);
  }

  function syncAll(explicitLang) {
    const activeLang = getActiveLang(explicitLang);
    document
      .querySelectorAll(".tc-trigger-btn[data-calendar-target]")
      .forEach((btn) => {
        const targetId = btn.getAttribute("data-calendar-target");
        if (targetId) syncTriggerDisplay(targetId, activeLang);
      });

    if (popoverState.isOpen && popoverState.targetInputId) {
      const targetInput = document.getElementById(popoverState.targetInputId);
      syncViewCoordinates(
        targetInput ? targetInput.value : getTodayISO(),
        activeLang,
      );
      renderPopover(activeLang);
      if (popoverState.triggerEl) {
        positionPopover(popoverState.triggerEl);
      }
    }
  }

  function setValue(targetInputId, isoDate, emitChange = false) {
    const hiddenInput = document.getElementById(targetInputId);
    if (!hiddenInput) return;
    hiddenInput.value = isoDate;
    syncTriggerDisplay(targetInputId);
    if (emitChange) {
      hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function init() {
    if (popoverState.initialized) return;
    popoverState.initialized = true;
    buildPopoverDOM();

    document.addEventListener("click", (event) => {
      const triggerBtn = event.target.closest(
        ".tc-trigger-btn[data-calendar-target]",
      );
      if (triggerBtn) {
        const targetId = triggerBtn.getAttribute("data-calendar-target");
        if (popoverState.isOpen && popoverState.targetInputId === targetId) {
          close();
        } else {
          open(triggerBtn);
        }
        return;
      }

      if (
        popoverState.isOpen &&
        popoverState.elements &&
        !popoverState.elements.popover.contains(event.target) &&
        !event.target.closest(".tc-trigger-btn")
      ) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && popoverState.isOpen) {
        close();
      }
    });

    window.addEventListener("resize", () => {
      if (popoverState.isOpen && popoverState.triggerEl) {
        positionPopover(popoverState.triggerEl);
      }
    });

    syncAll();
  }

  globalScope.TrilingualCalendar = {
    init,
    open,
    close,
    syncAll,
    setValue,
    formatDate,
    gregorianToJalali,
    jalaliToGregorian,
    toPersianDigits,
    getTodayISO,
    parseISODate,
  };
})(window);
