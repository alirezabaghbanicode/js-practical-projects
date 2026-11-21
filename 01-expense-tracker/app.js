"use strict";

const STORAGE_KEY = "alireza_ledgerflow_transactions_v1";
const LANG_STORAGE_KEY = "alireza_ledgerflow_lang_v1";

const ALLOWED_CATEGORIES = new Set([
  "Software & Tools",
  "Housing & Bills",
  "Food & Dining",
  "Transport",
  "Salary",
  "Freelance",
  "Other",
]);

const I18N = {
  en: {
    dir: "ltr",
    locale: "en-US",
    pageTitle: "LedgerFlow — Smart Expense & Budget Tracker",
    pageH1: "LedgerFlow Personal Expense and Budget Tracker",
    brandSub: "Personal Finance & Cashflow Engine",
    seedBtn: "Load Demo Data",
    clearBtn: "Clear All",
    kpiBalanceLabel: "Net Balance",
    kpiBalanceMeta: "Available cashflow",
    kpiIncomeLabel: "Total Income",
    kpiIncomeMeta: "Inflows recorded",
    kpiExpenseLabel: "Total Expenses",
    kpiExpenseMeta: "Outflows recorded",
    kpiSavingsLabel: "Savings Ratio",
    kpiSavingsMeta: "Retained from income",
    formHeading: "New Transaction",
    formSub: "Record an income source or expense item",
    typeExpense: "Expense (-)",
    typeIncome: "Income (+)",
    labelDesc: "Description",
    placeholderDesc: "e.g., Cloud Hosting, Freelance Project",
    labelAmount: "Amount (USD)",
    labelDate: "Date",
    labelCategory: "Category",
    submitBtn: "Add Transaction",
    breakdownHeading: "Expense Breakdown",
    breakdownSub: "Spending distribution by category",
    ledgerHeading: "Transaction Ledger",
    matchingRecords: "matching records",
    searchPlaceholder: "Search description or category...",
    filterAll: "All Types",
    filterIncome: "Income Only",
    filterExpense: "Expenses Only",
    emptyBreakdown: "No expenses recorded yet to visualize.",
    emptyLedger:
      "No transactions match the current filter. Add a new record on the panel.",
    deleteTitle: "Delete transaction",
    footerTech: "LedgerFlow • Vanilla JavaScript & LocalStorage",
    footerBuiltBy: "Built by",
    categories: {
      "Software & Tools": "Software & Tools",
      "Housing & Bills": "Housing & Bills",
      "Food & Dining": "Food & Dining",
      Transport: "Transport",
      Salary: "Salary",
      Freelance: "Freelance",
      Other: "Other",
    },
  },
  de: {
    dir: "ltr",
    locale: "de-DE",
    pageTitle: "LedgerFlow — Haushalts- & Budgetplaner",
    pageH1: "LedgerFlow Persönlicher Haushalts- und Budgetplaner",
    brandSub: "Persönliche Finanz- & Cashflow-Übersicht",
    seedBtn: "Beispieldaten laden",
    clearBtn: "Alle löschen",
    kpiBalanceLabel: "Nettosaldo",
    kpiBalanceMeta: "Verfügbarer Cashflow",
    kpiIncomeLabel: "Gesamteinnahmen",
    kpiIncomeMeta: "Erfasste Zuflüsse",
    kpiExpenseLabel: "Gesamtausgaben",
    kpiExpenseMeta: "Erfasste Abflüsse",
    kpiSavingsLabel: "Sparquote",
    kpiSavingsMeta: "Vom Einkommen gespart",
    formHeading: "Neue Transaktion",
    formSub: "Einnahmequelle oder Ausgabe erfassen",
    typeExpense: "Ausgabe (-)",
    typeIncome: "Einnahme (+)",
    labelDesc: "Beschreibung",
    placeholderDesc: "z. B. Cloud-Hosting, Freelance-Projekt",
    labelAmount: "Betrag (USD)",
    labelDate: "Datum",
    labelCategory: "Kategorie",
    submitBtn: "Transaktion hinzufügen",
    breakdownHeading: "Ausgabenverteilung",
    breakdownSub: "Verteilung nach Kategorien",
    ledgerHeading: "Transaktionsübersicht",
    matchingRecords: "passende Einträge",
    searchPlaceholder: "Beschreibung oder Kategorie suchen...",
    filterAll: "Alle Typen",
    filterIncome: "Nur Einnahmen",
    filterExpense: "Nur Ausgaben",
    emptyBreakdown: "Noch keine Ausgaben zur Visualisierung erfasst.",
    emptyLedger:
      "Keine Transaktionen für den aktuellen Filter gefunden. Fügen Sie einen neuen Eintrag hinzu.",
    deleteTitle: "Transaktion löschen",
    footerTech: "LedgerFlow • Vanilla JavaScript & LocalStorage",
    footerBuiltBy: "Entwickelt von",
    categories: {
      "Software & Tools": "Software & Tools",
      "Housing & Bills": "Wohnen & Rechnungen",
      "Food & Dining": "Essen & Gastronomie",
      Transport: "Transport",
      Salary: "Gehalt",
      Freelance: "Freelance",
      Other: "Sonstiges",
    },
  },
  fa: {
    dir: "rtl",
    locale: "fa-IR",
    pageTitle: "LedgerFlow — مدیریت هوشمند درآمد و هزینه",
    pageH1: "سامانه مدیریت هوشمند درآمد و هزینه LedgerFlow",
    brandSub: "سامانه مدیریت مالی شخصی و جریان نقدینگی",
    seedBtn: "بارگذاری داده نمونه",
    clearBtn: "پاک کردن همه",
    kpiBalanceLabel: "تراز خالص",
    kpiBalanceMeta: "موجودی قابل دسترس",
    kpiIncomeLabel: "مجموع درآمد",
    kpiIncomeMeta: "ورودی‌های ثبت‌شده",
    kpiExpenseLabel: "مجموع هزینه‌ها",
    kpiExpenseMeta: "خروجی‌های ثبت‌شده",
    kpiSavingsLabel: "نرخ پس‌انداز",
    kpiSavingsMeta: "نسبت به کل درآمد",
    formHeading: "تراکنش جدید",
    formSub: "ثبت منبع درآمد یا هزینه جدید",
    typeExpense: "هزینه (-)",
    typeIncome: "درآمد (+)",
    labelDesc: "شرح تراکنش",
    placeholderDesc: "مثلاً: هزینه سرور ابری، پروژه فریلنسری",
    labelAmount: "مبلغ (دلار)",
    labelDate: "تاریخ",
    labelCategory: "دسته‌بندی",
    submitBtn: "افزودن تراکنش",
    breakdownHeading: "تفکیک هزینه‌ها",
    breakdownSub: "سهم هزینه‌ها بر اساس دسته‌بندی",
    ledgerHeading: "دفتر کل تراکنش‌ها",
    matchingRecords: "رکورد یافت شد",
    searchPlaceholder: "جستجو در شرح یا دسته‌بندی...",
    filterAll: "همه تراکنش‌ها",
    filterIncome: "فقط درآمدها",
    filterExpense: "فقط هزینه‌ها",
    emptyBreakdown: "هنوز هزینه‌ای برای نمایش نمودار ثبت نشده است.",
    emptyLedger:
      "تراکنشی مطابق فیلتر فعلی پیدا نشد. از فرم کنار صفحه یک مورد جدید ثبت کنید.",
    deleteTitle: "حذف تراکنش",
    footerTech: "LedgerFlow • پیاده‌سازی با جاوااسکریپت خالص و LocalStorage",
    footerBuiltBy: "طراحی و توسعه توسط",
    categories: {
      "Software & Tools": "نرم‌افزار و ابزارها",
      "Housing & Bills": "مسکن و قبوض",
      "Food & Dining": "خوراک و رستوران",
      Transport: "حمل‌ونقل",
      Salary: "حقوق ماهانه",
      Freelance: "پروژه فریلنسری",
      Other: "سایر موارد",
    },
  },
};

const SAMPLE_TRANSACTIONS = [
  {
    id: "tx-101",
    title: "Frontend Web Development Milestone",
    amount: 1450.0,
    type: "income",
    category: "Freelance",
    date: "2026-11-18",
  },
  {
    id: "tx-102",
    title: "Monthly Software Engineering Retainer",
    amount: 2800.0,
    type: "income",
    category: "Salary",
    date: "2026-11-15",
  },
  {
    id: "tx-103",
    title: "Apartment Rent & Service Charge",
    amount: 1150.0,
    type: "expense",
    category: "Housing & Bills",
    date: "2026-11-14",
  },
  {
    id: "tx-104",
    title: "Cloud VPS & AI Developer Subscriptions",
    amount: 68.5,
    type: "expense",
    category: "Software & Tools",
    date: "2026-11-12",
  },
  {
    id: "tx-105",
    title: "Weekly Groceries & Specialty Coffee",
    amount: 134.25,
    type: "expense",
    category: "Food & Dining",
    date: "2026-11-10",
  },
];

// DOM References
const form = document.getElementById("transaction-form");
const titleInput = document.getElementById("tx-title");
const amountInput = document.getElementById("tx-amount");
const dateInput = document.getElementById("tx-date");
const categorySelect = document.getElementById("tx-category");

const netBalanceEl = document.getElementById("net-balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const savingsRateEl = document.getElementById("savings-rate");

const breakdownEl = document.getElementById("category-breakdown");
const transactionListEl = document.getElementById("transaction-list");
const txCountEl = document.getElementById("tx-count");
const searchInput = document.getElementById("search-input");
const filterTypeSelect = document.getElementById("filter-type");

const seedBtn = document.getElementById("seed-btn");
const clearBtn = document.getElementById("clear-btn");
const langButtons = document.querySelectorAll(".lang-btn");

// Application State
const state = {
  lang: loadLanguage(),
  transactions: loadTransactions(),
  filterType: "all",
  searchQuery: "",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function isValidTransaction(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.amount === "number" &&
    Number.isFinite(item.amount) &&
    item.amount > 0 &&
    (item.type === "income" || item.type === "expense") &&
    ALLOWED_CATEGORIES.has(item.category) &&
    typeof item.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date)
  );
}

function loadLanguage() {
  try {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    return savedLang && Object.hasOwn(I18N, savedLang) ? savedLang : "en";
  } catch {
    return "en";
  }
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TRANSACTIONS));
      return [...SAMPLE_TRANSACTIONS];
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTransaction);
  } catch {
    return [];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  } catch {
    // Ignore storage quota errors safely
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function translateCategory(categoryKey) {
  const dict = I18N[state.lang];
  return dict.categories[categoryKey] || categoryKey;
}

function formatDate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [year, month, day] = isoDate.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const locale = I18N[state.lang].locale;
  return dateObj.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function applyLanguage(langCode) {
  state.lang = Object.hasOwn(I18N, langCode) ? langCode : "en";
  try {
    localStorage.setItem(LANG_STORAGE_KEY, state.lang);
  } catch {
    // Ignore storage errors
  }

  const dict = I18N[state.lang];
  document.documentElement.lang = state.lang;
  document.documentElement.dir = dict.dir;
  document.title = dict.pageTitle;

  langButtons.forEach((btn) => {
    const isActive = btn.dataset.lang === state.lang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  Array.from(categorySelect.options).forEach((option) => {
    option.textContent = translateCategory(option.value);
  });

  renderApp();
}

function renderKPIs() {
  const totals = state.transactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += tx.amount;
      } else {
        acc.expense += tx.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const balance = totals.income - totals.expense;
  const savingsRate =
    totals.income > 0
      ? Math.max(0, Math.round((balance / totals.income) * 100))
      : 0;

  netBalanceEl.textContent = currencyFormatter.format(balance);
  totalIncomeEl.textContent = currencyFormatter.format(totals.income);
  totalExpenseEl.textContent = currencyFormatter.format(totals.expense);
  savingsRateEl.textContent = `${savingsRate}%`;
}

function renderCategoryBreakdown() {
  const dict = I18N[state.lang];
  const expenses = state.transactions.filter((tx) => tx.type === "expense");

  if (expenses.length === 0) {
    breakdownEl.innerHTML = `<p class="empty-state">${escapeHTML(dict.emptyBreakdown)}</p>`;
    return;
  }

  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  const grouped = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  breakdownEl.innerHTML = sortedCategories
    .map(([category, amount]) => {
      const percent = Math.min(
        100,
        Math.max(0, Math.round((amount / totalExpense) * 100)),
      );
      const label = translateCategory(category);
      return `
        <div class="breakdown-item">
          <div class="breakdown-meta">
            <span>${escapeHTML(label)}</span>
            <strong>${currencyFormatter.format(amount)} (${percent}%)</strong>
          </div>
          <div class="bar-track" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
            <div class="bar-fill" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTransactions() {
  const dict = I18N[state.lang];
  const query = state.searchQuery.trim().toLowerCase();

  const filtered = state.transactions
    .filter((tx) => {
      const matchesType =
        state.filterType === "all" || tx.type === state.filterType;
      const localizedCat = translateCategory(tx.category).toLowerCase();
      const matchesQuery =
        tx.title.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query) ||
        localizedCat.includes(query);
      return matchesType && matchesQuery;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  txCountEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    transactionListEl.innerHTML = `
      <li class="empty-state">
        ${escapeHTML(dict.emptyLedger)}
      </li>
    `;
    return;
  }

  transactionListEl.innerHTML = filtered
    .map((tx) => {
      const sign = tx.type === "income" ? "+" : "-";
      const formattedAmount = `${sign}${currencyFormatter.format(tx.amount)}`;
      const localizedCategory = translateCategory(tx.category);

      return `
        <li class="tx-item is-${tx.type}">
          <div class="tx-info">
            <div class="tx-title">${escapeHTML(tx.title)}</div>
            <div class="tx-sub">
              <span class="cat-tag">${escapeHTML(localizedCategory)}</span>
              <span>${escapeHTML(formatDate(tx.date))}</span>
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${tx.type}">${formattedAmount}</span>
            <button
              type="button"
              class="delete-btn"
              data-delete-id="${escapeHTML(tx.id)}"
              aria-label="${escapeHTML(dict.deleteTitle)}: ${escapeHTML(tx.title)}"
              title="${escapeHTML(dict.deleteTitle)}"
            >
              &times;
            </button>
          </div>
        </li>
      `;
    })
    .join("");
}

function renderApp() {
  renderKPIs();
  renderCategoryBreakdown();
  renderTransactions();
}

// Event Listeners
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyLanguage(btn.dataset.lang);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim().slice(0, 60);
  const amount = Number.parseFloat(amountInput.value);
  const typeInput = form.querySelector('input[name="tx-type"]:checked');
  const type = typeInput && typeInput.value === "income" ? "income" : "expense";
  const category = ALLOWED_CATEGORIES.has(categorySelect.value)
    ? categorySelect.value
    : "Other";
  const rawDate = dateInput.value;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate
    : new Date().toISOString().split("T")[0];

  if (!title || !Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
    return;
  }

  const newTransaction = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}`,
    title,
    amount: Math.round(amount * 100) / 100,
    type,
    category,
    date,
  };

  state.transactions.unshift(newTransaction);
  saveTransactions();
  renderApp();

  titleInput.value = "";
  amountInput.value = "";
  titleInput.focus();
});

transactionListEl.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest("[data-delete-id]");
  if (!deleteBtn) return;

  const idToDelete = deleteBtn.dataset.deleteId;
  state.transactions = state.transactions.filter((tx) => tx.id !== idToDelete);
  saveTransactions();
  renderApp();
});

filterTypeSelect.addEventListener("change", (event) => {
  const val = event.target.value;
  state.filterType = val === "income" || val === "expense" ? val : "all";
  renderTransactions();
});

searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value.slice(0, 60);
  renderTransactions();
});

seedBtn.addEventListener("click", () => {
  state.transactions = [...SAMPLE_TRANSACTIONS];
  saveTransactions();
  renderApp();
});

clearBtn.addEventListener("click", () => {
  state.transactions = [];
  saveTransactions();
  renderApp();
});

// Initialize Default Date & Language
dateInput.value = new Date().toISOString().split("T")[0];
applyLanguage(state.lang);
