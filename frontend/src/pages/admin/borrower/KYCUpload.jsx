import { useState, useEffect, useRef } from 'react';
import { Upload, Search, User, CheckCircle2, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const STORAGE_KEY = 'belwin_customers';

const KYCUpload = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [borrowers, setBorrowers] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Form files
  const [files, setFiles] = useState({
    aadhar: '',
    pan: '',
    photo: '',
    signature: '',
    addressProof: ''
  });

  const [uploadDate] = useState(new Date().toISOString().split('T')[0]);

  // Load borrowers
  const fetchBorrowers = async () => {
    try {
      const res = await api.get('/customers');
      setBorrowers(res.data.customers || res.data || []);
    } catch (err) {
      console.warn('API customer load failed, loading from LocalStorage fallback');
      const local = localStorage.getItem(STORAGE_KEY);
      setBorrowers(local ? JSON.parse(local) : []);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const handleSelectBorrower = (borrower) => {
    setSelectedBorrower(borrower);
    setSearchQuery('');
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => ({ ...prev, [field]: reader.result }));
        toast.success(`${field.toUpperCase()} file selected`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBorrower) {
      toast.error('Please select a borrower first');
      return;
    }

    setLoading(true);
    const docData = {
      aadharDocumentUrl: files.aadhar,
      panDocumentUrl: files.pan,
      customerPhotoUrl: files.photo,
      signatureDocumentUrl: files.signature,
      proof2DocumentUrl: files.addressProof,
      proof2Name: 'Address Proof',
      uploadDate: uploadDate
    };

    try {
      // Call backend documents route
      await api.post(`/customers/${selectedBorrower._id || selectedBorrower.id}/documents`, docData);
      toast.success('KYC documents uploaded successfully to server!');
      resetForm();
    } catch (err) {
      console.warn('API upload failed, saving to LocalStorage fallback');
      // LocalStorage update
      const local = localStorage.getItem(STORAGE_KEY);
      const list = local ? JSON.parse(local) : [];
      const updated = list.map(b => {
        const idMatch = selectedBorrower.id ? b.id === selectedBorrower.id : b._id === selectedBorrower._id;
        if (idMatch) {
          return {
            ...b,
            ...docData,
            status: 'KYC Verification Pending' // Align status
          };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success('KYC documents attached successfully (Local Storage)!');
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBorrower(null);
    setFiles({
      aadhar: '',
      pan: '',
      photo: '',
      signature: '',
      addressProof: ''
    });
    fetchBorrowers();
  };

  // Filter query
  const filteredBorrowers = searchQuery.trim() !== ''
    ? borrowers.filter(b =>
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.mobileNumber?.includes(searchQuery) ||
        (b.customerId || b.id)?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PageHeader
        title="KYC Documents Upload"
        subtitle="Upload Aadhaar, PAN, Photo, and Signature proofs."
        icon={Upload}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Borrower search and select */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">1. Select Borrower</h4>
            
            {/* Search query */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Name or Phone Number..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
              />
            </div>

            {/* Results dropdown list */}
            {filteredBorrowers.length > 0 && (
              <div className="mt-2 border border-gray-100 bg-white rounded-none shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-50">
                {filteredBorrowers.map(b => (
                  <button
                    key={b._id || b.id}
                    onClick={() => handleSelectBorrower(b)}
                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-gray-900">{b.customerName}</span>
                    <span className="text-xs text-gray-500 font-medium">ID: {b.customerId || b.id} · Mob: {b.mobileNumber}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Borrower Details Card */}
            {selectedBorrower ? (
              <div className="mt-4 p-4 rounded-none bg-green-50/50 border border-green-100 flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                    {selectedBorrower.customerName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{selectedBorrower.customerName}</h5>
                    <p className="text-xs text-gray-500">ID: {selectedBorrower.customerId || selectedBorrower.id}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-gray-600 border-t border-green-100/50 pt-2 font-medium">
                  <p>Mobile: {selectedBorrower.mobileNumber}</p>
                  <p>Branch: {selectedBorrower.branchName || selectedBorrower.branch || 'N/A'}</p>
                  <p>Aadhaar: {selectedBorrower.aadhaarNumber || selectedBorrower.aadhaarNo || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 rounded-none bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                No borrower selected yet.
              </div>
            )}
          </div>
        </div>

        {/* Upload form */}
        <div className="lg:col-span-2">
          <div className="">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">2. Attach Documents</h4>
            
            <form onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Aadhaar Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aadhaar Card Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'aadhar')}
                      className="hidden"
                      id="aadhar-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('aadhar-upload').click()}
                      className="w-full text-xs"
                      icon={Upload}
                    >
                      Choose Aadhaar file
                    </Button>
                  </div>
                  {files.aadhar && (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> Aadhaar attached</p>
                  )}
                </div>

                {/* PAN Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">PAN Card Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'pan')}
                      className="hidden"
                      id="pan-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('pan-upload').click()}
                      className="w-full text-xs"
                      icon={Upload}
                    >
                      Choose PAN file
                    </Button>
                  </div>
                  {files.pan && (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PAN attached</p>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Photo Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('photo-upload').click()}
                      className="w-full text-xs"
                      icon={Upload}
                    >
                      Choose Photo file
                    </Button>
                  </div>
                  {files.photo && (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> Photo attached</p>
                  )}
                </div>

                {/* Signature Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Signature Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'signature')}
                      className="hidden"
                      id="signature-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('signature-upload').click()}
                      className="w-full text-xs"
                      icon={Upload}
                    >
                      Choose Signature file
                    </Button>
                  </div>
                  {files.signature && (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> Signature attached</p>
                  )}
                </div>

                {/* Address Proof Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Address Proof Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'addressProof')}
                      className="hidden"
                      id="addressProof-upload"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById('addressProof-upload').click()}
                      className="w-full text-xs"
                      icon={Upload}
                    >
                      Choose Address Proof file
                    </Button>
                  </div>
                  {files.addressProof && (
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> Address Proof attached</p>
                  )}
                </div>

                {/* Upload Date */}
                <Input
                  label="Upload Date"
                  disabled
                  value={uploadDate}
                  icon={Calendar}
                  className="bg-gray-50 font-semibold"
                />

              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={!selectedBorrower}
                >
                  Submit KYC Documents
                </Button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default KYCUpload;
