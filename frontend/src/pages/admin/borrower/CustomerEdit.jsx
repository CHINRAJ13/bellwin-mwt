import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Save, Trash2, AlertTriangle, User, Upload, RefreshCw, ArrowLeft } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const BRANCHES = ['Head Office', 'Branch 01', 'Branch 02'];

const CustomerEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(location.state?.customerId || '');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const initialForm = {
    customerName: '',
    guardian: '',
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
    branch: 'Head Office',
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

  // Compute addresses
  useEffect(() => {
    const parts = [formData.doorNo, formData.area, formData.city, formData.postalCode].filter(p => p && String(p).trim() !== '');
    const newAddress = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      permanentAddress: newAddress,
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

  const executeSearch = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await api.get(`/customers/search?search=${query}`);
      if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
        const found = res.data.data[0];
        setCustomer(found);
        
        // Map backend fields to frontend state
        setFormData({
          customerName: found.customerName || '',
          guardian: found.guardianName || '',
          dob: found.dateOfBirth ? found.dateOfBirth.split('T')[0] : '',
          age: found.age || '',
          gender: found.gender || 'Male',
          mobileNumber: found.mobileNumber || '',
          alternateNumber: found.alternateNumber || '',
          aadhaarNo: found.aadhaarNumber || '',
          panNo: found.panNumber || '',
          doorNo: found.doorStreet || '',
          area: found.area || '',
          city: found.city || '',
          postalCode: found.postalCode || '',
          permanentAddress: found.permanentAddress || '',
          temporaryAddress: found.temporaryAddress || '',
          occupation: found.occupation || '',
          monthlyIncome: found.monthlyIncome || '',
          branch: found.branchName || 'Head Office',
          memberId: found.memberId || '',
          status: found.status === 'Approved' || found.status === 'Active' ? 'Active' : 'Inactive',
          photo: found.customerPhotoUrl || found.photoUrl || '',
          nomineeName: found.nominee?.nomineeName || '',
          nomineeRelationship: found.nominee?.nomineeRelationship || '',
          nomineeAge: found.nominee?.nomineeAge || '',
          nomineeAddress: found.nominee?.nomineeAddress || ''
        });

        toast.success('Customer found');
      } else {
        toast.error('Customer not found');
        setCustomer(null);
        setFormData(initialForm);
      }
    } catch (error) {
      console.error('Error finding customer:', error);
      toast.error('Failed to search customer');
      setCustomer(null);
      setFormData(initialForm);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    await executeSearch(searchQuery.trim());
  };

  useEffect(() => {
    if (location.state?.customerId) {
      executeSearch(location.state.customerId);
    }
  }, [location.state]);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!customer?._id) return;
    
    if (!formData.customerName || !formData.mobileNumber || !formData.doorNo) {
      toast.error('Please enter Name, Mobile and Address');
      return;
    }
    if (formData.mobileNumber.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    setSaving(true);
    
    // Instead of multipart/form-data for the update (since it's a PUT request), we'll send JSON
    // The backend PUT route handles JSON. If we need to upload files, we usually have a separate endpoint or modify the backend.
    // For now, we will update the textual details.
    
    const payload = {
      customerName: formData.customerName,
      guardianName: formData.guardian,
      dateOfBirth: formData.dob,
      age: parseInt(formData.age) || 18,
      gender: formData.gender,
      mobileNumber: formData.mobileNumber,
      alternateNumber: formData.alternateNumber,
      aadhaarNumber: formData.aadhaarNo,
      panNumber: formData.panNo,
      doorStreet: formData.doorNo,
      area: formData.area,
      city: formData.city,
      postalCode: formData.postalCode,
      branchName: formData.branch,
      status: formData.status === 'Active' ? 'Approved' : 'Inactive',
      occupation: formData.occupation,
      monthlyIncome: formData.monthlyIncome,
      permanentAddress: formData.permanentAddress,
      temporaryAddress: formData.temporaryAddress,
      memberId: formData.memberId,
      nominee: {
        nomineeName: formData.nomineeName,
        nomineeRelationship: formData.nomineeRelationship,
        nomineeAge: parseInt(formData.nomineeAge) || null,
        nomineeAddress: formData.nomineeAddress
      }
    };

    try {
      const res = await api.put(`/customers/${customer._id}`, payload);
      if (res.data.success) {
        toast.success('Customer updated successfully');
        
        // If files are attached, we would typically upload them via a separate document endpoint
        if (photoFile || aadhaarFile || panFile) {
           const fd = new FormData();
           if (photoFile) fd.append('photo', photoFile);
           if (aadhaarFile) fd.append('aadhaarDoc', aadhaarFile);
           if (panFile) fd.append('panDoc', panFile);
           
           try {
             await api.post(`/customers/${customer._id}/documents`, fd, {
               headers: { 'Content-Type': 'multipart/form-data' }
             });
             toast.success('Documents updated successfully');
           } catch(err) {
             console.error("Document upload failed", err);
             toast.error("Could not upload documents, but details were saved.");
           }
        }
        
      } else {
        toast.error(res.data.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update customer details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customer?._id) return;

    const confirmed = window.confirm("Are you sure? You won't be able to revert this! All customer data will be removed.");

    if (confirmed) {
      try {
        const res = await api.delete(`/customers/${customer._id}`);
        if (res.data.success) {
          toast.success('Customer has been deleted.');
          setCustomer(null);
          setFormData(initialForm);
          setSearchQuery('');
        } else {
          toast.error(res.data.message || 'Failed to delete customer');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('An error occurred while deleting the customer');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/borrower/list')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          title="Back to Customer List"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Customer Edit / Delete</h1>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 items-end form-spiritual-bg">
          <div className="flex-1 max-w-md">
            <Input
              label="Search by Customer ID or Phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., CUST00001 or 9876543210"
            />
          </div>
          <Button type="submit" disabled={loading} className="flex items-center gap-2 h-10 px-6">
            <Search size={20} />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {customer && (
        <>
          {customer.status === 'Correction Required' && customer.adminRemarks && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Correction Required
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      <strong>Admin Remarks:</strong> {customer.adminRemarks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Photo Upload card */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <div className="p-6 text-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Photo</h4>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Customer" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                >
                  Change Photo
                </Button>
              </div>
            </div>

            <div className="p-6 text-center">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Danger Zone</h4>
               <Button 
                type="button" 
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                disabled={customer.isDeleted}
              >
                <Trash2 size={20} />
                Delete Customer
              </Button>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:col-span-3 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto custom-scrollbar lg:pr-3">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Customer Details</h2>
                <div className="flex items-center gap-2">
                  {customer.status === 'Deleted' || customer.isDeleted ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1">
                      <AlertTriangle size={16} /> Deleted
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      {customer.status || 'Active'}
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6 form-spiritual-bg">
                
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Customer ID"
                    disabled
                    value={customer.customerId || ''}
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

                  <Select
                    label="Branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                  >
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </Select>

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
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update KYC (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Aadhaar Card</label>
                      {customer.aadhaarDocumentUrl && (
                        <a href={customer.aadhaarDocumentUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 mb-2 hover:underline">
                          View Current Aadhaar
                        </a>
                      )}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={(e) => setAadhaarFile(e.target.files?.[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all cursor-pointer border border-gray-200 rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Card</label>
                      {customer.panDocumentUrl && (
                        <a href={customer.panDocumentUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 mb-2 hover:underline">
                          View Current PAN
                        </a>
                      )}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={(e) => setPanFile(e.target.files?.[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-gray-200 rounded-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={Save}
                    disabled={customer.isDeleted}
                  >
                    Update Details
                  </Button>
                </div>

              </form>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerEdit;
