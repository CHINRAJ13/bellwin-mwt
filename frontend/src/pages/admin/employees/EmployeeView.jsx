import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft, User, Briefcase, Calendar,
  Shield, XCircle, Edit, Building2,
  Gem, UserCircle2
} from 'lucide-react';

const EmployeeView = ({ employeeId, onClose }) => {
  const { id: paramId } = useParams();
  const id = employeeId || paramId;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data.employee || response.data);
    } catch (err) {
      alert('Error fetching employee record');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin" />
        Retrieving employee profile...
      </div>
    );
  }

  if (!employee) return null;

  const lblClass = "text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1";
  const valClass = "text-sm font-bold text-gray-900";
  const sectionTitleClass = "text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-5 uppercase tracking-wide";

  return (
    <div className="max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          {onClose ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-gray-500 text-xs font-semibold p-0 mb-2 hover:text-green-600 transition-colors"
            >
              <XCircle size={14} /> Close
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/employees')}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-gray-500 text-xs font-semibold p-0 mb-2 hover:text-green-600 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Directory
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Employee Profile
          </h1>
        </div>
        <button
          onClick={() => navigate(`/admin/employees/edit/${employee._id}`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white border-none rounded-none text-sm font-bold cursor-pointer shadow-md shadow-green-600/20 hover:-translate-y-px hover:shadow-lg hover:shadow-green-600/30 transition-all"
        >
          <Edit size={14} strokeWidth={3} /> Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-none border border-gray-200 overflow-hidden shadow-sm">
        {/* Profile Banner */}
        <div className="relative bg-gray-900 p-8 md:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-none bg-white/5 border-4 border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative z-10">
            {employee.photo ? (
              <img src={employee.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={60} className="text-green-600 opacity-30" />
            )}
          </div>

          <div className="flex-1 relative z-10 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 md:mb-3">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{employee.firstName} {employee.lastName}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                employee.status === 'Active' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'
              }`}>
                {employee.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 md:gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-1.5">
                <Gem size={14} className="text-green-500" />
                <span className="text-green-500 font-bold">{employee.employeeId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase size={14} />
                {employee.role}
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 size={14} />
                {employee.branch}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs-like sections */}
        <div className="p-6 md:p-8 flex flex-col gap-10">
          
          {/* Contact Information */}
          <div>
            <h3 className={sectionTitleClass}>
              <UserCircle2 size={18} className="text-green-600" /> Personal & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <div className={lblClass}>Mobile Number</div>
                <div className={valClass}>{employee.mobile}</div>
              </div>
              <div>
                <div className={lblClass}>Email Address</div>
                <div className={valClass}>{employee.email || '—'}</div>
              </div>
              <div>
                <div className={lblClass}>Gender</div>
                <div className={valClass}>{employee.gender}</div>
              </div>
              <div>
                <div className={lblClass}>Birth Date (Age)</div>
                <div className={valClass}>
                  {employee.dob ? new Date(employee.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} 
                  {employee.age ? ` (${employee.age} yrs)` : ''}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className={lblClass}>Residential Address</div>
                <div className={`${valClass} leading-relaxed`}>
                  {employee.address}<br />
                  Pincode: {employee.pincode}
                </div>
              </div>
            </div>
          </div>

          {/* KYC Details */}
          <div>
            <h3 className={sectionTitleClass}>
              <Shield size={18} className="text-green-600" /> KYC & Bank Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className={lblClass}>PAN Number</div>
                <div className={valClass}>{employee.panNo || '—'}</div>
              </div>
              <div>
                <div className={lblClass}>Aadhar Card No</div>
                <div className={valClass}>{employee.aadharCardNo || '—'}</div>
              </div>
              <div>
                <div className={lblClass}>Account Number</div>
                <div className={valClass}>{employee.accountNo || '—'}</div>
              </div>
              <div>
                <div className={lblClass}>IFSC Code</div>
                <div className={valClass}>{employee.ifscCode || '—'}</div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h3 className={sectionTitleClass}>
              <Calendar size={18} className="text-green-600" /> Employment Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className={lblClass}>Current Branch</div>
                <div className={valClass}>{employee.branch}</div>
              </div>
              <div>
                <div className={lblClass}>Official Role</div>
                <div className={valClass}>{employee.role}</div>
              </div>
              <div>
                <div className={lblClass}>Joining Date</div>
                <div className={valClass}>{new Date(employee.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
              {employee.signatureUrl && (
                <div className="sm:col-span-2 mt-3">
                  <div className={lblClass}>Digital Signature</div>
                  <div className="mt-2 p-2 border border-gray-200 rounded-none inline-block bg-white">
                    <img src={employee.signatureUrl} alt="Signature" className="h-16 object-contain" />
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 mt-3">
                <div className="bg-gray-50 rounded-none p-5 border border-gray-200">
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Security & Access</div>
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">System Access Level: </span>
                    <span className="text-sm font-extrabold text-green-600">{employee.role.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-[11px] text-gray-500 font-medium">
            Profile Created: {new Date(employee.createdAt).toLocaleString('en-IN')}
          </div>
          <div className="flex gap-3">
            <button
               onClick={() => navigate(`/admin/employees/reset-password/${employee._id}`)}
               className="px-4 py-2 bg-white border border-gray-200 rounded-none text-xs font-semibold cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm"
            >
              Reset Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;

