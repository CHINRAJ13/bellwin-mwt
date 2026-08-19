import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, Printer, Calendar, RefreshCw } from 'lucide-react';

const DailySummaryReportView = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('today');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingDenom, setSavingDenom] = useState(false);

  const [denomForm, setDenomForm] = useState({
    denominationId: '',
    count500: '',
    count200: '',
    count100: '',
    count50: '',
    count20: '',
    count10: '',
    count5: '',
    count2: '',
    count1: '',
    coinsTotal: '',
    enteredBy: '',
    verifiedBy: '',
    verifiedTime: '',
    remarks: ''
  });

  const fetchNextDenomId = async () => {
    try {
      const res = await api.get('/denominations/next-id');
      setDenomForm(prev => ({ ...prev, denominationId: res.data.nextId }));
    } catch (err) {
      console.error('Failed to fetch next ID', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/daily-closing-summary?date=${date}&period=${period}`);
      setReportData(response.data);
      
      const raw = response.data.denominations?.rawDenomination;
      if (raw) {
        setDenomForm({
          denominationId: raw.denominationId || '',
          count500: raw.notes500 !== undefined && raw.notes500 !== null ? String(raw.notes500) : '',
          count200: raw.notes200 !== undefined && raw.notes200 !== null ? String(raw.notes200) : '',
          count100: raw.notes100 !== undefined && raw.notes100 !== null ? String(raw.notes100) : '',
          count50: raw.notes50 !== undefined && raw.notes50 !== null ? String(raw.notes50) : '',
          count20: raw.notes20 !== undefined && raw.notes20 !== null ? String(raw.notes20) : '',
          count10: raw.notes10 !== undefined && raw.notes10 !== null ? String(raw.notes10) : '',
          count5: raw.notes5 !== undefined && raw.notes5 !== null ? String(raw.notes5) : '',
          count2: raw.notes2 !== undefined && raw.notes2 !== null ? String(raw.notes2) : '',
          count1: raw.notes1 !== undefined && raw.notes1 !== null ? String(raw.notes1) : '',
          coinsTotal: raw.coinsTotal !== undefined && raw.coinsTotal !== null ? String(raw.coinsTotal) : '',
          enteredBy: raw.enteredBy || '',
          verifiedBy: raw.verifiedBy || '',
          verifiedTime: raw.verifiedTime ? new Date(raw.verifiedTime).toISOString().slice(0, 16) : '',
          remarks: raw.remarks || ''
        });
      } else {
        setDenomForm({
          denominationId: '',
          count500: '', count200: '', count100: '', count50: '', count20: '',
          count10: '', count5: '', count2: '', count1: '', coinsTotal: '',
          enteredBy: '', verifiedBy: '', verifiedTime: '', remarks: ''
        });
        fetchNextDenomId();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to fetch daily summary report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, period]);

  const handleDenomChange = (e) => {
    setDenomForm({ ...denomForm, [e.target.name]: e.target.value });
  };

  const calculatedGrandTotal = useMemo(() => {
    return (
      (Number(denomForm.count500) || 0) * 500 +
      (Number(denomForm.count200) || 0) * 200 +
      (Number(denomForm.count100) || 0) * 100 +
      (Number(denomForm.count50) || 0) * 50 +
      (Number(denomForm.count20) || 0) * 20 +
      (Number(denomForm.count10) || 0) * 10 +
      (Number(denomForm.count5) || 0) * 5 +
      (Number(denomForm.count2) || 0) * 2 +
      (Number(denomForm.count1) || 0) * 1 +
      (Number(denomForm.coinsTotal) || 0)
    );
  }, [denomForm]);

  const handleSaveDenomination = async (e) => {
    e.preventDefault();
    if (!denomForm.denominationId) {
      toast.error('Denomination ID is missing');
      return;
    }
    setSavingDenom(true);
    try {
      const payload = {
        denominationId: denomForm.denominationId,
        entryDate: date,
        cashInHandTotal: closingBalance,
        notes500: Number(denomForm.count500) || 0,
        notes200: Number(denomForm.count200) || 0,
        notes100: Number(denomForm.count100) || 0,
        notes50: Number(denomForm.count50) || 0,
        notes20: Number(denomForm.count20) || 0,
        notes10: Number(denomForm.count10) || 0,
        notes5: Number(denomForm.count5) || 0,
        notes2: Number(denomForm.count2) || 0,
        notes1: Number(denomForm.count1) || 0,
        coinsTotal: Number(denomForm.coinsTotal) || 0,
        enteredBy: denomForm.enteredBy,
        verifiedBy: denomForm.verifiedBy,
        verifiedTime: denomForm.verifiedTime || undefined,
        remarks: denomForm.remarks
      };

      const hasRaw = !!reportData?.denominations?.rawDenomination;
      if (hasRaw) {
        await api.put(`/denominations/${denomForm.denominationId}`, payload);
        toast.success('Denomination details updated successfully!');
      } else {
        await api.post('/denominations', payload);
        toast.success('Denomination details saved successfully!');
      }
      fetchReport();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save denomination details');
    } finally {
      setSavingDenom(false);
    }
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB').replace(/\//g, '-');
  };

  const getPeriodLabel = () => {
    if (period === 'today') return 'today';
    if (period === 'weekly') return 'this week';
    if (period === 'monthly') return 'this month';
    if (period === 'yearly') return 'this year';
    return 'this period';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const openingBalance = reportData?.openingBalance || 0;
  const closingBalance = reportData?.closingBalance || 0;
  const incomeItems = reportData?.income?.items || [];
  const expenseItems = reportData?.expense?.items || [];
  const totalIncome = reportData?.income?.total || 0;
  const totalExpense = reportData?.expense?.total || 0;
  const denominations = reportData?.denominations?.notes || {};
  const denominationTotal = reportData?.denominations?.total || 0;
  const goldStock = reportData?.goldStock || [];

  const noteKeys = ["2000", "500", "200", "100", "50", "20", "10", "5", "2", "1"];

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans text-black">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header and Controls (no-print) */}
      <div className="no-print mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Summary Report</h1>
          <p className="text-sm text-gray-500">Query and print daily transaction summaries and cash book closing data.</p>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-none bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 cursor-pointer h-[38px] min-w-[100px]"
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-none bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 h-[38px]"
              />
            </div>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-none transition-colors text-sm shadow-sm disabled:opacity-75"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Generate
          </button>

          <button
            onClick={() => window.print()}
            disabled={!reportData || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-none hover:bg-gray-50 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mb-2" />
          <p className="font-medium">Loading report data...</p>
        </div>
      ) : reportData ? (
        <>
          <div className="print-container bg-white p-8 border border-gray-300 shadow-sm">
          {/* Print Only Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wide">Daily Summary Report</h2>
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="font-bold mb-1 text-sm">Date : {formatDateLabel(reportData.date)}</div>
              <div className="font-bold text-base uppercase">OPENING BALANCE : {formatCurrency(openingBalance)}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-base uppercase">CLOSING BALANCE : {formatCurrency(closingBalance)}</div>
            </div>
          </div>

          {/* Main Income/Expense Table */}
          <div className="flex border border-black mb-6 min-h-[300px]">
            {/* Income Side */}
            <div className="flex-1 border-r border-black flex flex-col">
              <div className="flex border-b border-black font-bold text-center bg-gray-50">
                <div className="flex-[3] p-2 border-r border-black text-sm uppercase">TITLE (VARAVU)</div>
                <div className="flex-1 p-2 text-sm uppercase text-right">Amt.</div>
              </div>
              
              <div className="flex-1 flex flex-col">
                {incomeItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400 italic my-auto">
                    No income transactions recorded {getPeriodLabel()}
                  </div>
                ) : (
                  incomeItems.map((item, idx) => (
                    <div key={idx} className="flex border-b border-black last:border-b-0 min-h-[38px]">
                      <div className="flex-[3] p-2 border-r border-black text-sm">{item.title}</div>
                      <div className="flex-1 p-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expense Side */}
            <div className="flex-1 flex flex-col">
              <div className="flex border-b border-black font-bold text-center bg-gray-50">
                <div className="flex-[3] p-2 border-r border-black text-sm uppercase">EXPENSE TITLE (SELAVU)</div>
                <div className="flex-1 p-2 text-sm uppercase text-right">AMOUNT</div>
              </div>
              
              <div className="flex-1 flex flex-col">
                {expenseItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400 italic my-auto">
                    No expenses recorded {getPeriodLabel()}
                  </div>
                ) : (
                  expenseItems.map((item, idx) => (
                    <div key={idx} className="flex border-b border-black last:border-b-0 min-h-[38px]">
                      <div className="flex-[3] p-2 border-r border-black text-sm">{item.title}</div>
                      <div className="flex-1 p-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-between font-bold mb-10 text-sm border border-black p-3 bg-gray-50">
            <div className="uppercase">TOTAL INCOME RS. : {formatCurrency(totalIncome)}</div>
            <div className="uppercase">TOTAL EXPENSE AMOUNT RS. : {formatCurrency(totalExpense)}</div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Cash Denomination */}
            <div className="w-full md:w-80">
              <div className="font-bold text-sm mb-3 uppercase border-b border-black pb-1">CASH DENOMINATION</div>
              <div className="space-y-1 font-mono text-sm">
                {noteKeys.map(val => {
                  const note = denominations[val] || { count: 0, amount: 0 };
                  return (
                    <div key={val} className="flex justify-between pr-4 border-b border-gray-100 py-0.5">
                      <span className="w-20">{val} x</span>
                      <span>{note.count || 0}</span>
                      <span>=</span>
                      <span className="w-24 text-right">{formatCurrency(note.amount)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pr-4 border-b border-gray-100 py-0.5">
                  <span className="w-20">Coins x</span>
                  <span>{denominations["Coins"]?.count || 0}</span>
                  <span>=</span>
                  <span className="w-24 text-right">{formatCurrency(denominations["Coins"]?.amount)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-black text-sm pr-4">
                <span>Total Cash:</span>
                <span className="w-24 text-right">{formatCurrency(denominationTotal)}</span>
              </div>
            </div>

            {/* Gold Stock (Branch Stock) */}
            <div className="w-full md:w-80">
              <div className="font-bold text-sm mb-3 uppercase border-b border-black pb-1">Gold Stock (Pledged {getPeriodLabel()})</div>
              <div className="border border-black rounded-none">
                {goldStock.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 italic">
                    No gold articles pledged {getPeriodLabel()}.
                  </div>
                ) : (
                  goldStock.map((item, idx) => (
                    <div key={idx} className="flex border-b border-black last:border-b-0 min-h-[29px] hover:bg-gray-50">
                      <div className="flex-[2] p-1.5 border-r border-black uppercase text-xs truncate" title={item.customerName}>
                        {item.loanId} - {item.customerName}
                      </div>
                      <div className="flex-1 p-1.5 text-xs text-right font-medium">{item.weight}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Denomination Form (no-print) */}
        {reportData && (
          <div className="no-print mt-8 bg-white border border-gray-200 p-6">
            <div className="border-b border-gray-200 pb-3 mb-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Enter / Edit Daily Cash Closing Denominations</h3>
              <div className="bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                ID: {denomForm.denominationId || 'Loading...'}
              </div>
            </div>
            
            <form onSubmit={handleSaveDenomination} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Denomination Columns */}
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: '₹500 x', name: 'count500' },
                    { label: '₹200 x', name: 'count200' },
                    { label: '₹100 x', name: 'count100' },
                    { label: '₹50 x', name: 'count50' },
                    { label: '₹20 x', name: 'count20' },
                    { label: '₹10 x', name: 'count10' },
                    { label: '₹5 x', name: 'count5' },
                    { label: '₹2 x', name: 'count2' },
                    { label: '₹1 x', name: 'count1' }
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{item.label}</span>
                      <input
                        type="number"
                        name={item.name}
                        min="0"
                        value={denomForm[item.name]}
                        onChange={handleDenomChange}
                        className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700 w-12 text-right">Coins ₹</span>
                    <input
                      type="number"
                      name="coinsTotal"
                      min="0"
                      value={denomForm.coinsTotal}
                      onChange={handleDenomChange}
                      className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Grand Total Indicator */}
                <div className="bg-gray-50 border border-gray-200 p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Calculated Cash Total</span>
                  <span className="text-2xl font-black text-gray-900">₹{calculatedGrandTotal.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400 mt-2">System Cash: {formatCurrency(closingBalance)}</span>
                  {calculatedGrandTotal !== closingBalance && (
                    <span className="text-xs font-bold text-red-500 mt-1">
                      Difference: {formatCurrency(calculatedGrandTotal - closingBalance)}
                    </span>
                  )}
                </div>
              </div>

              {/* Verification details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Entered By</label>
                  <input
                    type="text"
                    name="enteredBy"
                    value={denomForm.enteredBy}
                    onChange={handleDenomChange}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Staff Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Verified By</label>
                  <input
                    type="text"
                    name="verifiedBy"
                    value={denomForm.verifiedBy}
                    onChange={handleDenomChange}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Manager Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Verified Time</label>
                  <input
                    type="datetime-local"
                    name="verifiedTime"
                    value={denomForm.verifiedTime}
                    onChange={handleDenomChange}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={denomForm.remarks}
                  onChange={handleDenomChange}
                  rows="2"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                  placeholder="Note any auditing remarks or cash differences here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={savingDenom}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-none shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingDenom ? 'Saving...' : 'Save Cash Closing & Denominations'}
                </button>
              </div>
            </form>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-20 border border-dashed border-gray-300 text-gray-500">
          No report generated. Please select a date and click "Generate".
        </div>
      )}
    </div>
  );
};

export default DailySummaryReportView;
