import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const FloatingLoginBtn: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/staff-login')}
      className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl shadow-brand-900/20 transition-all duration-300 hover:scale-110 active:scale-95 border border-slate-700 group backdrop-blur-md"
      title="Staff Login"
    >
      <ShieldCheck className="w-6 h-6 text-brand-400" />
    </button>
  );
};

export default FloatingLoginBtn;