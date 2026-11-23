// @ts-check
"use strict";

/**
 * @typedef {{ id: number, quantity: number }} BagEntry
 */

(function initBagStoreModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  const BAG_STORAGE_KEY = "alireza_runway_bag_v1";

  class StylingBag {
    /**
     * @param {"en" | "de" | "fa"} initialLang
     */
    constructor(initialLang) {
      /** @type {"en" | "de" | "fa"} */
      this.lang = initialLang || "en";
      /** @type {BagEntry[]} */
      this.entries = this.load();

      /** @type {HTMLDialogElement | null} */
      this.dialog = /** @type {HTMLDialogElement | null} */ (
        document.getElementById("bag-dialog")
      );
      /** @type {HTMLElement | null} */
      this.itemsEl = document.getElementById("bag-items");
      /** @type {HTMLElement | null} */
      this.totalEl = document.getElementById("bag-total");
      /** @type {HTMLButtonElement | null} */
      this.exportBtn = /** @type {HTMLButtonElement | null} */ (
        document.getElementById("export-bag")
      );
      /** @type {HTMLElement | null} */
      this.statusEl = document.getElementById("bag-status");
      /** @type {number | undefined} */
      this.toastTimer = undefined;

      this.bindEvents();
      this.updateCounters();
    }

    /**
     * @param {"en" | "de" | "fa"} lang
     */
    setLang(lang) {
      this.lang = lang;
      if (this.dialog && this.dialog.open) {
        this.renderDialog();
      }
    }

    /**
     * @returns {BagEntry[]}
     */
    load() {
      const { variantById } = ns.catalog;
      try {
        const raw = localStorage.getItem(BAG_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter(
            (e) =>
              e &&
              Number.isSafeInteger(e.id) &&
              Number.isSafeInteger(e.quantity) &&
              e.quantity >= 1 &&
              e.quantity <= 20 &&
              variantById.has(e.id),
          )
          .slice(0, 50);
      } catch {
        return [];
      }
    }

    save() {
      try {
        localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(this.entries));
      } catch {
        // Ignore storage quota errors
      }
    }

    updateCounters() {
      const { formatNumber } = ns.i18n;
      const totalQty = this.entries.reduce((sum, e) => sum + e.quantity, 0);
      const formatted = formatNumber(totalQty, this.lang);
      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = formatted;
      });
    }

    /**
     * @param {string} message
     */
    toast(message) {
      if (!this.statusEl) return;
      clearTimeout(this.toastTimer);
      this.statusEl.textContent = message;
      this.statusEl.classList.add("is-on");
      this.toastTimer = window.setTimeout(() => {
        if (this.statusEl) this.statusEl.classList.remove("is-on");
      }, 2600);
    }

    /**
     * @param {BagEntry[]} items
     */
    add(items) {
      if (!Array.isArray(items) || items.length === 0) return;
      const { variantById } = ns.catalog;
      const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;

      for (const req of items) {
        const found = variantById.get(req.id);
        if (!found || !found.variant.available) {
          throw new Error(dict.bagErrorMsg);
        }
      }

      for (const req of items) {
        const existing = this.entries.find((e) => e.id === req.id);
        if (existing) {
          existing.quantity = Math.min(
            20,
            existing.quantity + (req.quantity || 1),
          );
        } else if (this.entries.length < 50) {
          this.entries.push({
            id: req.id,
            quantity: Math.min(20, Math.max(1, req.quantity || 1)),
          });
        }
      }

      this.save();
      this.updateCounters();
      this.renderDialog();
      this.toast(items.length > 1 ? dict.toastLookSaved : dict.toastPieceSaved);
    }

    /**
     * @param {number} variantId
     */
    remove(variantId) {
      this.entries = this.entries.filter((e) => e.id !== variantId);
      this.save();
      this.updateCounters();
      this.renderDialog();
    }

    renderDialog() {
      if (!this.itemsEl || !this.totalEl || !this.exportBtn) return;
      const { escapeHTML, formatPrice, formatNumber, pickText, DICT } = ns.i18n;
      const { variantById } = ns.catalog;
      const dict = DICT[this.lang] || DICT.en;

      if (this.entries.length === 0) {
        this.itemsEl.innerHTML = `<p class="bag-note">${escapeHTML(dict.bagEmpty)}</p>`;
        this.totalEl.textContent = "";
        this.exportBtn.disabled = true;
        return;
      }

      let subtotalUSD = 0;
      const rowsHTML = this.entries.map((entry) => {
        const info = variantById.get(entry.id);
        if (!info) return "";
        const { product, variant } = info;
        subtotalUSD += product.priceUSD * entry.quantity;

        const title = pickText(product.name, this.lang);
        const sizeText =
          variant.size === "One Size" ? dict.oneSizeValue : variant.size;
        const localizedSize =
          this.lang === "fa" ? ns.i18n.toPersianDigits(sizeText) : sizeText;
        const qtyText = formatNumber(entry.quantity, this.lang);
        const priceText = formatPrice(product.priceUSD, this.lang);

        return `
          <div class="bag-row">
            <img src="${escapeHTML(product.image)}" width="58" height="74" alt="${escapeHTML(title)}" />
            <div>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(dict.sizeLabel)}: ${escapeHTML(localizedSize)} &middot; ${escapeHTML(dict.qtyLabel)}: ${escapeHTML(qtyText)} &middot; ${escapeHTML(priceText)}</p>
            </div>
            <button
              type="button"
              class="bag-remove"
              data-remove-variant="${entry.id}"
              aria-label="${escapeHTML(dict.removeLabel)} ${escapeHTML(title)}"
            >&times;</button>
          </div>
        `;
      });

      this.itemsEl.innerHTML = rowsHTML.join("");
      const formattedTotal = formatPrice(subtotalUSD, this.lang);
      this.totalEl.textContent = dict.bagSubtotal.replace(
        "[price]",
        formattedTotal,
      );
      this.exportBtn.disabled = false;
    }

    downloadShortlist() {
      if (this.entries.length === 0) return;
      const { formatPrice, pickText, DICT } = ns.i18n;
      const { variantById } = ns.catalog;
      const dict = DICT[this.lang] || DICT.en;

      let subtotalUSD = 0;
      const lines = [dict.shortlistHeader, dict.shortlistSubheader, ""];

      for (const entry of this.entries) {
        const info = variantById.get(entry.id);
        if (!info) continue;
        const { product, variant } = info;
        subtotalUSD += product.priceUSD * entry.quantity;
        const title = pickText(product.name, this.lang);
        const sizeText =
          variant.size === "One Size" ? dict.oneSizeValue : variant.size;
        const priceText = formatPrice(
          product.priceUSD * entry.quantity,
          this.lang,
        );
        lines.push(
          `${title} | ${dict.sizeLabel}: ${sizeText} | ${dict.qtyLabel}: ${entry.quantity} | ${priceText}`,
        );
      }

      lines.push(
        "",
        dict.bagSubtotal.replace(
          "[price]",
          formatPrice(subtotalUSD, this.lang),
        ),
      );

      const blob = new Blob([lines.join("\n")], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alireza-runway-shortlist-${this.lang}.txt`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    bindEvents() {
      const openBtn = document.getElementById("open-bag");
      const closeBtn = document.getElementById("close-bag");

      if (openBtn && this.dialog) {
        openBtn.addEventListener("click", () => {
          this.renderDialog();
          this.dialog?.showModal();
        });
      }

      if (closeBtn && this.dialog) {
        closeBtn.addEventListener("click", () => this.dialog?.close());
      }

      if (this.dialog) {
        this.dialog.addEventListener("click", (e) => {
          if (!this.dialog) return;
          const rect = this.dialog.getBoundingClientRect();
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (!inside) this.dialog.close();
        });
      }

      if (this.itemsEl) {
        this.itemsEl.addEventListener("click", (e) => {
          const target = /** @type {HTMLElement | null} */ (e.target);
          const btn = target?.closest("[data-remove-variant]");
          if (!btn) return;
          const vid = Number(btn.getAttribute("data-remove-variant"));
          if (Number.isSafeInteger(vid)) this.remove(vid);
        });
      }

      if (this.exportBtn) {
        this.exportBtn.addEventListener("click", () =>
          this.downloadShortlist(),
        );
      }
    }
  }

  ns.StylingBag = StylingBag;
})();
