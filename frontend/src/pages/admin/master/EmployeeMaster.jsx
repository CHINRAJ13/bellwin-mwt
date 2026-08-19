import { useState, useEffect } from 'react';
import { Plus, Search, Users, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_employee_master';

const EmployeeMaster = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeCode: '',
    mobileNumber: '',
    email: '@gmail.com',
    dateOfBirth: '',
    gender: 'Male',
    department: '',
    designation: '',
    branch: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '',
    aadhaarNumber: '',
    panNumber: '',
    address: '',
    username: '',
    password: '',
    role: 'Employee',
    status: 'Active'
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || res.data || []);
    } catch {
      const local = localStorage.getItem(STORAGE_KEY);
      setEmployees(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: `EMP${String(employees.length + 1).padStart(4, '0')}`,
      employeeName: '',
      employeeCode: '',
      mobileNumber: '',
      email: '@gmail.com',
      dateOfBirth: '',
      gender: 'Male',
      department: '',
      designation: '',
      branch: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: '',
      aadhaarNumber: '',
      panNumber: '',
      address: '',
      username: '',
      password: '',
      role: 'Employee',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      email: emp.email || '@gmail.com',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employeeName || !formData.mobileNumber) return alert('Fill required fields');
    if (formData.mobileNumber.length !== 10) return alert('Mobile must be 10 digits');
    if (formData.email && !formData.email.endsWith('@gmail.com')) return alert('Email must be a valid @gmail.com address');

    setLoading(true);
    try {
      if (editingEmployee) {
        try {
          await api.put(`/employees/${editingEmployee._id}`, formData);
        } catch {
          const updated = employees.map(emp => emp._id === editingEmployee._id ? { ...emp, ...formData } : emp);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } else {
        try {
          await api.post('/employees', formData);
        } catch {
          const newRec = { _id: Date.now().toString(), ...formData };
          const updated = [...employees, newRec];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
      setIsFormOpen(false);
      fetchEmployees();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      try {
        await api.delete(`/employees/${deleteId}`);
      } catch {
        const updated = employees.filter(emp => emp._id !== deleteId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      setDeleteId(null);
      fetchEmployees();
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp =>
    String(emp.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(emp.employeeCode || '').toLowerCase().includes(search.toLowerCase()) ||
    String(emp.mobileNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingEmployee ? 'Edit Employee' : 'New Employee'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <h3 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Employee ID" required disabled value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} />
              <Input label="Employee Code" value={formData.employeeCode} onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })} />
              <Input label="Employee Name" required value={formData.employeeName} onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })} />
               <Input label="Mobile Number" required value={formData.mobileNumber} onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^[0-9]+$/.test(val)) return;
                if (val.length > 10) return;
                setFormData({ ...formData, mobileNumber: val });
              }} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => {
                const val = e.target.value;
                if (/[A-Z]/.test(val)) return;
                if (val === '') {
                  setFormData({ ...formData, email: '@gmail.com' });
                  return;
                }
                if (!val.endsWith('@gmail.com')) {
                  const atIndex = val.indexOf('@');
                  const prefix = atIndex !== -1 ? val.slice(0, atIndex) : val;
                  setFormData({ ...formData, email: `${prefix}@gmail.com` });
                  return;
                }
                setFormData({ ...formData, email: val });
              }} />
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              <Select label="Gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="2" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-green-700 border-b pb-2 mt-6 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              <Input label="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
              <Select label="Branch" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                <option value="">Select Branch</option>
                <option value="Head Office">Head Office</option>
                <option value="Branch 1">Branch 1</option>
              </Select>
              <Input label="Joining Date" type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} />
              <Input label="Salary (₹)" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
            </div>

            <h3 className="text-lg font-semibold text-green-700 border-b pb-2 mt-6 mb-4">Identity & Login</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Aadhaar Number" value={formData.aadhaarNumber} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} />
              <Input label="PAN Number" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} />
              <Input label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <Select label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </Select>
              <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Employee</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Employee Master" subtitle="Manage organizational employees." icon={Users} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Employee</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Employee ID, Name, Phone Number" className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" />
        </div>
      </div>
      <DataTable
        headers={['ID', 'Name', 'Role', 'Branch', 'Mobile', 'Status', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.employeeId}</TD>
            <TD className="font-semibold text-gray-700">{item.employeeName}</TD>
            <TD>{item.role}</TD>
            <TD>{item.branch || '-'}</TD>
            <TD>{item.mobileNumber}</TD>
            <TD><span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
              </div>
            </TD>
          </TR>
        )}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Employee" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default EmployeeMaster;
