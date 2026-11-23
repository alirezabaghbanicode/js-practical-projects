// @ts-check
"use strict";

/**
 * @typedef {"en" | "de" | "fa"} LangCode
 * @typedef {{ en: string, de: string, fa: string }} LocalizedString
 */

(function initI18nModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  const LANG_STORAGE_KEY = "alireza_runway_lang_v1";

  /** @type {Record<LangCode, Record<string, string>>} */
  const DICT = {
    en: {
      dir: "ltr",
      pageTitle: "ALIREZA — Try the Look | Interactive 3D Runway",
      pageH1: "ALIREZA Runway Interactive 3D Lookbook and Styling Studio",
      navAll: "All Runway (10)",
      navWomen: "Women (5)",
      navMen: "Men (5)",
      eyebrow: "ALIREZA • ATELIER COLLECTION",
      heroTitle: "Try the Look.",
      heroSub:
        "Ten signature silhouettes, styled head to toe. Rotate the stage or tap a model to inspect every piece.",
      filterAllShort: "All (10)",
      filterWomenShort: "Women (5)",
      filterMenShort: "Men (5)",
      cursorDrag: "Drag",
      cursorView: "View",
      lbHint: "Tap a numbered pin to highlight the piece",
      panelTitle: "In this look",
      bagTitle: "Your ALIREZA Styling Bag",
      bagNote:
        "A curated local outfit shortlist stored in your browser. Export your list anytime with exact sizes and reference totals.",
      exportBagBtn: "Download outfit shortlist (.txt)",
      lookWord: "Look",
      pieceSingular: "piece",
      piecePlural: "pieces",
      completeLookTitle: "Complete the look",
      completeLookNote: "Bundle all pieces and save 10%",
      addToBag: "Add to bag",
      addedToBag: "Added to bag",
      soldOut: "Sold out",
      addFullLook: "Add full look to bag",
      addFullLookMobile: "Add full look — [price]",
      fullLookInBag: "Full look in your bag",
      pickSizeMsg: "Pick a size for: [items]",
      bagErrorMsg: "Couldn’t add to bag. Please try again.",
      bagEmpty:
        "Your styling bag is empty. Choose a size beside any piece to save it.",
      bagSubtotal: "Reference subtotal [price]",
      sizeLabel: "Size",
      qtyLabel: "Qty",
      removeLabel: "Remove",
      toastPieceSaved: "Piece saved to your styling bag",
      toastLookSaved: "Full look saved to your styling bag",
      shortlistHeader: "ALIREZA — STYLING SHORTLIST",
      shortlistSubheader:
        "Reference prices; curated via ALIREZA Interactive 3D Runway.",
      newTag: "New",
      optionApparel: "Apparel Size",
      optionFootwear: "Shoe Size (EU)",
      optionBag: "Edition",
      oneSizeValue: "One Size",
      prevLookLabel: "Previous look",
      nextLookLabel: "Next look",
      autoplayLabel: "Toggle autoplay",
      viewLookLabel: "Inspect look",
      closeLabel: "Close",
    },
    de: {
      dir: "ltr",
      pageTitle: "ALIREZA — Try the Look | Interaktiver 3D-Runway",
      pageH1: "ALIREZA Runway Interaktives 3D-Lookbook und Styling-Studio",
      navAll: "Alle Looks (10)",
      navWomen: "Damen (5)",
      navMen: "Herren (5)",
      eyebrow: "ALIREZA • ATELIER KOLLEKTION",
      heroTitle: "Try the Look.",
      heroSub:
        "Zehn charakteristische Silhouetten, von Kopf bis Fuß gestylt. Drehen Sie die Bühne oder tippen Sie auf ein Modell.",
      filterAllShort: "Alle (10)",
      filterWomenShort: "Damen (5)",
      filterMenShort: "Herren (5)",
      cursorDrag: "Ziehen",
      cursorView: "Ansehen",
      lbHint: "Tippen Sie auf einen Pin, um das Teil hervorzuheben",
      panelTitle: "In diesem Look",
      bagTitle: "Ihre ALIREZA Styling-Tasche",
      bagNote:
        "Eine lokal im Browser gespeicherte Outfit-Auswahl. Exportieren Sie Ihre Liste jederzeit inklusive Größen.",
      exportBagBtn: "Outfit-Auswahl herunterladen (.txt)",
      lookWord: "Look",
      pieceSingular: "Teil",
      piecePlural: "Teile",
      completeLookTitle: "Look vervollständigen",
      completeLookNote: "Komplett-Set wählen und 10 % sparen",
      addToBag: "In die Tasche",
      addedToBag: "Hinzugefügt",
      soldOut: "Ausverkauft",
      addFullLook: "Kompletten Look hinzufügen",
      addFullLookMobile: "Kompletter Look — [price]",
      fullLookInBag: "Kompletter Look in Ihrer Tasche",
      pickSizeMsg: "Bitte Größe wählen für: [items]",
      bagErrorMsg: "Konnte nicht hinzugefügt werden. Bitte erneut versuchen.",
      bagEmpty:
        "Ihre Styling-Tasche ist leer. Wählen Sie eine Größe neben einem Artikel.",
      bagSubtotal: "Referenz-Zwischensumme [price]",
      sizeLabel: "Größe",
      qtyLabel: "Menge",
      removeLabel: "Entfernen",
      toastPieceSaved: "Artikel in Ihrer Styling-Tasche gespeichert",
      toastLookSaved: "Kompletter Look in Ihrer Styling-Tasche gespeichert",
      shortlistHeader: "ALIREZA — STYLING-AUSWAHL",
      shortlistSubheader:
        "Referenzpreise; zusammengestellt im ALIREZA 3D-Runway.",
      newTag: "Neu",
      optionApparel: "Konfektionsgröße",
      optionFootwear: "Schuhgröße (EU)",
      optionBag: "Ausführung",
      oneSizeValue: "Einheitsgröße",
      prevLookLabel: "Vorheriger Look",
      nextLookLabel: "Nächster Look",
      autoplayLabel: "Autoplay umschalten",
      viewLookLabel: "Look vergrößern",
      closeLabel: "Schließen",
    },
    fa: {
      dir: "rtl",
      pageTitle: "ALIREZA — استودیو ران‌وی سه‌بعدی و ست لباس",
      pageH1: "استودیو تعاملی ران‌وی سه‌بعدی و ست لباس برند علیرضا",
      navAll: "همه استایل‌ها (۱۰)",
      navWomen: "کالکشن زنانه (۵)",
      navMen: "کالکشن مردانه (۵)",
      eyebrow: "ALIREZA • کالکشن اختصاصی آتلیه",
      heroTitle: "استایل را امتحان کن.",
      heroSub:
        "ده استایل اختصاصی از سر تا پا؛ صحنه را بچرخانید یا روی هر مدل کلیک کنید تا جزئیات و سایز هر آیتم را ببینید.",
      filterAllShort: "همه (۱۰)",
      filterWomenShort: "زنانه (۵)",
      filterMenShort: "مردانه (۵)",
      cursorDrag: "بکشید",
      cursorView: "نمایش",
      lbHint: "روی پین شماره‌دار بزنید تا آیتم در پنل مشخص شود",
      panelTitle: "آیتم‌های این استایل",
      bagTitle: "کیف استایل اختصاصی ALIREZA",
      bagNote:
        "فهرست انتخاب‌های شما به‌صورت محلی در مرورگر ذخیره می‌شود و هر زمان می‌توانید خروجی متنی آن را دانلود کنید.",
      exportBagBtn: "دانلود لیست انتخاب‌ها (.txt)",
      lookWord: "استایل",
      pieceSingular: "آیتم",
      piecePlural: "آیتم",
      completeLookTitle: "تکمیل کل استایل",
      completeLookNote: "خرید یکجای کل ست با ۱۰٪ تخفیف ویژه",
      addToBag: "افزودن به کیف",
      addedToBag: "اضافه شد",
      soldOut: "ناموجود",
      addFullLook: "افزودن کل استایل به کیف",
      addFullLookMobile: "خرید کل استایل — [price]",
      fullLookInBag: "کل استایل در کیف شماست",
      pickSizeMsg: "لطفاً سایز را انتخاب کنید: [items]",
      bagErrorMsg: "افزودن انجام نشد. لطفاً دوباره تلاش کنید.",
      bagEmpty:
        "کیف استایل شما خالی است. کنار هر آیتم سایز موردنظر را انتخاب کنید.",
      bagSubtotal: "جمع کل تقریبی: [price]",
      sizeLabel: "سایز",
      qtyLabel: "تعداد",
      removeLabel: "حذف",
      toastPieceSaved: "آیتم به کیف استایل شما اضافه شد",
      toastLookSaved: "کل استایل با موفقیت به کیف اضافه شد",
      shortlistHeader: "ALIREZA — لیست انتخاب استایل",
      shortlistSubheader:
        "قیمت‌های مرجع؛ انتخاب‌شده در استودیو سه‌بعدی ALIREZA.",
      newTag: "جدید",
      optionApparel: "سایز لباس",
      optionFootwear: "سایز کفش (EU)",
      optionBag: "مدل کیف",
      oneSizeValue: "تک‌سایز",
      prevLookLabel: "استایل قبلی",
      nextLookLabel: "استایل بعدی",
      autoplayLabel: "پخش خودکار",
      viewLookLabel: "بزرگ‌نمایی استایل",
      closeLabel: "بستن",
    },
  };

  /**
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * @param {string | number} text
   * @returns {string}
   */
  function toPersianDigits(text) {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(text).replace(/\d/g, (d) => persian[Number(d)]);
  }

  /**
   * @param {number} num
   * @param {LangCode} lang
   * @returns {string}
   */
  function formatNumber(num, lang) {
    if (lang === "fa") {
      return new Intl.NumberFormat("fa-IR").format(num);
    }
    if (lang === "de") {
      return new Intl.NumberFormat("de-DE").format(num);
    }
    return new Intl.NumberFormat("en-US").format(num);
  }

  /**
   * Formats base USD price into USD (en), EUR (de), or Iranian Toman (fa)
   * @param {number} usdAmount
   * @param {LangCode} lang
   * @returns {string}
   */
  function formatPrice(usdAmount, lang) {
    if (lang === "fa") {
      const toman = Math.round((usdAmount * 50000) / 10000) * 10000;
      return `${new Intl.NumberFormat("fa-IR").format(toman)} تومان`;
    }
    if (lang === "de") {
      const eur = Math.round(usdAmount * 0.92 * 100) / 100;
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(eur);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(usdAmount);
  }

  /**
   * @param {number} count
   * @param {LangCode} lang
   * @returns {string}
   */
  function formatPiecesLabel(count, lang) {
    const dict = DICT[lang] || DICT.en;
    const unit = count === 1 ? dict.pieceSingular : dict.piecePlural;
    return `${formatNumber(count, lang)} ${unit}`;
  }

  /**
   * @returns {LangCode}
   */
  function getInitialLanguage() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get("lang") || "").toLowerCase();
      if (q === "en" || q === "de" || q === "fa") return q;
    } catch {
      // Ignore URL parsing errors
    }
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === "en" || saved === "de" || saved === "fa") return saved;
    } catch {
      // Ignore storage errors
    }
    return "en";
  }

  /**
   * @param {LangCode} lang
   */
  function persistLanguage(lang) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Ignore history API errors
    }
  }

  /**
   * @param {LocalizedString} obj
   * @param {LangCode} lang
   * @returns {string}
   */
  function pickText(obj, lang) {
    return obj[lang] || obj.en;
  }

  ns.i18n = {
    DICT,
    escapeHTML,
    toPersianDigits,
    formatNumber,
    formatPrice,
    formatPiecesLabel,
    getInitialLanguage,
    persistLanguage,
    pickText,
  };
})();
