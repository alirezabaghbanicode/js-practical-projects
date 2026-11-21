"use strict";

window.FocusHabitOS = window.FocusHabitOS || {};

(function registerRecoveryEngine(ns) {
  const MILESTONES_DAYS = [1, 3, 7, 14, 30, 60, 90, 180, 365];

  // DOM References
  const kpiSmokeSavedEl = document.getElementById("kpi-smoke-saved");
  const kpiSmokeDaysEl = document.getElementById("kpi-smoke-days");
  const kpiUrgesWonEl = document.getElementById("kpi-urges-won");
  const kpiCleanDaysEl = document.getElementById("kpi-clean-days");

  const smokeSettingsToggleBtn = document.getElementById(
    "smoke-settings-toggle",
  );
  const smokeSettingsPanel = document.getElementById("smoke-settings-panel");
  const smokeCigsInput = document.getElementById("smoke-cigs-day");
  const smokePriceInput = document.getElementById("smoke-pack-price");
  const smokeStartDateInput = document.getElementById("smoke-start-date");
  const smokeStartTimeInput = document.getElementById("smoke-start-time");
  const smokeStartPreviewEl = document.getElementById("smoke-start-preview");
  const smokeFormErrorEl = document.getElementById("smoke-form-error");

  const smokeDaysEl = document.getElementById("smoke-days");
  const smokeHoursEl = document.getElementById("smoke-hours");
  const smokeMinsEl = document.getElementById("smoke-mins");
  const smokeMilestoneLabelEl = document.getElementById(
    "smoke-milestone-label",
  );
  const smokeMilestonePctEl = document.getElementById("smoke-milestone-pct");
  const smokeMilestoneBarEl = document.getElementById("smoke-milestone-bar");
  const smokeAvoidedEl = document.getElementById("smoke-avoided-count");
  const smokeSavedMoneyEl = document.getElementById("smoke-saved-money");
  const smokeBestRecordEl = document.getElementById("smoke-best-record");

  const nofapSettingsToggleBtn = document.getElementById(
    "nofap-settings-toggle",
  );
  const nofapSettingsPanel = document.getElementById("nofap-settings-panel");
  const nofapStartDateInput = document.getElementById("nofap-start-date");
  const nofapStartTimeInput = document.getElementById("nofap-start-time");
  const nofapStartPreviewEl = document.getElementById("nofap-start-preview");
  const nofapFormErrorEl = document.getElementById("nofap-form-error");

  const nofapDaysEl = document.getElementById("nofap-days");
  const nofapHoursEl = document.getElementById("nofap-hours");
  const nofapMinsEl = document.getElementById("nofap-mins");
  const nofapMilestoneLabelEl = document.getElementById(
    "nofap-milestone-label",
  );
  const nofapMilestonePctEl = document.getElementById("nofap-milestone-pct");
  const nofapMilestoneBarEl = document.getElementById("nofap-milestone-bar");
  const nofapWinsEl = document.getElementById("nofap-wins-count");
  const nofapClarityEl = document.getElementById("nofap-clarity-pct");
  const nofapBestRecordEl = document.getElementById("nofap-best-record");

  // Trigger Modal DOM
  const triggerModalEl = document.getElementById("trigger-modal");
  const triggerModalBadgeEl = document.getElementById("trigger-modal-badge");
  const triggerModalCloseBtn = document.getElementById("trigger-modal-close");
  const triggerFormEl = document.getElementById("trigger-form");
  const triggerTrackInput = document.getElementById("trigger-track-input");
  const triggerOutcomeInput = document.getElementById("trigger-outcome-input");
  const triggerCauseSelect = document.getElementById("trigger-cause-select");
  const triggerNoteInput = document.getElementById("trigger-note-input");

  let onRecoveryUpdateCallback = null;
  let liveTimerId = null;

  function parseLocalDateTime(isoLocal) {
    if (typeof isoLocal !== "string" || !isoLocal.includes("T")) {
      return new Date();
    }
    const [datePart, timePart] = isoLocal.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm] = (timePart || "00:00").split(":").map(Number);
    const parsed = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function getCurrentLocalDateTimeISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  function splitDateTimeISO(isoLocal) {
    const fallback = getCurrentLocalDateTimeISO();
    const safe =
      typeof isoLocal === "string" && isoLocal.includes("T")
        ? isoLocal
        : fallback;
    const [rawDate, rawTime] = safe.split("T");
    const datePart = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : fallback.split("T")[0];
    const timePart = /^\d{2}:\d{2}/.test(rawTime || "")
      ? rawTime.slice(0, 5)
      : "00:00";
    return { datePart, timePart };
  }

  function combineDateTimeISO(datePart, timePart) {
    const cleanDate = String(datePart || "").trim();
    const cleanTime = String(timePart || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) return "";
    if (!/^\d{2}:\d{2}$/.test(cleanTime)) return "";
    return `${cleanDate}T${cleanTime}`;
  }

  function formatLocalizedDateTime(isoLocal) {
    if (!isoLocal || !isoLocal.includes("T")) return "";
    const [datePart, timePart] = isoLocal.split("T");
    const lang = ns.Store.state.lang;
    const formattedDate =
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.formatDate === "function"
        ? window.TrilingualCalendar.formatDate(datePart, lang, true)
        : datePart;
    const formattedTime =
      lang === "fa" ? ns.Store.toPersianDigits(timePart) : timePart;
    return `${formattedDate} — ${formattedTime}`;
  }

  function updateDateTimePreviews() {
    if (smokeStartPreviewEl && smokeStartDateInput && smokeStartTimeInput) {
      const combined = combineDateTimeISO(
        smokeStartDateInput.value,
        smokeStartTimeInput.value,
      );
      smokeStartPreviewEl.textContent = formatLocalizedDateTime(combined);
    }
    if (nofapStartPreviewEl && nofapStartDateInput && nofapStartTimeInput) {
      const combined = combineDateTimeISO(
        nofapStartDateInput.value,
        nofapStartTimeInput.value,
      );
      nofapStartPreviewEl.textContent = formatLocalizedDateTime(combined);
    }
  }

  function getAssociatedTriggerBtn(hiddenInputEl) {
    if (!hiddenInputEl || !hiddenInputEl.id) return null;
    return document.querySelector(
      `.tc-trigger-btn[data-calendar-target="${hiddenInputEl.id}"]`,
    );
  }

  function showDrawerError(errorEl, inputEl, msgKey) {
    if (inputEl) {
      inputEl.classList.add("is-invalid");
      const triggerBtn = getAssociatedTriggerBtn(inputEl);
      if (triggerBtn) triggerBtn.classList.add("is-invalid");
    }
    if (errorEl) {
      errorEl.textContent = ns.Store.t(msgKey);
      errorEl.hidden = false;
    }
  }

  function clearDrawerErrors() {
    [
      smokeCigsInput,
      smokePriceInput,
      smokeStartDateInput,
      smokeStartTimeInput,
      nofapStartDateInput,
      nofapStartTimeInput,
    ].forEach((el) => {
      if (el) {
        el.classList.remove("is-invalid");
        const triggerBtn = getAssociatedTriggerBtn(el);
        if (triggerBtn) triggerBtn.classList.remove("is-invalid");
      }
    });
    [smokeFormErrorEl, nofapFormErrorEl].forEach((err) => {
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
    });
  }

  function computeElapsed(startISO) {
    const startObj = parseLocalDateTime(startISO);
    const diffMs = Math.max(0, Date.now() - startObj.getTime());
    const exactDays = diffMs / 86400000;
    const days = Math.floor(exactDays);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return { diffMs, exactDays, days, hours, mins };
  }

  function computeMilestoneProgress(exactDays) {
    let nextIdx = MILESTONES_DAYS.findIndex((m) => exactDays < m);
    if (nextIdx === -1) nextIdx = MILESTONES_DAYS.length - 1;

    const targetDays = MILESTONES_DAYS[nextIdx];
    const prevDays = nextIdx > 0 ? MILESTONES_DAYS[nextIdx - 1] : 0;
    const span = Math.max(1, targetDays - prevDays);
    const pct = Math.min(
      100,
      Math.max(0, Math.round(((exactDays - prevDays) / span) * 100)),
    );

    return { targetDays, pct };
  }

  function formatClockPart(val, padTwo = false) {
    const str = padTwo ? String(val).padStart(2, "0") : String(val);
    return ns.Store.state.lang === "fa" ? ns.Store.toPersianDigits(str) : str;
  }

  function syncSettingsInputs() {
    const rec = ns.Store.state.data.recovery;
    if (smokeCigsInput) smokeCigsInput.value = String(rec.smoking.cigsPerDay);
    if (smokePriceInput) smokePriceInput.value = String(rec.smoking.packPrice);

    const smkParts = splitDateTimeISO(rec.smoking.startISO);
    if (smokeStartDateInput) smokeStartDateInput.value = smkParts.datePart;
    if (smokeStartTimeInput) smokeStartTimeInput.value = smkParts.timePart;

    const slfParts = splitDateTimeISO(rec.selfcontrol.startISO);
    if (nofapStartDateInput) nofapStartDateInput.value = slfParts.datePart;
    if (nofapStartTimeInput) nofapStartTimeInput.value = slfParts.timePart;

    if (
      window.TrilingualCalendar &&
      typeof window.TrilingualCalendar.setValue === "function"
    ) {
      window.TrilingualCalendar.setValue(
        "smoke-start-date",
        smkParts.datePart,
        false,
      );
      window.TrilingualCalendar.setValue(
        "nofap-start-date",
        slfParts.datePart,
        false,
      );
    }

    clearDrawerErrors();
    updateDateTimePreviews();
  }

  function renderRecovery() {
    const rec = ns.Store.state.data.recovery;
    const daysUnit = ns.Store.t("daysUnit");
    const milestonePrefix = ns.Store.t("nextMilestonePrefix");
    const unitDaysWord = ns.Store.t("unitDays");

    // 1. Smoking Cessation Metrics
    const smk = rec.smoking;
    const smkElapsed = computeElapsed(smk.startISO);
    if (smkElapsed.days > smk.bestStreakDays) {
      smk.bestStreakDays = smkElapsed.days;
      ns.Store.save();
    }

    const cigsAvoided = Math.floor(smkElapsed.exactDays * smk.cigsPerDay);
    const moneySaved =
      ((smkElapsed.exactDays * smk.cigsPerDay) / 20) * smk.packPrice;
    const smkMilestone = computeMilestoneProgress(smkElapsed.exactDays);

    if (smokeDaysEl)
      smokeDaysEl.textContent = formatClockPart(smkElapsed.days, false);
    if (smokeHoursEl)
      smokeHoursEl.textContent = formatClockPart(smkElapsed.hours, true);
    if (smokeMinsEl)
      smokeMinsEl.textContent = formatClockPart(smkElapsed.mins, true);

    if (smokeMilestoneLabelEl) {
      smokeMilestoneLabelEl.textContent = `${milestonePrefix} ${ns.Store.formatNum(smkMilestone.targetDays)} ${unitDaysWord}`;
    }
    if (smokeMilestonePctEl) {
      smokeMilestonePctEl.textContent = ns.Store.formatPct(smkMilestone.pct);
    }
    if (smokeMilestoneBarEl) {
      smokeMilestoneBarEl.value = smkMilestone.pct;
    }

    if (smokeAvoidedEl) {
      smokeAvoidedEl.textContent = ns.Store.formatNum(cigsAvoided);
    }
    if (smokeSavedMoneyEl) {
      smokeSavedMoneyEl.textContent = ns.Store.formatMoney(moneySaved);
    }
    if (smokeBestRecordEl) {
      smokeBestRecordEl.textContent = `${ns.Store.formatNum(smk.bestStreakDays)}${daysUnit}`;
    }

    if (kpiSmokeDaysEl) {
      kpiSmokeDaysEl.textContent = `${ns.Store.formatNum(smkElapsed.days)}${daysUnit}`;
    }
    if (kpiSmokeSavedEl) {
      kpiSmokeSavedEl.textContent = ns.Store.formatMoney(moneySaved);
    }

    // 2. Self-Control / Clean Streak Metrics
    const slf = rec.selfcontrol;
    const slfElapsed = computeElapsed(slf.startISO);
    if (slfElapsed.days > slf.bestStreakDays) {
      slf.bestStreakDays = slfElapsed.days;
      ns.Store.save();
    }

    const slfMilestone = computeMilestoneProgress(slfElapsed.exactDays);
    const clarityScore = Math.min(
      100,
      Math.round(
        (Math.min(30, slfElapsed.exactDays) / 30) * 85 +
          Math.min(15, slf.urgesResisted * 1.5),
      ),
    );

    if (nofapDaysEl)
      nofapDaysEl.textContent = formatClockPart(slfElapsed.days, false);
    if (nofapHoursEl)
      nofapHoursEl.textContent = formatClockPart(slfElapsed.hours, true);
    if (nofapMinsEl)
      nofapMinsEl.textContent = formatClockPart(slfElapsed.mins, true);

    if (nofapMilestoneLabelEl) {
      nofapMilestoneLabelEl.textContent = `${milestonePrefix} ${ns.Store.formatNum(slfMilestone.targetDays)} ${unitDaysWord}`;
    }
    if (nofapMilestonePctEl) {
      nofapMilestonePctEl.textContent = ns.Store.formatPct(slfMilestone.pct);
    }
    if (nofapMilestoneBarEl) {
      nofapMilestoneBarEl.value = slfMilestone.pct;
    }

    if (nofapWinsEl) {
      nofapWinsEl.textContent = ns.Store.formatNum(slf.urgesResisted);
    }
    if (nofapClarityEl) {
      nofapClarityEl.textContent = ns.Store.formatPct(clarityScore);
    }
    if (nofapBestRecordEl) {
      nofapBestRecordEl.textContent = `${ns.Store.formatNum(slf.bestStreakDays)}${daysUnit}`;
    }

    const totalUrgesWon = smk.urgesResisted + slf.urgesResisted;
    if (kpiCleanDaysEl) {
      kpiCleanDaysEl.textContent = `${ns.Store.formatNum(slfElapsed.days)}${daysUnit}`;
    }
    if (kpiUrgesWonEl) {
      kpiUrgesWonEl.textContent = `${ns.Store.formatNum(totalUrgesWon)} ${ns.Store.t("winsUnit")}`;
    }
  }

  function openTriggerDialog(track, outcome) {
    if (!triggerModalEl) return;
    if (triggerTrackInput) triggerTrackInput.value = track;
    if (triggerOutcomeInput) triggerOutcomeInput.value = outcome;
    if (triggerNoteInput) triggerNoteInput.value = "";

    if (triggerModalBadgeEl) {
      triggerModalBadgeEl.textContent =
        outcome === "win" ? ns.Store.t("badgeWin") : ns.Store.t("badgeRelapse");
      triggerModalBadgeEl.className =
        outcome === "win"
          ? "recovery-badge badge-emerald"
          : "recovery-badge badge-copper";
    }

    if (typeof triggerModalEl.showModal === "function") {
      triggerModalEl.showModal();
    }
  }

  function init(onUpdateCallback) {
    onRecoveryUpdateCallback = onUpdateCallback || null;
    syncSettingsInputs();

    if (smokeStartDateInput) {
      smokeStartDateInput.addEventListener("change", () => {
        clearDrawerErrors();
        updateDateTimePreviews();
      });
    }

    if (smokeStartTimeInput) {
      smokeStartTimeInput.addEventListener("input", () => {
        clearDrawerErrors();
        updateDateTimePreviews();
      });
    }

    if (nofapStartDateInput) {
      nofapStartDateInput.addEventListener("change", () => {
        clearDrawerErrors();
        updateDateTimePreviews();
      });
    }

    if (nofapStartTimeInput) {
      nofapStartTimeInput.addEventListener("input", () => {
        clearDrawerErrors();
        updateDateTimePreviews();
      });
    }

    [smokeCigsInput, smokePriceInput].forEach((inp) => {
      if (inp) inp.addEventListener("input", clearDrawerErrors);
    });

    // Collapsible Settings Drawers
    if (smokeSettingsToggleBtn && smokeSettingsPanel) {
      smokeSettingsToggleBtn.addEventListener("click", () => {
        const isHidden = smokeSettingsPanel.hidden;
        smokeSettingsPanel.hidden = !isHidden;
        smokeSettingsToggleBtn.setAttribute("aria-expanded", String(isHidden));
        clearDrawerErrors();
        updateDateTimePreviews();
      });

      smokeSettingsPanel.addEventListener("submit", (event) => {
        event.preventDefault();
        clearDrawerErrors();

        if (ns.Store.isEmptyValue(smokeCigsInput.value)) {
          showDrawerError(smokeFormErrorEl, smokeCigsInput, "errFieldRequired");
          smokeCigsInput.focus();
          return;
        }

        if (ns.Store.isEmptyValue(smokePriceInput.value)) {
          showDrawerError(
            smokeFormErrorEl,
            smokePriceInput,
            "errFieldRequired",
          );
          smokePriceInput.focus();
          return;
        }

        if (ns.Store.isEmptyValue(smokeStartDateInput.value)) {
          showDrawerError(
            smokeFormErrorEl,
            smokeStartDateInput,
            "errFieldRequired",
          );
          const triggerBtn = getAssociatedTriggerBtn(smokeStartDateInput);
          if (triggerBtn) triggerBtn.focus();
          return;
        }

        if (ns.Store.isEmptyValue(smokeStartTimeInput.value)) {
          showDrawerError(
            smokeFormErrorEl,
            smokeStartTimeInput,
            "errFieldRequired",
          );
          smokeStartTimeInput.focus();
          return;
        }

        const cigs = Number.parseInt(smokeCigsInput.value, 10);
        const price = Number.parseFloat(smokePriceInput.value);
        const combinedISO = combineDateTimeISO(
          smokeStartDateInput.value,
          smokeStartTimeInput.value,
        );

        if (!Number.isFinite(cigs) || cigs < 1 || cigs > 100) {
          showDrawerError(smokeFormErrorEl, smokeCigsInput, "errInvalidNumber");
          smokeCigsInput.focus();
          return;
        }

        if (!Number.isFinite(price) || price <= 0) {
          showDrawerError(
            smokeFormErrorEl,
            smokePriceInput,
            "errInvalidNumber",
          );
          smokePriceInput.focus();
          return;
        }

        if (!combinedISO) {
          showDrawerError(
            smokeFormErrorEl,
            smokeStartTimeInput,
            "errInvalidDate",
          );
          smokeStartTimeInput.focus();
          return;
        }

        const smk = ns.Store.state.data.recovery.smoking;
        smk.cigsPerDay = cigs;
        smk.packPrice = price;
        smk.startISO = combinedISO;

        ns.Store.markUserModified();
        ns.Store.save();
        smokeSettingsPanel.hidden = true;
        smokeSettingsToggleBtn.setAttribute("aria-expanded", "false");
        renderRecovery();
      });
    }

    if (nofapSettingsToggleBtn && nofapSettingsPanel) {
      nofapSettingsToggleBtn.addEventListener("click", () => {
        const isHidden = nofapSettingsPanel.hidden;
        nofapSettingsPanel.hidden = !isHidden;
        nofapSettingsToggleBtn.setAttribute("aria-expanded", String(isHidden));
        clearDrawerErrors();
        updateDateTimePreviews();
      });

      nofapSettingsPanel.addEventListener("submit", (event) => {
        event.preventDefault();
        clearDrawerErrors();

        if (ns.Store.isEmptyValue(nofapStartDateInput.value)) {
          showDrawerError(
            nofapFormErrorEl,
            nofapStartDateInput,
            "errFieldRequired",
          );
          const triggerBtn = getAssociatedTriggerBtn(nofapStartDateInput);
          if (triggerBtn) triggerBtn.focus();
          return;
        }

        if (ns.Store.isEmptyValue(nofapStartTimeInput.value)) {
          showDrawerError(
            nofapFormErrorEl,
            nofapStartTimeInput,
            "errFieldRequired",
          );
          nofapStartTimeInput.focus();
          return;
        }

        const combinedISO = combineDateTimeISO(
          nofapStartDateInput.value,
          nofapStartTimeInput.value,
        );

        if (!combinedISO) {
          showDrawerError(
            nofapFormErrorEl,
            nofapStartTimeInput,
            "errInvalidDate",
          );
          nofapStartTimeInput.focus();
          return;
        }

        const slf = ns.Store.state.data.recovery.selfcontrol;
        slf.startISO = combinedISO;

        ns.Store.markUserModified();
        ns.Store.save();
        nofapSettingsPanel.hidden = true;
        nofapSettingsToggleBtn.setAttribute("aria-expanded", "false");
        renderRecovery();
      });
    }

    // Action Buttons (+1 Resisted Urge / Log Slip)
    document
      .querySelectorAll("[data-recovery-action][data-track]")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.getAttribute("data-recovery-action");
          const track = btn.getAttribute("data-track");
          if (
            (action === "win" || action === "relapse") &&
            (track === "smoking" || track === "selfcontrol")
          ) {
            openTriggerDialog(track, action);
          }
        });
      });

    if (triggerModalCloseBtn && triggerModalEl) {
      triggerModalCloseBtn.addEventListener("click", () =>
        triggerModalEl.close(),
      );
    }

    if (triggerFormEl) {
      triggerFormEl.addEventListener("submit", (event) => {
        event.preventDefault();
        const track =
          triggerTrackInput.value === "selfcontrol" ? "selfcontrol" : "smoking";
        const outcome =
          triggerOutcomeInput.value === "relapse" ? "relapse" : "win";
        const cause = ns.Store.ALLOWED_TRIGGERS.has(triggerCauseSelect.value)
          ? triggerCauseSelect.value
          : "Stress";
        const note = triggerNoteInput.value.trim().slice(0, 90);

        const rec = ns.Store.state.data.recovery;
        const targetTrack = rec[track];

        if (outcome === "win") {
          targetTrack.urgesResisted += 1;
        } else {
          const elapsed = computeElapsed(targetTrack.startISO);
          if (elapsed.days > targetTrack.bestStreakDays) {
            targetTrack.bestStreakDays = elapsed.days;
          }
          targetTrack.startISO = getCurrentLocalDateTimeISO();
        }

        rec.triggerLogs.unshift({
          id:
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `trg-${Date.now()}`,
          track,
          outcome,
          cause,
          note,
          date: ns.Store.getTodayISO(),
        });

        ns.Store.markUserModified();
        ns.Store.save();
        syncSettingsInputs();
        renderRecovery();
        if (triggerModalEl) triggerModalEl.close();
        if (typeof onRecoveryUpdateCallback === "function") {
          onRecoveryUpdateCallback();
        }
      });
    }

    renderRecovery();
    if (liveTimerId) clearInterval(liveTimerId);
    liveTimerId = setInterval(renderRecovery, 15000);
  }

  function refresh() {
    syncSettingsInputs();
    renderRecovery();
  }

  ns.RecoveryEngine = {
    init,
    refresh,
    renderRecovery,
  };
})(window.FocusHabitOS);
