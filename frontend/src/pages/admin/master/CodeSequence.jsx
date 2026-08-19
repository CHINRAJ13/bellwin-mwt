import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { TR, TD } from '../../../components/ui/Table';
import { Settings, Edit2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CodeSequence = () => {
  const [masterModules, setMasterModules] = useState([
    { id: 'm1', module: 'Branch Master', prefix: 'BR', digits: 4 },
    { id: 'm2', module: 'Employee Master', prefix: 'EMP', digits: 4 },
    { id: 'm3', module: 'Member Master', prefix: 'MEM', digits: 4 },
    { id: 'm4', module: 'Borrower/Customer', prefix: 'BOR', digits: 4 },
    { id: 'm5', module: 'Loan Scheme', prefix: 'LS', digits: 4 },
    { id: 'm6', module: 'Dealer Master', prefix: 'DLR', digits: 4 },
    { id: 'm7', module: 'Vehicle Master', prefix: 'VEH', digits: 4 },
    { id: 'm8', module: 'Item Group', prefix: 'IG', digits: 4 },
    { id: 'm9', module: 'Purity Master', prefix: 'PUR', digits: 4 },
    { id: 'm10', module: 'Gold Rate', prefix: 'GR', digits: 4 },
    { id: 'm11', module: 'Locker Master', prefix: 'LKR', digits: 4 },
    { id: 'm12', module: 'Valuer Master', prefix: 'VAL', digits: 4 },
    { id: 'm13', module: 'Ledger Master', prefix: 'LED', digits: 4 },
    { id: 'm14', module: 'Accounts Group', prefix: 'AG', digits: 4 },
    { id: 'm15', module: 'Bank Master', prefix: 'BNK', digits: 4 },
    { id: 'm16', module: 'Repledge Scheme', prefix: 'RPS', digits: 4 },
    { id: 'm17', module: 'Repledge Bank', prefix: 'RPB', digits: 4 },
    { id: 'm18', module: 'Repledge Entry', prefix: 'RPE', digits: 4 },
  ]);

  const [operationalModules, setOperationalModules] = useState([
    { id: 'o1', module: 'Loan Application', prefix: 'APP', digits: 6 },
    { id: 'o2', module: 'Loan Account', prefix: 'LN', digits: 6 },
    { id: 'o3', module: 'Loan Disbursement', prefix: 'DIS', digits: 6 },
    { id: 'o4', module: 'EMI Receipt', prefix: 'EMI', digits: 6 },
    { id: 'o5', module: 'Payment Voucher', prefix: 'PV', digits: 6 },
    { id: 'o6', module: 'Receive Voucher', prefix: 'RV', digits: 6 },
    { id: 'o7', module: 'Journal Voucher', prefix: 'JV', digits: 6 },
    { id: 'o8', module: 'Contra Voucher', prefix: 'CV', digits: 6 },
  ]);

  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    item: null,
    type: null, // 'master' or 'operational'
    prefix: '',
    digits: 4
  });

  const handleEditClick = (item, type) => {
    setEditModalState({
      isOpen: true,
      item,
      type,
      prefix: item.prefix,
      digits: item.digits
    });
  };

  const handleCloseModal = () => {
    setEditModalState({ ...editModalState, isOpen: false });
  };

  const handleSave = () => {
    const { item, type, prefix, digits } = editModalState;
    
    if (type === 'master') {
      setMasterModules(masterModules.map(m => 
        m.id === item.id ? { ...m, prefix: prefix.toUpperCase(), digits: parseInt(digits) } : m
      ));
    } else {
      setOperationalModules(operationalModules.map(m => 
        m.id === item.id ? { ...m, prefix: prefix.toUpperCase(), digits: parseInt(digits) } : m
      ));
    }
    handleCloseModal();
  };

  const renderRow = (item, type) => {
    const format = `${item.prefix} + ${item.digits} digits`;
    const example = `${item.prefix}${'0'.repeat(item.digits - 1)}1`;
    return (
      <TR key={item.id}>
        <TD className="font-semibold text-gray-700">{item.module}</TD>
        <TD>
          <span className={`px-2 py-1 ${type === 'master' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'} font-medium text-xs rounded-md`}>
            {format}
          </span>
        </TD>
        <TD className="font-mono text-sm text-gray-600">{example}</TD>
        <TD>
          <button 
            onClick={() => handleEditClick(item, type)}
            className="p-1 text-gray-400 hover:text-primary transition-colors"
            title="Edit Sequence"
          >
            <Edit2 size={16} />
          </button>
        </TD>
      </TR>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Code Sequence Settings" 
        subtitle="View and manage the auto-incrementing ID formats for all modules."
        icon={Settings}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">Master Modules</h3>
          </div>
          <DataTable
            headers={['Module', 'Format', 'Example', 'Action']}
            data={masterModules}
            renderRow={(item) => renderRow(item, 'master')}
          />
        </div>

        <div className="shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">Operational Modules</h3>
          </div>
          <DataTable
            headers={['Module', 'Format', 'Example', 'Action']}
            data={operationalModules}
            renderRow={(item) => renderRow(item, 'operational')}
          />
        </div>
      </div>

      <Modal 
        isOpen={editModalState.isOpen} 
        onClose={handleCloseModal}
        title="Edit Code Sequence"
      >
        {editModalState.item && (
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Module</p>
              <p className="font-semibold text-gray-800">{editModalState.item.module}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Prefix" 
                value={editModalState.prefix} 
                onChange={(e) => setEditModalState({...editModalState, prefix: e.target.value})}
                maxLength={5}
                placeholder="e.g. BR"
              />
              <Input 
                label="Number of Digits" 
                type="number" 
                min={3} 
                max={10}
                value={editModalState.digits} 
                onChange={(e) => setEditModalState({...editModalState, digits: e.target.value})}
              />
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Preview Example:</p>
              <p className="font-mono text-lg font-semibold text-primary">
                {editModalState.prefix.toUpperCase()}{'0'.repeat(Math.max(0, editModalState.digits - 1))}1
              </p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CodeSequence;
