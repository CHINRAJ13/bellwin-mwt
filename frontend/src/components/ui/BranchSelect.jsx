import { useState, useEffect } from 'react';
import Select from './Select';
import api from '../../services/api';

const BranchSelect = ({ 
  label = "Branch Name", 
  required = false, 
  value, 
  onChange, 
  name, 
  containerClassName = '', 
  className = '', 
  id, 
  error,
  showAllOption = false,
  allOptionLabel = "All Branches",
  ...props 
}) => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/master/branch');
        setBranches(res.data.branches || res.data || []);
      } catch (err) {
        console.error('Failed to fetch branches in BranchSelect:', err);
      }
    };
    fetchBranches();
  }, []);

  return (
    <Select
      label={label}
      required={required}
      value={value}
      onChange={onChange}
      name={name}
      id={id}
      error={error}
      containerClassName={containerClassName}
      className={className}
      {...props}
    >
      <option value="">{showAllOption ? allOptionLabel : "Select Branch"}</option>
      {branches.map((b) => (
        <option key={b._id} value={b.branchName}>
          {b.branchName}
        </option>
      ))}
    </Select>
  );
};

export default BranchSelect;
