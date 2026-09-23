import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "../services/api";
import { User, SlotBooking as SlotBookingType } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "../components/FadeIn";
import SlotBookingPanel from "../components/SlotBookingPanel";
import { ArrowLeft } from "lucide-react";
import SlotBookingModal from "../components/SlotBookingModal";

interface Props { user?: User; }

const SlotBooking: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden px-4 md:px-8 py-10">
      {/* Atmospheric Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto border-x border-slate-100 min-h-screen bg-white relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.02)]">
        {/* Navigation / Header Area */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-20">
           <Link to="/dashboard" className="group inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] tracking-[0.2em] uppercase">
              <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              Back to Workspace
           </Link>
           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocol Status</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Active Connection</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse" />
           </div>
        </div>

        <div className="p-10 md:p-16">
           <SlotBookingPanel 
              onBookClick={() => setIsModalOpen(true)} 
              initialSearch={location.state?.date || ""}
           />
        </div>
      </div>

      <SlotBookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        initialDate={location.state?.date || ""}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default SlotBooking;
