import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import { Users, Search, PlusCircle, UserPlus, Shield, Activity } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const MicroFinanceGroupMaster = () => {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('creation');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'creation', label: 'Group Creation', icon: PlusCircle },
    { id: 'member', label: 'Group Member Add', icon: UserPlus },
    { id: 'leader', label: 'Group Leader Assign', icon: Shield },
    { id: 'status', label: 'Group Status', icon: Activity }
  ];

  const handleSearch = () => {
    if (!searchId && !searchName) return;
    setLoading(true);
    // Mocking an API call
    setTimeout(() => {
      setCustomer({
        id: searchId || 'BOR0012',
        name: searchName || 'John Doe',
        mobile: '9876543210',
        branch: 'Main Branch',
        status: 'Active'
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Micro Finance Group Master" 
        subtitle="Manage Joint Liability Groups (JLG), members, and leaders."
        icon={Users}
      />

      {/* Customer Search Section */}
      <div className="p-6 mb-6 mt-6 border border-green-100 shadow-sm bg-green-50/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Search size={20} className="text-green-600" />
          Customer Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input 
            label="Customer ID" 
            placeholder="e.g. BOR0001" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <Input 
            label="Customer Name" 
            placeholder="Enter Name" 
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <Button 
            variant="primary" 
            className="w-full md:w-auto h-10"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Customer'}
          </Button>
        </div>

        {customer && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 flex flex-wrap gap-6 items-center shadow-sm animate-fade-in">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Customer ID</p>
              <p className="text-sm font-medium text-gray-800">{customer.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-sm font-medium text-gray-800">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Mobile</p>
              <p className="text-sm font-medium text-gray-800">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Branch</p>
              <p className="text-sm font-medium text-gray-800">{customer.branch}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                {customer.status}
              </span>
            </div>
          </div>
        )}
      </div>

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
        {activeTab === 'creation' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Group Creation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Group Code" placeholder="Auto-generated (e.g. MFG001)" disabled />
              <Input label="Group Name" placeholder="Enter Group Name" required />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Branch</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="">Select Branch</option>
                  <option value="main">Main Branch</option>
                  <option value="sub">Sub Branch 1</option>
                </select>
              </div>
              <Input label="Max Members Limit" type="number" placeholder="e.g. 5 or 10" defaultValue="5" required />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Create Group</Button>
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Group Member Add</h3>
            {!customer ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Please search and select a customer above to add them to a group.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Selected Customer" value={`${customer.id} - ${customer.name}`} disabled />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Select Group to Join</label>
                  <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                    <option value="">Select a Group</option>
                    <option value="g1">MFG001 - Rose Group</option>
                    <option value="g2">MFG002 - Lotus Group</option>
                  </select>
                </div>
              </div>
            )}
            {customer && (
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Add Member to Group</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leader' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Group Leader Assign</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Select Group</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="">Select a Group</option>
                  <option value="g1">MFG001 - Rose Group</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Select Member as Leader</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="">Select Member</option>
                  <option value="m1">BOR0012 - John Doe</option>
                  <option value="m2">BOR0015 - Jane Smith</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Assign Leader</Button>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Group Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Select Group</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="">Select a Group</option>
                  <option value="g1">MFG001 - Rose Group</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Change Status</label>
                <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed / Disbanded</option>
                </select>
              </div>
              <Input label="Remarks / Reason" placeholder="Enter reason for status change" className="md:col-span-2" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary">Update Status</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroFinanceGroupMaster;
