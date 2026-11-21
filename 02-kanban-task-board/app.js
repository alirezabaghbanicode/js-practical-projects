"use strict";

const STORAGE_KEY = "alireza_nexusboard_tasks_v1";
const LANG_STORAGE_KEY = "alireza_nexusboard_lang_v1";
const THEME_STORAGE_KEY = "alireza_nexusboard_theme_v1";

const STAGES = ["backlog", "todo", "in-progress", "done"];
const TRACKS = ["Frontend", "Backend", "UI/UX", "DevOps", "Testing"];
const PRIORITIES = ["high", "medium", "low"];
const MEMBERS = ["Alireza B.", "Sara K.", "Lukas M.", "Nina W."];

const ALLOWED_TAGS = new Set(TRACKS);
const ALLOWED_PRIORITIES = new Set(PRIORITIES);
const ALLOWED_MEMBERS = new Set(MEMBERS);

const TRACK_COLORS = {
  Frontend: "#8b5cf6",
  Backend: "#06b6d4",
  "UI/UX": "#ec4899",
  DevOps: "#f59e0b",
  Testing: "#10b981",
};

const STAGE_COLORS = {
  backlog: "#64748b",
  todo: "#8b5cf6",
  "in-progress": "#f59e0b",
  done: "#10b981",
};

const CALENDAR_META = {
  en: {
    systemLabel: "Gregorian Calendar",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    shortMonths: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    todayBtn: "Today",
    closeBtn: "Close",
  },
  de: {
    systemLabel: "Gregorianischer Kalender",
    months: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    shortMonths: [
      "Jan.",
      "Feb.",
      "Mär.",
      "Apr.",
      "Mai",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sep.",
      "Okt.",
      "Nov.",
      "Dez.",
    ],
    weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    todayBtn: "Heute",
    closeBtn: "Schließen",
  },
  fa: {
    systemLabel: "تقویم هجری شمسی",
    months: [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ],
    shortMonths: [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ],
    weekdays: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
    todayBtn: "امروز",
    closeBtn: "بستن",
  },
};

const I18N = {
  en: {
    dir: "ltr",
    locale: "en-US",
    pageTitle: "NexusBoard — Enterprise Agile Kanban & Sprint Analytics",
    pageH1: "NexusBoard Enterprise Agile Kanban and Sprint Analytics Dashboard",
    sprintBadge: "Sprint 14 • Active",
    brandSub: "Enterprise Agile Workspace & Visual Analytics",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    exportBtn: "Export JSON",
    seedBtn: "Reset Demo",
    clearBtn: "Clear All",
    kpiTotalLabel: "Sprint Scope",
    kpiTotalMeta: "Total tasks & estimated effort",
    kpiCompletionLabel: "Completion Rate",
    kpiActiveLabel: "Active Execution",
    kpiActiveMeta: "Share of tasks currently in progress",
    kpiCriticalLabel: "Critical Priority",
    kpiCriticalMeta: "High-priority items in sprint",
    chartDonutTitle: "Workflow Distribution",
    chartDonutSub: "Stage share by task count & percentage",
    donutCenterLabel: "Done",
    chartBarTitle: "Category Column Chart",
    chartBarSub: "Task volume & percentage across engineering tracks",
    chartPctTitle: "Priority & Team Load (%)",
    chartPctSub: "Urgency ratio & member hour allocation",
    composerHeading: "Create Sprint Issue",
    composerSub: "Assign tasks, estimate hours, and drag cards across stages",
    searchPlaceholder: "Search ID, title, tag, or member...",
    filterAllPriorities: "All Priorities",
    filterAllMembers: "All Members",
    labelTitle: "Issue Title",
    placeholderTitle: "e.g., Build OAuth2 Refresh Token Interceptor",
    labelDesc: "Summary / Note",
    placeholderDesc: "Acceptance criteria or technical note...",
    labelTag: "Track",
    labelPriority: "Priority",
    labelAssignee: "Assignee",
    labelHours: "Est. Hours",
    labelDue: "Due Date",
    labelStage: "Stage",
    submitBtn: "Create Issue",
    colBacklog: "Backlog",
    colTodo: "To Do",
    colProgress: "In Progress",
    colDone: "Done",
    priorityHigh: "High Priority",
    priorityMedium: "Medium Priority",
    priorityLow: "Low Priority",
    emptyColumn: "Drop issue cards here or create a new one above.",
    editTitle: "Edit & checklist",
    moveBackTitle: "Previous stage",
    moveNextTitle: "Next stage",
    deleteTitle: "Delete issue",
    modalHeading: "Issue Details & Checklist",
    subtasksHeading: "Action Checklist",
    subtaskPlaceholder: "Add checklist step...",
    addStepBtn: "+ Add",
    saveBtn: "Save Changes",
    hoursUnit: "h",
    footerTech: "NexusBoard • Vanilla JavaScript, SVG Analytics & LocalStorage",
    footerBuiltBy: "Built by",
    tags: {
      Frontend: "Frontend",
      Backend: "Backend",
      "UI/UX": "UI/UX",
      DevOps: "DevOps",
      Testing: "Testing",
    },
  },
  de: {
    dir: "ltr",
    locale: "de-DE",
    pageTitle: "NexusBoard — Agiles Kanban & Sprint-Analytics",
    pageH1: "NexusBoard Agiles Kanban- und Sprint-Analytics-Dashboard",
    sprintBadge: "Sprint 14 • Aktiv",
    brandSub: "Agiler Projekt-Workspace & Visuelle Analysen",
    themeLight: "Heller Modus",
    themeDark: "Dunkler Modus",
    exportBtn: "JSON-Export",
    seedBtn: "Demo laden",
    clearBtn: "Alle löschen",
    kpiTotalLabel: "Sprint-Umfang",
    kpiTotalMeta: "Gesamtaufgaben & geschätzter Aufwand",
    kpiCompletionLabel: "Abschlussquote",
    kpiActiveLabel: "Aktive Umsetzung",
    kpiActiveMeta: "Anteil der Aufgaben in Bearbeitung",
    kpiCriticalLabel: "Hohe Priorität",
    kpiCriticalMeta: "Kritische Aufgaben im Sprint",
    chartDonutTitle: "Workflow-Verteilung",
    chartDonutSub: "Phasenanteil nach Anzahl & Prozentsatz",
    donutCenterLabel: "Erledigt",
    chartBarTitle: "Kategorie-Säulendiagramm",
    chartBarSub: "Aufgabenvolumen & Anteil nach Fachbereich",
    chartPctTitle: "Priorität & Teamauslastung (%)",
    chartPctSub: "Dringlichkeitsquote & Stundenverteilung",
    composerHeading: "Neue Sprint-Aufgabe erstellen",
    composerSub:
      "Aufgaben zuweisen, Stunden schätzen und per Drag & Drop verschieben",
    searchPlaceholder: "ID, Titel, Tag oder Mitglied suchen...",
    filterAllPriorities: "Alle Prioritäten",
    filterAllMembers: "Alle Mitglieder",
    labelTitle: "Aufgabentitel",
    placeholderTitle: "z. B. OAuth2-Refresh-Token implementieren",
    labelDesc: "Zusammenfassung / Notiz",
    placeholderDesc: "Akzeptanzkriterien oder technische Notiz...",
    labelTag: "Bereich",
    labelPriority: "Priorität",
    labelAssignee: "Zuständig",
    labelHours: "Stunden",
    labelDue: "Fälligkeit",
    labelStage: "Phase",
    submitBtn: "Erstellen",
    colBacklog: "Backlog",
    colTodo: "Zu erledigen",
    colProgress: "In Bearbeitung",
    colDone: "Erledigt",
    priorityHigh: "Hohe Priorität",
    priorityMedium: "Mittlere Priorität",
    priorityLow: "Niedrige Priorität",
    emptyColumn: "Aufgaben hier ablegen oder oben neu erstellen.",
    editTitle: "Details & Checkliste",
    moveBackTitle: "Vorherige Phase",
    moveNextTitle: "Nächste Phase",
    deleteTitle: "Aufgabe löschen",
    modalHeading: "Aufgabendetails & Checkliste",
    subtasksHeading: "Aktions-Checkliste",
    subtaskPlaceholder: "Checklistenpunkt hinzufügen...",
    addStepBtn: "+ Hinzufügen",
    saveBtn: "Änderungen speichern",
    hoursUnit: "Std.",
    footerTech: "NexusBoard • Vanilla JavaScript, SVG-Analytics & LocalStorage",
    footerBuiltBy: "Entwickelt von",
    tags: {
      Frontend: "Frontend",
      Backend: "Backend",
      "UI/UX": "UI/UX",
      DevOps: "DevOps",
      Testing: "Testing",
    },
  },
  fa: {
    dir: "rtl",
    locale: "fa-IR",
    pageTitle: "NexusBoard — سامانه مدیریت پروژه و تحلیل آماری اسپرینت",
    pageH1: "داشبورد مدیریت پروژه چابک و تحلیل آماری NexusBoard",
    sprintBadge: "اسپرینت ۱۴ • فعال",
    brandSub: "فضای کاری چابک و داشبورد آمارهای گرافیکی پروژه",
    themeLight: "حالت روشن",
    themeDark: "حالت تیره",
    exportBtn: "خروجی JSON",
    seedBtn: "داده نمونه",
    clearBtn: "پاک کردن همه",
    kpiTotalLabel: "محدوده اسپرینت",
    kpiTotalMeta: "کل وظایف و مجموع زمان تخمینی",
    kpiCompletionLabel: "نرخ تکمیل اسپرینت",
    kpiActiveLabel: "در حال اجرا",
    kpiActiveMeta: "سهم درصدی تسک‌های فعال",
    kpiCriticalLabel: "اولویت حیاتی",
    kpiCriticalMeta: "درصد تسک‌های فوری اسپرینت",
    chartDonutTitle: "نمودار دایره‌ای وضعیت وظایف",
    chartDonutSub: "سهم هر ستون بر اساس تعداد و درصد",
    donutCenterLabel: "تکمیل‌شده",
    chartBarTitle: "نمودار ستونی دپارتمان‌های فنی",
    chartBarSub: "مقایسه تعداد و درصد وظایف هر بخش",
    chartPctTitle: "آمار درصدی اولویت‌ها و بار کاری",
    chartPctSub: "نسبت فوریت تسک‌ها و ساعات اعضای تیم",
    composerHeading: "ثبت تسک جدید در اسپرینت",
    composerSub: "تعیین مسئول، تخمین زمان و جابه‌جایی کارت‌ها بین ستون‌ها",
    searchPlaceholder: "جستجو بر اساس کد، عنوان، بخش یا مسئول...",
    filterAllPriorities: "همه اولویت‌ها",
    filterAllMembers: "همه اعضای تیم",
    labelTitle: "عنوان تسک",
    placeholderTitle: "مثلاً: پیاده‌سازی سیستم احراز هویت و توکن امنیتی",
    labelDesc: "توضیحات تکمیلی",
    placeholderDesc: "جزئیات فنی یا معیارهای پذیرش تسک...",
    labelTag: "بخش فنی",
    labelPriority: "اولویت",
    labelAssignee: "مسئول انجام",
    labelHours: "ساعت تخمینی",
    labelDue: "تاریخ سررسید",
    labelStage: "ستون شروع",
    submitBtn: "ایجاد تسک",
    colBacklog: "بک‌لاگ",
    colTodo: "آماده انجام",
    colProgress: "در حال اجرا",
    colDone: "تکمیل‌شده",
    priorityHigh: "اولویت بالا",
    priorityMedium: "اولویت متوسط",
    priorityLow: "اولویت پایین",
    emptyColumn: "کارت را اینجا رها کنید یا از فرم بالا تسک بسازید.",
    editTitle: "ویرایش و چک‌لیست",
    moveBackTitle: "انتقال به ستون قبل",
    moveNextTitle: "انتقال به ستون بعد",
    deleteTitle: "حذف تسک",
    modalHeading: "جزئیات تسک و چک‌لیست اجرایی",
    subtasksHeading: "چک‌لیست مراحل انجام",
    subtaskPlaceholder: "افزودن مرحله جدید...",
    addStepBtn: "+ افزودن",
    saveBtn: "ذخیره تغییرات",
    hoursUnit: "ساعت",
    footerTech: "NexusBoard • جاوااسکریپت خالص، نمودارهای SVG و LocalStorage",
    footerBuiltBy: "طراحی و توسعه توسط",
    tags: {
      Frontend: "فرانت‌اند",
      Backend: "بک‌اند",
      "UI/UX": "طراحی رابط کاربری",
      DevOps: "دواپس و سرور",
      Testing: "تست و کنترل کیفیت",
    },
  },
};

const SAMPLE_TASKS_BY_LANG = {
  en: [
    {
      id: "task-101",
      code: "NX-101",
      title: "Design Modular State & Event Delegation Core",
      desc: "Separate data mutations from SVG and DOM rendering pipeline.",
      tag: "Frontend",
      priority: "high",
      status: "done",
      assignee: "Alireza B.",
      hours: 8,
      dueDate: "2026-11-18",
      subtasks: [
        { text: "Define strict schema validator", done: true },
        { text: "Implement localStorage persistence", done: true },
      ],
    },
    {
      id: "task-102",
      code: "NX-102",
      title: "Implement OAuth2 & JWT Refresh Token API",
      desc: "Add rotating refresh token endpoint with rate limiting.",
      tag: "Backend",
      priority: "high",
      status: "in-progress",
      assignee: "Lukas M.",
      hours: 12,
      dueDate: "2026-11-23",
      subtasks: [
        { text: "Configure token signing keys", done: true },
        { text: "Add Redis revocation blacklist", done: false },
        { text: "Write integration auth tests", done: false },
      ],
    },
    {
      id: "task-103",
      code: "NX-103",
      title: "Build Interactive SVG Donut & Column Charts",
      desc: "Zero-dependency data visualization with live percentage calculations.",
      tag: "UI/UX",
      priority: "high",
      status: "done",
      assignee: "Sara K.",
      hours: 6,
      dueDate: "2026-11-20",
      subtasks: [
        { text: "Calculate SVG stroke-dasharray arcs", done: true },
        { text: "Responsive bar scaling", done: true },
      ],
    },
    {
      id: "task-104",
      code: "NX-104",
      title: "Configure Automated CI/CD & Docker Staging",
      desc: "Set up zero-downtime container deployment pipeline.",
      tag: "DevOps",
      priority: "medium",
      status: "in-progress",
      assignee: "Nina W.",
      hours: 10,
      dueDate: "2026-11-25",
      subtasks: [
        { text: "Optimize multi-stage Dockerfile", done: true },
        { text: "Configure healthcheck probes", done: false },
      ],
    },
    {
      id: "task-105",
      code: "NX-105",
      title: "End-to-End Accessibility & RTL Layout Audit",
      desc: "Verify WCAG contrast ratios and keyboard focus traps.",
      tag: "Testing",
      priority: "medium",
      status: "todo",
      assignee: "Sara K.",
      hours: 5,
      dueDate: "2026-11-27",
      subtasks: [
        { text: "Audit Persian RTL mirroring", done: false },
        { text: "Verify dialog keyboard escape", done: false },
      ],
    },
    {
      id: "task-106",
      code: "NX-106",
      title: "Database Query Indexing for Sprint Reports",
      desc: "Optimize composite indexes for historical sprint analytics.",
      tag: "Backend",
      priority: "low",
      status: "backlog",
      assignee: "Alireza B.",
      hours: 7,
      dueDate: "2026-12-02",
      subtasks: [{ text: "Benchmark EXPLAIN ANALYZE", done: false }],
    },
  ],
  de: [
    {
      id: "task-201",
      code: "NX-101",
      title: "Modulare Zustands- & Event-Architektur entwickeln",
      desc: "Trennung von Datenlogik und SVG/DOM-Rendering-Pipeline.",
      tag: "Frontend",
      priority: "high",
      status: "done",
      assignee: "Alireza B.",
      hours: 8,
      dueDate: "2026-11-18",
      subtasks: [
        { text: "Schema-Validierung umsetzen", done: true },
        { text: "LocalStorage-Speicherung testen", done: true },
      ],
    },
    {
      id: "task-202",
      code: "NX-102",
      title: "OAuth2 & JWT Refresh-Token-API implementieren",
      desc: "Endpunkt für rotierende Refresh-Tokens mit Rate-Limiting.",
      tag: "Backend",
      priority: "high",
      status: "in-progress",
      assignee: "Lukas M.",
      hours: 12,
      dueDate: "2026-11-23",
      subtasks: [
        { text: "Signaturschlüssel konfigurieren", done: true },
        { text: "Token-Sperrliste integrieren", done: false },
      ],
    },
    {
      id: "task-203",
      code: "NX-103",
      title: "Interaktive SVG-Kreis- & Säulendiagramme bauen",
      desc: "Datenvisualisierung ohne externe Bibliotheken mit Prozentwerten.",
      tag: "UI/UX",
      priority: "high",
      status: "done",
      assignee: "Sara K.",
      hours: 6,
      dueDate: "2026-11-20",
      subtasks: [
        { text: "SVG-Kreissegmente berechnen", done: true },
        { text: "Säulendiagramm responsiv gestalten", done: true },
      ],
    },
    {
      id: "task-204",
      code: "NX-104",
      title: "Automatisierte CI/CD-Pipeline mit Docker einrichten",
      desc: "Container-Deployment ohne Ausfallzeiten konfigurieren.",
      tag: "DevOps",
      priority: "medium",
      status: "in-progress",
      assignee: "Nina W.",
      hours: 10,
      dueDate: "2026-11-25",
      subtasks: [
        { text: "Multi-Stage-Dockerfile optimieren", done: true },
        { text: "Healthcheck-Endpunkte prüfen", done: false },
      ],
    },
    {
      id: "task-205",
      code: "NX-105",
      title: "Barrierefreiheit & RTL-Layout-Prüfung durchführen",
      desc: "WCAG-Kontrastwerte und Tastaturnavigation testen.",
      tag: "Testing",
      priority: "medium",
      status: "todo",
      assignee: "Sara K.",
      hours: 5,
      dueDate: "2026-11-27",
      subtasks: [{ text: "RTL-Ansicht verifizieren", done: false }],
    },
    {
      id: "task-206",
      code: "NX-106",
      title: "Datenbank-Indizes für Sprint-Berichte optimieren",
      desc: "Abfragegeschwindigkeit für historische Auswertungen verbessern.",
      tag: "Backend",
      priority: "low",
      status: "backlog",
      assignee: "Alireza B.",
      hours: 7,
      dueDate: "2026-12-02",
      subtasks: [{ text: "Abfrageplan analysieren", done: false }],
    },
  ],
  fa: [
    {
      id: "task-301",
      code: "NX-101",
      title: "طراحی هسته مدیریت وضعیت ماژولار و Event Delegation",
      desc: "جداسازی کامل منطق داده‌ها از لایه رندر نمودارهای SVG و DOM.",
      tag: "Frontend",
      priority: "high",
      status: "done",
      assignee: "Alireza B.",
      hours: 8,
      dueDate: "2026-11-18",
      subtasks: [
        { text: "پیاده‌سازی اعتبارسنجی داده‌های ورودی", done: true },
        { text: "اتصال به حافظه دائمی LocalStorage", done: true },
      ],
    },
    {
      id: "task-302",
      code: "NX-102",
      title: "پیاده‌سازی سرویس احراز هویت OAuth2 و توکن JWT",
      desc: "ایجاد اندپوینت تمدید خودکار توکن همراه با محدودسازی درخواست‌ها.",
      tag: "Backend",
      priority: "high",
      status: "in-progress",
      assignee: "Lukas M.",
      hours: 12,
      dueDate: "2026-11-23",
      subtasks: [
        { text: "تنظیم کلیدهای رمزنگاری توکن", done: true },
        { text: "پیاده‌سازی لیست ابطال نشست‌ها", done: false },
        { text: "نگارش تست‌های یکپارچگی API", done: false },
      ],
    },
    {
      id: "task-303",
      code: "NX-103",
      title: "ساخت نمودارهای دایره‌ای و ستونی تعاملی با SVG",
      desc: "نمایش زنده آمارهای درصدی بدون وابستگی به کتابخانه‌های جانبی.",
      tag: "UI/UX",
      priority: "high",
      status: "done",
      assignee: "Sara K.",
      hours: 6,
      dueDate: "2026-11-20",
      subtasks: [
        { text: "محاسبه کمان‌های نمودار دایره‌ای", done: true },
        { text: "مقیاس‌بندی خودکار ستون‌ها", done: true },
      ],
    },
    {
      id: "task-304",
      code: "NX-104",
      title: "راه‌اندازی پایپ‌لاین خودکار CI/CD و کانتینر Docker",
      desc: "استقرار بدون قطعی سرویس روی سرور آزمایشی و عملیاتی.",
      tag: "DevOps",
      priority: "medium",
      status: "in-progress",
      assignee: "Nina W.",
      hours: 10,
      dueDate: "2026-11-25",
      subtasks: [
        { text: "بهینه‌سازی حجم فایل Dockerfile", done: true },
        { text: "تنظیم مانیتورینگ سلامت سرویس", done: false },
      ],
    },
    {
      id: "task-305",
      code: "NX-105",
      title: "بررسی دسترسی‌پذیری و چیدمان راست‌به‌چپ (RTL)",
      desc: "کنترل کنتراست رنگ‌ها و عملکرد کیبورد در مودال‌ها.",
      tag: "Testing",
      priority: "medium",
      status: "todo",
      assignee: "Sara K.",
      hours: 5,
      dueDate: "2026-11-27",
      subtasks: [
        { text: "تست آینه‌ای شدن آیکون‌ها در حالت فارسی", done: false },
        { text: "تست ریسپانسیو در موبایل", done: false },
      ],
    },
    {
      id: "task-306",
      code: "NX-106",
      title: "بهینه‌سازی ایندکس‌های پایگاه داده برای گزارش‌های آماری",
      desc: "افزایش سرعت کوئری‌های تحلیلی اسپرینت‌های گذشته.",
      tag: "Backend",
      priority: "low",
      status: "backlog",
      assignee: "Alireza B.",
      hours: 7,
      dueDate: "2026-12-02",
      subtasks: [{ text: "تحلیل زمان اجرای کوئری‌ها", done: false }],
    },
  ],
};

// DOM References
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeLabelEl = document.getElementById("theme-label");
const exportJsonBtn = document.getElementById("export-json-btn");
const seedBtn = document.getElementById("seed-btn");
const clearBtn = document.getElementById("clear-btn");

const statTotalEl = document.getElementById("stat-total");
const statHoursChipEl = document.getElementById("stat-hours-chip");
const statRateEl = document.getElementById("stat-rate");
const statDoneCountEl = document.getElementById("stat-done-count");
const progressBarEl = document.getElementById("sprint-progress-bar");
const statActivePctEl = document.getElementById("stat-active-pct");
const statActiveCountEl = document.getElementById("stat-active-count");
const statHighPctEl = document.getElementById("stat-high-pct");
const statHighCountEl = document.getElementById("stat-high-count");

const donutSvgEl = document.getElementById("donut-svg");
const donutCenterPctEl = document.getElementById("donut-center-pct");
const donutLegendEl = document.getElementById("donut-legend");
const barChartSvgEl = document.getElementById("bar-chart-svg");
const priorityBarsEl = document.getElementById("priority-bars");
const workloadBarsEl = document.getElementById("workload-bars");

const searchInput = document.getElementById("search-input");
const filterPrioritySelect = document.getElementById("filter-priority");
const filterAssigneeSelect = document.getElementById("filter-assignee");

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const tagSelect = document.getElementById("task-tag");
const prioritySelect = document.getElementById("task-priority");
const assigneeSelect = document.getElementById("task-assignee");
const hoursInput = document.getElementById("task-hours");
const dueInput = document.getElementById("task-due");
const dueDisplayCreateEl = document.getElementById("due-display-create");
const statusSelect = document.getElementById("task-status");

const stageCounts = {
  backlog: document.getElementById("count-backlog"),
  todo: document.getElementById("count-todo"),
  "in-progress": document.getElementById("count-in-progress"),
  done: document.getElementById("count-done"),
};

const dropzones = {
  backlog: document.getElementById("list-backlog"),
  todo: document.getElementById("list-todo"),
  "in-progress": document.getElementById("list-in-progress"),
  done: document.getElementById("list-done"),
};

// Modal DOM
const taskModal = document.getElementById("task-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalTicketCodeEl = document.getElementById("modal-ticket-code");
const editForm = document.getElementById("edit-form");
const editTaskIdInput = document.getElementById("edit-task-id");
const editTitleInput = document.getElementById("edit-title");
const editDescInput = document.getElementById("edit-desc");
const editTagSelect = document.getElementById("edit-tag");
const editPrioritySelect = document.getElementById("edit-priority");
const editStatusSelect = document.getElementById("edit-status");
const editAssigneeSelect = document.getElementById("edit-assignee");
const editHoursInput = document.getElementById("edit-hours");
const editDueInput = document.getElementById("edit-due");
const dueDisplayEditEl = document.getElementById("due-display-edit");
const subtaskListEl = document.getElementById("subtask-list");
const modalSubtaskPctEl = document.getElementById("modal-subtask-pct");
const newSubtaskInput = document.getElementById("new-subtask-input");
const addSubtaskBtn = document.getElementById("add-subtask-btn");

// Custom Calendar DOM
const calPopover = document.getElementById("custom-calendar-popover");
const calPrevBtn = document.getElementById("cal-prev-month");
const calNextBtn = document.getElementById("cal-next-month");
const calMonthYearEl = document.getElementById("cal-month-year");
const calSystemBadgeEl = document.getElementById("cal-system-badge");
const calWeekdaysEl = document.getElementById("cal-weekdays");
const calDaysGridEl = document.getElementById("cal-days-grid");
const calTodayBtn = document.getElementById("cal-today-btn");
const calCloseBtn = document.getElementById("cal-close-btn");

/* =========================================================
   JALALI (SHAMSI) & GREGORIAN DATE CONVERSION ENGINE
   ========================================================= */
function gregorianToJalali(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 1;
  for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) {
    gd -= salA[gm];
  }
  return { gy, gm, gd };
}

function getJalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const g1 = jalaliToGregorian(jy, 1, 1);
  const g2 = jalaliToGregorian(jy + 1, 1, 1);
  const d1 = Date.UTC(g1.gy, g1.gm - 1, g1.gd);
  const d2 = Date.UTC(g2.gy, g2.gm - 1, g2.gd);
  return Math.round((d2 - d1) / 86400000) === 366 ? 30 : 29;
}

function pad2(num) {
  return String(num).padStart(2, "0");
}

function toISODate(gy, gm, gd) {
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

function parseISODate(isoStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    const now = new Date();
    return {
      gy: now.getFullYear(),
      gm: now.getMonth() + 1,
      gd: now.getDate(),
    };
  }
  const [gy, gm, gd] = isoStr.split("-").map(Number);
  return { gy, gm, gd };
}

function hasKey(obj, key) {
  return Boolean(key) && Object.prototype.hasOwnProperty.call(obj, key);
}

function toPersianDigits(text) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(text).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function formatNum(num) {
  if (state.lang === "fa") {
    return new Intl.NumberFormat("fa-IR").format(num);
  }
  if (state.lang === "de") {
    return new Intl.NumberFormat("de-DE").format(num);
  }
  return new Intl.NumberFormat("en-US").format(num);
}

function formatPct(value) {
  return state.lang === "fa" ? `${toPersianDigits(value)}٪` : `${value}%`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getInitialLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = (params.get("lang") || "").toLowerCase();
    if (hasKey(I18N, urlLang)) return urlLang;
  } catch {
    // Ignore URL errors
  }

  try {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    if (hasKey(I18N, savedLang)) return savedLang;
  } catch {
    // Ignore storage errors
  }

  return "en";
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function isValidTask(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.code === "string" &&
    typeof item.title === "string" &&
    ALLOWED_TAGS.has(item.tag) &&
    ALLOWED_PRIORITIES.has(item.priority) &&
    STAGES.includes(item.status) &&
    ALLOWED_MEMBERS.has(item.assignee) &&
    typeof item.hours === "number" &&
    Number.isFinite(item.hours) &&
    item.hours > 0 &&
    typeof item.dueDate === "string" &&
    Array.isArray(item.subtasks)
  );
}

function loadTasks(langCode) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      const defaults =
        SAMPLE_TASKS_BY_LANG[langCode] || SAMPLE_TASKS_BY_LANG.en;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return JSON.parse(JSON.stringify(defaults));
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

const initialLang = getInitialLanguage();

const state = {
  lang: initialLang,
  theme: getInitialTheme(),
  tasks: loadTasks(initialLang),
  searchQuery: "",
  priorityFilter: "all",
  assigneeFilter: "all",
  draggedTaskId: null,
  activeModalTaskId: null,
  calendar: {
    isOpen: false,
    targetInputId: "task-due",
    triggerEl: null,
    viewYear: 2026,
    viewMonth: 11,
  },
};

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch {
    // Ignore storage errors
  }
}

function translateTag(tagKey) {
  return I18N[state.lang].tags[tagKey] || tagKey;
}

function translatePriority(priorityKey) {
  const dict = I18N[state.lang];
  if (priorityKey === "high") return dict.priorityHigh;
  if (priorityKey === "low") return dict.priorityLow;
  return dict.priorityMedium;
}

function translateStage(stageKey) {
  const dict = I18N[state.lang];
  if (stageKey === "backlog") return dict.colBacklog;
  if (stageKey === "in-progress") return dict.colProgress;
  if (stageKey === "done") return dict.colDone;
  return dict.colTodo;
}

function formatDate(isoDate, includeYear = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const { gy, gm, gd } = parseISODate(isoDate);
  const meta = CALENDAR_META[state.lang];

  if (state.lang === "fa") {
    const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
    const dayStr = toPersianDigits(jd);
    const monthStr = meta.months[jm - 1];
    return includeYear
      ? `${dayStr} ${monthStr} ${toPersianDigits(jy)}`
      : `${dayStr} ${monthStr}`;
  }

  if (state.lang === "de") {
    const monthStr = meta.shortMonths[gm - 1];
    return includeYear ? `${gd}. ${monthStr} ${gy}` : `${gd}. ${monthStr}`;
  }

  const monthStr = meta.shortMonths[gm - 1];
  return includeYear ? `${monthStr} ${gd}, ${gy}` : `${monthStr} ${gd}`;
}

function syncDueDisplays() {
  if (dueInput.value) {
    dueDisplayCreateEl.textContent = formatDate(dueInput.value, true);
  }
  if (editDueInput.value) {
    dueDisplayEditEl.textContent = formatDate(editDueInput.value, true);
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* =========================================================
   CUSTOM TRILINGUAL CALENDAR POPOVER ENGINE
   ========================================================= */
function openCalendar(triggerBtn) {
  const targetId = triggerBtn.getAttribute("data-calendar-target");
  const hiddenInput = document.getElementById(targetId);
  if (!hiddenInput) return;

  const { gy, gm, gd } = parseISODate(hiddenInput.value);
  if (state.lang === "fa") {
    const { jy, jm } = gregorianToJalali(gy, gm, gd);
    state.calendar.viewYear = jy;
    state.calendar.viewMonth = jm;
  } else {
    state.calendar.viewYear = gy;
    state.calendar.viewMonth = gm;
  }

  state.calendar.isOpen = true;
  state.calendar.targetInputId = targetId;
  state.calendar.triggerEl = triggerBtn;

  // Ensure calendar renders inside top-layer dialog if triggered inside modal
  if (taskModal.open && taskModal.contains(triggerBtn)) {
    taskModal.appendChild(calPopover);
  } else {
    document.body.appendChild(calPopover);
  }

  calPopover.hidden = false;
  renderCalendar();
  positionCalendar(triggerBtn);
}

function closeCalendar() {
  state.calendar.isOpen = false;
  calPopover.hidden = true;
}

function positionCalendar(triggerBtn) {
  const rect = triggerBtn.getBoundingClientRect();
  const popWidth = 292;
  const popHeight = 320;

  let left = state.lang === "fa" ? rect.right - popWidth : rect.left;
  left = Math.max(12, Math.min(left, window.innerWidth - popWidth - 12));

  let top = rect.bottom + 6;
  if (top + popHeight > window.innerHeight - 12) {
    top = Math.max(12, rect.top - popHeight - 6);
  }

  calPopover.style.left = `${left}px`;
  calPopover.style.top = `${top}px`;
}

function renderCalendar() {
  const meta = CALENDAR_META[state.lang];
  const vy = state.calendar.viewYear;
  const vm = state.calendar.viewMonth;

  const hiddenInput = document.getElementById(state.calendar.targetInputId);
  const selectedISO = hiddenInput ? hiddenInput.value : "";

  const now = new Date();
  const todayISO = toISODate(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );

  const yearLabel = state.lang === "fa" ? toPersianDigits(vy) : String(vy);
  calMonthYearEl.textContent = `${meta.months[vm - 1]} ${yearLabel}`;
  calSystemBadgeEl.textContent = meta.systemLabel;
  calTodayBtn.textContent = meta.todayBtn;
  calCloseBtn.textContent = meta.closeBtn;

  calWeekdaysEl.innerHTML = meta.weekdays
    .map((dayName) => `<span class="cal-weekday">${escapeHTML(dayName)}</span>`)
    .join("");

  let firstDayOffset = 0;
  let totalDays = 30;

  if (state.lang === "fa") {
    const gFirst = jalaliToGregorian(vy, vm, 1);
    const jsDay = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay(); // 0=Sun..6=Sat
    firstDayOffset = (jsDay + 1) % 7; // Saturday = 0
    totalDays = getJalaliMonthLength(vy, vm);
  } else {
    const jsDay = new Date(vy, vm - 1, 1).getDay(); // 0=Sun..6=Sat
    firstDayOffset = state.lang === "de" ? (jsDay + 6) % 7 : jsDay; // Monday = 0 for DE, Sunday = 0 for EN
    totalDays = new Date(vy, vm, 0).getDate();
  }

  let cellsHTML = "";
  for (let i = 0; i < firstDayOffset; i++) {
    cellsHTML += `<span class="cal-day-empty"></span>`;
  }

  for (let day = 1; day <= totalDays; day++) {
    let cellISO = "";
    if (state.lang === "fa") {
      const gDate = jalaliToGregorian(vy, vm, day);
      cellISO = toISODate(gDate.gy, gDate.gm, gDate.gd);
    } else {
      cellISO = toISODate(vy, vm, day);
    }

    const isSelected = cellISO === selectedISO;
    const isToday = cellISO === todayISO;
    const classes = ["cal-day-cell"];
    if (isToday) classes.push("is-today");
    if (isSelected) classes.push("is-selected");

    const dayLabel = state.lang === "fa" ? toPersianDigits(day) : String(day);
    cellsHTML += `<button type="button" class="${classes.join(" ")}" data-cal-iso="${cellISO}">${dayLabel}</button>`;
  }

  calDaysGridEl.innerHTML = cellsHTML;
}

function applyTheme(themeName) {
  state.theme = themeName === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  } catch {
    // Ignore storage errors
  }

  const dict = I18N[state.lang];
  themeLabelEl.textContent =
    state.theme === "dark" ? dict.themeLight : dict.themeDark;
}

function applyLanguage(langCode) {
  const nextLang = hasKey(I18N, langCode) ? langCode : "en";
  const isDefaultDemoOnly =
    state.tasks.length > 0 &&
    state.tasks.every((t) => /^task-(10|20|30)\d$/.test(t.id));

  state.lang = nextLang;
  if (isDefaultDemoOnly) {
    state.tasks = JSON.parse(JSON.stringify(SAMPLE_TASKS_BY_LANG[state.lang]));
    saveTasks();
  }

  try {
    localStorage.setItem(LANG_STORAGE_KEY, state.lang);
  } catch {
    // Ignore storage errors
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", state.lang);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // Ignore history errors
  }

  const dict = I18N[state.lang];
  document.documentElement.lang = state.lang;
  document.documentElement.dir = dict.dir;
  document.title = dict.pageTitle;

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-lang") === state.lang;
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

  [tagSelect, editTagSelect].forEach((sel) => {
    Array.from(sel.options).forEach((opt) => {
      opt.textContent = translateTag(opt.value);
    });
  });

  if (state.calendar.isOpen) {
    closeCalendar();
  }
  syncDueDisplays();
  applyTheme(state.theme);
  renderAll();
}

/* =========================================================
   ANALYTICS ENGINE: KPIs, SVG DONUT, SVG BAR & PERCENTAGES
   ========================================================= */
function renderKPIs() {
  const dict = I18N[state.lang];
  const total = state.tasks.length;
  const totalHours = state.tasks.reduce((sum, t) => sum + t.hours, 0);
  const doneCount = state.tasks.filter((t) => t.status === "done").length;
  const activeCount = state.tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const highCount = state.tasks.filter((t) => t.priority === "high").length;

  const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const activePct = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;

  statTotalEl.textContent = formatNum(total);
  statHoursChipEl.textContent = `${formatNum(totalHours)} ${dict.hoursUnit}`;
  statRateEl.textContent = formatPct(donePct);
  statDoneCountEl.textContent = `${formatNum(doneCount)}/${formatNum(total)}`;
  progressBarEl.value = donePct;

  statActivePctEl.textContent = formatPct(activePct);
  statActiveCountEl.textContent = formatNum(activeCount);

  statHighPctEl.textContent = formatPct(highPct);
  statHighCountEl.textContent = formatNum(highCount);
}

function renderDonutChart() {
  const total = state.tasks.length;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const stageData = STAGES.map((stage) => {
    const count = state.tasks.filter((t) => t.status === stage).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      stage,
      count,
      pct,
      color: STAGE_COLORS[stage],
    };
  });

  const doneObj = stageData.find((d) => d.stage === "done");
  donutCenterPctEl.textContent = formatPct(doneObj ? doneObj.pct : 0);

  let svgCircles = `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(148,163,184,0.16)" stroke-width="18"></circle>`;

  if (total > 0) {
    let accumulatedLength = 0;
    stageData.forEach((item) => {
      if (item.count === 0) return;
      const segmentLength = (item.count / total) * circumference;
      const dashArray = `${Math.max(0, segmentLength - 2)} ${circumference}`;
      const dashOffset = -accumulatedLength;
      accumulatedLength += segmentLength;

      svgCircles += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${item.color}" stroke-width="18" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}"></circle>`;
    });
  }

  donutSvgEl.innerHTML = svgCircles;

  const swatchClassMap = {
    backlog: "swatch-backlog",
    todo: "swatch-todo",
    "in-progress": "swatch-progress",
    done: "swatch-done",
  };

  donutLegendEl.innerHTML = stageData
    .map(
      (item) => `
      <li class="legend-item">
        <span class="legend-left">
          <span class="legend-swatch ${swatchClassMap[item.stage]}"></span>
          <span>${escapeHTML(translateStage(item.stage))}</span>
        </span>
        <span class="legend-val">${formatNum(item.count)} (${formatPct(item.pct)})</span>
      </li>
    `,
    )
    .join("");
}

function renderBarChart() {
  const total = state.tasks.length;
  const counts = TRACKS.map((track) => ({
    track,
    label: translateTag(track),
    count: state.tasks.filter((t) => t.tag === track).length,
    color: TRACK_COLORS[track],
  }));

  const maxCount = Math.max(1, ...counts.map((c) => c.count));
  const chartBottomY = 165;
  const maxBarHeight = 122;
  const colWidth = 44;
  const gap = 34;
  const startX = 28;

  let svgParts = `<line x1="12" y1="${chartBottomY}" x2="408" y2="${chartBottomY}" class="bar-axis-line"></line>`;

  counts.forEach((item, index) => {
    const x = startX + index * (colWidth + gap);
    const barHeight =
      item.count > 0 ? Math.max(8, (item.count / maxCount) * maxBarHeight) : 4;
    const y = chartBottomY - barHeight;
    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
    const topText = `${formatNum(item.count)} (${formatPct(pct)})`;

    svgParts += `
      <g>
        <rect x="${x}" y="${y}" width="${colWidth}" height="${barHeight}" rx="7" fill="${item.color}" opacity="${item.count > 0 ? "0.92" : "0.22"}"></rect>
        <text x="${x + colWidth / 2}" y="${y - 7}" text-anchor="middle" class="bar-label-top">${escapeHTML(topText)}</text>
        <text x="${x + colWidth / 2}" y="${chartBottomY + 20}" text-anchor="middle" class="bar-label-bottom">${escapeHTML(item.label)}</text>
      </g>
    `;
  });

  barChartSvgEl.innerHTML = svgParts;
}

function renderPercentageBars() {
  const dict = I18N[state.lang];
  const total = state.tasks.length;

  const priorityRows = [
    { key: "high", label: dict.priorityHigh, fillClass: "fill-high" },
    { key: "medium", label: dict.priorityMedium, fillClass: "fill-medium" },
    { key: "low", label: dict.priorityLow, fillClass: "fill-low" },
  ].map((p) => {
    const count = state.tasks.filter((t) => t.priority === p.key).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...p, count, pct };
  });

  priorityBarsEl.innerHTML = priorityRows
    .map(
      (row) => `
      <div class="pct-row">
        <div class="pct-row-meta">
          <span>${escapeHTML(row.label)}</span>
          <strong>${formatNum(row.count)} (${formatPct(row.pct)})</strong>
        </div>
        <div class="pct-track">
          <div class="pct-fill ${row.fillClass}" data-width="${row.pct}"></div>
        </div>
      </div>
    `,
    )
    .join("");

  const totalHours = state.tasks.reduce((sum, t) => sum + t.hours, 0);
  const memberRows = MEMBERS.map((member) => {
    const hours = state.tasks
      .filter((t) => t.assignee === member)
      .reduce((sum, t) => sum + t.hours, 0);
    const pct = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0;
    return { member, hours, pct };
  }).sort((a, b) => b.hours - a.hours);

  workloadBarsEl.innerHTML = memberRows
    .map(
      (row) => `
      <div class="pct-row">
        <div class="pct-row-meta">
          <span>${escapeHTML(row.member)}</span>
          <strong>${formatNum(row.hours)} ${escapeHTML(dict.hoursUnit)} (${formatPct(row.pct)})</strong>
        </div>
        <div class="pct-track">
          <div class="pct-fill fill-member" data-width="${row.pct}"></div>
        </div>
      </div>
    `,
    )
    .join("");

  document.querySelectorAll(".pct-fill[data-width]").forEach((bar) => {
    bar.style.width = `${bar.getAttribute("data-width")}%`;
  });
}

/* =========================================================
   KANBAN BOARD & TASK CARDS
   ========================================================= */
function createTaskCardHTML(task) {
  const dict = I18N[state.lang];
  const stageIndex = STAGES.indexOf(task.status);
  const canMoveBack = stageIndex > 0;
  const canMoveNext = stageIndex < STAGES.length - 1;

  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const totalSubs = task.subtasks.length;
  const subtaskBadge =
    totalSubs > 0
      ? `<span class="subtask-chip">${formatNum(doneSubs)}/${formatNum(totalSubs)}</span>`
      : "";

  const backBtnHTML = canMoveBack
    ? `<button type="button" class="icon-btn" data-move-prev="${escapeHTML(task.id)}" title="${escapeHTML(dict.moveBackTitle)}" aria-label="${escapeHTML(dict.moveBackTitle)}">
        <svg class="icon-flip" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>`
    : "";

  const nextBtnHTML = canMoveNext
    ? `<button type="button" class="icon-btn" data-move-next="${escapeHTML(task.id)}" title="${escapeHTML(dict.moveNextTitle)}" aria-label="${escapeHTML(dict.moveNextTitle)}">
        <svg class="icon-flip" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>`
    : "";

  return `
    <li class="task-card" draggable="true" data-task-id="${escapeHTML(task.id)}">
      <div class="task-card-top">
        <span class="ticket-code">${escapeHTML(task.code)}</span>
        <div class="task-badges">
          <span class="tag-badge">${escapeHTML(translateTag(task.tag))}</span>
          <span class="priority-badge priority-${escapeHTML(task.priority)}">${escapeHTML(translatePriority(task.priority))}</span>
        </div>
      </div>

      <div class="task-title">${escapeHTML(task.title)}</div>
      ${task.desc ? `<p class="task-desc-snippet">${escapeHTML(task.desc)}</p>` : ""}

      <div class="task-meta-strip">
        <span class="assignee-pill">
          <span class="avatar-circle">${escapeHTML(getInitials(task.assignee))}</span>
          <span>${escapeHTML(task.assignee)}</span>
        </span>
        <div>
          ${subtaskBadge}
          <span>${formatNum(task.hours)}${escapeHTML(dict.hoursUnit)} • ${escapeHTML(formatDate(task.dueDate, false))}</span>
        </div>
      </div>

      <div class="task-card-footer">
        <button
          type="button"
          class="icon-btn"
          data-edit-id="${escapeHTML(task.id)}"
          title="${escapeHTML(dict.editTitle)}"
          aria-label="${escapeHTML(dict.editTitle)}"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>

        <div class="card-actions">
          ${backBtnHTML}
          ${nextBtnHTML}
          <button
            type="button"
            class="icon-btn icon-btn-delete"
            data-delete-id="${escapeHTML(task.id)}"
            title="${escapeHTML(dict.deleteTitle)}"
            aria-label="${escapeHTML(dict.deleteTitle)}"
          >&times;</button>
        </div>
      </div>
    </li>
  `;
}

function renderBoard() {
  const dict = I18N[state.lang];
  const query = state.searchQuery.trim().toLowerCase();

  const filtered = state.tasks.filter((task) => {
    const matchesPriority =
      state.priorityFilter === "all" || task.priority === state.priorityFilter;
    const matchesAssignee =
      state.assigneeFilter === "all" || task.assignee === state.assigneeFilter;
    const localizedTag = translateTag(task.tag).toLowerCase();
    const matchesSearch =
      task.code.toLowerCase().includes(query) ||
      task.title.toLowerCase().includes(query) ||
      task.desc.toLowerCase().includes(query) ||
      task.assignee.toLowerCase().includes(query) ||
      task.tag.toLowerCase().includes(query) ||
      localizedTag.includes(query);
    return matchesPriority && matchesAssignee && matchesSearch;
  });

  STAGES.forEach((stage) => {
    const items = filtered.filter((t) => t.status === stage);
    stageCounts[stage].textContent = formatNum(items.length);
    const zone = dropzones[stage];
    if (items.length === 0) {
      zone.innerHTML = `<li class="empty-column">${escapeHTML(dict.emptyColumn)}</li>`;
    } else {
      zone.innerHTML = items.map(createTaskCardHTML).join("");
    }
  });
}

function renderAll() {
  renderKPIs();
  renderDonutChart();
  renderBarChart();
  renderPercentageBars();
  renderBoard();
}

/* =========================================================
   TASK MUTATIONS & MODAL CHECKLIST
   ========================================================= */
function getNextTicketCode() {
  const maxNum = state.tasks.reduce((max, t) => {
    const num = Number.parseInt(t.code.replace(/\D/g, ""), 10);
    return Number.isFinite(num) && num > max ? num : max;
  }, 100);
  return `NX-${maxNum + 1}`;
}

function moveTaskToStage(taskId, targetStage) {
  if (!STAGES.includes(targetStage)) return;
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.status === targetStage) return;
  task.status = targetStage;
  saveTasks();
  renderAll();
}

function shiftTaskStage(taskId, step) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  const idx = STAGES.indexOf(task.status) + step;
  if (idx < 0 || idx >= STAGES.length) return;
  task.status = STAGES[idx];
  saveTasks();
  renderAll();
}

function renderModalSubtasks(task) {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  modalSubtaskPctEl.textContent = formatPct(pct);

  subtaskListEl.innerHTML = task.subtasks
    .map(
      (sub, index) => `
      <li class="subtask-item ${sub.done ? "is-checked" : ""}">
        <input type="checkbox" data-sub-idx="${index}" ${sub.done ? "checked" : ""} />
        <span>${escapeHTML(sub.text)}</span>
      </li>
    `,
    )
    .join("");
}

function openTaskModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  closeCalendar();
  state.activeModalTaskId = task.id;
  modalTicketCodeEl.textContent = task.code;
  editTaskIdInput.value = task.id;
  editTitleInput.value = task.title;
  editDescInput.value = task.desc;
  editTagSelect.value = task.tag;
  editPrioritySelect.value = task.priority;
  editStatusSelect.value = task.status;
  editAssigneeSelect.value = task.assignee;
  editHoursInput.value = String(task.hours);
  editDueInput.value = task.dueDate;
  syncDueDisplays();

  renderModalSubtasks(task);
  if (typeof taskModal.showModal === "function") {
    taskModal.showModal();
  }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
document.addEventListener("click", (event) => {
  const langBtn = event.target.closest(".lang-btn[data-lang]");
  if (langBtn) {
    applyLanguage(langBtn.getAttribute("data-lang"));
    return;
  }

  const calTrigger = event.target.closest(
    ".date-trigger-btn[data-calendar-target]",
  );
  if (calTrigger) {
    const targetId = calTrigger.getAttribute("data-calendar-target");
    if (state.calendar.isOpen && state.calendar.targetInputId === targetId) {
      closeCalendar();
    } else {
      openCalendar(calTrigger);
    }
    return;
  }

  const dayCell = event.target.closest(".cal-day-cell[data-cal-iso]");
  if (dayCell) {
    const pickedISO = dayCell.getAttribute("data-cal-iso");
    const targetInput = document.getElementById(state.calendar.targetInputId);
    if (targetInput && pickedISO) {
      targetInput.value = pickedISO;
      syncDueDisplays();
    }
    closeCalendar();
    return;
  }

  if (
    state.calendar.isOpen &&
    !calPopover.contains(event.target) &&
    !event.target.closest(".date-trigger-btn")
  ) {
    closeCalendar();
  }
});

calPrevBtn.addEventListener("click", () => {
  if (state.calendar.viewMonth === 1) {
    state.calendar.viewMonth = 12;
    state.calendar.viewYear -= 1;
  } else {
    state.calendar.viewMonth -= 1;
  }
  renderCalendar();
});

calNextBtn.addEventListener("click", () => {
  if (state.calendar.viewMonth === 12) {
    state.calendar.viewMonth = 1;
    state.calendar.viewYear += 1;
  } else {
    state.calendar.viewMonth += 1;
  }
  renderCalendar();
});

calTodayBtn.addEventListener("click", () => {
  const now = new Date();
  const todayISO = toISODate(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  const targetInput = document.getElementById(state.calendar.targetInputId);
  if (targetInput) {
    targetInput.value = todayISO;
    syncDueDisplays();
  }
  closeCalendar();
});

calCloseBtn.addEventListener("click", closeCalendar);

window.addEventListener("resize", () => {
  if (state.calendar.isOpen && state.calendar.triggerEl) {
    positionCalendar(state.calendar.triggerEl);
  }
});

themeToggleBtn.addEventListener("click", () => {
  applyTheme(state.theme === "dark" ? "light" : "dark");
});

exportJsonBtn.addEventListener("click", () => {
  const payload = JSON.stringify(state.tasks, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nexusboard-sprint-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

seedBtn.addEventListener("click", () => {
  state.tasks = JSON.parse(JSON.stringify(SAMPLE_TASKS_BY_LANG[state.lang]));
  saveTasks();
  renderAll();
});

clearBtn.addEventListener("click", () => {
  state.tasks = [];
  saveTasks();
  renderAll();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim().slice(0, 80);
  const desc = descInput.value.trim().slice(0, 120);
  const tag = ALLOWED_TAGS.has(tagSelect.value) ? tagSelect.value : "Frontend";
  const priority = ALLOWED_PRIORITIES.has(prioritySelect.value)
    ? prioritySelect.value
    : "medium";
  const assignee = ALLOWED_MEMBERS.has(assigneeSelect.value)
    ? assigneeSelect.value
    : "Alireza B.";
  const hours = Math.min(
    200,
    Math.max(1, Number.parseInt(hoursInput.value, 10) || 4),
  );
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(dueInput.value)
    ? dueInput.value
    : new Date().toISOString().split("T")[0];
  const status = STAGES.includes(statusSelect.value)
    ? statusSelect.value
    : "todo";

  if (!title) {
    titleInput.focus();
    return;
  }

  state.tasks.unshift({
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `task-${Date.now()}`,
    code: getNextTicketCode(),
    title,
    desc,
    tag,
    priority,
    status,
    assignee,
    hours,
    dueDate,
    subtasks: [],
  });

  saveTasks();
  renderAll();
  titleInput.value = "";
  descInput.value = "";
  titleInput.focus();
});

// Board Delegation (Edit, Move, Delete)
const boardGrid = document.querySelector(".board-grid");

boardGrid.addEventListener("click", (event) => {
  const editBtn = event.target.closest("[data-edit-id]");
  if (editBtn) {
    openTaskModal(editBtn.getAttribute("data-edit-id"));
    return;
  }

  const prevBtn = event.target.closest("[data-move-prev]");
  if (prevBtn) {
    shiftTaskStage(prevBtn.getAttribute("data-move-prev"), -1);
    return;
  }

  const nextBtn = event.target.closest("[data-move-next]");
  if (nextBtn) {
    shiftTaskStage(nextBtn.getAttribute("data-move-next"), 1);
    return;
  }

  const deleteBtn = event.target.closest("[data-delete-id]");
  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-delete-id");
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasks();
    renderAll();
  }
});

// HTML5 Drag & Drop
boardGrid.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".task-card[data-task-id]");
  if (!card) return;
  state.draggedTaskId = card.getAttribute("data-task-id");
  card.classList.add("is-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", state.draggedTaskId);
  }
});

boardGrid.addEventListener("dragend", (event) => {
  const card = event.target.closest(".task-card");
  if (card) card.classList.remove("is-dragging");
  state.draggedTaskId = null;
  document
    .querySelectorAll(".column-dropzone")
    .forEach((zone) => zone.classList.remove("is-drag-over"));
});

Object.values(dropzones).forEach((zone) => {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("is-drag-over");
  });

  zone.addEventListener("dragleave", (event) => {
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-drag-over");
    }
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-drag-over");
    const taskId =
      state.draggedTaskId ||
      (event.dataTransfer && event.dataTransfer.getData("text/plain"));
    const targetStage = zone.getAttribute("data-status");
    if (taskId && targetStage) {
      moveTaskToStage(taskId, targetStage);
    }
  });
});

// Modal Subtasks & Save
modalCloseBtn.addEventListener("click", () => {
  closeCalendar();
  taskModal.close();
});

subtaskListEl.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[type="checkbox"][data-sub-idx]');
  if (!checkbox || !state.activeModalTaskId) return;
  const task = state.tasks.find((t) => t.id === state.activeModalTaskId);
  if (!task) return;
  const idx = Number.parseInt(checkbox.getAttribute("data-sub-idx"), 10);
  if (task.subtasks[idx]) {
    task.subtasks[idx].done = checkbox.checked;
    saveTasks();
    renderModalSubtasks(task);
    renderBoard();
  }
});

addSubtaskBtn.addEventListener("click", () => {
  if (!state.activeModalTaskId) return;
  const task = state.tasks.find((t) => t.id === state.activeModalTaskId);
  const text = newSubtaskInput.value.trim().slice(0, 70);
  if (!task || !text) return;
  task.subtasks.push({ text, done: false });
  newSubtaskInput.value = "";
  saveTasks();
  renderModalSubtasks(task);
  renderBoard();
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = state.tasks.find((t) => t.id === editTaskIdInput.value);
  if (!task) return;

  const newTitle = editTitleInput.value.trim().slice(0, 80);
  if (!newTitle) return;

  task.title = newTitle;
  task.desc = editDescInput.value.trim().slice(0, 180);
  if (ALLOWED_TAGS.has(editTagSelect.value)) task.tag = editTagSelect.value;
  if (ALLOWED_PRIORITIES.has(editPrioritySelect.value)) {
    task.priority = editPrioritySelect.value;
  }
  if (STAGES.includes(editStatusSelect.value)) {
    task.status = editStatusSelect.value;
  }
  if (ALLOWED_MEMBERS.has(editAssigneeSelect.value)) {
    task.assignee = editAssigneeSelect.value;
  }
  task.hours = Math.min(
    200,
    Math.max(1, Number.parseInt(editHoursInput.value, 10) || 4),
  );
  if (/^\d{4}-\d{2}-\d{2}$/.test(editDueInput.value)) {
    task.dueDate = editDueInput.value;
  }

  closeCalendar();
  saveTasks();
  renderAll();
  taskModal.close();
});

// Filters
searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value.slice(0, 60);
  renderBoard();
});

filterPrioritySelect.addEventListener("change", (event) => {
  state.priorityFilter = event.target.value;
  renderBoard();
});

filterAssigneeSelect.addEventListener("change", (event) => {
  state.assigneeFilter = event.target.value;
  renderBoard();
});

// Initialize Default Due Date & Render
dueInput.value = new Date(Date.now() + 3 * 86400000)
  .toISOString()
  .split("T")[0];
syncDueDisplays();
applyLanguage(state.lang);
