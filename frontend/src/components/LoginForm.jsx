import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, KeyRound, User } from 'lucide-react';
import api from '../services/api';

const LoginForm = ({ portal, title }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username || !password) {
      setErrorMsg('Please enter credentials');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;

      if (response.status === 200 || data.success) {
        toast.success('Login successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          username: data.username,
          role: data.role,
          employee: data.employee
        }));
        
        // Regardless of role, we now use the unified Admin layout
        navigate('/admin-dashboard');
      } else {
        setErrorMsg('Invalid username or password');
      }
    } catch (error) {
      setErrorMsg('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fdf9] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-green-600/5 -skew-y-6 transform origin-top-left -z-10"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Header/Logo area */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 flex items-center justify-center mb-4 overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-center">
          Belwin ERP System
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Secure Access Portal
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-900">{title || 'Sign In'}</h2>
        
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold border border-red-200 rounded text-center animate-fade-in">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input w-full pl-10 pr-4 py-2.5 rounded-none bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="Enter user name"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full pl-10 pr-4 py-2.5 rounded-none bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-none font-bold shadow-sm shadow-green-600/20 hover:bg-green-700 hover:shadow-md hover:shadow-green-600/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center text-xs font-semibold text-gray-400">
        &copy; {new Date().getFullYear()} Belwin Enterprises. All rights reserved.
      </div>
    </div>
  );
};

export default LoginForm;
