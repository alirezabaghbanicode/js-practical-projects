// @ts-check
"use strict";

/**
 * @typedef {"apparel" | "footwear" | "bag"} ProductOptionType
 * @typedef {{ id: number, available: boolean, size: string }} ProductVariant
 * @typedef {{
 *   id: string,
 *   gender: "women" | "men",
 *   name: { en: string, de: string, fa: string },
 *   category: { en: string, de: string, fa: string },
 *   priceUSD: number,
 *   image: string,
 *   width: number,
 *   height: number,
 *   optionType: ProductOptionType,
 *   sizes: string[],
 *   variants: ProductVariant[]
 * }} RunwayProduct
 */

(function initProductsDataModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
  const WOMEN_SHOE_SIZES = ["36", "37", "38", "39", "40", "41"];
  const MEN_SHOE_SIZES = ["40", "41", "42", "43", "44", "45"];
  const BAG_SIZES = ["One Size"];

  /**
   * Generates deterministic integer variant IDs per product
   * @param {number} baseId
   * @param {string[]} sizes
   * @returns {ProductVariant[]}
   */
  function buildVariants(baseId, sizes) {
    return sizes.map((size, idx) => ({
      id: baseId + idx,
      available: true,
      size,
    }));
  }

  /** @type {RunwayProduct[]} */
  const PRODUCTS = [
    // =========================================================================
    // WOMEN'S COLLECTION (w-01.webp .. w-10.webp)
    // =========================================================================
    {
      id: "w-01",
      gender: "women",
      name: {
        en: "Ribbed Zip Stand-Collar Jacket",
        de: "Gerippte Zip-Jacke mit Stehkragen",
        fa: "کت زیپ‌دار راه‌راه یقه ایستاده",
      },
      category: {
        en: "ALIREZA • Women Outerwear",
        de: "ALIREZA • Damen Oberbekleidung",
        fa: "ALIREZA • بالاپوش زنانه",
      },
      priceUSD: 185,
      image: "assets/products/w-01.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(10100, APPAREL_SIZES),
    },
    {
      id: "w-02",
      gender: "women",
      name: {
        en: "Charcoal Tailored Wide-Leg Trousers",
        de: "Anthrazitfarbene Wide-Leg-Hose",
        fa: "شلوار واید ذغالی خوش‌دوخت",
      },
      category: {
        en: "ALIREZA • Women Tailoring",
        de: "ALIREZA • Damen Hosen",
        fa: "ALIREZA • شلوار زنانه",
      },
      priceUSD: 165,
      image: "assets/products/w-02.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(10200, APPAREL_SIZES),
    },
    {
      id: "w-03",
      gender: "women",
      name: {
        en: "Structured Noir Leather Crossbody",
        de: "Strukturierte Noir-Umhängetasche",
        fa: "کیف دوشی چرم مشکی مینیمال",
      },
      category: {
        en: "ALIREZA • Leather Goods",
        de: "ALIREZA • Lederwaren",
        fa: "ALIREZA • کیف و چرم",
      },
      priceUSD: 240,
      image: "assets/products/w-03.webp",
      width: 600,
      height: 600,
      optionType: "bag",
      sizes: BAG_SIZES,
      variants: buildVariants(10300, BAG_SIZES),
    },
    {
      id: "w-04",
      gender: "women",
      name: {
        en: "Silver Mesh & Leather Runner Sneaker",
        de: "Silberner Mesh- & Leder-Runner",
        fa: "کتانی رانر سفید و نقره‌ای",
      },
      category: {
        en: "ALIREZA • Women Footwear",
        de: "ALIREZA • Damen Schuhe",
        fa: "ALIREZA • کفش زنانه",
      },
      priceUSD: 195,
      image: "assets/products/w-04.webp",
      width: 600,
      height: 600,
      optionType: "footwear",
      sizes: WOMEN_SHOE_SIZES,
      variants: buildVariants(10400, WOMEN_SHOE_SIZES),
    },
    {
      id: "w-05",
      gender: "women",
      name: {
        en: "Oversized Cream Wool Blazer",
        de: "Oversized Wollblazer in Creme",
        fa: "کت بلیزر پشمی کرم اورسایز",
      },
      category: {
        en: "ALIREZA • Atelier Tailoring",
        de: "ALIREZA • Atelier Blazer",
        fa: "ALIREZA • کت رسمی زنانه",
      },
      priceUSD: 290,
      image: "assets/products/w-05.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(10500, APPAREL_SIZES),
    },
    {
      id: "w-06",
      gender: "women",
      name: {
        en: "Vintage Washed Baggy Wide Denim",
        de: "Vintage-Washed Baggy-Jeans",
        fa: "شلوار جین بگ سنگ‌شور آبی روشن",
      },
      category: {
        en: "ALIREZA • Denim Studio",
        de: "ALIREZA • Denim Studio",
        fa: "ALIREZA • جین زنانه",
      },
      priceUSD: 175,
      image: "assets/products/w-06.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(10600, APPAREL_SIZES),
    },
    {
      id: "w-07",
      gender: "women",
      name: {
        en: "Burgundy Top-Handle Mini Bag",
        de: "Burgunderrote Mini-Henkeltasche",
        fa: "کیف دستی مینی چرم زرشکی",
      },
      category: {
        en: "ALIREZA • Leather Goods",
        de: "ALIREZA • Lederwaren",
        fa: "ALIREZA • کیف و چرم",
      },
      priceUSD: 260,
      image: "assets/products/w-07.webp",
      width: 600,
      height: 600,
      optionType: "bag",
      sizes: BAG_SIZES,
      variants: buildVariants(10700, BAG_SIZES),
    },
    {
      id: "w-08",
      gender: "women",
      name: {
        en: "Pointed Black Leather Ankle Boots",
        de: "Spitze Stiefeletten aus Glattleder",
        fa: "نیم‌بوت چرم مشکی پاشنه‌مکعبی",
      },
      category: {
        en: "ALIREZA • Women Footwear",
        de: "ALIREZA • Damen Stiefel",
        fa: "ALIREZA • نیم‌بوت زنانه",
      },
      priceUSD: 235,
      image: "assets/products/w-08.webp",
      width: 600,
      height: 600,
      optionType: "footwear",
      sizes: WOMEN_SHOE_SIZES,
      variants: buildVariants(10800, WOMEN_SHOE_SIZES),
    },
    {
      id: "w-09",
      gender: "women",
      name: {
        en: "Olive Heavyweight Boxy Hoodie",
        de: "Schwerer Boxy-Hoodie in Olivgrün",
        fa: "هودی ضخیم سبز زیتونی",
      },
      category: {
        en: "ALIREZA • Street Essentials",
        de: "ALIREZA • Street Essentials",
        fa: "ALIREZA • هودی و سویشرت",
      },
      priceUSD: 155,
      image: "assets/products/w-09.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(10900, APPAREL_SIZES),
    },
    {
      id: "w-10",
      gender: "women",
      name: {
        en: "Espresso Ribbed Knit Midi Dress",
        de: "Geripptes Strick-Midikleid in Espresso",
        fa: "پیراهن میدی بافت قهوه‌ای اسپرسو",
      },
      category: {
        en: "ALIREZA • Knitwear Atelier",
        de: "ALIREZA • Strick-Atelier",
        fa: "ALIREZA • پیراهن زنانه",
      },
      priceUSD: 210,
      image: "assets/products/w-10.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(11000, APPAREL_SIZES),
    },

    // =========================================================================
    // MEN'S COLLECTION (man-01.webp .. man-10.webp)
    // =========================================================================
    {
      id: "man-01",
      gender: "men",
      name: {
        en: "Charcoal Ribbed Crewneck Knit",
        de: "Schwerer Rippenstrick-Pullover",
        fa: "پلیور بافت یقه گرد ذغالی",
      },
      category: {
        en: "ALIREZA • Men Knitwear",
        de: "ALIREZA • Herren Strick",
        fa: "ALIREZA • بافت مردانه",
      },
      priceUSD: 175,
      image: "assets/products/man-01.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20100, APPAREL_SIZES),
    },
    {
      id: "man-02",
      gender: "men",
      name: {
        en: "Washed Light-Blue Carpenter Denim",
        de: "Hellblaue Carpenter-Denim-Jeans",
        fa: "شلوار جین کارپنتر آبی روشن",
      },
      category: {
        en: "ALIREZA • Men Denim",
        de: "ALIREZA • Herren Denim",
        fa: "ALIREZA • شلوار جین مردانه",
      },
      priceUSD: 180,
      image: "assets/products/man-02.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20200, APPAREL_SIZES),
    },
    {
      id: "man-03",
      gender: "men",
      name: {
        en: "Matte Black Leather Sling Bag",
        de: "Mattschwarze Leder-Sling-Bag",
        fa: "کوله تک‌بند چرم مشکی مات",
      },
      category: {
        en: "ALIREZA • Men Accessories",
        de: "ALIREZA • Herren Accessoires",
        fa: "ALIREZA • کیف و اکسسوری مردانه",
      },
      priceUSD: 215,
      image: "assets/products/man-03.webp",
      width: 600,
      height: 600,
      optionType: "bag",
      sizes: BAG_SIZES,
      variants: buildVariants(20300, BAG_SIZES),
    },
    {
      id: "man-04",
      gender: "men",
      name: {
        en: "Retro Grey Suede & Cream Sneaker",
        de: "Retro-Sneaker aus Wildleder & Creme",
        fa: "کتانی رترو جیر طوسی و کرم",
      },
      category: {
        en: "ALIREZA • Men Footwear",
        de: "ALIREZA • Herren Schuhe",
        fa: "ALIREZA • کفش مردانه",
      },
      priceUSD: 190,
      image: "assets/products/man-04.webp",
      width: 600,
      height: 600,
      optionType: "footwear",
      sizes: MEN_SHOE_SIZES,
      variants: buildVariants(20400, MEN_SHOE_SIZES),
    },
    {
      id: "man-05",
      gender: "men",
      name: {
        en: "Boxy Off-White Heavy Cotton Tee",
        de: "Schweres Boxy-T-Shirt in Off-White",
        fa: "تیشرت ضخیم باکسی سفید شیری",
      },
      category: {
        en: "ALIREZA • Core Jersey",
        de: "ALIREZA • Core Jersey",
        fa: "ALIREZA • تیشرت مردانه",
      },
      priceUSD: 95,
      image: "assets/products/man-05.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20500, APPAREL_SIZES),
    },
    {
      id: "man-06",
      gender: "men",
      name: {
        en: "Pleated Sand-Beige Wide Trousers",
        de: "Weite Bundfaltenhose in Sandbeige",
        fa: "شلوار واید پیلی‌دار بژ شنی",
      },
      category: {
        en: "ALIREZA • Men Tailoring",
        de: "ALIREZA • Herren Hosen",
        fa: "ALIREZA • شلوار پارچه‌ای مردانه",
      },
      priceUSD: 185,
      image: "assets/products/man-06.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20600, APPAREL_SIZES),
    },
    {
      id: "man-07",
      gender: "men",
      name: {
        en: "Noir Full-Grain Leather Bomber",
        de: "Vollnarben-Leder-Bomberjacke",
        fa: "کت بامبر چرم طبیعی مشکی",
      },
      category: {
        en: "ALIREZA • Men Outerwear",
        de: "ALIREZA • Herren Jacken",
        fa: "ALIREZA • کت چرم مردانه",
      },
      priceUSD: 380,
      image: "assets/products/man-07.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20700, APPAREL_SIZES),
    },
    {
      id: "man-08",
      gender: "men",
      name: {
        en: "Chunky Black Leather Derby Shoes",
        de: "Markante Derby-Schuhe aus Glattleder",
        fa: "کفش دربی چرم مشکی لژدار",
      },
      category: {
        en: "ALIREZA • Men Footwear",
        de: "ALIREZA • Herren Schuhe",
        fa: "ALIREZA • کفش رسمی مردانه",
      },
      priceUSD: 245,
      image: "assets/products/man-08.webp",
      width: 600,
      height: 600,
      optionType: "footwear",
      sizes: MEN_SHOE_SIZES,
      variants: buildVariants(20800, MEN_SHOE_SIZES),
    },
    {
      id: "man-09",
      gender: "men",
      name: {
        en: "Forest Green Oversized Zip Hoodie",
        de: "Oversized Zip-Hoodie in Waldgrün",
        fa: "هودی زیپ‌دار اورسایز سبز جنگلی",
      },
      category: {
        en: "ALIREZA • Street Essentials",
        de: "ALIREZA • Street Essentials",
        fa: "ALIREZA • هودی مردانه",
      },
      priceUSD: 165,
      image: "assets/products/man-09.webp",
      width: 600,
      height: 750,
      optionType: "apparel",
      sizes: APPAREL_SIZES,
      variants: buildVariants(20900, APPAREL_SIZES),
    },
    {
      id: "man-10",
      gender: "men",
      name: {
        en: "Olive Heavy Canvas & Leather Tote",
        de: "Olivgrüne Canvas- & Leder-Tote",
        fa: "کیف دستی برزنتی زیتونی با بند چرم",
      },
      category: {
        en: "ALIREZA • Men Accessories",
        de: "ALIREZA • Herren Taschen",
        fa: "ALIREZA • کیف مردانه",
      },
      priceUSD: 195,
      image: "assets/products/man-10.webp",
      width: 600,
      height: 600,
      optionType: "bag",
      sizes: BAG_SIZES,
      variants: buildVariants(21000, BAG_SIZES),
    },
  ];

  /** @type {Map<string, RunwayProduct>} */
  const productById = new Map();
  PRODUCTS.forEach((p) => {
    productById.set(p.id, p);
  });

  /** @type {Map<number, { product: RunwayProduct, variant: ProductVariant }>} */
  const variantById = new Map();
  PRODUCTS.forEach((product) => {
    product.variants.forEach((variant) => {
      variantById.set(variant.id, { product, variant });
    });
  });

  ns.catalog = {
    PRODUCTS,
    productById,
    variantById,
  };
})();
