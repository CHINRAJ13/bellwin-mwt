import { Settings2 } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-20 h-20 rounded-none bg-green-50 flex items-center justify-center mb-6 shadow-sm border border-green-100">
        <Settings2 size={40} className="text-green-600 animate-spin-slow" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Module Coming Soon</h1>
      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
        This module is currently under development and will be available in a future update of the ERP system.
      </p>
    </div>
  );
};

export default ComingSoon;
