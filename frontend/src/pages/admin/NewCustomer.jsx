import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Save, RefreshCcw } from 'lucide-react';
import { saveCustomer } from '../utils/customerStore';

const emptyForm = {
  customerName: '', guardian: '', dob: '',
  mobileNumber: '', alternateNumber: '', aadhaarNo: '', doorNo: '',
  area: '', city: '',
  permanentAddress: '', temporaryAddress: '',
  voterId: '', occupation: '', remarks: '', proof2Name: ''
};

const NewCustomer = () => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [files, setFiles] = useState({ photo: null, aadharFile: null, proof2File: null });
  const [isSameAddress, setIsSameAddress] = useState(false);

  useEffect(() => {
    const parts = [formData.doorNo, formData.area, formData.city].filter(p => p && p.trim() !== '');
    if (parts.length > 0) {
      const newAddress = parts.join(', ');
      setFormData(prev => ({
        ...prev,
        permanentAddress: newAddress,
        ...(isSameAddress ? { temporaryAddress: newAddress } : {})
      }));
    }
  }, [formData.doorNo, formData.area, formData.city, isSameAddress]);

  const photoInputRef = useRef(null);
  const aadharInputRef = useRef(null);
  const proof2InputRef = useRef(null);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e, fileType) => e.target.files?.[0] && setFiles(prev => ({ ...prev, [fileType]: e.target.files[0] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ['customerName', 'guardian', 'mobileNumber', 'doorNo', 'area', 'permanentAddress', 'temporaryAddress'];
    if (required.some(f => !formData[f])) return toast.error('Please fill in all required fields');
    saveCustomer(formData);
    toast.success('Customer saved successfully!');
    handleClear();
  };

  const handleClear = () => {
    setFormData({ ...emptyForm });
    setFiles({ photo: null, aadharFile: null, proof2File: null });
    setIsSameAddress(false);
    [photoInputRef, aadharInputRef, proof2InputRef].forEach(r => r.current && (r.current.value = ''));
  };

  const inp = "w-full px-4 py-2.5 bg-white border border-gray-300 shadow-sm rounded-none text-sm outline-none text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all";
  const lbl = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[1440px] mx-auto pb-8 p-6">
      {/* Title */}
      <div className="mb-6 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 m-0">Add New Customer</h2>
        <p className="text-xs text-gray-500 m-0 mt-1">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-200 rounded-none shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1">
          <form id="new-customer-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 form-spiritual-bg">

            {/* ── Row 1 ── */}
            <div>
              <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Guardian <span className="text-red-500">*</span></label>
              <input type="text" name="guardian" value={formData.guardian} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 2 ── */}
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Alternate Number</label>
              <input type="tel" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Aadhaar No</label>
              <input type="text" name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 3 ── */}
            <div>
              <label className={lbl}>Door No/Street <span className="text-red-500">*</span></label>
              <input type="text" name="doorNo" value={formData.doorNo} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>Area <span className="text-red-500">*</span></label>
              <input type="text" name="area" value={formData.area} onChange={handleInputChange} className={inp} required />
            </div>
            <div>
              <label className={lbl}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Row 4 ── */}
            <div className="lg:col-span-2">
              <label className={lbl}>Permanent Address <span className="text-red-500">*</span></label>
              <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} required />
            </div>
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Temporary Address <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="sameAsPermanent" 
                    className="cursor-pointer accent-green-600 w-3.5 h-3.5"
                    checked={isSameAddress}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSameAddress(checked);
                      if (checked) {
                        setFormData(prev => ({ ...prev, temporaryAddress: prev.permanentAddress }));
                      }
                    }} 
                  />
                  <label htmlFor="sameAsPermanent" className="text-[11px] font-bold text-gray-500 cursor-pointer uppercase tracking-wider">Same as Permanent</label>
                </div>
              </div>
              <textarea name="temporaryAddress" value={formData.temporaryAddress} onChange={handleInputChange} rows="2" className={`${inp} resize-none`} required />
            </div>

            {/* ── Row 5 ── */}
            <div>
              <label className={lbl}>Voter ID</label>
              <input type="text" name="voterId" value={formData.voterId} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} className={inp} />
            </div>
            <div>
              <label className={lbl}>Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inp} />
            </div>

            {/* ── Uploads ── */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              {[
                { label: 'Photo', key: 'photo', ref: photoInputRef, accept: 'image/*' },
                { label: 'Aadhar Document', key: 'aadharFile', ref: aadharInputRef, accept: '' },
                { label: 'Proof 2 Document', key: 'proof2File', ref: proof2InputRef, accept: '' }
              ].map(({ label, key, ref, accept }) => (
                <div key={key}>
                  <label className={lbl}>{label}</label>
                  <div className="flex items-center gap-2">
                    {key === 'proof2File' && (
                      <input type="text" name="proof2Name" value={formData.proof2Name} onChange={handleInputChange}
                        placeholder="Proof name" className="w-28 px-3 py-1.5 text-xs bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors shrink-0 outline-none text-gray-900" />
                    )}
                    <button type="button" onClick={() => ref.current.click()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-none text-xs font-bold text-gray-700 hover:bg-gray-50 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Browse
                    </button>
                    <span className="text-xs font-medium text-gray-500 truncate">{files[key] ? files[key].name : 'No file'}</span>
                    <input type="file" ref={ref} onChange={e => handleFileChange(e, key)} className="hidden" accept={accept} />
                  </div>
                </div>
              ))}
            </div>

          </form>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
          <button form="new-customer-form" type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-none hover:bg-green-700 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm border-none cursor-pointer">
            <Save size={16} /> Save Customer
          </button>
          <button type="button" onClick={handleClear}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-none hover:bg-gray-50 transition-all cursor-pointer">
            <RefreshCcw size={16} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer;
