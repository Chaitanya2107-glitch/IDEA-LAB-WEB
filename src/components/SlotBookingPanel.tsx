import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, Clock, User, FileText, CheckCircle, 
  XCircle, Clock3, Plus, Search, Filter, Loader2,
  CalendarDays, CheckSquare, ListTodo
} from "lucide-react";
import { SlotBooking } from "../../types";
import { authService } from "../services/api";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

const QuickStats: React.FC<{ items: SlotBooking[] }> = ({ items }) => {
  const approved = items.filter(i => i.status === 'approved').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const totalSlots = items.length;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        { 
          label: "Total Bookings", 
          val: totalSlots, 
          icon: ListTodo, 
          gradient: "from-brand-600 to-brand-400",
          bg: "bg-brand-50/30"
        },
        { 
          label: "Approved Slots", 
          val: approved, 
          icon: CheckSquare, 
          gradient: "from-emerald-600 to-teal-400",
          bg: "bg-emerald-50/30"
        },
        { 
          label: "Active Requests", 
          val: pending, 
          icon: Clock3, 
          gradient: pending > 0 ? "from-amber-500 to-orange-400" : "from-slate-400 to-slate-300",
          bg: pending > 0 ? "bg-amber-50/30" : "bg-slate-50/30"
        }
      ].map((s, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`group relative overflow-hidden p-8 ${s.bg} border border-slate-100 backdrop-blur-sm transition-all hover:shadow-2xl hover:-translate-y-1`}
        >
          {/* Background Accent */}
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
          
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg shadow-brand-500/10`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.label}</p>
            <p className="text-4xl font-light text-slate-900 tracking-tight">{s.val}</p>
          </div>
          
          <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </motion.div>
      ))}
    </div>
  );
};

const SlotBookingPanel: React.FC<{ onBookClick: () => void, initialSearch?: string }> = ({ onBookClick, initialSearch = "" }) => {
  const [items, setItems] = useState<SlotBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await authService.getSlotRequests();
      setItems(data || []);
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.purpose?.toLowerCase().includes(search.toLowerCase()) ||
        item.date?.includes(search);
      const matchesFilter = filter === "All" || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-emerald-600 bg-emerald-50/50 border-emerald-100';
      case 'rejected': return 'text-red-600 bg-red-50/50 border-red-100';
      default: return 'text-amber-600 bg-amber-50/50 border-amber-100';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-[1px] bg-brand-500" />
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em]">Resource Scheduler</p>
          </div>
          <h1 className="text-5xl font-light text-slate-900 tracking-tight leading-none">Slot Registry</h1>
          <p className="text-slate-400 text-sm max-w-md font-medium">Manage and monitor lab equipment availability and user bookings in real-time.</p>
        </div>
        
        <button 
          onClick={onBookClick}
          className="group relative overflow-hidden flex items-center gap-4 px-10 py-5 bg-slate-900 text-white transition-all hover:bg-brand-600 shadow-2xl shadow-slate-900/10 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Initiate Booking</span>
        </button>
      </div>

      <QuickStats items={items} />

      {/* Main Registry */}
      <div className="bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col md:flex-row border-b border-slate-100 bg-slate-50/30">
          <div className="flex-1 flex items-center px-10 py-6 border-b md:border-b-0 md:border-r border-slate-100 group">
            <Search className="w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search registry by date or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-2 text-sm bg-transparent focus:outline-none text-slate-600 placeholder:text-slate-300 font-medium"
            />
          </div>
          
          <div className="flex items-center px-10 py-6 gap-6">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter</span>
            </div>
            <div className="flex gap-2">
              {["All", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-wider transition-all border ${
                    filter === f 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Date & Temporal Slot</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Project Purpose</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Quota</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Auth Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full animate-pulse" />
                          <Loader2 className="w-10 h-10 text-brand-500 animate-spin relative" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing Cryptographic Registry</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                        <Calendar className="w-10 h-10 text-slate-100" />
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">No booking protocols match your current parameters. Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, i) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className="group transition-all hover:bg-slate-50/50"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                             <Clock className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-slate-900 tracking-tight">{item.date}</span>
                            <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter uppercase">{item.startTime} — {item.endTime}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1 max-w-sm">
                          <span className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-brand-600 transition-colors">{item.purpose}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                           </div>
                           <span className="text-sm font-bold text-slate-600">{item.attendees} <span className="text-[10px] text-slate-300 font-black uppercase">pax</span></span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusColor(item.status || 'pending')}`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            item.status === 'approved' ? 'bg-emerald-500' : 
                            item.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          {item.status || 'pending'}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-white border-t border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Node: REVA-IDEA-LAB-PROD</p>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Vaulted Entries: {filteredItems.length}</p>
        </div>
      </div>
    </div>
  );
};

export default SlotBookingPanel;
