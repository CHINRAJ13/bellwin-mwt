import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Calculator, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';

const LoanCalculator = () => {
  const [calculators, setCalculators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCalc, setEditingCalc] = useState(null);

  const [formData, setFormData] = useState({
    calculationType: 'Simple',
    loanMode: 'Monthly',
    loanAmount: 500000,
    term: 11,
    roi: 11,
    interestAmount: 0,
    totalPayable: 0,
    installmentAmount: 0,
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  const fetchCalculators = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/loan-calculator');
      setCalculators(res.data || []);
    } catch (err) {
      console.error('Failed to fetch loan calculators', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculators();
  }, []);

  // Recalculate whenever amount, term, or roi changes
  useEffect(() => {
    let P = parseFloat(formData.loanAmount);
    let R = parseFloat(formData.roi);
    let T = parseFloat(formData.term);

    // Validation fallbacks
    if (isNaN(P) || P < 0) P = 0;
    if (isNaN(R) || R < 0) R = 0;
    if (isNaN(T) || T < 0) T = 0;

    let interest = 0;
    let total = 0;
    let inst = 0;

    if (formData.calculationType === 'Simple') {
      let timeInYears = 0;
      if (formData.loanMode === 'Monthly') timeInYears = T / 12;
      else if (formData.loanMode === 'Weekly') timeInYears = T / 52;
      else if (formData.loanMode === 'Daily') timeInYears = T / 365;

      interest = P * (R / 100) * timeInYears;
      total = P + interest;
      inst = T > 0 ? total / T : total;
    } else {
      // Reducing EMI
      let ratePerPeriod = 0;
      if (formData.loanMode === 'Monthly') ratePerPeriod = R / 12 / 100;
      else if (formData.loanMode === 'Weekly') ratePerPeriod = R / 52 / 100;
      else if (formData.loanMode === 'Daily') ratePerPeriod = R / 365 / 100;

      if (ratePerPeriod > 0 && T > 0) {
        inst = (P * ratePerPeriod * Math.pow(1 + ratePerPeriod, T)) / (Math.pow(1 + ratePerPeriod, T) - 1);
      } else {
        inst = T > 0 ? P / T : P;
      }
      total = inst * T;
      interest = Math.max(0, total - P);
    }

    // Format to 2 decimal places internally
    interest = Math.round(interest * 100) / 100 || 0;
    total = Math.round(total * 100) / 100 || 0;
    inst = Math.round(inst * 100) / 100 || 0;

    setFormData(prev => ({
      ...prev,
      interestAmount: interest,
      totalPayable: total,
      installmentAmount: inst
    }));
  }, [formData.loanAmount, formData.term, formData.roi, formData.calculationType, formData.loanMode]);

  const handleOpenAdd = () => {
    setEditingCalc(null);
    setFormData({
      calculationType: 'Simple',
      loanMode: 'Monthly',
      loanAmount: 500000,
      term: 11,
      roi: 11,
      interestAmount: 0,
      totalPayable: 0,
      installmentAmount: 0,
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (calc) => {
    setEditingCalc(calc);
    setFormData({
      calculationType: calc.calculationType || 'Simple',
      loanMode: calc.loanMode || 'Monthly',
      loanAmount: calc.loanAmount || 0,
      term: calc.term || 0,
      roi: calc.roi || 0,
      interestAmount: calc.interestAmount || 0,
      totalPayable: calc.totalPayable || 0,
      installmentAmount: calc.installmentAmount || 0,
      status: calc.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.loanAmount <= 0 || formData.term <= 0 || formData.roi < 0) {
      return alert('Please enter valid positive values for Amount, Term, and ROI');
    }

    setLoading(true);
    try {
      if (editingCalc) {
        await api.put(`/loan-config/loan-calculator/${editingCalc._id}`, formData);
      } else {
        await api.post('/loan-config/loan-calculator', formData);
      }
      setIsFormOpen(false);
      fetchCalculators();
    } catch (err) {
      console.error(err);
      alert('Failed to save calculation setting');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/loan-calculator/${deleteId}`);
      setDeleteId(null);
      fetchCalculators();
    } catch (err) {
      console.error(err);
      alert('Failed to delete calculation setting');
    } finally {
      setLoading(false);
    }
  };

  const filteredCalculators = calculators.filter(c =>
    c.calculationType?.toLowerCase().includes(search.toLowerCase()) ||
    c.loanMode?.toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingCalc ? 'Edit Calculator Preset' : 'Add New Calculator Preset'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure and save a predefined loan scheme calculation.
            </p>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-6 form-spiritual-bg">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Calculation Type"
                value={formData.calculationType}
                onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                containerClassName="bg-gray-50"
              >
                <option value="Simple">Simple Interest</option>
                <option value="EMI">EMI (Reducing Balance)</option>
              </Select>

              <Select
                label="Loan Mode"
                value={formData.loanMode}
                onChange={(e) => setFormData({ ...formData, loanMode: e.target.value })}
                containerClassName="bg-gray-50"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Loan Amount (₹)"
                type="number"
                step="0.01"
                required
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                className="bg-gray-50 text-lg font-bold"
              />
              <Input
                label={`Term (${formData.loanMode})`}
                type="number"
                required
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="bg-gray-50"
              />
              <Input
                label="ROI"
                type="number"
                step="0.01"
                required
                value={formData.roi}
                onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                className="bg-gray-50"
              />
            </div>

            <div className="mt-8 p-6 bg-green-50 border border-green-200">
              <div className="mb-4 pb-4 border-b border-green-200 flex justify-between items-end">
                <div>
                  <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider">Calculation Summary</h3>
                  <div className="text-xs text-green-700 mt-1 flex gap-4">
                    <span>Type: {formData.calculationType}</span>
                    <span>Mode: {formData.loanMode}</span>
                    <span>ROI: {formData.roi}% p.a.</span>
                    <span>Term: {formData.term} {formData.loanMode === 'Monthly' ? 'Months' : formData.loanMode === 'Weekly' ? 'Weeks' : 'Days'}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Principal Amount</p>
                  <p className="text-xl font-bold text-green-900">₹{Number(formData.loanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Interest Amount</p>
                  <p className="text-xl font-bold text-green-900">₹{Number(formData.interestAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Total Payable</p>
                  <p className="text-xl font-bold text-green-900">₹{Number(formData.totalPayable).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">{formData.loanMode} Installment</p>
                  <p className="text-xl font-extrabold text-green-900">₹{Number(formData.installmentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                onClick={() => setIsFormOpen(false)}
                variant="secondary"
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="px-8 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                Save Preset
              </Button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader
        title="Loan Calculator Settings"
        subtitle="Manage and save calculations for standard loan configurations."
        icon={Calculator}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Preset
          </Button>
        }
      />

      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Type or Mode..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
          />
        </div>
      </div>

      <DataTable
        headers={[
          'Calc Type',
          'Loan Mode',
          'Loan Amount',
          'Term',
          'ROI (% p.a.)',
          'Interest',
          'Total Payable',
          'Installment',
          'Actions'
        ]}
        data={filteredCalculators}
        loading={loading}
        renderRow={(calc) => (
          <TR key={calc._id}>
            <TD className="font-bold text-gray-800">
              <Badge variant={calc.calculationType === 'Simple' ? 'primary' : 'secondary'}>
                {calc.calculationType}
              </Badge>
            </TD>
            <TD className="font-semibold text-gray-700">{calc.loanMode}</TD>
            <TD className="font-bold text-gray-900">₹{Number(calc.loanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TD>
            <TD>{calc.term}</TD>
            <TD>{calc.roi}%</TD>
            <TD className="text-gray-700">₹{Number(calc.interestAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TD>
            <TD className="font-bold text-gray-900">₹{Number(calc.totalPayable).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TD>
            <TD className="font-extrabold text-green-700">₹{Number(calc.installmentAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(calc)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(calc._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </TD>
          </TR>
        )}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Preset"
        description="Are you sure you want to delete this preset calculation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default LoanCalculator;
