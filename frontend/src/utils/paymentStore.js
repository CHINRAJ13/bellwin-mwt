const STORAGE_KEY = 'belwin_payments';

export const getAllPayments = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayment = (payment) => {
  const payments = getAllPayments();
  const newPayment = {
    ...payment,
    receiptNo: payment.receiptNo || `REC${Date.now()}`
  };
  payments.push(newPayment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  return newPayment;
};

export const searchPayments = (query) => {
  const q = query.toLowerCase();
  return getAllPayments().filter(p =>
    p.receiptNo?.toLowerCase().includes(q) ||
    p.customerName?.toLowerCase().includes(q) ||
    p.loanNumber?.toLowerCase().includes(q) ||
    p.mobileNumber?.includes(q)
  );
};
