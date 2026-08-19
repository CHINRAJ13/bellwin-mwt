import React, { useState } from 'react';

const LoanSchemeStandalone = ({ title, icon: Icon, ActiveComponent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
            <Icon size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 m-0 leading-none">{title} Configuration</h1>
            <p className="text-sm text-gray-500 mt-1 mb-0">Manage {title} details and parameters</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow hover:shadow-md cursor-pointer border-none outline-none"
        >
          {showAddForm ? 'Cancel Form' : 'Add New Scheme'}
        </button>
      </div>
      
      <ActiveComponent showAddForm={showAddForm} setShowAddForm={setShowAddForm} />
    </div>
  );
};

export default LoanSchemeStandalone;
