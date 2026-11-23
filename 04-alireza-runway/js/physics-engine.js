// @ts-check
"use strict";

/**
 * @typedef {{
 *   el: HTMLElement,
 *   lookIdx: number,
 *   hit: HTMLButtonElement,
 *   w: number,
 *   lastBlur: string,
 *   x: number,
 *   g: number,
 *   goal: number,
 *   v: number,
 *   from: number,
 *   trip: boolean
 * }} RunwayBodyState
 */

(function initPhysicsEngineModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  /** @type {Map<string, number>} */
  const footOffsetCache = new Map();

  /**
   * Scans transparent alpha channel from bottom up to align soles on ground line
   * @param {string} imageUrl
   * @param {(footOffset: number) => void} callback
   */
  function probeFeetOffset(imageUrl, callback) {
    if (!imageUrl) return;
    if (footOffsetCache.has(imageUrl)) {
      callback(/** @type {number} */ (footOffsetCache.get(imageUrl)));
      return;
    }

    const probeImg = new Image();
    probeImg.decoding = "async";
    probeImg.onload = () => {
      try {
        const w = 48;
        const h = Math.max(
          1,
          Math.round((w * probeImg.naturalHeight) / probeImg.naturalWidth),
        );
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(probeImg, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let lastRow = h - 1;

        outer: for (let y = h - 1; y >= 0; y--) {
          for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 36) {
              lastRow = y;
              break outer;
            }
          }
        }

        const foot = Math.max(0, Math.min(0.4, (h - 1 - lastRow) / h));
        footOffsetCache.set(imageUrl, foot);
        callback(foot);
      } catch {
        // Fallback silently to 0 offset if canvas read fails
      }
    };
    probeImg.src = imageUrl;
  }

  /**
   * Positions a single body on GPU composite layer
   * @param {RunwayBodyState} body
   * @param {number} stageW
   * @param {number} x
   * @param {number} bottom
   * @param {number} scale
   * @param {number} opacity
   * @param {number} blur
   * @param {number} zIndex
   */
  function placeBody(body, stageW, x, bottom, scale, opacity, blur, zIndex) {
    const halfW = (body.w * scale) / 2;
    if (x + halfW < -6 || x - halfW > stageW + 6) {
      opacity = 0;
    }

    body.el.style.transform = `translate3d(${x.toFixed(2)}px, ${(-bottom).toFixed(2)}px, 0) translateX(-50%) scale(${scale.toFixed(4)})`;
    body.el.style.opacity = opacity.toFixed(3);
    body.el.style.zIndex = String(zIndex);
    body.el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
    body.el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";

    const blurRounded = Math.round(blur * 10) / 10;
    const nextFilter = blurRounded > 0.05 ? `blur(${blurRounded}px)` : "";
    if (body.lastBlur !== nextFilter) {
      body.el.style.filter = nextFilter;
      body.lastBlur = nextFilter;
    }
  }

  /**
   * Desktop 3D Depth Ring renderer
   * @param {{
   *   bodies: RunwayBodyState[],
   *   stageW: number,
   *   stageH: number,
   *   cur: number,
   *   still: boolean,
   *   enableBlur: boolean
   * }} params
   */
  function renderRingStage(params) {
    const { bodies, stageW, stageH, cur, still, enableBlur } = params;
    const count = bodies.length;
    if (count === 0) return;

    const cx = 0.5 * stageW;
    const R = 0.62 * stageW;
    const P = 1.65 * stageW;
    const bottomMargin = stageH < 340 ? 18 : 32;
    const floor = stageH - bottomMargin;
    const horizon = 0.36 * stageH;
    const step = (2 * Math.PI) / count;
    const frontBoostMax = 1.08;

    for (let a = 0; a < count; a++) {
      const s = bodies[a];
      let phi = ((a - cur) * step) % (2 * Math.PI);
      if (phi > Math.PI) phi -= 2 * Math.PI;
      if (phi <= -Math.PI) phi += 2 * Math.PI;

      const z = R * (1 - Math.cos(phi));
      const persp = P / (P + z);
      const sl = Math.abs(phi) / step;
      const t = Math.max(0, Math.min(1, 1 - sl));
      const smoothT = t * t * (3 - 2 * t);
      const boost = 1 + (frontBoostMax - 1) * smoothT;
      const scale = persp * boost;
      const x = cx + R * Math.sin(phi) * persp;
      const feet = horizon + (floor - horizon) * persp;
      const bottom = stageH - feet;
      const blur = enableBlur
        ? sl <= 1
          ? 1.8 * sl
          : Math.min(1.8 + (sl - 1) * 1.9, 6.2)
        : 0;
      let opacity = Math.max(0, Math.min(1, (Math.cos(phi) + 0.55) / 0.3));

      if (still && sl < 0.02) {
        opacity = 0;
      }

      const zIdx = Math.round(scale * 1000);
      placeBody(s, stageW, x, bottom, scale, opacity, blur, zIdx);
    }
  }

  /**
   * Mobile diagonal classic line renderer (optimized for Android & iOS GPU)
   * @param {{
   *   bodies: RunwayBodyState[],
   *   stageW: number,
   *   still: boolean,
   *   isRTL: boolean
   * }} params
   */
  function renderClassicMobileStage(params) {
    const { bodies, stageW, still, isRTL } = params;
    const count = bodies.length;
    if (count === 0) return;

    const isWideMobile = stageW > 520;
    const ax = isWideMobile ? 0.36 : 0.3;
    const ay = 18;
    const sx = isWideMobile ? 0.24 : 0.32;
    const sy = 18;
    const sr = 0.76;
    const ex = 0.55;
    const maxDepth = 4;

    /**
     * @param {number} normX
     * @returns {number}
     */
    const mapX = (normX) => (isRTL ? stageW * (1 - normX) : stageW * normX);

    for (let a = 0; a < count; a++) {
      const s = bodies[a];
      let k = s.x;
      let e = -1;

      if (s.trip) {
        const span = Math.abs(s.goal - s.from);
        const rawU = span > 0.0001 ? Math.abs(s.x - s.from) / span : 1;
        const u = Math.max(0, Math.min(1, rawU));
        if (s.goal > s.from) {
          if (u < 0.5) e = 2 * u * 1.4;
          else k = s.goal + 2 * (1 - u);
        } else {
          if (u < 0.5) k = s.from + 2 * u;
          else e = 2 * (1 - u) * 1.4;
        }
      } else if (k < 0) {
        e = Math.min(-k, 1.4);
      }

      if (e >= 0) {
        const x = mapX(ax - ex * e);
        const bottom = ay - 18 * e;
        const scale = 1 + 0.14 * e;
        const opacity = Math.max(0, 1 - 1.05 * e);
        const blur = 3.2 * Math.min(e, 1);
        placeBody(s, stageW, x, bottom, scale, opacity, blur, 1100);
      } else {
        const x = mapX(ax + sx * k);
        const bottom = ay + sy * k;
        const scale = Math.pow(sr, k);
        let opacity =
          k <= maxDepth - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (4 - k));
        if (still && Math.abs(k) < 0.02) {
          opacity = 0;
        }
        const blur = Math.min(0.8 * k, 2.6);
        const zIdx = 1000 - Math.round(10 * k);
        placeBody(s, stageW, x, bottom, scale, opacity, blur, zIdx);
      }
    }
  }

  ns.physics = {
    probeFeetOffset,
    renderRingStage,
    renderClassicMobileStage,
  };
})();
