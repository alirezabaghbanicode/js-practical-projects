// @ts-check
"use strict";

(function initDomBuilderModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  /**
   * Ensures at least 10 ring bodies so 5-model collections keep full 3D depth
   * @param {number} lookCount
   * @returns {number}
   */
  function getRingBodyCount(lookCount) {
    if (lookCount <= 0) return 0;
    return lookCount < 8 ? lookCount * Math.ceil(8 / lookCount) : lookCount;
  }

  /**
   * Builds all dynamic runway actors, heroes, progress ticks, and product panels
   * @param {{
   *   root: HTMLElement,
   *   looks: any[],
   *   lang: "en" | "de" | "fa",
   *   addedKeys: Set<string>,
   *   activeIndex: number
   * }} params
   */
  function renderRunwayDOM(params) {
    const { root, looks, lang, addedKeys, activeIndex } = params;
    const {
      escapeHTML,
      toPersianDigits,
      formatPrice,
      formatPiecesLabel,
      pickText,
      DICT,
    } = ns.i18n;
    const { productById } = ns.catalog;
    const dict = DICT[lang] || DICT.en;

    const actorsEl = root.querySelector("[data-rw-actors]");
    const heroesEl = root.querySelector("[data-rw-heroes]");
    const ticksEl = root.querySelector("[data-rw-ticks]");
    const panelsEl = root.querySelector("[data-rw-panels]");
    const piecesHeaderEl = root.querySelector("[data-rw-pieces]");

    if (!actorsEl || !heroesEl || !ticksEl || !panelsEl) return;

    const n = looks.length;
    const N = getRingBodyCount(n);

    // 1. Build 3D Ring Bodies (originals + clones)
    let actorsHTML = "";
    for (let a = 0; a < N; a++) {
      const lookIdx = a % n;
      const look = looks[lookIdx];
      const isClone = a >= n;
      const lookName = pickText(look.name, lang);
      const numStr = String(lookIdx + 1).padStart(2, "0");
      const localizedNum = lang === "fa" ? toPersianDigits(numStr) : numStr;
      const ariaLabel = `${dict.lookWord} ${localizedNum}: ${lookName}`;

      actorsHTML += `
        <div
          class="rw__model"
          data-rw-model
          data-index="${lookIdx}"
          data-body="${a}"
          ${isClone ? 'data-rw-clone=""' : ""}
          aria-hidden="true"
        >
          <span class="rw__shadow"></span>
          <div class="rw__figure" style="--rw-ar: 0.5625">
            <div class="rw__art">
              <img
                src="${escapeHTML(look.modelImage)}"
                loading="${isClone ? "lazy" : "eager"}"
                decoding="async"
                width="1080"
                height="1920"
                draggable="false"
                data-model-image
                alt="${escapeHTML(lookName)}"
              />
              <button
                type="button"
                class="rw__hit"
                data-rw-go="${a}"
                aria-label="${escapeHTML(ariaLabel)}"
                tabindex="-1"
              ></button>
            </div>
          </div>
        </div>
      `;
    }
    actorsEl.innerHTML = actorsHTML;

    // 2. Build Front Heroes & Hotspot Pins
    heroesEl.innerHTML = looks
      .map((look, i) => {
        const isCurrent = i === activeIndex;
        const lookName = pickText(look.name, lang);
        const pins = /** @type {{ n: number, left: number, top: number }[]} */ (
          look.pins || []
        );
        const productIds = /** @type {string[]} */ (look.products || []);

        const pinsHTML = pins
          .map((pin, pIdx) => {
            const prod = productById.get(productIds[pIdx]);
            const prodName = prod ? pickText(prod.name, lang) : "";
            const pinNum =
              lang === "fa" ? toPersianDigits(pin.n) : String(pin.n);
            return `
              <button
                type="button"
                class="rw__pin"
                data-rw-pin="${pin.n}"
                data-tip="${escapeHTML(prodName)}"
                style="left:${pin.left}%; top:${pin.top}%; --pi:${pin.n}"
                aria-label="${escapeHTML(pinNum)}: ${escapeHTML(prodName)}"
                tabindex="-1"
              >
                <span class="rw__pin-dot">${escapeHTML(pinNum)}</span>
              </button>
            `;
          })
          .join("");

        return `
          <div
            class="rw__hero${isCurrent ? " is-on" : ""}"
            data-rw-hero
            data-index="${i}"
            data-name="${escapeHTML(lookName)}"
            data-probe="${escapeHTML(look.modelImage)}"
            aria-hidden="${isCurrent ? "false" : "true"}"
          >
            <div class="rw__morph">
              <span class="rw__shadow"></span>
              <div class="rw__figure" style="--rw-ar: 0.5625">
                <div class="rw__art">
                  <img
                    src="${escapeHTML(look.modelImage)}"
                    loading="eager"
                    decoding="async"
                    width="1080"
                    height="1920"
                    draggable="false"
                    data-model-image
                    alt="${escapeHTML(lookName)}"
                  />
                  <button
                    type="button"
                    class="rw__zoom"
                    data-rw-zoom
                    aria-label="${escapeHTML(dict.viewLookLabel)}: ${escapeHTML(lookName)}"
                    tabindex="${isCurrent ? "0" : "-1"}"
                  ></button>
                  <div class="rw__pins">${pinsHTML}</div>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // 3. Build Bottom Progress Ticks
    ticksEl.innerHTML = looks
      .map((look, i) => {
        const isCurrent = i === activeIndex;
        const lookName = pickText(look.name, lang);
        const rawNum = String(i + 1).padStart(2, "0");
        const numLabel = lang === "fa" ? toPersianDigits(rawNum) : rawNum;

        return `
          <button
            type="button"
            class="rw__tick${i < activeIndex ? " is-past" : ""}"
            data-rw-tick="${i}"
            aria-current="${isCurrent ? "true" : "false"}"
            aria-label="${escapeHTML(dict.lookWord)} ${escapeHTML(numLabel)}: ${escapeHTML(lookName)}"
          >
            <span class="rw__tick-bar"></span>
            <span class="rw__tick-label">${escapeHTML(numLabel)}<span class="rw__tick-name">&nbsp;&nbsp;${escapeHTML(lookName)}</span></span>
          </button>
        `;
      })
      .join("");

    // 4. Build Right-Hand Look Panels
    panelsEl.innerHTML = looks
      .map((look, lookIdx) => {
        const isCurrent = lookIdx === activeIndex;
        const lookName = pickText(look.name, lang);
        const productIds = /** @type {string[]} */ (look.products || []);
        const piecesLabel = formatPiecesLabel(productIds.length, lang);
        let totalUSD = 0;
        let addedCount = 0;

        const rowsHTML = productIds
          .map((prodId, idx) => {
            const nCard = idx + 1;
            const prod = productById.get(prodId);
            if (!prod) return "";

            totalUSD += prod.priceUSD;
            const cardKey = `${look.id}:${nCard}`;
            const isAdded = addedKeys.has(cardKey);
            if (isAdded) addedCount++;

            const prodName = pickText(prod.name, lang);
            const catName = pickText(prod.category, lang);
            const priceText = formatPrice(prod.priceUSD, lang);
            const numBadge =
              lang === "fa" ? toPersianDigits(nCard) : String(nCard);
            const isNew =
              Array.isArray(look.newIndices) && look.newIndices.includes(idx);

            const optionLegend =
              prod.optionType === "footwear"
                ? dict.optionFootwear
                : prod.optionType === "bag"
                  ? dict.optionBag
                  : dict.optionApparel;

            const pickerId = `Picker-${look.id}-${nCard}`;
            const radioName = `Opt-${look.id}-${nCard}`;
            const sizesList = /** @type {string[]} */ (prod.sizes || []);
            const isSingleSize = sizesList.length === 1;

            const pillsHTML = sizesList
              .map((sz, sIdx) => {
                const displaySz =
                  sz === "One Size"
                    ? dict.oneSizeValue
                    : lang === "fa"
                      ? toPersianDigits(sz)
                      : sz;
                return `
                  <label class="rw__pill">
                    <input
                      type="radio"
                      name="${escapeHTML(radioName)}"
                      value="${escapeHTML(sz)}"
                      data-rw-option="0"
                      ${sIdx === 0 ? "checked" : ""}
                    />
                    <span class="rw__pill-label">${escapeHTML(displaySz)}</span>
                  </label>
                `;
              })
              .join("");

            return `
              <li
                class="rw__item${isAdded ? " is-added" : ""}"
                data-rw-card="${nCard}"
                data-card-key="${escapeHTML(cardKey)}"
                data-touched="${isSingleSize ? "1" : "0"}"
                style="--i:${nCard}"
                data-title="${escapeHTML(prodName)}"
              >
                ${isNew ? `<span class="rw__tag"><span class="rw__tag-text">${escapeHTML(dict.newTag)}</span></span>` : ""}

                <div class="rw__media">
                  <img
                    src="${escapeHTML(prod.image)}"
                    width="${prod.width}"
                    height="${prod.height}"
                    loading="lazy"
                    decoding="async"
                    alt="${escapeHTML(prodName)}"
                  />
                  <span class="rw__num">${escapeHTML(numBadge)}</span>
                </div>

                <div class="rw__info">
                  <span class="rw__type">${escapeHTML(catName)}</span>
                  <span class="rw__name">${escapeHTML(prodName)}</span>
                  <span class="rw__price"><span>${escapeHTML(priceText)}</span></span>
                </div>

                <button
                  type="button"
                  class="rw__add"
                  data-rw-add
                  ${isAdded ? "" : 'aria-expanded="false"'}
                  aria-controls="${escapeHTML(pickerId)}"
                  aria-label="${escapeHTML(isAdded ? dict.addedToBag : dict.addToBag)}: ${escapeHTML(prodName)}"
                  data-added-label="${escapeHTML(dict.addedToBag)}: ${escapeHTML(prodName)}"
                >
                  <svg class="rw__add-plus" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                  <svg class="rw__add-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M4.5 12.5l5 5L19.5 7" />
                  </svg>
                  <svg class="rw__add-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                    <path d="M12 3a9 9 0 1 1-9 9" />
                  </svg>
                </button>

                <div class="rw__picker" id="${escapeHTML(pickerId)}" data-rw-picker hidden>
                  <div class="rw__picker-head">
                    <img src="${escapeHTML(prod.image)}" width="54" height="68" loading="lazy" decoding="async" alt="" />
                    <div>
                      <p class="rw__picker-title">${escapeHTML(prodName)}</p>
                      <p class="rw__picker-price">${escapeHTML(priceText)}</p>
                    </div>
                    <button type="button" class="rw__picker-close" data-rw-pick-close aria-label="${escapeHTML(dict.closeLabel)}">&times;</button>
                  </div>

                  <fieldset class="rw__opt">
                    <legend class="rw__opt-name">${escapeHTML(optionLegend)}</legend>
                    <div class="rw__pills">${pillsHTML}</div>
                  </fieldset>

                  <button type="button" class="rw__confirm" data-rw-confirm>
                    <span data-rw-confirm-label data-add="${escapeHTML(dict.addToBag)}">${escapeHTML(dict.addToBag)}</span>
                  </button>

                  <script type="application/json" data-rw-variants>${JSON.stringify(prod.variants)}</script>
                </div>
              </li>
            `;
          })
          .join("");

        const bundleUSD = Math.round(totalUSD * 0.9 * 100) / 100;
        const originalFormatted = formatPrice(totalUSD, lang);
        const bundleFormatted = formatPrice(bundleUSD, lang);
        const mobileCtaLabel = dict.addFullLookMobile.replace(
          "[price]",
          bundleFormatted,
        );
        const isComplete =
          productIds.length >= 2 && addedCount === productIds.length;

        return `
          <div
            class="rw__look-panel${isCurrent ? " is-in" : ""}${isComplete ? " is-complete" : ""}"
            data-rw-panel="${lookIdx}"
            ${isCurrent ? "" : "hidden"}
          >
            <div class="rw__mhead">
              <span class="rw__mhead-title">${escapeHTML(lookName)}</span>
              <span class="rw__label">${escapeHTML(piecesLabel)}</span>
            </div>

            <ul class="rw__items" role="list">${rowsHTML}</ul>

            <div class="rw__bundle has-rule">
              <p class="rw__msg" data-rw-msg role="status" aria-live="polite"></p>
              <div class="rw__bundle-row">
                <div class="rw__bundle-copy">
                  <span class="rw__bundle-title">${escapeHTML(dict.completeLookTitle)}</span>
                  <span class="rw__bundle-note">${escapeHTML(dict.completeLookNote)}</span>
                </div>
                <div class="rw__bundle-price">
                  <s>${escapeHTML(originalFormatted)}</s>
                  <strong>${escapeHTML(bundleFormatted)}</strong>
                </div>
              </div>

              <button type="button" class="rw__cta" data-rw-all>
                <span class="rw__cta-add">${escapeHTML(dict.addFullLook)}</span>
                <span class="rw__cta-m">${escapeHTML(mobileCtaLabel)}</span>
                <span class="rw__cta-done">${escapeHTML(dict.fullLookInBag)}</span>
                <svg class="rw__cta-arrow icon-flip" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 7h24M19 1l6 6-6 6" />
                </svg>
                <svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 1-9 9" />
                </svg>
              </button>
            </div>

            <template data-rw-pieces-text>${escapeHTML(piecesLabel)}</template>
          </div>
        `;
      })
      .join("");

    if (piecesHeaderEl && looks[activeIndex]) {
      piecesHeaderEl.textContent = formatPiecesLabel(
        looks[activeIndex].products.length,
        lang,
      );
    }

    // Reveal decoded model images cleanly
    root.querySelectorAll("img[data-model-image]").forEach((node) => {
      const img = /** @type {HTMLImageElement} */ (node);
      const reveal = () => img.classList.add("is-decoded");
      if (img.complete && img.naturalWidth > 0) {
        reveal();
      } else if (typeof img.decode === "function") {
        img
          .decode()
          .then(reveal)
          .catch(() => {
            if (img.naturalWidth > 0) reveal();
          });
      }
      img.addEventListener("load", reveal, { once: true });
    });
  }

  ns.domBuilder = {
    getRingBodyCount,
    renderRunwayDOM,
  };
})();
