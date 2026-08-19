import React, { useState } from 'react';
import { ArrowLeft, Wallet, Coins, Briefcase, Landmark, Truck } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import ChitFundManager from './Loanscheme/ChitFundManager';
import GoldLoanManager from './Loanscheme/GoldLoanManager';
import MicroFinanceManager from './Loanscheme/MicroFinanceManager';
import PersonalLoanManager from './Loanscheme/PersonalLoanManager';
import TwoWheelerLoanManager from './Loanscheme/TwoWheelerLoanManager';

const LoanScheme = () => {
  const [activeScheme, setActiveScheme] = useState(null);

  const schemeTypes = [
    { id: 'chitfund', title: 'Chit Fund Loan', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50', component: ChitFundManager },
    { id: 'gold', title: 'Gold Loan', icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-50', component: GoldLoanManager },
    { id: 'microfinance', title: 'Micro Finance', icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50', component: MicroFinanceManager },
    { id: 'personal', title: 'Personal Loan', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50', component: PersonalLoanManager },
    { id: 'twowheeler', title: 'Two Wheeler Loan', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-50', component: TwoWheelerLoanManager },
  ];

  if (activeScheme) {
    const ActiveComponent = activeScheme.component;
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveScheme(null)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{activeScheme.title} Configuration</h1>
          </div>
        </div>
        
        <ActiveComponentWrapper ActiveComponent={ActiveComponent} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Loan Schemes Hub"
        subtitle="Select a loan type below to configure its schemes and parameters."
        icon={Wallet}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {schemeTypes.map((scheme) => {
          const Icon = scheme.icon;
          return (
            <div 
              key={scheme.id}
              onClick={() => setActiveScheme(scheme)}
              className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1"
            >
              <div className={`p-5 rounded-full ${scheme.bg} ${scheme.color} group-hover:scale-110 transition-transform`}>
                <Icon size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{scheme.title}</h3>
              <p className="text-sm text-gray-500">Configure settings, rates, and limits for {scheme.title}.</p>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const ActiveComponentWrapper = ({ ActiveComponent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          {showAddForm ? 'Cancel Form' : 'Add New Scheme'}
        </button>
      </div>
      <ActiveComponent showAddForm={showAddForm} setShowAddForm={setShowAddForm} />
    </div>
  );
};

export default LoanScheme;
