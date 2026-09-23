// src/components/SlotBookingModal.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CheckCircle, AlertCircle, Loader2, Clock, Users } from "lucide-react";
import { authService } from "../services/api";
import { User, SlotBooking } from "../../types";
import { getLabStatus } from "../utils/labClosure";

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  initialDate?: string;
  onSuccess?: () => void;
}

export const SESSION_TYPES = [
  "Project Work",
  "Faculty Consultation",
  "Equipment Training",
  "Hackathon Practice",
  "PCB Assembly",
  "3D Printing Session",
  "Research / Documentation",
  "Team Meeting",
];

export const TIME_SLOTS = [
  { label: "Morning (09:00–12:00)", start: "09:00", end: "12:00" },
  { label: "Afternoon (13:00–16:00)", start: "13:00", end: "16:00" },
  { label: "Evening (16:00–19:00)", start: "16:00", end: "19:00" },
  { label: "Full Day (09:00–18:00)", start: "09:00", end: "18:00" },
];

const SlotBookingModal: React.FC<SlotBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  initialDate = "", 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  
  const [formData, setFormData] = useState({
    date: initialDate,
    slotIndex: 0,
    sessionType: SESSION_TYPES[0],
    purpose: "",
    attendees: 1
  });

  useEffect(() => {
    if (initialDate) setFormData(prev => ({ ...prev, date: initialDate }));
  }, [initialDate]);

  useEffect(() => {
    (async () => {
      try {
        const dates = await authService.getBlockedDates();
        setBlockedDates(dates);
      } catch (err) {
        console.error("Failed to load blocked dates", err);
      }
    })();
  }, []);

  const labStatus = getLabStatus(formData.date, blockedDates);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (labStatus.isClosed) return;
    
    setLoading(true);
    setError(null);

    const slot = TIME_SLOTS[formData.slotIndex];

    try {
      await authService.createSlotRequest({
        bookingDate: formData.date,
        startTime: slot.start,
        endTime: slot.end,
        sessionType: formData.sessionType,
        purpose: formData.purpose,
        attendees: formData.attendees,
        tenant_id: user.tenant_id,
        user_id: user.id,
        user_name: user.name,
        status: "pending"
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to book slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6 sm:p-10 md:p-14">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-600/30">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reserve Slot</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Idea Lab Protocol v3.0</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  disabled={loading}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Your slot request is being processed...</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Date Selection */}
                      <div className="relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 block ml-1">Preferred Date</label>
                        <div className="relative">
                          <input 
                            required
                            type="date" 
                            className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-800 ${
                              labStatus.isClosed 
                                ? "border-red-200 focus:ring-red-500/10 focus:border-red-500" 
                                : "border-slate-100 focus:ring-brand-500/10 focus:border-brand-500"
                            }`}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          />
                          {labStatus.isClosed && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        {labStatus.isClosed && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-black text-red-500 mt-2 ml-1 uppercase tracking-wider"
                          >
                            {labStatus.reason}
                          </motion.p>
                        )}
                      </div>

                      {/* Session Type */}
                      <div className="relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 block ml-1">Session Type</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                          value={formData.sessionType}
                          onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                        >
                          {SESSION_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Time Slots */}
                      <div className="relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 block ml-1">Time Slot</label>
                        <div className="grid grid-cols-2 gap-3">
                          {TIME_SLOTS.map((slot, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFormData({ ...formData, slotIndex: i })}
                              className={`px-4 py-4 rounded-2xl border text-left transition-all relative overflow-hidden group/btn ${
                                formData.slotIndex === i 
                                  ? "border-brand-600 bg-brand-50 text-brand-700 shadow-md shadow-brand-600/10" 
                                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-brand-200"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-wider mb-1">
                                  {slot.label.split('(')[0]}
                                </span>
                                <span className={`text-xs font-bold font-mono ${formData.slotIndex === i ? "text-brand-600" : "text-slate-400"}`}>
                                  {slot.start} — {slot.end}
                                </span>
                              </div>
                              {formData.slotIndex === i && (
                                <motion.div layoutId="slot-check" className="absolute top-3 right-3">
                                  <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                                </motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Attendees & Purpose */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 block ml-1">Pax</label>
                          <input 
                            type="number" min={1} max={50}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-slate-800"
                            value={formData.attendees}
                            onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3 block ml-1">Purpose / Notes</label>
                          <input 
                            required
                            placeholder="Briefly describe your activity..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-slate-800"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || labStatus.isClosed}
                      className="w-full py-5 bg-slate-900 hover:bg-brand-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-[20px] font-black text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Submit Request</span>
                        </div>
                      )}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlotBookingModal;
