// @ts-check
"use strict";

(function initRunwayAppModule() {
  /** @type {any} */
  const win = window;
  /** @type {Record<string, any>} */
  const ns = (win.AlirezaRunway = win.AlirezaRunway || {});

  const THEME_STORAGE_KEY = "alireza_runway_theme_v1";

  class RunwaySection extends HTMLElement {
    constructor() {
      super();
      this.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      this.finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;

      /** @type {any} */
      this.bag = null;
      /** @type {"en" | "de" | "fa"} */
      this.lang = ns.i18n.getInitialLanguage();
      /** @type {"all" | "women" | "men"} */
      this.collection = "all";
      /** @type {any[]} */
      this.looks = ns.looksData.getLooksByCollection(this.collection);
      /** @type {Set<string>} */
      this.addedKeys = new Set();

      this.n = this.looks.length;
      this.N = ns.domBuilder.getRingBodyCount(this.n);
      this.index = 0;
      this.target = 0;
      const startOffset = this.reducedMotion ? 0 : 1.15;
      this.cur = -startOffset;
      this.vel = 0;
      this.still = false;

      this.playing = false;
      this.engaged = false;
      this.panelHover = false;
      this.zoomed = false;
      this.visible = true;
      this.dragging = false;
      this.suppressClickUntil = 0;

      this.K = 95;
      this.C = 2 * Math.sqrt(this.K);
      /** @type {any[]} */
      this.bodies = [];
      /** @type {HTMLElement[]} */
      this.heroes = [];
      /** @type {HTMLElement[]} */
      this.panels = [];
      /** @type {HTMLElement[]} */
      this.ticks = [];
      /** @type {number[]} */
      this.footOffsets = [];

      this.stageW = 800;
      this.stageH = 600;
      this.unit = 240;
      this.isMobile = window.innerWidth <= 749;
      this.latchedVH = window.innerHeight;
      this.lastW = window.innerWidth;

      /** @type {number | null} */
      this.rafId = null;
      /** @type {number | null} */
      this.measureRaf = null;
      this.lastFrameTime = 0;
      /** @type {number | undefined} */
      this.autoTimer = undefined;
      this.wheelLockUntil = 0;
      this.wheelAcc = 0;

      this.cursorX = 0;
      this.cursorY = 0;
      this.cursorTX = 0;
      this.cursorTY = 0;
      /** @type {number | null} */
      this.cursorRaf = null;
      this.cursorActive = false;

      /** @type {{ card: HTMLElement, picker: HTMLElement, addBtn: HTMLElement } | null} */
      this.activeSheet = null;
      /** @type {HTMLDivElement | null} */
      this.sheetHost = null;

      /** @type {HTMLElement | null} */
      this.stageEl = null;
      /** @type {HTMLElement | null} */
      this.panelEl = null;
      /** @type {HTMLElement | null} */
      this.liveEl = null;
      /** @type {HTMLElement | null} */
      this.piecesEl = null;
      /** @type {HTMLElement | null} */
      this.autoBtn = null;
      /** @type {HTMLElement | null} */
      this.cursorEl = null;
      /** @type {HTMLElement | null} */
      this.lbEl = null;
      /** @type {HTMLElement | null} */
      this.lbStageEl = null;
      /** @type {HTMLElement | null} */
      this.lbKickerEl = null;
      /** @type {HTMLElement | null} */
      this.lbNameEl = null;

      /** @type {IntersectionObserver | null} */
      this.revealObs = null;
      /** @type {IntersectionObserver | null} */
      this.visObs = null;
      /** @type {ResizeObserver | null} */
      this.resizeObs = null;

      /** @type {() => void} */
      this.onWindowResize = () => {};
      /** @type {() => void} */
      this.onVisChange = () => {};
    }

    connectedCallback() {
      this.bag = new ns.StylingBag(this.lang);

      this.stageEl = this.querySelector("[data-rw-stage]");
      this.panelEl = this.querySelector(".rw__panel");
      this.liveEl = this.querySelector("[data-rw-live]");
      this.piecesEl = this.querySelector("[data-rw-pieces]");
      this.autoBtn = this.querySelector("[data-rw-auto]");
      this.cursorEl = this.querySelector("[data-rw-cursor]");
      this.lbEl = this.querySelector("[data-rw-lb]");
      this.lbStageEl = this.querySelector("[data-rw-lb-stage]");
      this.lbKickerEl = this.querySelector("[data-rw-lb-kicker]");
      this.lbNameEl = this.querySelector("[data-rw-lb-name]");

      if (!this.stageEl || !this.panelEl) return;

      this.rebuildStage(true);
      this.setupCursor();
      this.bindEvents();

      this.classList.add("rw--js");

      if (this.reducedMotion) {
        this.classList.add("is-revealed");
        this.cur = 0;
        this.setStill(true);
        this.renderAll();
      } else {
        this.revealObs = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              this.revealObs?.disconnect();
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  this.classList.add("is-revealed");
                });
              });
            }
          },
          { threshold: 0, rootMargin: "0px 0px -15% 0px" },
        );
        this.revealObs.observe(this);
      }

      this.visObs = new IntersectionObserver(
        (entries) => {
          this.visible = entries[0]?.isIntersecting ?? true;
          if (this.visible) {
            this.kick();
            this.restartAutoTimer();
          }
        },
        { threshold: 0 },
      );
      this.visObs.observe(this);

      if (
        this.getAttribute("data-autoplay") === "true" &&
        !this.reducedMotion
      ) {
        this.play(true);
      }

      this.kick();
    }

    disconnectedCallback() {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      if (this.measureRaf !== null) cancelAnimationFrame(this.measureRaf);
      if (this.cursorRaf !== null) cancelAnimationFrame(this.cursorRaf);
      window.clearTimeout(this.autoTimer);
      this.revealObs?.disconnect();
      this.visObs?.disconnect();
      this.resizeObs?.disconnect();
      window.removeEventListener("resize", this.onWindowResize);
      document.removeEventListener("visibilitychange", this.onVisChange);
      this.closeSheet(true);
      this.sheetHost?.remove();
    }

    /**
     * @param {"all" | "women" | "men"} nextCollection
     */
    setCollection(nextCollection) {
      if (this.collection === nextCollection) return;
      this.collection = nextCollection;
      this.setAttribute("data-collection", nextCollection);
      this.looks = ns.looksData.getLooksByCollection(nextCollection);
      this.index = 0;
      this.target = 0;
      this.cur = this.reducedMotion ? 0 : -0.85;
      this.vel = 0;
      this.closePopup();
      this.closeSheet(true);
      this.rebuildStage(false);
    }

    /**
     * @param {"en" | "de" | "fa"} nextLang
     */
    setLanguage(nextLang) {
      this.lang = nextLang;
      this.bag?.setLang(nextLang);
      this.closePopup();
      this.closeSheet(true);
      this.rebuildStage(true);
    }

    /**
     * Rebuilds actors, heroes, ticks, and panels while preserving state
     * @param {boolean} keepPosition
     */
    rebuildStage(keepPosition) {
      this.n = this.looks.length;
      this.N = ns.domBuilder.getRingBodyCount(this.n);
      this.index = keepPosition ? Math.min(this.index, this.n - 1) : 0;
      this.footOffsets = new Array(this.n).fill(0);

      ns.domBuilder.renderRunwayDOM({
        root: this,
        looks: this.looks,
        lang: this.lang,
        addedKeys: this.addedKeys,
        activeIndex: this.index,
      });

      this.heroes = Array.from(this.querySelectorAll("[data-rw-hero]"));
      this.ticks = Array.from(this.querySelectorAll("[data-rw-tick]"));
      this.panels = Array.from(this.querySelectorAll("[data-rw-panel]"));

      const startOffset = this.reducedMotion || keepPosition ? 0 : 1.15;
      this.bodies = Array.from(this.querySelectorAll("[data-rw-model]")).map(
        (node, a) => {
          const el = /** @type {HTMLElement} */ (node);
          const hit = /** @type {HTMLButtonElement} */ (
            el.querySelector(".rw__hit")
          );
          return {
            el,
            lookIdx: a % this.n,
            hit,
            w: 240,
            lastBlur: "",
            x: a + startOffset,
            g: a,
            goal: a,
            v: 0,
            from: a,
            trip: false,
          };
        },
      );

      // Hydrate product variant data on cards
      this.panels.forEach((panel) => {
        panel.querySelectorAll("[data-rw-card]").forEach((node) => {
          const card = /** @type {HTMLElement} */ (node);
          const picker = card.querySelector("[data-rw-picker]");
          const jsonScript = picker?.querySelector("[data-rw-variants]");
          /** @type {any} */ (card)._variants = jsonScript
            ? JSON.parse(jsonScript.textContent || "[]")
            : [];
          this.syncCardOptions(card, false);
        });
      });

      this.measure();
      this.probeAllFeet();
      this.setIndex(this.index, true);
      this.kick();
    }

    probeAllFeet() {
      this.heroes.forEach((hero, lookIdx) => {
        const url = hero.getAttribute("data-probe");
        if (!url) return;

        /** @param {number} foot */
        const onFootMeasured = (foot) => {
          this.footOffsets[lookIdx] = foot;
          hero.style.setProperty("--rw-foot", foot.toFixed(4));
          this.bodies.forEach((b) => {
            if (b.lookIdx === lookIdx) {
              b.el.style.setProperty("--rw-foot", foot.toFixed(4));
            }
          });
        };

        ns.physics.probeFeetOffset(url, onFootMeasured);
      });
    }

    measure() {
      const stage = this.stageEl;
      if (!stage) return;

      const wasMobile = this.isMobile;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      this.isMobile = winW <= 749;

      if (wasMobile && !this.isMobile) {
        this.closeSheet(true);
      }

      let headerH = 0;
      document
        .querySelectorAll(".shopify-section-group-header-group")
        .forEach((node) => {
          const el = /** @type {HTMLElement} */ (node);
          if (!el.contains(this) && el.offsetParent !== null) {
            headerH += el.offsetHeight;
          }
        });

      if (this.isMobile) {
        if (winW !== this.lastW || Math.abs(winH - this.latchedVH) >= 160) {
          this.latchedVH = winH;
          this.lastW = winW;
        }
        const frameH = Math.max(460, this.latchedVH - headerH);
        this.style.setProperty("--rw-frame-h", `${frameH}px`);
      } else {
        const frameH = Math.max(380, winH - headerH);
        this.style.setProperty("--rw-frame-h", `${frameH}px`);
      }

      const rect = stage.getBoundingClientRect();
      this.stageW = Math.max(200, rect.width);
      this.stageH = Math.max(180, rect.height);

      const fs = this.isMobile ? 1 : 1.08;
      this.style.setProperty("--rw-fs", String(fs));

      const modelH = this.isMobile
        ? Math.max(120, Math.round(this.stageH - 28))
        : Math.max(120, Math.round((this.stageH - 42) / 1.08));
      stage.style.setProperty("--rw-model-h", `${modelH}px`);

      const isRTL = document.documentElement.dir === "rtl";
      const isWideMobile = this.stageW > 520;
      const mobileAnchor = isWideMobile ? 0.36 : 0.3;
      const hx = this.isMobile
        ? (isRTL ? 1 - mobileAnchor : mobileAnchor) * this.stageW
        : 0.5 * this.stageW;
      const hy = this.isMobile ? 18 : this.stageH < 340 ? 18 : 32;
      stage.style.setProperty("--rw-hx", `${hx}px`);
      stage.style.setProperty("--rw-hy", `${hy}px`);

      this.unit = this.isMobile
        ? Math.max(90, this.stageW * 0.32 * 1.6)
        : Math.max(120, 0.3 * this.stageW);

      this.bodies.forEach((b) => {
        b.w = b.el.offsetWidth || modelH * 0.5625;
      });

      this.renderAll();
    }

    /**
     * @param {number} val
     * @returns {number}
     */
    wrapN(val) {
      return ((val % this.N) + this.N) % this.N;
    }

    /**
     * @param {number} val
     * @returns {number}
     */
    wrapIndex(val) {
      return ((val % this.n) + this.n) % this.n;
    }

    /**
     * @param {boolean} nextStill
     */
    setStill(nextStill) {
      if (this.still === nextStill) return;
      this.still = nextStill;
      this.classList.toggle("rw--still", nextStill);
    }

    renderAll() {
      const isRTL = document.documentElement.dir === "rtl";
      if (this.isMobile) {
        ns.physics.renderClassicMobileStage({
          bodies: this.bodies,
          stageW: this.stageW,
          still: this.still,
          isRTL,
        });
      } else {
        ns.physics.renderRingStage({
          bodies: this.bodies,
          stageW: this.stageW,
          stageH: this.stageH,
          cur: this.cur,
          still: this.still,
          enableBlur: this.getAttribute("data-blur") === "true",
        });
      }
    }

    kick() {
      if (this.rafId !== null) return;
      this.lastFrameTime = 0;

      /** @param {number} now */
      const stepFrame = (now) => {
        if (!this.visible || document.hidden) {
          this.rafId = null;
          return;
        }

        const dt =
          this.lastFrameTime === 0
            ? 1 / 60
            : Math.min(0.034, (now - this.lastFrameTime) / 1000);
        this.lastFrameTime = now;

        let settled = true;

        if (!this.isMobile) {
          if (this.reducedMotion || this.dragging) {
            this.cur = this.target;
            this.vel = 0;
            settled = !this.dragging;
          } else {
            const h = dt / 3;
            for (let sub = 0; sub < 3; sub++) {
              const acc =
                -this.K * (this.cur - this.target) - this.C * this.vel;
              this.vel += acc * h;
              this.cur += this.vel * h;
            }
            if (
              Math.abs(this.cur - this.target) <= 0.0005 &&
              Math.abs(this.vel) <= 0.0005
            ) {
              this.cur = this.target;
              this.vel = 0;
            } else {
              settled = false;
            }
          }
        } else {
          for (let a = 0; a < this.N; a++) {
            const s = this.bodies[a];
            const newGoal = this.wrapN(a - this.target);
            if (!s.trip && Math.abs(newGoal - s.goal) > this.N / 2) {
              s.from = s.x;
              s.trip = true;
            }
            s.goal = newGoal;

            if (this.reducedMotion) {
              s.x = s.goal;
              s.g = s.goal;
              s.v = 0;
              s.trip = false;
              continue;
            }

            const tau = this.dragging
              ? 0.016
              : s.trip
                ? 0.1
                : 0.03 + 0.04 * Math.min(s.goal, 4);
            s.g += (s.goal - s.g) * (1 - Math.exp(-dt / tau));

            const h = dt / 3;
            for (let sub = 0; sub < 3; sub++) {
              const acc = -this.K * (s.x - s.g) - this.C * s.v;
              s.v += acc * h;
              s.x += s.v * h;
            }

            if (s.trip && Math.abs(s.x - s.goal) < 0.02) {
              s.trip = false;
            }

            if (
              Math.abs(s.x - s.goal) <= 0.0006 &&
              Math.abs(s.v) <= 0.0006 &&
              !s.trip
            ) {
              s.x = s.goal;
              s.g = s.goal;
              s.v = 0;
            } else {
              settled = false;
            }
          }
          if (this.dragging) settled = false;
        }

        if (!settled) {
          this.setStill(false);
          this.renderAll();
          this.rafId = requestAnimationFrame(stepFrame);
        } else {
          this.setStill(true);
          this.renderAll();
          this.rafId = null;
        }
      };

      this.rafId = requestAnimationFrame(stepFrame);
    }

    /**
     * @param {number} nextIdx
     * @param {boolean} silent
     */
    setIndex(nextIdx, silent = false) {
      const i = this.wrapIndex(nextIdx);
      this.index = i;

      this.bodies.forEach((b, a) => {
        let rank = this.wrapN(a - Math.round(this.target));
        if (!this.isMobile && rank > this.N / 2) rank -= this.N;
        const maxVisible = this.isMobile ? 3 : 2;
        const accessible = rank !== 0 && Math.abs(rank) <= maxVisible;
        b.hit.tabIndex = accessible ? 0 : -1;
        b.el.setAttribute("aria-hidden", accessible ? "false" : "true");
      });

      this.style.setProperty("--rw-progress", ((i + 1) / this.n).toFixed(3));

      this.heroes.forEach((hero, hIdx) => {
        const active = hIdx === i;
        hero.classList.toggle("is-on", active);
        hero.setAttribute("aria-hidden", active ? "false" : "true");
        const zoomBtn = /** @type {HTMLElement | null} */ (
          hero.querySelector("[data-rw-zoom]")
        );
        if (zoomBtn) zoomBtn.tabIndex = active ? 0 : -1;
      });

      this.ticks.forEach((tick, tIdx) => {
        tick.setAttribute("aria-current", tIdx === i ? "true" : "false");
        tick.classList.toggle("is-past", tIdx < i);
      });

      if (!silent) {
        if (this.zoomed) this.closePopup();
        if (this.isMobile) this.closeSheet(true);

        if (!this.reducedMotion && this.stageEl) {
          this.stageEl.classList.remove("is-sweep");
          void this.stageEl.offsetWidth;
          this.stageEl.classList.add("is-sweep");
        }

        const look = this.looks[i];
        const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;
        if (this.liveEl && look) {
          this.liveEl.textContent = `${dict.lookWord} ${i + 1}: ${ns.i18n.pickText(look.name, this.lang)}`;
        }

        this.panels.forEach((panel, pIdx) => {
          const isCurrent = pIdx === i;
          panel.hidden = !isCurrent;
          panel.classList.remove("is-in");
          if (isCurrent) {
            void panel.offsetWidth;
            panel.classList.add("is-in");
          }
        });

        if (this.piecesEl) {
          const tpl = this.panels[i]?.querySelector("[data-rw-pieces-text]");
          this.piecesEl.textContent = tpl?.textContent || "";
        }
      }

      this.clearHot();
      this.restartAutoBar();
      this.kick();
    }

    /**
     * @param {number} T
     */
    moveTo(T) {
      this.target = T;
      this.setStill(false);
      this.setIndex(T, false);
    }

    next() {
      this.moveTo(Math.round(this.target) + 1);
    }

    prev() {
      this.moveTo(Math.round(this.target) - 1);
    }

    /**
     * @param {number} i
     */
    go(i) {
      let d = (i - this.index) % this.n;
      if (d < 0) d += this.n;
      if (d > this.n / 2) d -= this.n;
      this.moveTo(Math.round(this.target) + d);
    }

    /**
     * @param {boolean} nextState
     */
    play(nextState) {
      this.playing = Boolean(nextState);
      this.classList.toggle("is-playing", this.playing);
      if (this.autoBtn) {
        this.autoBtn.classList.toggle("is-playing", this.playing);
        this.autoBtn.setAttribute("aria-pressed", String(this.playing));
      }
      this.restartAutoBar();
      this.restartAutoTimer();
    }

    engage() {
      if (this.engaged) return;
      this.engaged = true;
      this.play(false);
    }

    restartAutoBar() {
      this.ticks.forEach((t) => t.classList.remove("is-run"));
      if (!this.playing) return;
      const currentTick = this.ticks[this.index];
      if (!currentTick) return;
      void currentTick.offsetWidth;
      currentTick.classList.add("is-run");
    }

    restartAutoTimer() {
      window.clearTimeout(this.autoTimer);
      if (!this.playing) return;
      const speed = Number(this.getAttribute("data-speed")) || 5000;
      this.autoTimer = window.setTimeout(() => {
        if (
          this.playing &&
          this.visible &&
          !this.dragging &&
          !document.hidden &&
          !this.panelHover &&
          !this.zoomed &&
          !this.engaged
        ) {
          this.next();
        } else {
          this.restartAutoBar();
          this.restartAutoTimer();
        }
      }, speed);
    }

    setupCursor() {
      const stage = this.stageEl;
      const cursor = this.cursorEl;
      if (!this.finePointer || !cursor || !stage) {
        cursor?.remove();
        return;
      }
      this.classList.add("rw--cursor");

      const lerpStep = () => {
        const factor = this.reducedMotion ? 1 : 0.18;
        this.cursorX += (this.cursorTX - this.cursorX) * factor;
        this.cursorY += (this.cursorTY - this.cursorY) * factor;
        cursor.style.transform = `translate3d(${this.cursorX.toFixed(1)}px, ${this.cursorY.toFixed(1)}px, 0)`;

        if (
          Math.abs(this.cursorTX - this.cursorX) > 0.2 ||
          Math.abs(this.cursorTY - this.cursorY) > 0.2
        ) {
          this.cursorRaf = requestAnimationFrame(lerpStep);
        } else {
          this.cursorRaf = null;
        }
      };

      stage.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const rect = stage.getBoundingClientRect();
        this.cursorTX = e.clientX - rect.left;
        this.cursorTY = e.clientY - rect.top;

        if (!this.cursorActive) {
          this.cursorActive = true;
          this.cursorX = this.cursorTX;
          this.cursorY = this.cursorTY;
          cursor.classList.add("is-on");
        }

        const target = /** @type {HTMLElement | null} */ (e.target);
        const overZoom = Boolean(target?.closest("[data-rw-zoom]"));
        const overLink = Boolean(
          target?.closest("[data-rw-pin], [data-rw-go]"),
        );
        cursor.classList.toggle("is-view", overZoom && !this.dragging);
        cursor.classList.toggle("is-link", overLink && !this.dragging);

        if (this.cursorRaf === null) {
          this.cursorRaf = requestAnimationFrame(lerpStep);
        }
      });

      stage.addEventListener("pointerleave", () => {
        this.cursorActive = false;
        cursor.classList.remove("is-on", "is-link", "is-view");
      });
    }

    clearHot() {
      this.querySelectorAll(".is-hot").forEach((el) =>
        el.classList.remove("is-hot"),
      );
    }

    /**
     * @param {string | null} pinNum
     * @param {boolean} revealCard
     */
    hot(pinNum, revealCard = false) {
      if (!pinNum) return;
      this.clearHot();
      const pinScope = this.zoomed ? this.lbStageEl : this.heroes[this.index];
      const pin = pinScope?.querySelector(`[data-rw-pin="${pinNum}"]`);
      if (pin) pin.classList.add("is-hot");

      const panel = this.panels[this.index];
      const card = /** @type {HTMLElement | null} */ (
        panel?.querySelector(`[data-rw-card="${pinNum}"]`)
      );
      if (!card) return;
      card.classList.add("is-hot");

      if (revealCard) {
        const list = /** @type {HTMLElement | null} */ (
          panel.querySelector(".rw__items")
        );
        const behavior = this.reducedMotion ? "auto" : "smooth";
        if (list && list.scrollWidth > list.clientWidth + 4) {
          const cRect = card.getBoundingClientRect();
          const lRect = list.getBoundingClientRect();
          list.scrollBy({ left: cRect.left - lRect.left - 18, behavior });
        } else if (list && list.scrollHeight > list.clientHeight + 4) {
          list.scrollTo({
            top: card.offsetTop - list.offsetTop - 12,
            behavior,
          });
        }
      }
    }

    openPopup() {
      const lb = this.lbEl;
      const lbStage = this.lbStageEl;
      const lbKicker = this.lbKickerEl;
      const lbName = this.lbNameEl;
      if (this.zoomed || !lb || !lbStage || !lbKicker || !lbName) return;

      this.engage();
      this.clearHot();

      const hero = this.heroes[this.index];
      const runwayFig = hero?.querySelector(".rw__figure");
      const aRect = runwayFig?.getBoundingClientRect();
      if (!hero || !runwayFig) return;

      const wrap = document.createElement("div");
      wrap.className = "rw__lb-model";
      const foot = this.footOffsets[this.index] || 0;
      wrap.style.setProperty("--rw-foot", foot.toFixed(4));

      const shadowEl = hero.querySelector(".rw__shadow");
      if (shadowEl) wrap.appendChild(shadowEl.cloneNode(true));

      const figClone = /** @type {HTMLElement} */ (runwayFig.cloneNode(true));
      figClone.querySelector("[data-rw-zoom]")?.remove();
      figClone.querySelectorAll("[data-rw-pin]").forEach((node) => {
        /** @type {HTMLElement} */ (node).tabIndex = 0;
      });
      figClone.querySelectorAll("img").forEach((img) => {
        img.classList.add("is-decoded");
      });

      wrap.appendChild(figClone);
      lbStage.innerHTML = "";
      lbStage.appendChild(wrap);

      const look = this.looks[this.index];
      const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;
      const rawNum = String(this.index + 1).padStart(2, "0");
      const numLabel =
        this.lang === "fa" ? ns.i18n.toPersianDigits(rawNum) : rawNum;

      lbKicker.textContent = `${dict.lookWord} ${numLabel}`;
      lbName.textContent = ns.i18n.pickText(look.name, this.lang);

      this.zoomed = true;
      this.classList.add("rw--zoom");
      lb.setAttribute("aria-hidden", "false");

      const stRect = lbStage.getBoundingClientRect();
      const h = Math.max(150, Math.min(stRect.height, stRect.width / 0.5625));
      wrap.style.setProperty("--rw-model-h", `${Math.round(h)}px`);

      if (!this.reducedMotion && aRect && aRect.height > 0) {
        const bRect = figClone.getBoundingClientRect();
        wrap.style.transition = "none";
        wrap.style.transformOrigin = "0 100%";
        wrap.style.transform = `translate3d(${aRect.left - bRect.left}px, ${aRect.bottom - bRect.bottom}px, 0) scale(${aRect.height / bRect.height})`;
        void wrap.offsetWidth;
        wrap.style.transition = "";
        wrap.style.transform = "";
      }

      /** @type {HTMLElement | null} */ (
        this.querySelector("[data-rw-zoom-close]")
      )?.focus();
    }

    closePopup() {
      const lb = this.lbEl;
      const lbStage = this.lbStageEl;
      if (!this.zoomed || !lb || !lbStage) return;

      this.zoomed = false;
      this.clearHot();

      const wrap = /** @type {HTMLElement | null} */ (
        lbStage.querySelector(".rw__lb-model")
      );
      const figClone = wrap?.querySelector(".rw__figure");
      const hero = this.heroes[this.index];
      const runwayFig = hero?.querySelector(".rw__figure");

      if (!this.reducedMotion && wrap && figClone && runwayFig) {
        const aRect = runwayFig.getBoundingClientRect();
        const bRect = figClone.getBoundingClientRect();
        if (aRect.height > 0 && bRect.height > 0) {
          wrap.style.transformOrigin = "0 100%";
          wrap.style.transform = `translate3d(${aRect.left - bRect.left}px, ${aRect.bottom - bRect.bottom}px, 0) scale(${aRect.height / bRect.height})`;
        }
      }

      if (lb.contains(document.activeElement)) {
        this.stageEl?.focus();
      }

      this.classList.remove("rw--zoom");
      lb.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        if (!this.zoomed) lbStage.innerHTML = "";
      }, 900);
    }

    /**
     * @param {HTMLElement} card
     * @param {boolean} markTouched
     */
    syncCardOptions(card, markTouched) {
      const picker = card.querySelector("[data-rw-picker]");
      if (!picker) return;
      const checked = /** @type {HTMLInputElement | null} */ (
        picker.querySelector('input[type="radio"]:checked')
      );
      const selectedVal = checked ? checked.value : null;
      /** @type {any[]} */
      const variants = /** @type {any} */ (card)._variants || [];
      const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;

      const match = variants.find((v) => v.available && v.size === selectedVal);
      const confirmBtn = /** @type {HTMLButtonElement | null} */ (
        picker.querySelector("[data-rw-confirm]")
      );
      const confirmLabel = picker.querySelector("[data-rw-confirm-label]");

      if (match) {
        card.dataset.selected = String(match.id);
        if (confirmBtn) confirmBtn.disabled = false;
        if (confirmLabel) confirmLabel.textContent = dict.addToBag;
      } else {
        delete card.dataset.selected;
        if (confirmBtn) confirmBtn.disabled = true;
        if (confirmLabel) confirmLabel.textContent = dict.soldOut;
      }

      if (markTouched) {
        card.dataset.touched = "1";
      }
    }

    /**
     * @param {HTMLElement} card
     */
    openPicker(card) {
      const picker = /** @type {HTMLElement | null} */ (
        card.querySelector("[data-rw-picker]")
      );
      const addBtn = /** @type {HTMLElement | null} */ (
        card.querySelector("[data-rw-add]")
      );
      if (!picker || !addBtn) return;

      if (this.isMobile) {
        this.openSheet(card, picker, addBtn);
        return;
      }

      picker.hidden = false;
      card.classList.add("is-picking");
      addBtn.setAttribute("aria-expanded", "true");
      const checked = /** @type {HTMLElement | null} */ (
        picker.querySelector('input[type="radio"]:checked')
      );
      checked?.focus({ preventScroll: true });
    }

    /**
     * @param {HTMLElement} card
     */
    closePicker(card) {
      if (this.activeSheet && this.activeSheet.card === card) {
        this.closeSheet(false);
        return;
      }
      const picker = /** @type {HTMLElement | null} */ (
        card.querySelector("[data-rw-picker]")
      );
      const addBtn = card.querySelector("[data-rw-add]");
      if (picker) picker.hidden = true;
      card.classList.remove("is-picking");
      if (addBtn && !card.classList.contains("is-added")) {
        addBtn.setAttribute("aria-expanded", "false");
      }
    }

    /**
     * @param {HTMLElement} card
     * @param {HTMLElement} picker
     * @param {HTMLElement} addBtn
     */
    openSheet(card, picker, addBtn) {
      this.closeSheet(true);

      if (!this.sheetHost) {
        this.sheetHost = document.createElement("div");
        this.sheetHost.className = "rw-sheet-host";
        const scrim = document.createElement("button");
        scrim.type = "button";
        scrim.className = "rw__pick-scrim";
        scrim.setAttribute("data-rw-pick-close", "");
        scrim.tabIndex = -1;
        scrim.setAttribute("aria-hidden", "true");
        this.sheetHost.appendChild(scrim);

        this.sheetHost.addEventListener("click", (e) => {
          const target = /** @type {HTMLElement | null} */ (e.target);
          if (target?.closest("[data-rw-pick-close]")) {
            this.closeSheet(false);
            return;
          }
          if (target?.closest("[data-rw-confirm]") && this.activeSheet) {
            this.confirmSingleCard(this.activeSheet.card);
          }
        });

        this.sheetHost.addEventListener("change", (e) => {
          const target = /** @type {HTMLElement | null} */ (e.target);
          if (target?.matches("[data-rw-option]") && this.activeSheet) {
            this.engage();
            this.syncCardOptions(this.activeSheet.card, true);
          }
        });

        this.sheetHost.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            this.closeSheet(false);
          }
        });
      }

      const cs = getComputedStyle(this);
      [
        "--rw-panel",
        "--rw-elevated",
        "--rw-text",
        "--rw-muted",
        "--rw-line",
        "--rw-accent",
        "--rw-on-accent",
        "--rw-pt-size",
        "--rw-price",
        "--rw-opt",
        "--rw-ease",
        "--rw-ease-sheet",
      ].forEach((v) => {
        const val = cs.getPropertyValue(v);
        if (val && this.sheetHost) this.sheetHost.style.setProperty(v, val);
      });
      this.sheetHost.style.fontFamily = cs.fontFamily;
      this.sheetHost.style.color = cs.color;

      this.activeSheet = { card, picker, addBtn };
      picker.hidden = false;
      card.classList.add("is-picking");
      addBtn.setAttribute("aria-expanded", "true");

      this.sheetHost.appendChild(picker);
      document.body.appendChild(this.sheetHost);
      requestAnimationFrame(() => {
        this.sheetHost?.classList.add("is-open");
        /** @type {HTMLElement | null} */ (
          picker.querySelector('input[type="radio"]:checked')
        )?.focus();
      });
    }

    /**
     * @param {boolean} instant
     */
    closeSheet(instant) {
      if (!this.activeSheet) return;
      const { card, picker, addBtn } = this.activeSheet;
      this.activeSheet = null;

      picker.hidden = true;
      card.appendChild(picker);
      card.classList.remove("is-picking");

      if (!card.classList.contains("is-added")) {
        addBtn.setAttribute("aria-expanded", "false");
      }

      if (this.sheetHost) {
        this.sheetHost.classList.remove("is-open");
        if (instant) {
          this.sheetHost.remove();
        } else {
          window.setTimeout(() => {
            if (!this.activeSheet) this.sheetHost?.remove();
          }, 300);
        }
      }

      if (!instant) {
        addBtn.focus();
      }
    }

    /**
     * @param {HTMLElement} card
     */
    markCardAdded(card) {
      this.closePicker(card);
      card.classList.remove("is-loading");
      card.classList.add("is-added");
      const key = card.getAttribute("data-card-key");
      if (key) this.addedKeys.add(key);

      const addBtn = card.querySelector("[data-rw-add]");
      if (addBtn) {
        const addedLabel = addBtn.getAttribute("data-added-label");
        if (addedLabel) addBtn.setAttribute("aria-label", addedLabel);
        addBtn.removeAttribute("aria-expanded");
      }
    }

    /**
     * @param {HTMLElement} card
     */
    confirmSingleCard(card) {
      if (card.classList.contains("is-added")) return;
      this.syncCardOptions(card, true);
      const variantId = Number(card.dataset.selected);
      const panel = /** @type {HTMLElement | null} */ (
        card.closest("[data-rw-panel]")
      );
      const msgEl = panel?.querySelector("[data-rw-msg]");
      const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;
      if (msgEl) msgEl.textContent = "";

      if (!Number.isSafeInteger(variantId)) {
        if (msgEl) msgEl.textContent = dict.bagErrorMsg;
        return;
      }

      card.classList.add("is-loading");
      try {
        this.bag.add([{ id: variantId, quantity: 1 }]);
        this.markCardAdded(card);
        this.checkPanelComplete(panel);
      } catch (err) {
        card.classList.remove("is-loading");
        if (msgEl) {
          msgEl.textContent =
            err instanceof Error ? err.message : dict.bagErrorMsg;
        }
      }
    }

    /**
     * @param {HTMLElement | null} panel
     */
    checkPanelComplete(panel) {
      if (!panel) return;
      const cards = Array.from(panel.querySelectorAll("[data-rw-card]"));
      if (
        cards.length >= 2 &&
        cards.every((c) => c.classList.contains("is-added"))
      ) {
        panel.classList.add("is-complete");
        const msgEl = panel.querySelector("[data-rw-msg]");
        if (msgEl) msgEl.textContent = "";
      }
    }

    /**
     * @param {HTMLElement | null} panel
     */
    addFullLook(panel) {
      if (!panel || panel.classList.contains("is-complete")) return;
      const cta = panel.querySelector("[data-rw-all]");
      if (!cta || cta.classList.contains("is-loading")) return;

      const msgEl = panel.querySelector("[data-rw-msg]");
      const dict = ns.i18n.DICT[this.lang] || ns.i18n.DICT.en;
      if (msgEl) msgEl.textContent = "";

      const remaining = Array.from(panel.querySelectorAll("[data-rw-card]"))
        .map((n) => /** @type {HTMLElement} */ (n))
        .filter((c) => !c.classList.contains("is-added"));

      /** @type {{ card: HTMLElement, id: number }[]} */
      const ready = [];
      /** @type {HTMLElement[]} */
      const pending = [];

      for (const card of remaining) {
        const vid = Number(card.dataset.selected);
        if (card.dataset.touched === "1" && Number.isSafeInteger(vid)) {
          ready.push({ card, id: vid });
        } else {
          pending.push(card);
        }
      }

      if (ready.length > 0) {
        cta.classList.add("is-loading");
        ready.forEach((r) => r.card.classList.add("is-loading"));
        try {
          this.bag.add(ready.map((r) => ({ id: r.id, quantity: 1 })));
          ready.forEach((r) => this.markCardAdded(r.card));
          this.checkPanelComplete(panel);
        } catch (err) {
          ready.forEach((r) => r.card.classList.remove("is-loading"));
          if (msgEl) {
            msgEl.textContent =
              err instanceof Error ? err.message : dict.bagErrorMsg;
          }
        } finally {
          cta.classList.remove("is-loading");
        }
      }

      if (pending.length > 0) {
        if (this.isMobile) {
          this.openPicker(pending[0]);
        } else {
          pending.forEach((c) => this.openPicker(c));
          pending[0].scrollIntoView({
            behavior: this.reducedMotion ? "auto" : "smooth",
            block: "nearest",
          });
        }

        if (msgEl) {
          const sep = this.lang === "fa" ? "، " : ", ";
          const names = pending.map((c) => c.dataset.title || "").join(sep);
          msgEl.textContent = dict.pickSizeMsg.replace("[items]", names);
        }
      }
    }

    bindEvents() {
      const stage = this.stageEl;
      const panel = this.panelEl;
      if (!stage || !panel) return;

      /** @type {number | null} */
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let startTarget = 0;
      let moved = false;
      let abandoned = false;
      /** @type {{ x: number, time: number }[]} */
      let samples = [];

      stage.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (this.zoomed) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        startTarget = this.target;
        moved = false;
        abandoned = false;
        samples = [{ x: e.clientX, time: performance.now() }];
      });

      stage.addEventListener("pointermove", (e) => {
        if (e.pointerId !== pointerId || abandoned) return;
        if (e.pointerType === "mouse" && e.buttons === 0) {
          pointerId = null;
          this.dragging = false;
          this.classList.remove("is-dragging");
          this.kick();
          return;
        }

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!moved) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            abandoned = true;
            pointerId = null;
            return;
          }
          if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
            moved = true;
            this.dragging = true;
            this.classList.add("is-dragging");
            try {
              stage.setPointerCapture(pointerId);
            } catch {
              // Ignore capture errors
            }
          } else {
            return;
          }
        }

        const dirSign =
          this.isMobile && document.documentElement.dir === "rtl" ? -1 : 1;
        this.target = startTarget - (dx * dirSign) / this.unit;
        samples.push({ x: e.clientX, time: performance.now() });
        if (samples.length > 6) samples.shift();
        this.kick();
      });

      /** @param {PointerEvent} e */
      const endDrag = (e) => {
        if (e.pointerId !== pointerId) return;
        pointerId = null;
        if (!moved) return;

        this.dragging = false;
        this.classList.remove("is-dragging");
        this.suppressClickUntil = performance.now() + 60;

        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = Math.max(1, last.time - first.time);
        const vx = (last.x - first.x) / dt;
        const dx = last.x - startX;
        const from = Math.round(startTarget);
        const dirSign =
          this.isMobile && document.documentElement.dir === "rtl" ? -1 : 1;

        if (this.isMobile) {
          if (Math.abs(dx) > 30 || Math.abs(vx) > 0.3) {
            this.moveTo(from + (dx * dirSign > 0 ? -1 : 1));
          } else {
            this.moveTo(from);
          }
        } else {
          let i = Math.round(this.target - (vx * 160) / this.unit);
          if (i === from && Math.abs(vx) > 0.3) {
            i = from + (vx > 0 ? -1 : 1);
          }
          i = Math.max(from - 2, Math.min(from + 2, i));
          this.moveTo(i);
        }
      };

      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);

      this.addEventListener(
        "click",
        (e) => {
          if (performance.now() < this.suppressClickUntil) {
            e.stopPropagation();
            e.preventDefault();
          }
        },
        true,
      );

      stage.addEventListener(
        "wheel",
        (e) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          e.preventDefault();
          if (performance.now() < this.wheelLockUntil || this.zoomed) return;
          this.wheelAcc += e.deltaX;
          if (Math.abs(this.wheelAcc) > 45) {
            if (this.wheelAcc > 0) this.next();
            else this.prev();
            this.wheelAcc = 0;
            this.wheelLockUntil = performance.now() + 500;
          }
        },
        { passive: false },
      );

      this.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.activeSheet) {
            e.preventDefault();
            this.closeSheet(false);
          } else if (this.zoomed) {
            e.preventDefault();
            this.closePopup();
          }
          return;
        }

        if (document.activeElement === stage && !this.zoomed) {
          const isRTL = document.documentElement.dir === "rtl";
          if (e.key === "ArrowRight") {
            e.preventDefault();
            if (isRTL) this.prev();
            else this.next();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (isRTL) this.next();
            else this.prev();
          }
        }
      });

      panel.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") this.panelHover = true;
      });
      panel.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") {
          this.panelHover = false;
          this.restartAutoBar();
        }
      });

      panel.addEventListener("pointerover", (e) => {
        if (e.pointerType !== "mouse") return;
        const target = /** @type {HTMLElement | null} */ (e.target);
        const card = target?.closest("[data-rw-card]");
        if (card) this.hot(card.getAttribute("data-rw-card"), false);
      });
      panel.addEventListener("pointerout", (e) => {
        if (e.pointerType !== "mouse") return;
        const target = /** @type {HTMLElement | null} */ (e.target);
        const card = target?.closest("[data-rw-card]");
        const related = /** @type {Node | null} */ (e.relatedTarget);
        if (card && !card.contains(related)) {
          this.clearHot();
        }
      });

      panel.addEventListener("change", (e) => {
        const target = /** @type {HTMLElement | null} */ (e.target);
        if (target?.matches("[data-rw-option]")) {
          this.engage();
          const card = /** @type {HTMLElement | null} */ (
            target.closest("[data-rw-card]")
          );
          if (card) this.syncCardOptions(card, true);
        }
      });

      this.addEventListener("click", (e) => {
        const target = /** @type {HTMLElement | null} */ (e.target);
        if (!target) return;

        if (
          panel.contains(target) &&
          target.closest("button, a, input, select, label")
        ) {
          this.engage();
        }

        const pickClose = target.closest("[data-rw-pick-close]");
        if (pickClose) {
          const card = /** @type {HTMLElement | null} */ (
            pickClose.closest("[data-rw-card]")
          );
          if (card) this.closePicker(card);
          return;
        }

        if (target.closest("[data-rw-zoom-close]")) {
          this.closePopup();
          return;
        }

        if (
          this.zoomed &&
          target.closest("[data-rw-lb]") &&
          !target.closest(".rw__lb-model, .rw__lb-top")
        ) {
          this.closePopup();
          return;
        }

        if (target.closest("[data-rw-zoom]")) {
          this.openPopup();
          return;
        }

        if (target.closest("[data-rw-next]")) {
          this.next();
          return;
        }

        if (target.closest("[data-rw-prev]")) {
          this.prev();
          return;
        }

        const tick = target.closest("[data-rw-tick]");
        if (tick) {
          this.go(Number(tick.getAttribute("data-rw-tick")));
          return;
        }

        if (target.closest("[data-rw-auto]")) {
          if (!this.playing) this.engaged = false;
          this.play(!this.playing);
          return;
        }

        const pin = target.closest("[data-rw-pin]");
        if (pin) {
          this.engage();
          this.hot(pin.getAttribute("data-rw-pin"), true);
          return;
        }

        const goBtn = target.closest("[data-rw-go]");
        if (goBtn) {
          const bodyIdx = Number(goBtn.getAttribute("data-rw-go"));
          let rank = this.wrapN(bodyIdx - Math.round(this.target));
          if (!this.isMobile && rank > this.N / 2) rank -= this.N;
          if (rank === 0) {
            this.openPopup();
          } else if (Math.abs(rank) < 6) {
            this.moveTo(Math.round(this.target) + rank);
          }
          return;
        }

        const confirmBtn = target.closest("[data-rw-confirm]");
        if (confirmBtn) {
          const card = /** @type {HTMLElement | null} */ (
            confirmBtn.closest("[data-rw-card]")
          );
          if (card) this.confirmSingleCard(card);
          return;
        }

        const addBtn = target.closest("[data-rw-add]");
        if (addBtn) {
          const card = /** @type {HTMLElement | null} */ (
            addBtn.closest("[data-rw-card]")
          );
          if (!card || card.classList.contains("is-added")) return;
          if (card.classList.contains("is-picking")) {
            this.closePicker(card);
          } else {
            this.openPicker(card);
          }
          return;
        }

        const allBtn = target.closest("[data-rw-all]");
        if (allBtn) {
          const lookPanel = /** @type {HTMLElement | null} */ (
            allBtn.closest("[data-rw-panel]")
          );
          this.addFullLook(lookPanel);
        }
      });

      const scheduleMeasure = () => {
        if (this.measureRaf !== null) return;
        this.measureRaf = requestAnimationFrame(() => {
          this.measureRaf = null;
          this.measure();
        });
      };

      this.onWindowResize = scheduleMeasure;
      window.addEventListener("resize", this.onWindowResize);

      if (typeof ResizeObserver === "function") {
        this.resizeObs = new ResizeObserver(scheduleMeasure);
        this.resizeObs.observe(stage);
      }

      this.onVisChange = () => {
        if (!document.hidden) {
          this.kick();
          this.restartAutoTimer();
        }
      };
      document.addEventListener("visibilitychange", this.onVisChange);
    }
  }

  customElements.define("runway-section", RunwaySection);

  /* ==========================================================================
     GLOBAL HEADER CONTROLLERS (LANGUAGE, THEME & COLLECTION FILTERS)
     ========================================================================== */
  /**
   * @param {"en" | "de" | "fa"} langCode
   */
  function applyGlobalLanguage(langCode) {
    const { DICT, persistLanguage } = ns.i18n;
    const lang =
      langCode === "en" || langCode === "de" || langCode === "fa"
        ? langCode
        : "en";
    const dict = DICT[lang];

    persistLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir;
    document.title = dict.pageTitle;

    document.querySelectorAll(".lang-btn[data-lang]").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    const runway = /** @type {RunwaySection | null} */ (
      document.querySelector("runway-section")
    );
    if (runway && typeof runway.setLanguage === "function") {
      runway.setLanguage(lang);
    }
  }

  /**
   * @param {"light" | "dark"} themeName
   */
  function applyGlobalTheme(themeName) {
    const theme = themeName === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }

  /** @type {"light" | "dark"} */
  let initialTheme = "light";
  try {
    if (localStorage.getItem(THEME_STORAGE_KEY) === "dark") {
      initialTheme = "dark";
    }
  } catch {
    // Ignore storage errors
  }
  applyGlobalTheme(initialTheme);
  applyGlobalLanguage(ns.i18n.getInitialLanguage());

  document.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement | null} */ (e.target);
    if (!target) return;

    const langBtn = target.closest(".lang-btn[data-lang]");
    if (langBtn) {
      const code = /** @type {"en" | "de" | "fa"} */ (
        langBtn.getAttribute("data-lang") || "en"
      );
      applyGlobalLanguage(code);
      return;
    }

    const filterBtn = target.closest("[data-rw-collection]");
    if (filterBtn) {
      const col = /** @type {"all" | "women" | "men"} */ (
        filterBtn.getAttribute("data-rw-collection") || "all"
      );
      document.querySelectorAll("[data-rw-collection]").forEach((btn) => {
        const active = btn.getAttribute("data-rw-collection") === col;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
      const runway = /** @type {RunwaySection | null} */ (
        document.querySelector("runway-section")
      );
      if (runway && typeof runway.setCollection === "function") {
        runway.setCollection(col);
      }
    }
  });

  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyGlobalTheme(current === "dark" ? "light" : "dark");
  });
})();