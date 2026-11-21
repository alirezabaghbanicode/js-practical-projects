"use strict";

window.FocusHabitOS = window.FocusHabitOS || {};

(function registerTimerAndAudio(ns) {
  const RING_CIRCUMFERENCE = 2 * Math.PI * 86; // 540.354

  const timerState = {
    mode: "pomodoro",
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    isRunning: false,
    endTimestamp: null,
    intervalId: null,
    soundEnabled: true,
    onSessionChange: null,
  };

  // DOM References
  const timerPanelEl = document.querySelector(".timer-panel");
  const modeButtons = document.querySelectorAll(".mode-btn[data-mode]");
  const ringProgressEl = document.getElementById("timer-ring-progress");
  const timerDisplayEl = document.getElementById("timer-display");
  const timerStatusEl = document.getElementById("timer-status-text");
  const categorySelectEl = document.getElementById("timer-category");
  const taskNoteInputEl = document.getElementById("timer-task-note");
  const startBtnEl = document.getElementById("timer-start-btn");
  const resetBtnEl = document.getElementById("timer-reset-btn");
  const completeBtnEl = document.getElementById("timer-complete-btn");
  const soundBtnEl = document.getElementById("timer-sound-btn");
  const sessionLogListEl = document.getElementById("focus-session-log");
  const kpiFocusSessionsEl = document.getElementById("kpi-focus-sessions");
  const kpiFocusMinsEl = document.getElementById("kpi-focus-mins");

  function playCompletionChime() {
    if (!timerState.soundEnabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5 harmonic chime
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        const startAt = ctx.currentTime + idx * 0.16;
        const stopAt = startAt + 0.55;

        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.14, startAt + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(stopAt);
      });
    } catch {
      // Ignore audio autoplay restrictions if blocked
    }
  }

  function isBreakMode() {
    return timerState.mode === "short" || timerState.mode === "long";
  }

  function formatClock(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const raw = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return ns.Store.state.lang === "fa" ? ns.Store.toPersianDigits(raw) : raw;
  }

  function updateRingAndClock() {
    const totalSeconds = timerState.durationMinutes * 60;
    const fraction =
      totalSeconds > 0 ? timerState.remainingSeconds / totalSeconds : 0;
    const offset =
      RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));

    if (ringProgressEl) {
      ringProgressEl.style.strokeDasharray = String(RING_CIRCUMFERENCE);
      ringProgressEl.style.strokeDashoffset = String(offset);
    }

    const formatted = formatClock(timerState.remainingSeconds);
    if (timerDisplayEl) {
      timerDisplayEl.textContent = formatted;
    }

    if (timerState.isRunning) {
      document.title = `[${formatted}] FocusHabit OS`;
    } else {
      document.title = ns.Store.t("pageTitle");
    }
  }

  function updateControlsUI() {
    if (timerPanelEl) {
      timerPanelEl.classList.toggle("is-break", isBreakMode());
    }

    if (startBtnEl) {
      if (timerState.isRunning) {
        startBtnEl.textContent = ns.Store.t("btnPause");
      } else if (
        timerState.remainingSeconds <
        timerState.durationMinutes * 60
      ) {
        startBtnEl.textContent = ns.Store.t("btnResume");
      } else {
        startBtnEl.textContent = ns.Store.t("btnStart");
      }
    }

    if (timerStatusEl) {
      if (timerState.isRunning) {
        timerStatusEl.textContent = isBreakMode()
          ? ns.Store.t("statusBreak")
          : ns.Store.t("statusRunning");
      } else if (
        timerState.remainingSeconds <
        timerState.durationMinutes * 60
      ) {
        timerStatusEl.textContent = ns.Store.t("statusPaused");
      } else {
        timerStatusEl.textContent = ns.Store.t("statusReady");
      }
    }
  }

  function stopInterval() {
    if (timerState.intervalId !== null) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
  }

  function handleTimerFinished() {
    stopInterval();
    timerState.isRunning = false;
    timerState.endTimestamp = null;
    playCompletionChime();

    if (!isBreakMode()) {
      const track = categorySelectEl ? categorySelectEl.value : "Coding";
      const note = taskNoteInputEl ? taskNoteInputEl.value : "";
      ns.Store.addFocusSession(
        track,
        timerState.durationMinutes,
        note,
        ns.Store.getTodayISO(),
      );
      if (typeof timerState.onSessionChange === "function") {
        timerState.onSessionChange();
      }
    }

    timerState.remainingSeconds = timerState.durationMinutes * 60;
    updateRingAndClock();
    updateControlsUI();
    renderFocusStatsAndLog();
  }

  function tick() {
    if (!timerState.isRunning || !timerState.endTimestamp) return;
    const msLeft = timerState.endTimestamp - Date.now();
    const nextRemaining = Math.max(0, Math.ceil(msLeft / 1000));
    timerState.remainingSeconds = nextRemaining;
    updateRingAndClock();

    if (nextRemaining <= 0) {
      handleTimerFinished();
    }
  }

  function startOrPause() {
    if (timerState.isRunning) {
      stopInterval();
      timerState.isRunning = false;
      timerState.endTimestamp = null;
    } else {
      timerState.isRunning = true;
      timerState.endTimestamp = Date.now() + timerState.remainingSeconds * 1000;
      timerState.intervalId = setInterval(tick, 250);
    }
    updateRingAndClock();
    updateControlsUI();
  }

  function resetTimer() {
    stopInterval();
    timerState.isRunning = false;
    timerState.endTimestamp = null;
    timerState.remainingSeconds = timerState.durationMinutes * 60;
    updateRingAndClock();
    updateControlsUI();
  }

  function setMode(modeName, minutes) {
    stopInterval();
    timerState.isRunning = false;
    timerState.endTimestamp = null;
    timerState.mode = modeName;
    timerState.durationMinutes = minutes;
    timerState.remainingSeconds = minutes * 60;

    modeButtons.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-mode") === modeName,
      );
    });

    updateRingAndClock();
    updateControlsUI();
  }

  function logManualSession() {
    if (isBreakMode()) return;
    const track = categorySelectEl ? categorySelectEl.value : "Coding";
    const note = taskNoteInputEl ? taskNoteInputEl.value : "";
    ns.Store.addFocusSession(
      track,
      timerState.durationMinutes,
      note,
      ns.Store.getTodayISO(),
    );
    playCompletionChime();
    renderFocusStatsAndLog();
    if (typeof timerState.onSessionChange === "function") {
      timerState.onSessionChange();
    }
  }

  function renderFocusStatsAndLog() {
    const today = ns.Store.getTodayISO();
    const todaySessions = ns.Store.state.data.focusSessions.filter(
      (s) => s.date === today,
    );
    const totalMins = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

    if (kpiFocusMinsEl) {
      kpiFocusMinsEl.textContent = `${ns.Store.formatNum(totalMins)} ${ns.Store.t("minsUnit")}`;
    }
    if (kpiFocusSessionsEl) {
      kpiFocusSessionsEl.textContent = `${ns.Store.formatNum(todaySessions.length)} ${ns.Store.t("sessionsUnit")}`;
    }

    if (!sessionLogListEl) return;
    if (todaySessions.length === 0) {
      sessionLogListEl.innerHTML = `<li class="empty-placeholder">${ns.Store.escapeHTML(ns.Store.t("emptySessions"))}</li>`;
      return;
    }

    sessionLogListEl.innerHTML = todaySessions
      .map((ses) => {
        const trackLabel = ns.Store.tGroup("focusTracks", ses.track);
        const noteLabel = ses.note || ns.Store.t("generalFocusNote");
        const minsLabel = `+${ns.Store.formatNum(ses.minutes)} ${ns.Store.t("minsUnit")}`;
        return `
          <li class="session-log-item">
            <div class="session-log-left">
              <span class="session-track-pill">${ns.Store.escapeHTML(trackLabel)}</span>
              <span class="session-note-text">${ns.Store.escapeHTML(noteLabel)}</span>
            </div>
            <span class="session-mins-badge">${ns.Store.escapeHTML(minsLabel)}</span>
          </li>
        `;
      })
      .join("");
  }

  function init(onSessionChangeCallback) {
    timerState.onSessionChange = onSessionChangeCallback || null;

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode") || "pomodoro";
        const mins =
          Number.parseInt(btn.getAttribute("data-minutes"), 10) || 25;
        setMode(mode, mins);
      });
    });

    if (startBtnEl) startBtnEl.addEventListener("click", startOrPause);
    if (resetBtnEl) resetBtnEl.addEventListener("click", resetTimer);
    if (completeBtnEl)
      completeBtnEl.addEventListener("click", logManualSession);

    if (soundBtnEl) {
      soundBtnEl.addEventListener("click", () => {
        timerState.soundEnabled = !timerState.soundEnabled;
        soundBtnEl.setAttribute(
          "aria-pressed",
          String(timerState.soundEnabled),
        );
      });
    }

    updateRingAndClock();
    updateControlsUI();
    renderFocusStatsAndLog();
  }

  function refreshLocalization() {
    updateRingAndClock();
    updateControlsUI();
    renderFocusStatsAndLog();
  }

  ns.TimerEngine = {
    init,
    refreshLocalization,
    renderFocusStatsAndLog,
  };
})(window.FocusHabitOS);
