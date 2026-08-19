import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { ArrowLeft, Key, Save, Loader2, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return alert('Password must be at least 8 characters');
    if (password !== confirmPassword) return alert('Passwords do not match');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/employees/reset-password', {
        id,
        newPassword: password
      });
      alert('Password Reset Successfully');
      navigate('/admin/employees');
    } catch (err) {
      alert('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-none shadow-sm border border-gray-200">
        <button
          onClick={() => navigate('/admin/employees')}
          className="flex items-center gap-1.5 bg-transparent border-none text-gray-500 cursor-pointer mb-6 font-bold text-xs hover:text-gray-900 transition-colors p-0"
        >
          <ArrowLeft size={14} /> Back to Workforce
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-none flex items-center justify-center mx-auto mb-4 border border-green-100">
            <Key size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Security Override</h2>
          <p className="text-gray-500 mt-1.5 text-xs font-medium leading-relaxed">Reset the account credentials for this employee member directly.</p>
        </div>

        <div className="bg-red-50 border border-red-200 p-3.5 rounded-none flex items-start gap-3 mb-6">
          <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-600 leading-relaxed m-0">
            Warning: This will immediately change the employee's login password. Ensure you communicate the new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 form-spiritual-bg">
          <div>
            <label className="text-[11px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">New Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="Enter new secret"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none text-sm outline-none text-gray-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required placeholder="Repeat new secret"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-none text-sm outline-none text-gray-900 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-green-600 hover:bg-green-700 text-white border-none rounded-none font-bold text-sm cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Finalize Reset
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

