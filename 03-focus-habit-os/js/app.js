"use strict";

window.FocusHabitOS = window.FocusHabitOS || {};

(function bootstrapFocusHabitApp(ns) {
  // Topbar & Global Controls
  const headerStreakBadgeEl = document.getElementById("header-streak-badge");
  const privacyToggleBtn = document.getElementById("privacy-toggle-btn");
  const privacyLabelEl = document.getElementById("privacy-label");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeLabelEl = document.getElementById("theme-label");
  const exportJsonBtn = document.getElementById("export-json-btn");
  const seedBtn = document.getElementById("seed-btn");
  const clearBtn = document.getElementById("clear-btn");

  // Habit Elements
  const habitDateInput = document.getElementById("habit-active-date");
  const habitForm = document.getElementById("habit-form");
  const habitTitleInput = document.getElementById("habit-title");
  const habitCatSelect = document.getElementById("habit-category");
  const habitListEl = document.getElementById("habit-list");
  const habitFormErrorEl = document.getElementById("habit-form-error");
  const kpiHabitRatioEl = document.getElementById("kpi-habit-ratio");
  const kpiHabitPctEl = document.getElementById("kpi-habit-pct");
  const kpiHabitBarEl = document.getElementById("kpi-habit-bar");

  // Selects requiring option localization
  const timerCategorySelect = document.getElementById("timer-category");
  const triggerCauseSelect = document.getElementById("trigger-cause-select");

  function showHabitError(msgKey) {
    if (habitTitleInput) habitTitleInput.classList.add("is-invalid");
    if (habitFormErrorEl) {
      habitFormErrorEl.textContent = ns.Store.t(msgKey);
      habitFormErrorEl.hidden = false;
    }
  }

  function clearHabitError() {
    if (habitTitleInput) habitTitleInput.classList.remove("is-invalid");
    if (habitFormErrorEl) {
      habitFormErrorEl.hidden = true;
      habitFormErrorEl.textContent = "";
    }
  }

  function applyTheme(themeName) {
    ns.Store.setTheme(themeName);
    document.documentElement.setAttribute("data-theme", ns.Store.state.theme);
    if (themeLabelEl) {
      themeLabelEl.textContent =
        ns.Store.state.theme === "dark"
          ? ns.Store.t("themeLight")
          : ns.Store.t("themeDark");
    }
  }

  function applyPrivacy(enabled) {
    ns.Store.setPrivacy(enabled);
    document.documentElement.setAttribute(
      "data-privacy",
      String(ns.Store.state.privacy),
    );
    if (privacyToggleBtn) {
      privacyToggleBtn.setAttribute(
        "aria-pressed",
        String(ns.Store.state.privacy),
      );
    }
    if (privacyLabelEl) {
      privacyLabelEl.textContent = ns.Store.state.privacy
        ? ns.Store.t("privacyOn")
        : ns.Store.t("privacyOff");
    }
  }

  function localizeSelectOptions() {
    if (timerCategorySelect) {
      Array.from(timerCategorySelect.options).forEach((opt) => {
        opt.textContent = ns.Store.tGroup("focusTracks", opt.value);
      });
    }
    if (habitCatSelect) {
      Array.from(habitCatSelect.options).forEach((opt) => {
        opt.textContent = ns.Store.tGroup("habitCategories", opt.value);
      });
    }
    if (triggerCauseSelect) {
      Array.from(triggerCauseSelect.options).forEach((opt) => {
        opt.textContent = ns.Store.tGroup("triggerCauses", opt.value);
      });
    }
  }

  function syncCalendarWidgets(langCode) {
    if (
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.syncAll === "function"
    ) {
      window.TrilingualCalendar.syncAll(langCode);
    }
  }

  function applyLanguage(langCode) {
    clearHabitError();
    ns.Store.setLanguage(langCode);
    const activeLang = ns.Store.state.lang;
    const dict = ns.I18N[activeLang];

    document.documentElement.lang = activeLang;
    document.documentElement.dir = dict.dir;
    document.title = dict.pageTitle;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", activeLang);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Ignore history API errors
    }

    document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
      const isActive = btn.getAttribute("data-lang") === activeLang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.placeholder = dict[key];
    });

    localizeSelectOptions();
    applyTheme(ns.Store.state.theme);
    applyPrivacy(ns.Store.state.privacy);
    syncCalendarWidgets(activeLang);

    if (ns.TimerEngine) ns.TimerEngine.refreshLocalization();
    if (ns.RecoveryEngine) ns.RecoveryEngine.refresh();
    renderHabitsAndHeader();
    if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
  }

  function renderHabitsAndHeader() {
    const activeDate = ns.Store.state.selectedHabitDate;
    const habits = ns.Store.state.data.habits;
    const totalHabits = habits.length;
    const completedOnDate = habits.filter((h) =>
      h.completedDates.includes(activeDate),
    ).length;

    const pct =
      totalHabits > 0 ? Math.round((completedOnDate / totalHabits) * 100) : 0;

    if (kpiHabitRatioEl) {
      kpiHabitRatioEl.textContent = `${ns.Store.formatNum(completedOnDate)}/${ns.Store.formatNum(totalHabits)}`;
    }
    if (kpiHabitPctEl) {
      kpiHabitPctEl.textContent = ns.Store.formatPct(pct);
    }
    if (kpiHabitBarEl) {
      kpiHabitBarEl.value = pct;
    }

    const globalStreak = ns.Store.calculateGlobalStreak();
    if (headerStreakBadgeEl) {
      headerStreakBadgeEl.textContent = `${ns.Store.formatNum(globalStreak)}${ns.Store.t("streakSuffix")}`;
    }

    if (!habitListEl) return;
    if (habits.length === 0) {
      habitListEl.innerHTML = `<li class="empty-placeholder">${ns.Store.escapeHTML(ns.Store.t("emptyHabits"))}</li>`;
      return;
    }

    habitListEl.innerHTML = habits
      .map((habit) => {
        const isDone = habit.completedDates.includes(activeDate);
        const streak = ns.Store.calculateHabitStreak(habit);
        const catLabel = ns.Store.tGroup("habitCategories", habit.category);
        const streakText = `${ns.Store.formatNum(streak)}${ns.Store.t("daysUnit")}`;

        return `
          <li class="habit-item ${isDone ? "is-completed" : ""}">
            <div class="habit-left">
              <button
                type="button"
                class="habit-check-btn"
                data-toggle-habit="${ns.Store.escapeHTML(habit.id)}"
                aria-pressed="${String(isDone)}"
                aria-label="${ns.Store.escapeHTML(habit.title)}"
              >
                ${
                  isDone
                    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                    : ""
                }
              </button>
              <span class="habit-title-text">${ns.Store.escapeHTML(habit.title)}</span>
            </div>

            <div class="habit-right">
              <span class="habit-cat-badge">${ns.Store.escapeHTML(catLabel)}</span>
              <span class="habit-streak-badge">${ns.Store.escapeHTML(streakText)}</span>
              <button
                type="button"
                class="icon-btn"
                data-delete-habit="${ns.Store.escapeHTML(habit.id)}"
                title="${ns.Store.escapeHTML(ns.Store.t("deleteHabitTitle"))}"
                aria-label="${ns.Store.escapeHTML(ns.Store.t("deleteHabitTitle"))}"
              >&times;</button>
            </div>
          </li>
        `;
      })
      .join("");
  }

  function refreshAllViews() {
    clearHabitError();
    syncCalendarWidgets(ns.Store.state.lang);
    renderHabitsAndHeader();
    if (ns.TimerEngine) ns.TimerEngine.renderFocusStatsAndLog();
    if (ns.RecoveryEngine) ns.RecoveryEngine.refresh();
    if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
  }

  // Event Listeners
  document.addEventListener("click", (event) => {
    const langBtn = event.target.closest(".lang-btn[data-lang]");
    if (langBtn) {
      applyLanguage(langBtn.getAttribute("data-lang"));
    }
  });

  if (privacyToggleBtn) {
    privacyToggleBtn.addEventListener("click", () => {
      applyPrivacy(!ns.Store.state.privacy);
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      applyTheme(ns.Store.state.theme === "dark" ? "light" : "dark");
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => ns.Store.exportJSON());
  }

  if (seedBtn) {
    seedBtn.addEventListener("click", () => {
      ns.Store.resetToDemo();
      refreshAllViews();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ns.Store.clearAll();
      refreshAllViews();
    });
  }

  // Habit Date Picker Integration with Shared TrilingualCalendar
  if (habitDateInput) {
    habitDateInput.value = ns.Store.state.selectedHabitDate;
    habitDateInput.addEventListener("change", () => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(habitDateInput.value)) {
        ns.Store.state.selectedHabitDate = habitDateInput.value;
        renderHabitsAndHeader();
      }
    });
  }

  if (habitTitleInput) {
    habitTitleInput.addEventListener("input", clearHabitError);
  }

  // Add Habit Form with Unified Localized Validation
  if (habitForm) {
    habitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (ns.Store.isEmptyValue(habitTitleInput ? habitTitleInput.value : "")) {
        showHabitError("errFieldRequired");
        if (habitTitleInput) habitTitleInput.focus();
        return;
      }

      clearHabitError();
      const added = ns.Store.addHabit(
        habitTitleInput.value.trim(),
        habitCatSelect.value,
      );
      if (added) {
        habitTitleInput.value = "";
        habitTitleInput.focus();
        renderHabitsAndHeader();
        if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
      }
    });
  }

  // Habit Toggle & Delete Delegation
  if (habitListEl) {
    habitListEl.addEventListener("click", (event) => {
      const toggleBtn = event.target.closest("[data-toggle-habit]");
      if (toggleBtn) {
        const id = toggleBtn.getAttribute("data-toggle-habit");
        ns.Store.toggleHabitDate(id, ns.Store.state.selectedHabitDate);
        renderHabitsAndHeader();
        if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
        return;
      }

      const delBtn = event.target.closest("[data-delete-habit]");
      if (delBtn) {
        const id = delBtn.getAttribute("data-delete-habit");
        ns.Store.deleteHabit(id);
        renderHabitsAndHeader();
        if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
      }
    });
  }

  // Initialize Shared Calendar + Engines
  if (
    window.TrilingualCalendar &&
    typeof window.TrilingualCalendar.init === "function"
  ) {
    window.TrilingualCalendar.init();
  }

  if (ns.TimerEngine) {
    ns.TimerEngine.init(() => {
      renderHabitsAndHeader();
      if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
    });
  }

  if (ns.RecoveryEngine) {
    ns.RecoveryEngine.init(() => {
      if (ns.ChartsEngine) ns.ChartsEngine.renderAllCharts();
    });
  }

  if (ns.ChartsEngine) {
    ns.ChartsEngine.init();
  }

  applyLanguage(ns.Store.state.lang);
})(window.FocusHabitOS);
