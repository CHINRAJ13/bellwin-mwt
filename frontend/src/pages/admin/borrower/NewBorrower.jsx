import { useState, useEffect, useRef } from 'react';
import { User, Save, RefreshCw, Upload, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const BRANCHES = ['Head Office', 'Branch 01', 'Branch 02'];

const NewBorrower = () => {
  const [loading, setLoading] = useState(false);
  const [borrowerId, setBorrowerId] = useState('');
  const fileInputRef = useRef(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const userBranch = user.branch || user.employee?.branch || 'Head Office';

  const initialForm = {
    customerName: '',
    guardian: '', // guardianName / Father name
    dob: '',
    age: '',
    gender: 'Male',
    mobileNumber: '',
    alternateNumber: '',
    aadhaarNo: '',
    panNo: '',
    doorNo: '',
    area: '',
    city: '',
    postalCode: '',
    permanentAddress: '',
    temporaryAddress: '',
    occupation: '',
    monthlyIncome: '',
    branch: userBranch,
    memberId: '',
    status: 'Active',
    photo: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineeAge: '',
    nomineeAddress: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);

  const fetchNextId = async () => {
    try {
      const res = await api.get('/customers/next-id');
      setBorrowerId(res.data.customerId || res.data);
    } catch (err) {
      console.error('Failed to fetch next customer ID from DB', err);
      toast.error('Could not connect to database to fetch Next ID');
    }
  };

  useEffect(() => {
    fetchNextId();
  }, []);

  // Compute addresses
  useEffect(() => {
    const parts = [formData.doorNo, formData.area, formData.city, formData.postalCode].filter(p => p && p.trim() !== '');
    const newAddress = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      permanentAddress: newAddress,
      temporaryAddress: newAddress
    }));
  }, [formData.doorNo, formData.area, formData.city, formData.postalCode]);

  // Age calculation from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      const computedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      setFormData(prev => ({ ...prev, age: computedAge }));
    }
  }, [formData.dob]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Mobile validation
    if (name === 'mobileNumber' || name === 'alternateNumber') {
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
      if (value.length > 10) return;
    }
    // Pincode validation
    if (name === 'postalCode') {
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
      if (value.length > 6) return;
    }
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setFormData({ ...initialForm });
    setPhotoFile(null);
    setAadhaarFile(null);
    setPanFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchNextId();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobileNumber || !formData.doorNo) {
      toast.error('Please enter Name, Mobile and Address');
      return;
    }
    if (formData.mobileNumber.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    setLoading(true);

    const fd = new FormData();
    fd.append('customerId', borrowerId);
    fd.append('customerName', formData.customerName);
    fd.append('guardianName', formData.guardian);
    fd.append('dateOfBirth', formData.dob);
    fd.append('age', parseInt(formData.age) || 18);
    fd.append('gender', formData.gender);
    fd.append('mobileNumber', formData.mobileNumber);
    fd.append('alternateNumber', formData.alternateNumber);
    fd.append('aadhaarNumber', formData.aadhaarNo);
    fd.append('panNumber', formData.panNo);
    fd.append('doorStreet', formData.doorNo);
    fd.append('area', formData.area);
    fd.append('city', formData.city);
    fd.append('postalCode', formData.postalCode);
    fd.append('branchName', formData.branch);
    fd.append('status', formData.status === 'Active' ? 'Approved' : 'Customer Approval Pending');
    fd.append('occupation', formData.occupation);
    fd.append('permanentAddress', formData.permanentAddress);
    fd.append('temporaryAddress', formData.temporaryAddress);
    
    // Nominee
    fd.append('nominee.nomineeName', formData.nomineeName);
    fd.append('nominee.nomineeRelationship', formData.nomineeRelationship);
    fd.append('nominee.nomineeAge', parseInt(formData.nomineeAge) || '');
    fd.append('nominee.nomineeAddress', formData.nomineeAddress);
    
    // Append Files
    if (photoFile) fd.append('photo', photoFile);
    if (aadhaarFile) fd.append('aadhaarDoc', aadhaarFile);
    if (panFile) fd.append('panDoc', panFile);

    try {
      // Post to backend API
      const token = localStorage.getItem('token');
      await api.post('/customers', fd, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Customer registered successfully in DB!');
      handleClear();
    } catch (err) {
      console.error('API post failed:', err);
      // Display the actual error from the backend if available
      const errorData = err.response?.data;
      const errorMessage = errorData?.errors?.[0]?.message || errorData?.message || 'Failed to register customer. Please check all required fields.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PageHeader
        title="New Customer Registration"
        subtitle="Add a new customer or client to the database."
        icon={User}
      />

      <div className="w-full">
        
          <form onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
            
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Input
                  label="Customer ID"
                  disabled
                  value={borrowerId}
                  className="font-bold text-gray-800 bg-gray-50"
                />

                <Input
                  label="Customer Name"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="ENTER FULL NAME"
                />

                <Input
                  label="Guardian / Father Name"
                  name="guardian"
                  required
                  value={formData.guardian}
                  onChange={handleInputChange}
                  placeholder="ENTER GUARDIAN NAME"
                />

                <Input
                  label="Mobile Number"
                  name="mobileNumber"
                  required
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="ENTER 10 DIGIT MOBILE"
                />

                <Input
                  label="Alternate Number"
                  name="alternateNumber"
                  maxLength={10}
                  value={formData.alternateNumber}
                  onChange={handleInputChange}
                  placeholder="ALTERNATE MOBILE"
                />

                <Input
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                />

                <Input
                  label="Age"
                  name="age"
                  type="number"
                  disabled
                  value={formData.age}
                  className="bg-gray-50 font-semibold"
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>

                <Input
                  label="Aadhaar Number"
                  name="aadhaarNo"
                  maxLength={12}
                  value={formData.aadhaarNo}
                  onChange={handleInputChange}
                  placeholder="12 DIGIT AADHAAR"
                />

                <Input
                  label="PAN Number (Optional)"
                  name="panNo"
                  maxLength={10}
                  value={formData.panNo}
                  onChange={handleInputChange}
                  placeholder="10 DIGIT PAN"
                />

                <Input
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="e.g. BUSINESS"
                />

                <Input
                  label="Monthly Income (₹)"
                  name="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  placeholder="e.g. 25000"
                />

                <Input
                  label="Branch"
                  name="branch"
                  value={formData.branch}
                  disabled
                  className="bg-gray-50 text-gray-500 font-semibold"
                />

                <Input
                  label="Member ID (Optional)"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  placeholder="e.g. MEM-123"
                />

                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>

              {/* Address details */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Input
                    label="Door / Street"
                    name="doorNo"
                    required
                    value={formData.doorNo}
                    onChange={handleInputChange}
                    placeholder="DOOR / STREET"
                    containerClassName="md:col-span-2"
                  />
                  <Input
                    label="Area"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="AREA"
                  />
                  <Input
                    label="City / Town"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="CITY"
                  />
                  <Input
                    label="Pincode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="PINCODE"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Permanent Address (Auto)"
                    disabled
                    value={formData.permanentAddress}
                    className="bg-gray-50"
                  />
                  <Input
                    label="Temporary Address"
                    name="temporaryAddress"
                    value={formData.temporaryAddress}
                    onChange={handleInputChange}
                    placeholder="ENTER TEMPORARY ADDRESS"
                  />
                </div>
              </div>

              {/* Nominee details */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nominee Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    label="Nominee Name"
                    name="nomineeName"
                    value={formData.nomineeName}
                    onChange={handleInputChange}
                    placeholder="ENTER NOMINEE NAME"
                    containerClassName="md:col-span-2"
                  />
                  <Input
                    label="Relationship"
                    name="nomineeRelationship"
                    value={formData.nomineeRelationship}
                    onChange={handleInputChange}
                    placeholder="e.g. SPOUSE, SON"
                  />
                  <Input
                    label="Nominee Age"
                    name="nomineeAge"
                    type="number"
                    value={formData.nomineeAge}
                    onChange={handleInputChange}
                    placeholder="AGE"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <Input
                    label="Nominee Address"
                    name="nomineeAddress"
                    value={formData.nomineeAddress}
                    onChange={handleInputChange}
                    placeholder="ENTER NOMINEE ADDRESS"
                  />
                </div>
              </div>

              {/* KYC Upload section */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">KYC & Photo Upload</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Aadhaar Card *</label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      required
                      onChange={(e) => setAadhaarFile(e.target.files?.[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer border border-gray-200 rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Card</label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={(e) => setPanFile(e.target.files?.[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-200 rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer Photo</label>
                    <div className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group shrink-0">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Customer" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload size={16} className="text-white" />
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} icon={Upload}>Upload Photo</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClear}
                  icon={RefreshCw}
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Save}
                >
                  Save Borrower
                </Button>
              </div>

            </form>
         
      </div>
    </div>
  );
};

export default NewBorrower;
