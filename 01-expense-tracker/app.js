const STORAGE_KEY = "alireza_ledgerflow_transactions_v1";

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

// Application State
const state = {
  transactions: loadTransactions(),
  filterType: "all",
  searchQuery: "",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function loadTransactions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TRANSACTIONS));
    return [...SAMPLE_TRANSACTIONS];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const expenses = state.transactions.filter((tx) => tx.type === "expense");

  if (expenses.length === 0) {
    breakdownEl.innerHTML = `<p class="empty-state">No expenses recorded yet to visualize.</p>`;
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
      const percent = Math.round((amount / totalExpense) * 100);
      return `
        <div class="breakdown-item">
          <div class="breakdown-meta">
            <span>${escapeHTML(category)}</span>
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
  const query = state.searchQuery.trim().toLowerCase();

  const filtered = state.transactions
    .filter((tx) => {
      const matchesType =
        state.filterType === "all" || tx.type === state.filterType;
      const matchesQuery =
        tx.title.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  txCountEl.textContent = String(filtered.length);

  if (filtered.length === 0) {
    transactionListEl.innerHTML = `
      <li class="empty-state">
        No transactions match the current filter. Add a new record on the left.
      </li>
    `;
    return;
  }

  transactionListEl.innerHTML = filtered
    .map((tx) => {
      const sign = tx.type === "income" ? "+" : "-";
      const formattedAmount = `${sign}${currencyFormatter.format(tx.amount)}`;

      return `
        <li class="tx-item is-${tx.type}">
          <div class="tx-info">
            <div class="tx-title">${escapeHTML(tx.title)}</div>
            <div class="tx-sub">
              <span class="cat-tag">${escapeHTML(tx.category)}</span>
              <span>${escapeHTML(formatDate(tx.date))}</span>
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount ${tx.type}">${formattedAmount}</span>
            <button
              type="button"
              class="delete-btn"
              data-delete-id="${escapeHTML(tx.id)}"
              aria-label="Delete ${escapeHTML(tx.title)}"
              title="Delete transaction"
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
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number.parseFloat(amountInput.value);
  const type = form.querySelector('input[name="tx-type"]:checked').value;
  const category = categorySelect.value;
  const date = dateInput.value || new Date().toISOString().split("T")[0];

  if (!title || Number.isNaN(amount) || amount <= 0) return;

  const newTransaction = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}`,
    title,
    amount,
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
  state.filterType = event.target.value;
  renderTransactions();
});

searchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value;
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

// Initialize Default Date & Render
dateInput.value = new Date().toISOString().split("T")[0];
renderApp();
