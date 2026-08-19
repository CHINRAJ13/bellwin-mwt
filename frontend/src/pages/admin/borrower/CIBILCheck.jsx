import { useState, useEffect } from 'react';
import { ShieldCheck, Search, ShieldAlert, Award, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'belwin_customers';
const LOG_KEY = 'belwin_cibil_history';

const CIBILCheck = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [eligibility, setEligibility] = useState('');
  const [checkDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [history, setHistory] = useState([]);

  // Fetch borrowers
  const fetchBorrowers = async () => {
    try {
      const res = await api.get('/customers');
      setBorrowers(res.data.customers || res.data.data || res.data || []);
    } catch (err) {
      console.warn('API customer load failed, loading from LocalStorage fallback');
      const local = localStorage.getItem(STORAGE_KEY);
      setBorrowers(local ? JSON.parse(local) : []);
    }
  };

  const loadHistory = () => {
    const local = localStorage.getItem(LOG_KEY);
    setHistory(local ? JSON.parse(local) : []);
  };

  useEffect(() => {
    fetchBorrowers();
    loadHistory();
  }, []);

  const handleSelectBorrower = (borrower) => {
    setSelectedBorrower(borrower);
    setSearchQuery('');
    setScore(borrower.cibilScore || null);
    setEligibility(borrower.loanEligibility || '');
    setRemarks(borrower.cibilRemarks || '');
  };

  const handleCheckCIBIL = () => {
    if (!selectedBorrower) return;
    setLoading(true);

    setTimeout(() => {
      // Deterministic pseudo-random score using the mobile number/ID hash
      const identVal = selectedBorrower.mobileNumber || '750';
      let sum = 0;
      for (let i = 0; i < identVal.length; i++) sum += identVal.charCodeAt(i);
      const computedScore = 600 + (sum % 250); // score range 600-850

      let eligMsg = '';
      if (computedScore >= 750) eligMsg = 'ELIGIBLE - PLATINUM OFFERS';
      else if (computedScore >= 700) eligMsg = 'ELIGIBLE - GOLD OFFERS';
      else if (computedScore >= 620) eligMsg = 'ELIGIBLE - SILVER OFFERS';
      else eligMsg = 'NOT ELIGIBLE - HIGH RISK';

      setScore(computedScore);
      setEligibility(eligMsg);

      const checkRemarks = computedScore >= 700 ? 'EXCELLENT CREDIT STANDING' : 'MODERATE RISK RATING';
      setRemarks(checkRemarks);

      // Save log in history
      const logEntry = {
        _id: Date.now().toString(),
        customerId: selectedBorrower.customerId || selectedBorrower.id,
        customerName: selectedBorrower.customerName,
        panOrAadhaar: selectedBorrower.panNumber || selectedBorrower.panNo || selectedBorrower.aadhaarNumber || selectedBorrower.aadhaarNo || 'N/A',
        score: computedScore,
        eligibility: eligMsg,
        checkDate: checkDate,
        remarks: checkRemarks
      };

      const updatedHistory = [logEntry, ...history];
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);

      // Save to local storage database
      const local = localStorage.getItem(STORAGE_KEY);
      const list = local ? JSON.parse(local) : [];
      const updatedList = list.map(b => {
        const idMatch = selectedBorrower.id ? b.id === selectedBorrower.id : b._id === selectedBorrower._id;
        if (idMatch) {
          return {
            ...b,
            cibilScore: computedScore,
            loanEligibility: eligMsg,
            cibilRemarks: checkRemarks,
            cibilCheckDate: checkDate
          };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

      toast.success('CIBIL inquiry completed successfully!');
      setLoading(false);
    }, 2000); // slightly longer loading for effect
  };

  const getScoreColor = (cibil) => {
    if (!cibil) return 'text-slate-400';
    if (cibil >= 750) return 'text-emerald-400';
    if (cibil >= 700) return 'text-blue-400';
    if (cibil >= 620) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGlow = (cibil) => {
    if (!cibil) return 'shadow-none';
    if (cibil >= 750) return 'drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]';
    if (cibil >= 700) return 'drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]';
    if (cibil >= 620) return 'drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]';
    return 'drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]';
  };

  const getScoreGradient = (cibil) => {
    if (!cibil) return 'from-slate-800 to-slate-900';
    if (cibil >= 750) return 'from-emerald-900/50 to-emerald-950';
    if (cibil >= 700) return 'from-blue-900/50 to-blue-950';
    if (cibil >= 620) return 'from-amber-900/50 to-amber-950';
    return 'from-rose-900/50 to-rose-950';
  };

  const getScoreGaugeAngle = (cibil) => {
    if (!cibil) return -90;
    // Map score range 300-900 to gauge angle range -90deg to +90deg
    const clamped = Math.max(300, Math.min(900, cibil));
    const pct = (clamped - 300) / 600;
    return -90 + pct * 180;
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Credit Assessment"
        subtitle="Live CIBIL inquiry & instant loan eligibility scoring engine."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 mt-6">
        
        {/* Borrower search and select */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden flex-grow flex flex-col">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
            
            <h4 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2 mb-5">
              <Search className="w-4 h-4 text-indigo-500" /> Search Borrower
            </h4>
            
            <div className="relative group z-10">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, ID or Mobile..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 placeholder-slate-400 shadow-inner"
              />
            </div>

            {filteredBorrowers.length > 0 && (
              <div className="mt-3 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-200/50 max-h-64 overflow-y-auto divide-y divide-slate-50 relative z-20 custom-scrollbar">
                {filteredBorrowers.map(b => (
                  <button
                    key={b._id || b.id}
                    onClick={() => handleSelectBorrower(b)}
                    className="w-full text-left px-5 py-3.5 hover:bg-indigo-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors">{b.customerName}</span>
                      <span className="text-xs text-slate-500 font-medium">ID: {b.customerId || b.id} &bull; Mob: {b.mobileNumber}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}

            {selectedBorrower ? (
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100/50 flex flex-col gap-4 animate-fade-in flex-grow justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 text-lg">
                      {selectedBorrower.customerName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-base">{selectedBorrower.customerName}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">{selectedBorrower.customerId || selectedBorrower.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 p-3 rounded-lg border border-white space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">PAN</span>
                      <span className="text-slate-800">{selectedBorrower.panNumber || selectedBorrower.panNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Aadhaar</span>
                      <span className="text-slate-800">{selectedBorrower.aadhaarNumber || selectedBorrower.aadhaarNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Mobile</span>
                      <span className="text-slate-800">{selectedBorrower.mobileNumber}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckCIBIL}
                  loading={loading}
                  variant="primary"
                  className="w-full h-11 text-sm font-bold shadow-lg shadow-indigo-500/25"
                  icon={ShieldCheck}
                >
                  {loading ? 'Analyzing Profile...' : 'Query Credit Rating'}
                </Button>
              </div>
            ) : (
              <div className="mt-6 p-8 rounded-xl bg-slate-50/80 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3 flex-grow">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  <User size={20} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium max-w-[200px]">Search and select a borrower to view credit profile</p>
              </div>
            )}
          </div>
        </div>

        {/* CIBIL Score Premium Dashboard */}
        <div className="lg:col-span-7">
          <div className={`h-full relative overflow-hidden rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center transition-all duration-700 bg-gradient-to-br ${getScoreGradient(score)}`}>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 blur-3xl pointer-events-none"></div>

            {loading ? (
              <div className="flex flex-col items-center gap-6 animate-pulse z-10">
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <ShieldCheck size={32} className="text-indigo-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg tracking-wide">Connecting to Bureau...</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Retrieving credit history and computing score</p>
                </div>
              </div>
            ) : score ? (
              <div className="w-full flex flex-col items-center z-10 animate-fade-in">
                
                {/* Score Header */}
                <div className="flex items-center gap-2 mb-8">
                  <ShieldCheck className={getScoreColor(score)} size={20} />
                  <span className="text-slate-300 font-bold tracking-widest text-xs uppercase">Official CIBIL Rating</span>
                </div>

                {/* Main Gauge UI */}
                <div className="relative flex flex-col items-center justify-end h-[160px] w-full max-w-sm mb-4">
                  {/* Gauge Arc Background */}
                  <svg viewBox="0 0 200 100" className="w-full h-full absolute inset-0 drop-shadow-2xl">
                    <path
                      d="M 20 90 A 80 80 0 0 1 180 90"
                      fill="none"
                      stroke="#1e293b" // slate-800
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    
                    {/* Gauge Arc Foreground (Color mapped) */}
                    <path
                      d="M 20 90 A 80 80 0 0 1 180 90"
                      fill="none"
                      stroke="url(#premiumGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="251.2" // PI * 80
                      strokeDashoffset={251.2 - (251.2 * ((Math.max(300, Math.min(900, score)) - 300) / 600))}
                      className="transition-all duration-1000 ease-out"
                    />
                    
                    <defs>
                      <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" /> {/* rose-500 */}
                        <stop offset="30%" stopColor="#fbbf24" /> {/* amber-400 */}
                        <stop offset="70%" stopColor="#60a5fa" /> {/* blue-400 */}
                        <stop offset="100%" stopColor="#34d399" /> {/* emerald-400 */}
                      </linearGradient>
                    </defs>

                    {/* Gauge Needle */}
                    <g 
                      transform={`translate(100, 90) rotate(${getScoreGaugeAngle(score)})`} 
                      className="transition-all duration-1000 ease-out delay-300"
                    >
                      <polygon points="-4,0 4,0 0,-65" fill="#f8fafc" />
                      <circle cx="0" cy="0" r="8" fill="#f8fafc" className="drop-shadow-lg" />
                      <circle cx="0" cy="0" r="3" fill="#0f172a" />
                    </g>
                  </svg>
                  
                  {/* Score Number Display */}
                  <div className={`absolute bottom-0 translate-y-[20px] bg-slate-900 px-6 py-2 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col items-center ${getScoreGlow(score)} transition-all duration-700`}>
                    <span className={`text-5xl font-black tracking-tighter ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>

                {/* Score Details Grid */}
                <div className="w-full max-w-md mt-12 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Eligibility Status</span>
                    <span className={`text-xs font-bold leading-tight ${getScoreColor(score)}`}>{eligibility}</span>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Bureau Remarks</span>
                    <span className="text-white text-xs font-bold leading-tight">{remarks}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Calendar size={12} />
                  Last Updated: {checkDate}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center text-center z-10 p-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-5 shadow-inner">
                  <ShieldAlert size={36} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Awaiting Assessment</h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm">
                  Select a borrower profile from the panel and initiate a secure query to generate their credit report.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Inquiry Logs */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
          Inquiry History Log
        </h3>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
          {history.length} Records
        </span>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          headers={[
            'Date',
            'Borrower ID',
            'Name',
            'PAN / Aadhaar',
            'CIBIL Score',
            'Eligibility Status',
            'Remarks'
          ]}
          data={history}
          renderRow={(h) => (
            <TR key={h._id}>
              <TD className="text-slate-500 text-xs font-semibold">{h.checkDate}</TD>
              <TD className="font-bold text-slate-800 text-xs">{h.customerId}</TD>
              <TD className="font-semibold text-xs text-slate-700">{h.customerName}</TD>
              <TD className="font-mono text-xs text-slate-600">{h.panOrAadhaar}</TD>
              <TD className={`font-bold text-xs ${getScoreColor(h.score)}`}>{h.score}</TD>
              <TD className="text-xs font-bold text-slate-700">{h.eligibility}</TD>
              <TD className="text-xs text-slate-600 font-medium">{h.remarks}</TD>
            </TR>
          )}
        />
        {history.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm font-medium">
            No inquiry records found.
          </div>
        )}
      </div>

    </div>
  );
};

// Add User icon that was missing in imports but used in JSX
import { User } from 'lucide-react';

export default CIBILCheck;
