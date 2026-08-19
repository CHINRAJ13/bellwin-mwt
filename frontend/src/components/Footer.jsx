import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-4 mt-auto print:hidden">
      <div className="max-w-screen-2xl mx-auto px-6 flex flex-col items-center justify-center text-sm text-gray-500 gap-2">
        <div className="text-center">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-700">Belwin Groups Jewellery ERP</span>. All rights reserved.
        </div>
        <div className="flex gap-4 justify-center">
          <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-green-600 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
