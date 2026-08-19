import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { Settings, Percent, Clock, DollarSign } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const MicroFinanceScheme = () => {
  const [activeTab, setActiveTab] = useState('scheme');
  const [schemeCode, setSchemeCode] = useState(`MFI-${Math.floor(100000 + Math.random() * 900000)}`);

  const tabs = [
    { id: 'scheme', label: 'Scheme Master', icon: Settings },
    { id: 'interest', label: 'Interest Rate Setup', icon: Percent },
    { id: 'tenure', label: 'Loan Tenure Setup', icon: Clock },
    { id: 'fee', label: 'Processing Fee Setup', icon: DollarSign }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Micro Finance Scheme" 
        subtitle="Configure schemes, interest rates, tenures, and processing fees."
        icon={Settings}
      />

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-6 mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'scheme' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Scheme Master</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Scheme Code" 
                value={schemeCode} 
                readOnly 
                className="bg-gray-200 cursor-not-allowed font-bold" 
              />
              <Input label="Scheme Name" placeholder="Enter Scheme Name" required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Scheme Type</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="">Select Type</option>
                  <option value="individual">Individual Loan</option>
                  <option value="group">Group Loan (JLG)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Save Scheme</Button>
            </div>
          </div>
        )}

        {activeTab === 'interest' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Interest Rate Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Interest Rate (%)" type="number" placeholder="Enter Interest Rate" required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Calculation Method</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="flat">Flat Rate</option>
                  <option value="reducing">Reducing Balance</option>
                </select>
              </div>
              <Input label="Overdue Penalty Rate (%)" type="number" placeholder="Penalty Rate" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Save Interest Rate</Button>
            </div>
          </div>
        )}

        {activeTab === 'tenure' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Loan Tenure Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Minimum Tenure (Months)" type="number" placeholder="Min Months" required />
              <Input label="Maximum Tenure (Months)" type="number" placeholder="Max Months" required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Repayment Frequency</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Save Tenure</Button>
            </div>
          </div>
        )}

        {activeTab === 'fee' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Processing Fee Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Fee Type</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage of Loan</option>
                </select>
              </div>
              <Input label="Fee Value" type="number" placeholder="Enter Value" required />
              <Input label="Insurance / Documentation Fee" type="number" placeholder="Fixed Value" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Save Fees</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroFinanceScheme;
