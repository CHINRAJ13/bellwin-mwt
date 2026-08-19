import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Save, X, Loader2, ArrowLeft,
  User, Briefcase, MapPin, Shield, Camera, CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import BranchSelect from '../../components/ui/BranchSelect';

const API = '';

const HRForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const initialFormState = {
    firstName: '', lastName: '',
    mobile: '', email: '@gmail.com',
    address: '', city: '', state: '',
    branch: 'HEADOFFICE', department: 'HR',
    designation: 'HR MANAGER',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active', username: '', password: '', confirmPassword: '',
    photo: '', employeeId: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchNextId();
  }, []);

  const fetchNextId = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`${API}/employees/next-id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData((p) => ({ ...p, employeeId: res.data.employeeId }));
    } catch (err) {
      console.error('Error fetching next ID:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
      if (value.length > 10) return;
    }
    if (name === 'email') {
      if (/[A-Z]/.test(value)) return;
      if (value === '') {
        setFormData(p => ({ ...p, email: '@gmail.com' }));
        return;
      }
      if (!value.endsWith('@gmail.com')) {
        const atIndex = value.indexOf('@');
        const prefix = atIndex !== -1 ? value.slice(0, atIndex) : value;
        setFormData(p => ({ ...p, email: `${prefix}@gmail.com` }));
        return;
      }
    }
    const upper = ['firstName', 'lastName', 'address', 'city', 'state', 'designation'];
    setFormData((p) => ({ ...p, [name]: upper.includes(name) ? value.toUpperCase() : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData((p) => ({ ...p, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Full name is required';
    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!formData.email.endsWith('@gmail.com')) {
      e.email = 'Email must be a valid @gmail.com address';
    }
    if (formData.mobile && formData.mobile.length !== 10) {
      e.mobile = 'Mobile number must be 10 digits';
    }
    if (!formData.designation.trim()) e.designation = 'Designation is required';
    if (!formData.joiningDate) e.joiningDate = 'Joining date is required';
    if (!formData.username.trim()) e.username = 'Username is required';
    if (!formData.password) e.password = 'Password is required';
    if (formData.password.length > 0 && formData.password.length < 6) e.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(`${API}/hr/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => {
        navigate('/admin/employees');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create HR user';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">HR User Created!</h2>
          <p className="text-gray-500">Redirecting to employee list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create HR User"
        subtitle="Add a new Human Resources team member"
        icon={Shield}
        actions={
          <Button variant="ghost" onClick={() => navigate('/admin/employees')}>
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <form className="form-spiritual-bg" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Photo + Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo Upload */}
            <div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Camera size={16} className="text-green-600" />
                  Profile Photo
                </div>
                <div
                  ref={fileInputRef}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click?.()}
                  className={`relative mx-auto w-40 h-40 rounded-none border-2 border-dashed cursor-pointer transition-all duration-200 flex items-center justify-center overflow-hidden group ${
                    dragOver ? 'border-green-500 bg-green-50 scale-105' : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
                  }`}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Camera size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 font-medium">Click or Drag Photo</p>
                    </div>
                  )}
                </div>
                <input
                  ref={(el) => { if (el) fileInputRef.current = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => processFile(e.target.files[0])}
                />
                {photoPreview && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setFormData(p => ({ ...p, photo: '' })); }}
                    className="w-full text-xs text-red-500 hover:text-red-700 font-semibold py-1"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Employee ID + Status */}
            <div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Shield size={16} className="text-green-600" />
                  Account Info
                </div>
                <Input
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  disabled
                  className="bg-gray-50 font-mono font-bold text-green-700"
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <User size={16} className="text-green-600" />
                  Personal Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input label="Full Name *" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter full name" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" />
                  <div>
                    <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                  <div>
                    <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <MapPin size={16} className="text-green-600" />
                  Address
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
                  </div>
                  <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                  <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <Briefcase size={16} className="text-green-600" />
                  Work Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BranchSelect
                    label="Branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                  />
                  <Select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={[
                      { label: 'HR', value: 'HR' },
                      { label: 'Admin', value: 'ADMIN' },
                      { label: 'Sales', value: 'SALES' },
                      { label: 'Operations', value: 'OPERATIONS' },
                      { label: 'Finance', value: 'FINANCE' }
                    ]}
                  />
                  <div>
                    <Input label="Designation *" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. HR Manager" />
                    {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                  </div>
                  <div>
                    <Input label="Joining Date *" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
                    {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                  <Shield size={16} className="text-green-600" />
                  Login Credentials
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input label="Username *" name="username" value={formData.username} onChange={handleChange} placeholder="Login username" />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <Input label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <Input label="Confirm Password *" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => navigate('/admin/employees')}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save HR User
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HRForm;
