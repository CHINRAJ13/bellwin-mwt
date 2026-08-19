// Simple in-memory + localStorage store for loans shared between pages
const STORAGE_KEY = 'belwin_loans';

const seedData = [];

function initStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  }
}

export function getAllLoans() {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function saveLoan(loan) {
  const loans = getAllLoans();
  // Auto Generate Loan Number
  const newId = 'L' + String(loans.length + 1).padStart(4, '0');
  const newLoan = { ...loan, loanNumber: newId, id: newId };
  loans.push(newLoan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  return newLoan;
}

export function updateLoan(updatedLoan) {
  const loans = getAllLoans();
  const idx = loans.findIndex(l => l.loanNumber === updatedLoan.loanNumber);
  if (idx !== -1) {
    loans[idx] = updatedLoan;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }
}

export function deleteLoan(loanNumber) {
  const loans = getAllLoans().filter(l => l.loanNumber !== loanNumber);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

export function searchLoans(query) {
  const q = query.trim().toLowerCase();
  return getAllLoans().filter(l =>
    l.loanNumber.toLowerCase().includes(q) || 
    (l.customerName && l.customerName.toLowerCase().includes(q)) ||
    (l.mobileNumber && l.mobileNumber.includes(q))
  );
}
