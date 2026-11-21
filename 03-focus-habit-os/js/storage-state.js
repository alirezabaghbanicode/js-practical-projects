"use strict";

window.FocusHabitOS = window.FocusHabitOS || {};

(function registerStorageAndState(ns) {
  const STORAGE_KEY = "alireza_focushabit_os_v1";
  const LANG_KEY = "alireza_focushabit_lang_v1";
  const THEME_KEY = "alireza_focushabit_theme_v1";
  const PRIVACY_KEY = "alireza_focushabit_privacy_v1";

  const ALLOWED_FOCUS_TRACKS = new Set([
    "Coding",
    "Study",
    "Language",
    "Reading",
    "Planning",
  ]);
  const ALLOWED_HABIT_CATS = new Set([
    "Coding",
    "Health",
    "Study",
    "Language",
    "Mindset",
  ]);
  const ALLOWED_TRIGGERS = new Set([
    "Stress",
    "Boredom",
    "Loneliness",
    "LateNight",
    "CoffeeRoutine",
    "ScreenScrolling",
  ]);

  function hasKey(obj, key) {
    return Boolean(key) && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isEmptyValue(value) {
    return String(value ?? "").trim().length === 0;
  }

  function toPersianDigits(text) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(text).replace(/\d/g, (d) => digits[Number(d)]);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getTodayISO() {
    if (
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.getTodayISO === "function"
    ) {
      return window.TrilingualCalendar.getTodayISO();
    }
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function getInitialLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = (params.get("lang") || "").toLowerCase();
      if (hasKey(ns.I18N, urlLang)) return urlLang;
    } catch {
      // Ignore URL errors
    }
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (hasKey(ns.I18N, saved)) return saved;
    } catch {
      // Ignore storage errors
    }
    return "en";
  }

  function getInitialTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  }

  function getInitialPrivacy() {
    try {
      return localStorage.getItem(PRIVACY_KEY) === "true";
    } catch {
      return false;
    }
  }

  function isPureSampleData(data) {
    if (!data || typeof data !== "object") return false;
    if (data.isUserModified === true) return false;

    const habitsAreSample =
      Array.isArray(data.habits) &&
      data.habits.length > 0 &&
      data.habits.every((h) => /^hab-\d+$/.test(h.id));

    const sessionsAreSample =
      Array.isArray(data.focusSessions) &&
      data.focusSessions.every((s) => /^ses-\d+$/.test(s.id));

    const triggersAreSample =
      data.recovery &&
      Array.isArray(data.recovery.triggerLogs) &&
      data.recovery.triggerLogs.every((t) => /^trg-\d+$/.test(t.id));

    return habitsAreSample && sessionsAreSample && triggersAreSample;
  }

  function sanitizeData(raw, fallbackLang) {
    const fallback = ns.buildSampleData(fallbackLang);
    if (!raw || typeof raw !== "object") {
      return { ...fallback, isUserModified: false };
    }

    const habits = Array.isArray(raw.habits)
      ? raw.habits
          .filter(
            (h) =>
              h &&
              typeof h.id === "string" &&
              typeof h.title === "string" &&
              ALLOWED_HABIT_CATS.has(h.category) &&
              Array.isArray(h.completedDates),
          )
          .map((h) => ({
            id: h.id,
            title: h.title.slice(0, 65),
            category: h.category,
            completedDates: h.completedDates.filter((d) =>
              /^\d{4}-\d{2}-\d{2}$/.test(String(d)),
            ),
          }))
      : fallback.habits;

    const focusSessions = Array.isArray(raw.focusSessions)
      ? raw.focusSessions
          .filter(
            (s) =>
              s &&
              typeof s.id === "string" &&
              ALLOWED_FOCUS_TRACKS.has(s.track) &&
              typeof s.minutes === "number" &&
              Number.isFinite(s.minutes) &&
              s.minutes > 0 &&
              /^\d{4}-\d{2}-\d{2}$/.test(String(s.date)),
          )
          .map((s) => ({
            id: s.id,
            track: s.track,
            minutes: Math.round(s.minutes),
            note: typeof s.note === "string" ? s.note.slice(0, 60) : "",
            date: s.date,
          }))
      : fallback.focusSessions;

    const rec =
      raw.recovery && typeof raw.recovery === "object" ? raw.recovery : {};
    const smk =
      rec.smoking && typeof rec.smoking === "object" ? rec.smoking : {};
    const slf =
      rec.selfcontrol && typeof rec.selfcontrol === "object"
        ? rec.selfcontrol
        : {};

    const triggerLogs = Array.isArray(rec.triggerLogs)
      ? rec.triggerLogs
          .filter(
            (t) =>
              t &&
              typeof t.id === "string" &&
              (t.track === "smoking" || t.track === "selfcontrol") &&
              (t.outcome === "win" || t.outcome === "relapse") &&
              ALLOWED_TRIGGERS.has(t.cause) &&
              /^\d{4}-\d{2}-\d{2}$/.test(String(t.date)),
          )
          .map((t) => ({
            id: t.id,
            track: t.track,
            outcome: t.outcome,
            cause: t.cause,
            note: typeof t.note === "string" ? t.note.slice(0, 90) : "",
            date: t.date,
          }))
      : fallback.recovery.triggerLogs;

    const sanitized = {
      isUserModified: Boolean(raw.isUserModified),
      habits,
      focusSessions,
      recovery: {
        smoking: {
          startISO:
            typeof smk.startISO === "string" && smk.startISO.includes("T")
              ? smk.startISO
              : fallback.recovery.smoking.startISO,
          cigsPerDay:
            typeof smk.cigsPerDay === "number" && smk.cigsPerDay > 0
              ? Math.min(100, smk.cigsPerDay)
              : 15,
          packPrice:
            typeof smk.packPrice === "number" && smk.packPrice > 0
              ? smk.packPrice
              : fallback.recovery.smoking.packPrice,
          bestStreakDays:
            typeof smk.bestStreakDays === "number" && smk.bestStreakDays >= 0
              ? smk.bestStreakDays
              : 0,
          urgesResisted:
            typeof smk.urgesResisted === "number" && smk.urgesResisted >= 0
              ? smk.urgesResisted
              : 0,
        },
        selfcontrol: {
          startISO:
            typeof slf.startISO === "string" && slf.startISO.includes("T")
              ? slf.startISO
              : fallback.recovery.selfcontrol.startISO,
          bestStreakDays:
            typeof slf.bestStreakDays === "number" && slf.bestStreakDays >= 0
              ? slf.bestStreakDays
              : 0,
          urgesResisted:
            typeof slf.urgesResisted === "number" && slf.urgesResisted >= 0
              ? slf.urgesResisted
              : 0,
        },
        triggerLogs,
      },
    };

    if (!isPureSampleData(sanitized)) {
      sanitized.isUserModified = true;
    }

    return sanitized;
  }

  function loadInitialData(lang) {
    try {
      const rawStr = localStorage.getItem(STORAGE_KEY);
      if (rawStr === null) {
        const sample = { ...ns.buildSampleData(lang), isUserModified: false };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        return sample;
      }
      return sanitizeData(JSON.parse(rawStr), lang);
    } catch {
      return { ...ns.buildSampleData(lang), isUserModified: false };
    }
  }

  const initialLang = getInitialLang();

  const state = {
    lang: initialLang,
    theme: getInitialTheme(),
    privacy: getInitialPrivacy(),
    selectedHabitDate: getTodayISO(),
    data: loadInitialData(initialLang),
  };

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch {
      // Ignore quota errors
    }
  }

  function markUserModified() {
    state.data.isUserModified = true;
  }

  function t(key) {
    const dict = ns.I18N[state.lang] || ns.I18N.en;
    return dict[key] !== undefined ? dict[key] : key;
  }

  function tGroup(groupName, itemKey) {
    const dict = ns.I18N[state.lang] || ns.I18N.en;
    const grp = dict[groupName];
    return grp && grp[itemKey] ? grp[itemKey] : itemKey;
  }

  function formatNum(num) {
    if (state.lang === "fa") {
      return new Intl.NumberFormat("fa-IR").format(num);
    }
    if (state.lang === "de") {
      return new Intl.NumberFormat("de-DE").format(num);
    }
    return new Intl.NumberFormat("en-US").format(num);
  }

  function formatPct(pct) {
    return state.lang === "fa" ? `${toPersianDigits(pct)}٪` : `${pct}%`;
  }

  function formatMoney(amount) {
    if (state.lang === "fa") {
      const formatted = new Intl.NumberFormat("fa-IR", {
        maximumFractionDigits: 0,
      }).format(Math.round(amount));
      return `${formatted} تومان`;
    }
    if (state.lang === "de") {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function addFocusSession(track, minutes, note, dateISO) {
    const safeTrack = ALLOWED_FOCUS_TRACKS.has(track) ? track : "Coding";
    const safeMins = Math.max(
      1,
      Math.min(240, Math.round(Number(minutes) || 25)),
    );
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateISO || ""))
      ? dateISO
      : getTodayISO();

    markUserModified();
    state.data.focusSessions.unshift({
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `ses-${Date.now()}`,
      track: safeTrack,
      minutes: safeMins,
      note: String(note || "")
        .trim()
        .slice(0, 60),
      date: safeDate,
    });
    save();
  }

  function addHabit(title, category) {
    const cleanTitle = String(title || "")
      .trim()
      .slice(0, 65);
    if (!cleanTitle) return false;
    const safeCat = ALLOWED_HABIT_CATS.has(category) ? category : "Coding";

    markUserModified();
    state.data.habits.unshift({
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `hab-${Date.now()}`,
      title: cleanTitle,
      category: safeCat,
      completedDates: [],
    });
    save();
    return true;
  }

  function toggleHabitDate(habitId, dateISO) {
    const habit = state.data.habits.find((h) => h.id === habitId);
    if (!habit) return;
    const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(dateISO)
      ? dateISO
      : getTodayISO();
    const idx = habit.completedDates.indexOf(targetDate);
    if (idx === -1) {
      habit.completedDates.push(targetDate);
    } else {
      habit.completedDates.splice(idx, 1);
    }
    markUserModified();
    save();
  }

  function deleteHabit(habitId) {
    state.data.habits = state.data.habits.filter((h) => h.id !== habitId);
    markUserModified();
    save();
  }

  function calculateHabitStreak(habit) {
    if (!habit || !Array.isArray(habit.completedDates)) return 0;
    const set = new Set(habit.completedDates);
    let streak = 0;
    let cursor = new Date();
    const todayStr = getTodayISO();
    if (!set.has(todayStr)) {
      cursor = new Date(Date.now() - 86400000);
    }
    while (true) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (set.has(iso)) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  }

  function getDailyActivityScore(isoDate) {
    const focusMins = state.data.focusSessions
      .filter((s) => s.date === isoDate)
      .reduce((sum, s) => sum + s.minutes, 0);
    const habitsDone = state.data.habits.filter((h) =>
      h.completedDates.includes(isoDate),
    ).length;

    const focusPoints = Math.floor(focusMins / 25);
    return focusPoints + habitsDone;
  }

  function calculateGlobalStreak() {
    let streak = 0;
    let cursor = new Date();
    if (getDailyActivityScore(getTodayISO()) === 0) {
      cursor = new Date(Date.now() - 86400000);
    }
    while (streak < 365) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (getDailyActivityScore(iso) > 0) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  }

  function setLanguage(langCode) {
    const nextLang = hasKey(ns.I18N, langCode) ? langCode : "en";
    state.lang = nextLang;

    if (isPureSampleData(state.data)) {
      state.data = {
        ...ns.buildSampleData(nextLang),
        isUserModified: false,
      };
      save();
    }

    try {
      localStorage.setItem(LANG_KEY, nextLang);
    } catch {
      // Ignore storage errors
    }
  }

  function setTheme(themeName) {
    state.theme = themeName === "light" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, state.theme);
    } catch {
      // Ignore storage errors
    }
  }

  function setPrivacy(enabled) {
    state.privacy = Boolean(enabled);
    try {
      localStorage.setItem(PRIVACY_KEY, String(state.privacy));
    } catch {
      // Ignore storage errors
    }
  }

  function exportJSON() {
    const payload = JSON.stringify(state.data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focushabit-os-backup-${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetToDemo() {
    state.data = {
      ...ns.buildSampleData(state.lang),
      isUserModified: false,
    };
    save();
  }

  function clearAll() {
    const nowLocal = new Date();
    const isoLocal = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(nowLocal.getDate()).padStart(2, "0")}T${String(nowLocal.getHours()).padStart(2, "0")}:${String(nowLocal.getMinutes()).padStart(2, "0")}`;
    state.data = {
      isUserModified: true,
      habits: [],
      focusSessions: [],
      recovery: {
        smoking: {
          startISO: isoLocal,
          cigsPerDay: 15,
          packPrice: state.lang === "fa" ? 85000 : 8.5,
          bestStreakDays: 0,
          urgesResisted: 0,
        },
        selfcontrol: {
          startISO: isoLocal,
          bestStreakDays: 0,
          urgesResisted: 0,
        },
        triggerLogs: [],
      },
    };
    save();
  }

  ns.Store = {
    state,
    save,
    markUserModified,
    isEmptyValue,
    t,
    tGroup,
    formatNum,
    formatPct,
    formatMoney,
    toPersianDigits,
    escapeHTML,
    getTodayISO,
    addFocusSession,
    addHabit,
    toggleHabitDate,
    deleteHabit,
    calculateHabitStreak,
    getDailyActivityScore,
    calculateGlobalStreak,
    setLanguage,
    setTheme,
    setPrivacy,
    exportJSON,
    resetToDemo,
    clearAll,
    ALLOWED_TRIGGERS,
  };
})(window.FocusHabitOS);
