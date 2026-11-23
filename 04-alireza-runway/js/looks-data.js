// @ts-check
"use strict";

/**
 * @typedef {"all" | "women" | "men"} CollectionFilter
 * @typedef {{ n: number, left: number, top: number }} LookPin
 * @typedef {{
 *   id: string,
 *   gender: "women" | "men",
 *   name: { en: string, de: string, fa: string },
 *   modelImage: string,
 *   products: string[],
 *   newIndices?: number[],
 *   pins: LookPin[]
 * }} RunwayLook
 */

(function initLooksDataModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  /** @type {RunwayLook[]} */
  const LOOKS = [
    // =========================================================================
    // 5 WOMEN'S RUNWAY LOOKS (assets/models/f-01.webp .. f-05.webp)
    // =========================================================================
    {
      id: "f-01",
      gender: "women",
      name: {
        en: "Noir Kinetic Edit",
        de: "Noir Kinetic Edit",
        fa: "استایل کینتیک مشکی",
      },
      modelImage: "assets/models/f-01.webp",
      products: ["w-01", "w-02", "w-04"],
      newIndices: [0],
      pins: [
        { n: 1, left: 48, top: 31 },
        { n: 2, left: 46, top: 60 },
        { n: 3, left: 49, top: 92 },
      ],
    },
    {
      id: "f-02",
      gender: "women",
      name: {
        en: "Gallery Cream Tailoring",
        de: "Galerie Creme-Tailoring",
        fa: "استایل گالری بلیزر کرم",
      },
      modelImage: "assets/models/f-02.webp",
      products: ["w-05", "w-06", "w-03", "w-08"],
      newIndices: [2],
      pins: [
        { n: 1, left: 44, top: 30 },
        { n: 2, left: 46, top: 62 },
        { n: 3, left: 56, top: 45 },
        { n: 4, left: 48, top: 93 },
      ],
    },
    {
      id: "f-03",
      gender: "women",
      name: {
        en: "Olive Studio Streetwear",
        de: "Oliv Studio-Streetwear",
        fa: "استریت‌ور سبز زیتونی",
      },
      modelImage: "assets/models/f-03.webp",
      products: ["w-09", "w-06", "w-04"],
      pins: [
        { n: 1, left: 49, top: 32 },
        { n: 2, left: 47, top: 61 },
        { n: 3, left: 50, top: 92 },
      ],
    },
    {
      id: "f-04",
      gender: "women",
      name: {
        en: "Espresso Evening Silhouette",
        de: "Espresso Abend-Silhouette",
        fa: "سیلوئت عصرانه اسپرسو",
      },
      modelImage: "assets/models/f-04.webp",
      products: ["w-10", "w-07", "w-08"],
      newIndices: [0, 1],
      pins: [
        { n: 1, left: 49, top: 38 },
        { n: 2, left: 61, top: 53 },
        { n: 3, left: 48, top: 93 },
      ],
    },
    {
      id: "f-05",
      gender: "women",
      name: {
        en: "Burgundy Accent Atelier",
        de: "Burgunder Akzent-Atelier",
        fa: "آتلیه مدرن با اکسسوری زرشکی",
      },
      modelImage: "assets/models/f-05.webp",
      products: ["w-01", "w-02", "w-07", "w-08"],
      pins: [
        { n: 1, left: 48, top: 30 },
        { n: 2, left: 46, top: 61 },
        { n: 3, left: 60, top: 52 },
        { n: 4, left: 49, top: 93 },
      ],
    },

    // =========================================================================
    // 5 MEN'S RUNWAY LOOKS (assets/models/m-01.webp .. m-05.webp)
    // =========================================================================
    {
      id: "m-01",
      gender: "men",
      name: {
        en: "Charcoal Knit & Denim",
        de: "Anthrazit Strick & Denim",
        fa: "بافت ذغالی و جین کارپنتر",
      },
      modelImage: "assets/models/m-01.webp",
      products: ["man-01", "man-02", "man-04"],
      newIndices: [0],
      pins: [
        { n: 1, left: 49, top: 31 },
        { n: 2, left: 47, top: 61 },
        { n: 3, left: 50, top: 93 },
      ],
    },
    {
      id: "m-02",
      gender: "men",
      name: {
        en: "Noir Leather & Sand Pleats",
        de: "Noir Leder & Sand-Bundfalten",
        fa: "کت چرم مشکی و شلوار بژ",
      },
      modelImage: "assets/models/m-02.webp",
      products: ["man-07", "man-05", "man-06", "man-08"],
      newIndices: [0],
      pins: [
        { n: 1, left: 43, top: 31 },
        { n: 2, left: 51, top: 36 },
        { n: 3, left: 47, top: 62 },
        { n: 4, left: 49, top: 93 },
      ],
    },
    {
      id: "m-03",
      gender: "men",
      name: {
        en: "Forest Utility Street",
        de: "Waldgrün Utility-Street",
        fa: "استایل شهری سبز جنگلی",
      },
      modelImage: "assets/models/m-03.webp",
      products: ["man-09", "man-02", "man-03", "man-04"],
      newIndices: [2],
      pins: [
        { n: 1, left: 44, top: 31 },
        { n: 2, left: 47, top: 62 },
        { n: 3, left: 53, top: 38 },
        { n: 4, left: 50, top: 93 },
      ],
    },
    {
      id: "m-04",
      gender: "men",
      name: {
        en: "Minimalist Studio Tote",
        de: "Minimalistischer Studio-Tote",
        fa: "مینیمال استودیو و کیف زیتونی",
      },
      modelImage: "assets/models/m-04.webp",
      products: ["man-05", "man-06", "man-10", "man-08"],
      pins: [
        { n: 1, left: 49, top: 32 },
        { n: 2, left: 47, top: 61 },
        { n: 3, left: 62, top: 54 },
        { n: 4, left: 49, top: 93 },
      ],
    },
    {
      id: "m-05",
      gender: "men",
      name: {
        en: "Contemporary Monochrome",
        de: "Zeitgenössisch Monochrom",
        fa: "ترکیب مدرن ذغالی و شنی",
      },
      modelImage: "assets/models/m-05.webp",
      products: ["man-01", "man-06", "man-03", "man-04"],
      pins: [
        { n: 1, left: 44, top: 30 },
        { n: 2, left: 47, top: 62 },
        { n: 3, left: 53, top: 38 },
        { n: 4, left: 50, top: 93 },
      ],
    },
  ];

  /**
   * Filters looks by collection ("all" | "women" | "men")
   * @param {CollectionFilter} collection
   * @returns {RunwayLook[]}
   */
  function getLooksByCollection(collection) {
    if (collection === "women" || collection === "men") {
      return LOOKS.filter((look) => look.gender === collection);
    }
    return LOOKS;
  }

  ns.looksData = {
    LOOKS,
    getLooksByCollection,
  };
})();
