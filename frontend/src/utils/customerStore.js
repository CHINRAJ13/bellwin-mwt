// Simple in-memory + localStorage store for customers shared between pages
const STORAGE_KEY = 'belwin_customers';

const seedData = [
  {
    id: 'C001', customerName: 'Ravi Kumar', guardian: 'Suresh Kumar', dob: '1990-05-12', age: '34',
    gender: 'Male', mobileNumber: '9876543210', alternateNumber: '9123456780', aadhaarNo: '1234 5678 9012',
    doorNo: '12, Gandhi Street', area: 'Anna Nagar', city: 'Chennai', postalCode: '600040',
    permanentAddress: '12, Gandhi Street, Anna Nagar, Chennai - 600040',
    temporaryAddress: '',
    voterId: 'TN/01/234/567890', panNo: 'ABCDE1234F', occupation: 'Software Engineer',
    proof2Name: 'Driving License', remarks: 'Regular customer'
  },
  {
    id: 'C002', customerName: 'Priya Sharma', guardian: 'Ramesh Sharma', dob: '1995-08-20', age: '28',
    gender: 'Female', mobileNumber: '9988776655', alternateNumber: '', aadhaarNo: '9876 5432 1098',
    doorNo: '45, Lake View Road', area: 'T Nagar', city: 'Chennai', postalCode: '600017',
    permanentAddress: '45, Lake View Road, T Nagar, Chennai - 600017',
    temporaryAddress: 'Staying at 10, Rose Apartments, Adyar',
    voterId: '', panNo: 'FGHIJ5678K', occupation: 'Teacher',
    proof2Name: '', remarks: ''
  },
  {
    id: 'C003', customerName: 'Murugan Selvam', guardian: 'Selvam', dob: '1982-02-28', age: '42',
    gender: 'Male', mobileNumber: '9765432109', alternateNumber: '9043210987', aadhaarNo: '1111 2222 3333',
    doorNo: '78, Main Bazaar', area: 'Vadapalani', city: 'Chennai', postalCode: '600026',
    permanentAddress: '78, Main Bazaar, Vadapalani, Chennai - 600026',
    temporaryAddress: '',
    voterId: 'TN/02/111/222333', panNo: 'LMNOP9012Q', occupation: 'Business',
    proof2Name: 'Voter ID', remarks: 'Gold loan customer'
  }
];

function initStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  }
}

export function getAllCustomers() {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function saveCustomer(customer) {
  const customers = getAllCustomers();
  const newId = 'C' + String(customers.length + 1).padStart(3, '0');
  const newCustomer = { ...customer, id: newId };
  customers.push(newCustomer);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  return newCustomer;
}

export function updateCustomer(updatedCustomer) {
  const customers = getAllCustomers();
  const idx = customers.findIndex(c => c.id === updatedCustomer.id);
  if (idx !== -1) customers[idx] = updatedCustomer;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function deleteCustomer(id) {
  const customers = getAllCustomers().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function searchCustomers(query) {
  const q = query.trim().toLowerCase();
  return getAllCustomers().filter(c =>
    c.id.toLowerCase().includes(q) || c.mobileNumber.includes(q)
  );
}
